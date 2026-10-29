const request = require('supertest');
const app = require('./app');
const openapi = require('./openapi.json');

describe('API docs', () => {
  it('serves Swagger UI at /docs', async () => {
    const res = await request(app).get('/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Swagger UI');
  });

  it('documents every route in app.js', () => {
    expect(Object.keys(openapi.paths)).toEqual([
      '/products',
      '/products/{id}',
      '/products/{id}/archive',
    ]);
    expect(Object.keys(openapi.paths['/products'])).toEqual(['get', 'post']);
    expect(Object.keys(openapi.paths['/products/{id}'])).toEqual(
      expect.arrayContaining(['parameters', 'get', 'put', 'delete'])
    );
    expect(Object.keys(openapi.paths['/products/{id}/archive'])).toContain('patch');
  });
});
