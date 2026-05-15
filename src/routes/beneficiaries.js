const express = require('express');
const router = express.Router();
const beneficiaryService = require('../services/beneficiaryService');
const { authenticate } = require('../middleware/auth');
const { validate, beneficiarySchema } = require('../validators/schemas');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const beneficiaries = await beneficiaryService.getBeneficiaries(req.user.userId);

    res.json({
      success: true,
      data: beneficiaries
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const beneficiary = await beneficiaryService.getBeneficiaryById(
      req.params.id,
      req.user.userId
    );

    res.json({
      success: true,
      data: beneficiary
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.post('/', validate(beneficiarySchema), async (req, res) => {
  try {
    const { name, accountNumber, bankName, relationship } = req.validatedBody;
    const beneficiary = await beneficiaryService.createBeneficiary(
      req.user.userId,
      name,
      accountNumber,
      bankName,
      relationship
    );

    res.status(201).json({
      success: true,
      data: beneficiary
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await beneficiaryService.deleteBeneficiary(
      req.params.id,
      req.user.userId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router;