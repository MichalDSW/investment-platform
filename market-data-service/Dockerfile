# Dockerfile
FROM node:18-alpine

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Start the service
CMD ["node", "src/server.js"]

# .dockerignore
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.eslintrc
.prettierrc
coverage
.nyc_output
.DS_Store
*.log

# docker-compose.yml (for local development)
version: '3.8'

services:
  market-data-service:
    build: .
    container_name: market-data-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - MONGO_URL=mongodb://mongo:27017/market_data
      - REDIS_URL=redis://redis:6379
      - ALPHA_VANTAGE_API_KEY=${ALPHA_VANTAGE_API_KEY}
    depends_on:
      - mongo
      - redis
    volumes:
      - ./src:/usr/src/app/src
      - ./package.json:/usr/src/app/package.json
    networks:
      - market-network

  mongo:
    image: mongo:6
    container_name: market-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - market-network

  redis:
    image: redis:7-alpine
    container_name: market-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - market-network

  mongo-express:
    image: mongo-express
    container_name: market-mongo-express
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongo
    depends_on:
      - mongo
    networks:
      - market-network

volumes:
  mongo_data:
  redis_data:

networks:
  market-network:
    driver: bridge

# Makefile
.PHONY: help build run stop clean test

help:
	@echo "Available commands:"
	@echo "  make build    - Build Docker images"
	@echo "  make run      - Run services with docker-compose"
	@echo "  make stop     - Stop all services"
	@echo "  make clean    - Clean up containers and volumes"
	@echo "  make test     - Run tests"
	@echo "  make logs     - Show service logs"

build:
	docker-compose build

run:
	docker-compose up -d

stop:
	docker-compose down

clean:
	docker-compose down -v

test:
	npm test

logs:
	docker-compose logs -f market-data-service

# Install dependencies locally
install:
	npm install

# README.md
# Market Data Service

## Overview
This is the market data aggregation service for the Investment Comparison Platform. It fetches real-time and historical data from various financial markets including stocks, cryptocurrencies, commodities, and real estate.

## Features
- Real-time stock quotes from Alpha Vantage
- Cryptocurrency data from CoinGecko
- Redis caching for performance
- MongoDB for historical data storage
- Scheduled data updates
- RESTful API with validation
- Rate limiting and security headers

## Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Alpha Vantage API key (free at https://www.alphavantage.co/support/#api-key)
- Optional: CoinGecko API key for higher rate limits

## Quick Start

### Using Docker (Recommended)
1. Clone the repository
```bash
git clone <repository-url>
cd market-data-service
```

2. Create `.env` file
```bash
cp .env.example .env
# Edit .env and add your API keys
```

3. Build and run with Docker
```bash
make build
make run
# or without make:
# docker-compose build
# docker-compose up -d
```

4. Check if service is running
```bash
curl http://localhost:3002/health
```

### Local Development
1. Install dependencies
```bash
npm install
```

2. Start MongoDB and Redis
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongo mongo:6
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Or install locally
```

3. Start the service
```bash
npm run dev
```

## API Endpoints

### Stocks
- `GET /api/v1/markets/stocks?symbols=AAPL,GOOGL,MSFT` - Get multiple stock quotes
- `GET /api/v1/markets/stocks/AAPL` - Get single stock details
- `GET /api/v1/markets/stocks/AAPL/history?period=1M` - Get historical data

### Cryptocurrencies
- `GET /api/v1/markets/crypto` - Get top cryptocurrencies by market cap
- `GET /api/v1/markets/crypto?symbols=BTC,ETH,BNB` - Get specific cryptos
- `GET /api/v1/markets/crypto/BTC` - Get single crypto details

### Example Responses

#### Stock Quote
```json
{
  "symbol": "AAPL",
  "price": 178.50,
  "change": 2.35,
  "changePercent": "1.33%",
  "volume": 52896547,
  "timestamp": "2024-01-15T16:00:00.000Z",
  "open": 176.25,
  "high": 179.10,
  "low": 175.80,
  "previousClose": 176.15
}
```

#### Crypto Data
```json
{
  "symbol": "BTC",
  "name": "Bitcoin",
  "priceUSD": 42350.75,
  "priceBTC": 1,
  "marketCap": 829874563219,
  "volume24h": 23654789652,
  "circulatingSupply": 19598743,
  "percentChange1h": 0.45,
  "percentChange24h": 2.15,
  "percentChange7d": -1.23
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/production) | No | development |
| `PORT` | Service port | No | 3002 |
| `MONGO_URL` | MongoDB connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | Yes | - |
| `LOG_LEVEL` | Logging level | No | info |

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing with Artillery
```bash
npm install -g artillery
artillery run tests/load-test.yml
```

## Monitoring

### Health Check
```bash
curl http://localhost:3002/health
```

### Metrics
The service exposes Prometheus metrics at `/metrics` endpoint.

### Logs
```bash
# Docker logs
docker-compose logs -f market-data-service

# Local logs
tail -f combined.log
```

## Troubleshooting

### Common Issues

1. **Rate Limit Errors**
   - Alpha Vantage free tier: 5 API calls/minute
   - Solution: Implement caching or upgrade API plan

2. **MongoDB Connection Failed**
   - Check if MongoDB is running: `docker ps`
   - Verify connection string in .env

3. **Redis Connection Failed**
   - Check Redis status: `redis-cli ping`
   - Verify Redis URL in .env

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

## Production Deployment

### Using Kubernetes
```bash
# Build and push image
docker build -t your-registry/market-data-service:latest .
docker push your-registry/market-data-service:latest

# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
```

### Environment-specific configs
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

## Performance Optimization

1. **Caching Strategy**
   - Stock data: 5 minutes TTL
   - Crypto data: 1 minute TTL
   - Historical data: 1 hour TTL

2. **Database Indexes**
   - Compound index on (symbol, timestamp)
   - TTL index for automatic data cleanup

3. **Connection Pooling**
   - MongoDB: 10 connections
   - Redis: Automatic pooling

## Security

- Helmet.js for security headers
- Rate limiting per IP
- Input validation with Joi
- API key rotation support
- No sensitive data in logs

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is part of the Investment Comparison Platform.

# tests/stocks.test.js
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

# healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3002,
  path: '/health',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.end();