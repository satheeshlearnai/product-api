const request = require('supertest');

const NAME_ERROR = { error: 'Name must be a non-empty string' };
const PRICE_ERROR = { error: 'Price must be a positive number' };
const NOT_FOUND_ERROR = { error: 'Product not found' };

/**
 * Loads a fresh copy of the app so the in-memory products are reset.
 * @returns {import('express').Express} A new app instance.
 */
function loadFreshApp() {
  let app;
  jest.isolateModules(() => {
    app = require('./app');
  });
  return app;
}

describe('Product API integration', () => {
  let app;

  beforeEach(() => {
    app = loadFreshApp();
  });

  describe('GET /products', () => {
    it('200: lists the seeded products', async () => {
      const res = await request(app).get('/products');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { id: 1, name: 'Laptop', price: 999.99 },
        { id: 2, name: 'Smartphone', price: 499.99 },
        { id: 3, name: 'Headphones', price: 149.99 },
      ]);
    });

    it('200: hides archived products', async () => {
      await request(app).patch('/products/2/archive');
      const res = await request(app).get('/products');
      expect(res.status).toBe(200);
      expect(res.body.map((p) => p.id)).toEqual([1, 3]);
    });

    it('starts from seed data after a previous test changed it', async () => {
      await request(app).delete('/products/1');
      app = loadFreshApp();
      const res = await request(app).get('/products');
      expect(res.body).toHaveLength(3);
    });
  });

  describe('POST /products', () => {
    it('201: creates a product and makes it retrievable', async () => {
      const res = await request(app).post('/products').send({ name: 'Mouse', price: 25.5 });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 4, name: 'Mouse', price: 25.5 });

      const fetched = await request(app).get('/products/4');
      expect(fetched.status).toBe(200);
      expect(fetched.body).toEqual(res.body);
    });

    it.each([
      ['missing name', { price: 10 }],
      ['empty name', { name: '', price: 10 }],
      ['blank name', { name: '   ', price: 10 }],
      ['non-string name', { name: 123, price: 10 }],
    ])('400: rejects %s', async (_label, body) => {
      const res = await request(app).post('/products').send(body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual(NAME_ERROR);
    });

    it.each([
      ['missing price', { name: 'Mouse' }],
      ['zero price', { name: 'Mouse', price: 0 }],
      ['negative price', { name: 'Mouse', price: -1 }],
      ['string price', { name: 'Mouse', price: '10' }],
    ])('400: rejects %s', async (_label, body) => {
      const res = await request(app).post('/products').send(body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual(PRICE_ERROR);
    });

    it('does not store a product that failed validation', async () => {
      await request(app).post('/products').send({ name: '', price: 10 });
      const res = await request(app).get('/products');
      expect(res.body).toHaveLength(3);
    });
  });

  describe('GET /products/:id', () => {
    it('200: returns the product', async () => {
      const res = await request(app).get('/products/3');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 3, name: 'Headphones', price: 149.99 });
    });

    it('200: still returns an archived product by id', async () => {
      await request(app).patch('/products/3/archive');
      const res = await request(app).get('/products/3');
      expect(res.status).toBe(200);
      expect(res.body.archived).toBe(true);
    });

    it('404: unknown id', async () => {
      const res = await request(app).get('/products/99');
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND_ERROR);
    });

    it('404: non-numeric id', async () => {
      const res = await request(app).get('/products/abc');
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND_ERROR);
    });
  });

  describe('PUT /products/:id', () => {
    it('200: replaces the product', async () => {
      const res = await request(app).put('/products/1').send({ name: 'Laptop Pro', price: 1299 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: 'Laptop Pro', price: 1299 });

      const fetched = await request(app).get('/products/1');
      expect(fetched.body).toEqual(res.body);
    });

    it('404: unknown id', async () => {
      const res = await request(app).put('/products/99').send({ name: 'X', price: 1 });
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND_ERROR);
    });

    it('404 takes priority over validation errors', async () => {
      const res = await request(app).put('/products/99').send({ name: '', price: -1 });
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND_ERROR);
    });

    it('400: invalid name', async () => {
      const res = await request(app).put('/products/1').send({ name: ' ', price: 10 });
      expect(res.status).toBe(400);
      expect(res.body).toEqual(NAME_ERROR);
    });

    it('400: invalid price', async () => {
      const res = await request(app).put('/products/1').send({ name: 'Laptop', price: 0 });
      expect(res.status).toBe(400);
      expect(res.body).toEqual(PRICE_ERROR);
    });

    it('leaves the product unchanged after a failed update', async () => {
      await request(app).put('/products/1').send({ name: 'Bad', price: -1 });
      const res = await request(app).get('/products/1');
      expect(res.body).toEqual({ id: 1, name: 'Laptop', price: 999.99 });
    });
  });

  describe('PATCH /products/:id/archive', () => {
    it('200: marks the product as archived', async () => {
      const res = await request(app).patch('/products/1/archive');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: 'Laptop', price: 999.99, archived: true });
    });

    it('404: unknown id', async () => {
      const res = await request(app).patch('/products/99/archive');
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND_ERROR);
    });
  });

  describe('DELETE /products/:id', () => {
    it('204: removes the product with an empty body', async () => {
      const res = await request(app).delete('/products/2');
      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
      expect(res.text).toBe('');

      const fetched = await request(app).get('/products/2');
      expect(fetched.status).toBe(404);
      expect(fetched.body).toEqual(NOT_FOUND_ERROR);
    });

    it('404: unknown id', async () => {
      const res = await request(app).delete('/products/99');
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND_ERROR);
    });

    it('404: deleting the same product twice', async () => {
      await request(app).delete('/products/1');
      const res = await request(app).delete('/products/1');
      expect(res.status).toBe(404);
      expect(res.body).toEqual(NOT_FOUND_ERROR);
    });
  });
});
