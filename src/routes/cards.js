const express = require('express');
const router = express.Router();
const cardService = require('../services/cardService');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const cards = await cardService.getCards(req.user.userId);

    res.json({
      success: true,
      data: cards
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
    const card = await cardService.getCardById(req.params.id, req.user.userId);

    res.json({
      success: true,
      data: card
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
    const { accountId, cardType, cardHolderName } = req.body;

    if (!accountId || !cardHolderName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'accountId and cardHolderName are required'
        }
      });
    }

    const card = await cardService.createCard(
      req.user.userId,
      accountId,
      cardType,
      cardHolderName
    );

    res.status(201).json({
      success: true,
      data: card
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

router.post('/:id/add-funds', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be positive'
        }
      });
    }

    const result = await cardService.addFunds(req.params.id, req.user.userId, amount);

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

router.get('/:id/transactions', async (req, res) => {
  try {
    const transactions = await cardService.getCardTransactions(req.params.id, req.user.userId);

    res.json({
      success: true,
      data: transactions
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
    const result = await cardService.deactivateCard(req.params.id, req.user.userId);

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