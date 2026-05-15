const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const config = require('../config');
const specs = require('./utils/swagger');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transferRoutes = require('./routes/transfers');
const beneficiaryRoutes = require('./routes/beneficiaries');
const depositRoutes = require('./routes/deposits');
const paymentRoutes = require('./routes/payments');
const cardRoutes = require('./routes/cards');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { font-size: 2.5em }
  `,
  customSiteTitle: 'BankAPI - Documentación',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BankAPI'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cards', cardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 BankAPI running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;