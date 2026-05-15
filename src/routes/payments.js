const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/services', async (req, res) => {
  try {
    const services = await paymentService.getAvailableServices();

    res.json({
      success: true,
      data: services
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

router.post('/', async (req, res) => {
  try {
    const { accountId, serviceId, amount, reference } = req.body;

    if (!accountId || !serviceId || !amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'accountId, serviceId and amount are required'
        }
      });
    }

    const payment = await paymentService.payService(
      req.user.userId,
      accountId,
      serviceId,
      amount,
      reference
    );

    res.status(201).json({
      success: true,
      data: payment
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

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const payments = await paymentService.getPaymentHistory(req.user.userId, limit, offset);

    res.json({
      success: true,
      data: payments,
      pagination: { limit, offset }
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
    const payment = await paymentService.getPaymentById(req.params.id, req.user.userId);

    res.json({
      success: true,
      data: payment
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