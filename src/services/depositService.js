const { v4: uuidv4 } = require('uuid');
const db = require('../db');

class DepositService {
  async deposit(userId, accountId, amount, depositType, reference) {
    if (amount <= 0) {
      const error = new Error('Amount must be positive');
      error.code = 'INVALID_AMOUNT';
      error.statusCode = 400;
      throw error;
    }

    if (amount > 100000) {
      const error = new Error('Maximum deposit amount is $100,000');
      error.code = 'MAX_AMOUNT_EXCEEDED';
      error.statusCode = 400;
      throw error;
    }

    const accountResult = await db.query(
      'SELECT id, user_id, balance, account_number FROM accounts WHERE id = $1 AND user_id = $2 AND is_active = true',
      [accountId, userId]
    );

    if (accountResult.rows.length === 0) {
      const error = new Error('Account not found');
      error.code = 'ACCOUNT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const account = accountResult.rows[0];
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const newBalance = parseFloat(account.balance) + parseFloat(amount);

      await client.query(
        'UPDATE accounts SET balance = $1, updated_at = NOW() WHERE id = $2',
        [newBalance, accountId]
      );

      const depositId = uuidv4();
      const confirmationNumber = `DEP${Date.now()}${Math.floor(Math.random() * 1000)}`;

      await client.query(
        `INSERT INTO deposits (id, user_id, account_id, amount, deposit_type, reference, confirmation_number, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')`,
        [depositId, userId, accountId, amount, depositType || 'bank_transfer', reference || '', confirmationNumber]
      );

      await client.query('COMMIT');

      return {
        id: depositId,
        confirmationNumber: confirmationNumber,
        accountId: accountId,
        accountNumber: account.account_number,
        amount: parseFloat(amount),
        depositType: depositType || 'bank_transfer',
        previousBalance: parseFloat(account.balance),
        newBalance: newBalance,
        status: 'completed',
        createdAt: new Date()
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getDepositHistory(userId, limit = 20, offset = 0) {
    const result = await db.query(
      `SELECT id, user_id, account_id, amount, deposit_type, reference, confirmation_number, status, created_at
       FROM deposits
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows.map(this.formatDeposit);
  }

  async getDepositById(depositId, userId) {
    const result = await db.query(
      `SELECT id, user_id, account_id, amount, deposit_type, reference, confirmation_number, status, created_at
       FROM deposits
       WHERE id = $1 AND user_id = $2`,
      [depositId, userId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Deposit not found');
      error.code = 'DEPOSIT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return this.formatDeposit(result.rows[0]);
  }

  formatDeposit(deposit) {
    return {
      id: deposit.id,
      userId: deposit.user_id,
      accountId: deposit.account_id,
      amount: parseFloat(deposit.amount),
      depositType: deposit.deposit_type,
      reference: deposit.reference,
      confirmationNumber: deposit.confirmation_number,
      status: deposit.status,
      createdAt: deposit.created_at
    };
  }
}

module.exports = new DepositService();