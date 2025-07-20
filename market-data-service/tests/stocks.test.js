const request = require('supertest');
const { app } = require('../src/server');

describe('Stock API Endpoints', () => {
  describe('GET /api/v1/markets/stocks/:symbol', () => {
    it('should return stock data for valid symbol', async () => {
      const response = await request(app)
        .get('/api/v1/markets/stocks/AAPL')
        .expect(200);

      expect(response.body).toHaveProperty('symbol', 'AAPL');
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('volume');
    });

    it('should return 400 for invalid symbol', async () => {
      const response = await request(app)
        .get('/api/v1/markets/stocks/INVALID123')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/markets/stocks', () => {
    it('should return multiple stock quotes', async () => {
      const response = await request(app)
        .get('/api/v1/markets/stocks?symbols=AAPL,GOOGL,MSFT')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should return 400 when symbols missing', async () => {
      await request(app)
        .get('/api/v1/markets/stocks')
        .expect(400);
    });
  });
});