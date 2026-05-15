const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(20).required(),
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const accountSchema = Joi.object({
  accountType: Joi.string().valid('savings', 'checking').required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  initialBalance: Joi.number().min(0).default(0)
});

const transferSchema = Joi.object({
  toAccountId: Joi.string().uuid().required(),
  amount: Joi.number().positive().max(100000).required(),
  description: Joi.string().max(255),
  transferType: Joi.string().valid('internal', 'external').default('internal')
});

const beneficiarySchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  accountNumber: Joi.string().alphanum().min(8).max(20).required(),
  bankName: Joi.string().max(100),
  relationship: Joi.string().max(50)
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors
      }
    });
  }

  req.validatedBody = value;
  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  accountSchema,
  transferSchema,
  beneficiarySchema,
  refreshTokenSchema,
  validate
};