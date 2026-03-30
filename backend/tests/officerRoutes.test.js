import request from 'supertest';
import express from 'express';
import officerRouter from '../router/officerRouter.js';

describe('Officer Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/officer', officerRouter);

  it('GET /api/officer/complaints should require auth', async () => {
    const res = await request(app).get('/api/officer/complaints');
    expect(res.statusCode).toBe(401);
  });
});
