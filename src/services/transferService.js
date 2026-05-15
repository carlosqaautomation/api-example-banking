const { v4: uuidv4 } = require('uuid');
const db = require('../db');

class TransferService {
  async getTransfers(userId, limit = 20, offset = 0) {
    const result = await db.query(
      `SELECT t.id, t.from_account_id, t.to_account_id, t.amount, t.currency,
              t.description, t.status, t.transfer_type, t.reference, t.created_at, t.completed_at,
              fa.account_number as from_account_number, ta.account_number as to_account_number
       FROM transfers t
       JOIN accounts fa ON t.from_account_id = fa.id
       JOIN accounts ta ON t.to_account_id = ta.id
       WHERE fa.user_id = $1 OR ta.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows.map(this.formatTransfer);
  }

  async getTransferById(transferId, userId) {
    const result = await db.query(
      `SELECT t.id, t.from_account_id, t.to_account_id, t.amount, t.currency,
              t.description, t.status, t.transfer_type, t.reference, t.created_at, t.completed_at,
              fa.account_number as from_account_number, ta.account_number as to_account_number,
              fa.user_id as from_user_id, ta.user_id as to_user_id
       FROM transfers t
       JOIN accounts fa ON t.from_account_id = fa.id
       JOIN accounts ta ON t.to_account_id = ta.id
       WHERE t.id = $1`,
      [transferId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Transfer not found');
      error.code = 'TRANSFER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const transfer = result.rows[0];

    if (transfer.from_user_id !== userId && transfer.to_user_id !== userId) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      error.statusCode = 403;
      throw error;
    }

    return this.formatTransfer(transfer);
  }

  async createTransfer(fromAccountId, toAccountId, amount, description, transferType, userId) {
    const fromAccount = await this.getAccountByIdForTransfer(fromAccountId, userId);

    if (fromAccount.user_id !== userId) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      error.statusCode = 403;
      throw error;
    }

    if (parseFloat(fromAccount.balance) < amount) {
      const error = new Error('Insufficient funds');
      error.code = 'INSUFFICIENT_FUNDS';
      error.statusCode = 422;
      throw error;
    }

    const toAccount = await this.getAccountByIdForTransfer(toAccountId);

    if (!toAccount) {
      const error = new Error('Destination account not found');
      error.code = 'DESTINATION_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (fromAccountId === toAccountId) {
      const error = new Error('Cannot transfer to the same account');
      error.code = 'SAME_ACCOUNT';
      error.statusCode = 400;
      throw error;
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2',
        [amount, fromAccountId]
      );

      await client.query(
        'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
        [amount, toAccountId]
      );

      const transferId = uuidv4();
      const reference = `TRF${Date.now()}`;

      await client.query(
        `INSERT INTO transfers (id, from_account_id, to_account_id, amount, currency, description, status, transfer_type, reference, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [transferId, fromAccountId, toAccountId, amount, 'USD', description || '', 'completed', transferType || 'internal', reference]
      );

      await client.query('COMMIT');

      return this.getTransferById(transferId, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAccountByIdForTransfer(accountId, userId = null) {
    let query = 'SELECT id, user_id, account_number, account_type, balance, currency FROM accounts WHERE id = $1 AND is_active = true';
    const params = [accountId];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await db.query(query, params);
    return result.rows[0];
  }

  formatTransfer(transfer) {
    return {
      id: transfer.id,
      fromAccountId: transfer.from_account_id,
      toAccountId: transfer.to_account_id,
      fromAccountNumber: transfer.from_account_number,
      toAccountNumber: transfer.to_account_number,
      amount: parseFloat(transfer.amount),
      currency: transfer.currency,
      description: transfer.description,
      status: transfer.status,
      transferType: transfer.transfer_type,
      reference: transfer.reference,
      createdAt: transfer.created_at,
      completedAt: transfer.completed_at
    };
  }
}

module.exports = new TransferService();