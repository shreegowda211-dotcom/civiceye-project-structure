import request from 'supertest';
import express from 'express';
import officerRouter from '../router/officerRouter.js';

describe('Complaint Update', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/officer', officerRouter);

  it('PUT /api/officer/complaints/:id/status should require auth', async () => {
    const res = await request(app)
      .put('/api/officer/complaints/123/status')
      .send({ status: 'resolved', notes: 'Done' });
    expect(res.statusCode).toBe(401);
  });
});
