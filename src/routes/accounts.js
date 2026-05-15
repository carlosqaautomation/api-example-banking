const express = require('express');
const router = express.Router();
const accountService = require('../services/accountService');
const { authenticate } = require('../middleware/auth');
const { validate, accountSchema } = require('../validators/schemas');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const accounts = await accountService.getAccounts(req.user.userId);

    res.json({
      success: true,
      data: accounts
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
    const account = await accountService.getAccountById(req.params.id, req.user.userId);

    res.json({
      success: true,
      data: account
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

router.get('/:id/balance', async (req, res) => {
  try {
    const balance = await accountService.getBalance(req.params.id, req.user.userId);

    res.json({
      success: true,
      data: balance
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

router.post('/', validate(accountSchema), async (req, res) => {
  try {
    const { accountType, currency, initialBalance } = req.validatedBody;
    const account = await accountService.createAccount(
      req.user.userId,
      accountType,
      currency,
      initialBalance
    );

    res.status(201).json({
      success: true,
      data: account
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