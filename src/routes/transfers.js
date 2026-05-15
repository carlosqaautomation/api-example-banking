const express = require('express');
const router = express.Router();
const transferService = require('../services/transferService');
const { authenticate } = require('../middleware/auth');
const { validate, transferSchema } = require('../validators/schemas');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const transfers = await transferService.getTransfers(req.user.userId, limit, offset);

    res.json({
      success: true,
      data: transfers,
      pagination: {
        limit,
        offset
      }
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
    const transfer = await transferService.getTransferById(req.params.id, req.user.userId);

    res.json({
      success: true,
      data: transfer
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

router.post('/', validate(transferSchema), async (req, res) => {
  try {
    const { toAccountId, amount, description, transferType } = req.validatedBody;
    const fromAccountId = req.body.fromAccountId;

    if (!fromAccountId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FROM_ACCOUNT',
          message: 'fromAccountId is required'
        }
      });
    }

    const transfer = await transferService.createTransfer(
      fromAccountId,
      toAccountId,
      amount,
      description,
      transferType,
      req.user.userId
    );

    res.status(201).json({
      success: true,
      data: transfer
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