const { v4: uuidv4 } = require('uuid');
const db = require('../db');

class BeneficiaryService {
  async getBeneficiaries(userId) {
    const result = await db.query(
      `SELECT id, user_id, name, account_number, bank_name, relationship, is_active, created_at
       FROM beneficiaries
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(this.formatBeneficiary);
  }

  async getBeneficiaryById(beneficiaryId, userId) {
    const result = await db.query(
      `SELECT id, user_id, name, account_number, bank_name, relationship, is_active, created_at
       FROM beneficiaries
       WHERE id = $1 AND user_id = $2`,
      [beneficiaryId, userId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Beneficiary not found');
      error.code = 'BENEFICIARY_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return this.formatBeneficiary(result.rows[0]);
  }

  async createBeneficiary(userId, name, accountNumber, bankName, relationship) {
    const existingBeneficiary = await db.query(
      `SELECT id FROM beneficiaries
       WHERE user_id = $1 AND account_number = $2 AND is_active = true`,
      [userId, accountNumber]
    );

    if (existingBeneficiary.rows.length > 0) {
      const error = new Error('Beneficiary already exists');
      error.code = 'BENEFICIARY_EXISTS';
      error.statusCode = 409;
      throw error;
    }

    const result = await db.query(
      `INSERT INTO beneficiaries (id, user_id, name, account_number, bank_name, relationship)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, name, account_number, bank_name, relationship, is_active, created_at`,
      [uuidv4(), userId, name, accountNumber, bankName, relationship]
    );

    return this.formatBeneficiary(result.rows[0]);
  }

  async deleteBeneficiary(beneficiaryId, userId) {
    const beneficiary = await this.getBeneficiaryById(beneficiaryId, userId);

    await db.query(
      'UPDATE beneficiaries SET is_active = false WHERE id = $1',
      [beneficiaryId]
    );

    return { message: 'Beneficiary deleted successfully' };
  }

  formatBeneficiary(beneficiary) {
    return {
      id: beneficiary.id,
      userId: beneficiary.user_id,
      name: beneficiary.name,
      accountNumber: beneficiary.account_number,
      bankName: beneficiary.bank_name,
      relationship: beneficiary.relationship,
      isActive: beneficiary.is_active,
      createdAt: beneficiary.created_at
    };
  }
}

module.exports = new BeneficiaryService();