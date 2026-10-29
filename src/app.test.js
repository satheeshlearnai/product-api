const request = require('supertest');

/**
 * Loads a fresh copy of the app so in-memory state is reset.
 * @returns {import('express').Express} A new app instance.
 */
function loadApp() {
  let app;
  jest.isolateModules(() => {
    app = require('./app');
  });
  return app;
}

describe('Product API', () => {
  let app;

  beforeEach(() => {
    app = loadApp();
  });

  describe('GET /products', () => {
    it('returns all active products', async () => {
      const res = await request(app).get('/products');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
    });

    it('excludes archived products', async () => {
      await request(app).patch('/products/1/archive');
      const res = await request(app).get('/products');
      expect(res.body.map((p) => p.id)).toEqual([2, 3]);
    });
  });

  describe('POST /products', () => {
    it('creates a product', async () => {
      const res = await request(app).post('/products').send({ name: 'Mouse', price: 25 });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 4, name: 'Mouse', price: 25 });
    });

    it('rejects an empty name', async () => {
      const res = await request(app).post('/products').send({ name: '  ', price: 25 });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Name must be a non-empty string' });
    });

    it('rejects a non-positive price', async () => {
      const res = await request(app).post('/products').send({ name: 'Mouse', price: 0 });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Price must be a positive number' });
    });
  });

  describe('GET /products/:id', () => {
    it('returns the product', async () => {
      const res = await request(app).get('/products/2');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Smartphone');
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).get('/products/99');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Product not found' });
    });
  });

  describe('PUT /products/:id', () => {
    it('updates the product', async () => {
      const res = await request(app).put('/products/1').send({ name: 'Laptop Pro', price: 1200 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: 'Laptop Pro', price: 1200 });
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).put('/products/99').send({ name: 'X', price: 1 });
      expect(res.status).toBe(404);
    });

    it('rejects an invalid name', async () => {
      const res = await request(app).put('/products/1').send({ name: '', price: 1 });
      expect(res.status).toBe(400);
    });

    it('rejects an invalid price', async () => {
      const res = await request(app).put('/products/1').send({ name: 'X', price: -5 });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /products/:id/archive', () => {
    it('archives the product', async () => {
      const res = await request(app).patch('/products/3/archive');
      expect(res.status).toBe(200);
      expect(res.body.archived).toBe(true);
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).patch('/products/99/archive');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('removes the product', async () => {
      const res = await request(app).delete('/products/1');
      expect(res.status).toBe(204);
      const check = await request(app).get('/products/1');
      expect(check.status).toBe(404);
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).delete('/products/99');
      expect(res.status).toBe(404);
    });
  });
});
