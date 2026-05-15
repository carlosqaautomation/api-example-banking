const { v4: uuidv4 } = require('uuid');
const db = require('../db');

class AccountService {
  async getAccounts(userId) {
    const result = await db.query(
      `SELECT id, user_id, account_number, account_type, balance, currency, is_active, created_at, updated_at
       FROM accounts
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(this.formatAccount);
  }

  async getAccountById(accountId, userId) {
    const result = await db.query(
      `SELECT id, user_id, account_number, account_type, balance, currency, is_active, created_at, updated_at
       FROM accounts
       WHERE id = $1 AND user_id = $2`,
      [accountId, userId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Account not found');
      error.code = 'ACCOUNT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return this.formatAccount(result.rows[0]);
  }

  async createAccount(userId, accountType, currency, initialBalance) {
    const accountNumber = this.generateAccountNumber();

    const result = await db.query(
      `INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, account_number, account_type, balance, currency, is_active, created_at`,
      [uuidv4(), userId, accountNumber, accountType, initialBalance || 0, currency || 'USD']
    );

    return this.formatAccount(result.rows[0]);
  }

  async getBalance(accountId, userId) {
    const account = await this.getAccountById(accountId, userId);

    return {
      accountId: account.id,
      accountNumber: account.accountNumber,
      balance: account.balance,
      currency: account.currency,
      availableBalance: account.balance,
      ledgerBalance: account.balance
    };
  }

  generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  formatAccount(account) {
    return {
      id: account.id,
      userId: account.user_id,
      accountNumber: account.account_number,
      accountType: account.account_type,
      balance: parseFloat(account.balance),
      currency: account.currency,
      isActive: account.is_active,
      createdAt: account.created_at,
      updatedAt: account.updated_at
    };
  }
}

module.exports = new AccountService();