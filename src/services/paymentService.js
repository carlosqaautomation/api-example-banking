const { v4: uuidv4 } = require('uuid');
const db = require('../db');

class PaymentService {
  constructor() {
    this.services = [
      { id: 'electricity', name: 'Electricidad', category: 'utilities', fee: 1.50 },
      { id: 'water', name: 'Agua', category: 'utilities', fee: 1.00 },
      { id: 'gas', name: 'Gas', category: 'utilities', fee: 1.25 },
      { id: 'internet', name: 'Internet', category: 'telecom', fee: 2.00 },
      { id: 'mobile', name: 'Teléfono Móvil', category: 'telecom', fee: 1.50 },
      { id: 'tv', name: 'Televisión por Cable', category: 'entertainment', fee: 3.00 },
      { id: 'insurance', name: 'Seguro', category: 'insurance', fee: 5.00 },
      { id: ' tuition ', name: 'Matrícula Educación', category: 'education', fee: 10.00 },
      { id: 'credit-card', name: 'Tarjeta de Crédito', category: 'financial', fee: 2.50 },
      { id: 'loan', name: 'Préstamo', category: 'financial', fee: 3.00 }
    ];
  }

  async getAvailableServices() {
    return this.services.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      processingFee: s.fee
    }));
  }

  async payService(userId, accountId, serviceId, amount, reference) {
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

    const account = accountResult.rows[0];
    const service = this.services.find(s => s.id === serviceId);

    if (!service) {
      const error = new Error('Service not found');
      error.code = 'SERVICE_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const totalAmount = parseFloat(amount) + service.fee;

    if (parseFloat(account.balance) < totalAmount) {
      const error = new Error('Insufficient funds');
      error.code = 'INSUFFICIENT_FUNDS';
      error.statusCode = 422;
      throw error;
    }

    if (amount <= 0) {
      const error = new Error('Invalid amount');
      error.code = 'INVALID_AMOUNT';
      error.statusCode = 400;
      throw error;
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2',
        [totalAmount, accountId]
      );

      const paymentId = uuidv4();
      const confirmationNumber = `PAY${Date.now()}`;

      await client.query(
        `INSERT INTO payments (id, user_id, account_id, service_id, service_name, amount, processing_fee, total_amount, reference, confirmation_number, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'completed')`,
        [paymentId, userId, accountId, serviceId, service.name, amount, service.fee, totalAmount, reference || '', confirmationNumber]
      );

      await client.query('COMMIT');

      return {
        id: paymentId,
        confirmationNumber: confirmationNumber,
        serviceId: serviceId,
        serviceName: service.name,
        amount: parseFloat(amount),
        processingFee: service.fee,
        totalAmount: totalAmount,
        newBalance: parseFloat(account.balance) - totalAmount,
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

  async getPaymentHistory(userId, limit = 20, offset = 0) {
    const result = await db.query(
      `SELECT id, user_id, account_id, service_id, service_name, amount, processing_fee,
              total_amount, reference, confirmation_number, status, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows.map(this.formatPayment);
  }

  async getPaymentById(paymentId, userId) {
    const result = await db.query(
      `SELECT id, user_id, account_id, service_id, service_name, amount, processing_fee,
              total_amount, reference, confirmation_number, status, created_at
       FROM payments
       WHERE id = $1 AND user_id = $2`,
      [paymentId, userId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Payment not found');
      error.code = 'PAYMENT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return this.formatPayment(result.rows[0]);
  }

  formatPayment(payment) {
    return {
      id: payment.id,
      userId: payment.user_id,
      accountId: payment.account_id,
      serviceId: payment.service_id,
      serviceName: payment.service_name,
      amount: parseFloat(payment.amount),
      processingFee: parseFloat(payment.processing_fee),
      totalAmount: parseFloat(payment.total_amount),
      reference: payment.reference,
      confirmationNumber: payment.confirmation_number,
      status: payment.status,
      createdAt: payment.created_at
    };
  }
}

module.exports = new PaymentService();