const { v4: uuidv4 } = require('uuid');
const db = require('../db');

class CardService {
  async getCards(userId) {
    const result = await db.query(
      `SELECT id, user_id, account_id, card_number, card_type, cvv, expiry_date,
              card_holder_name, is_active, daily_limit, daily_spent, created_at
       FROM virtual_cards
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(this.formatCard);
  }

  async getCardById(cardId, userId) {
    const result = await db.query(
      `SELECT id, user_id, account_id, card_number, card_type, cvv, expiry_date,
              card_holder_name, is_active, daily_limit, daily_spent, created_at
       FROM virtual_cards
       WHERE id = $1 AND user_id = $2`,
      [cardId, userId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Card not found');
      error.code = 'CARD_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return this.formatCard(result.rows[0]);
  }

  async createCard(userId, accountId, cardType, cardHolderName) {
    const accountResult = await db.query(
      'SELECT id, user_id, balance FROM accounts WHERE id = $1 AND user_id = $2 AND is_active = true',
      [accountId, userId]
    );

    if (accountResult.rows.length === 0) {
      const error = new Error('Account not found');
      error.code = 'ACCOUNT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const cardNumber = this.generateCardNumber();
    const cvv = this.generateCVV();
    const expiryDate = this.generateExpiryDate();

    const result = await db.query(
      `INSERT INTO virtual_cards (id, user_id, account_id, card_number, card_type, cvv, expiry_date, card_holder_name, daily_limit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [uuidv4(), userId, accountId, cardNumber, cardType || 'virtual', cvv, expiryDate, cardHolderName, 1000.00]
    );

    return this.formatCard(result.rows[0]);
  }

  async deactivateCard(cardId, userId) {
    const card = await this.getCardById(cardId, userId);

    await db.query(
      'UPDATE virtual_cards SET is_active = false WHERE id = $1',
      [cardId]
    );

    return { message: 'Card deactivated successfully' };
  }

  async addFunds(cardId, userId, amount) {
    const card = await this.getCardById(cardId, userId);

    if (!card.isActive) {
      const error = new Error('Card is not active');
      error.code = 'CARD_INACTIVE';
      error.statusCode = 400;
      throw error;
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
        [amount, card.accountId]
      );

      const transactionId = uuidv4();
      await client.query(
        `INSERT INTO card_transactions (id, card_id, transaction_type, amount, description, status)
         VALUES ($1, $2, 'deposit', $3, 'Funds added to card', 'completed')`,
        [transactionId, cardId, amount]
      );

      await client.query('COMMIT');

      return {
        cardId: card.id,
        amount: amount,
        newBalance: parseFloat(card.balance) + amount,
        transactionId: transactionId
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCardTransactions(cardId, userId) {
    await this.getCardById(cardId, userId);

    const result = await db.query(
      `SELECT id, card_id, transaction_type, amount, description, status, created_at
       FROM card_transactions
       WHERE card_id = $1
       ORDER BY created_at DESC`,
      [cardId]
    );

    return result.rows.map(t => ({
      id: t.id,
      cardId: t.card_id,
      transactionType: t.transaction_type,
      amount: parseFloat(t.amount),
      description: t.description,
      status: t.status,
      createdAt: t.created_at
    }));
  }

  generateCardNumber() {
    const bin = '453201';
    let cardNumber = bin;
    for (let i = 0; i < 9; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
    return cardNumber + checkDigit;
  }

  calculateLuhnCheckDigit(number) {
    let sum = 0;
    for (let i = 0; i < number.length; i++) {
      let digit = parseInt(number[i]);
      if ((number.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return (10 - (sum % 10)) % 10;
  }

  generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  generateExpiryDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }

  formatCard(card) {
    return {
      id: card.id,
      userId: card.user_id,
      accountId: card.account_id,
      cardNumber: card.card_number,
      cardType: card.card_type,
      cvv: card.cvv,
      expiryDate: card.expiry_date,
      cardHolderName: card.card_holder_name,
      isActive: card.is_active,
      dailyLimit: parseFloat(card.daily_limit),
      dailySpent: parseFloat(card.daily_spent || 0),
      createdAt: card.created_at
    };
  }
}

module.exports = new CardService();