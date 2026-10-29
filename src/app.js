const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');
const app = express();

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

/**
 * In-memory store for products.
 * @type {Array<{id: number, name: string, price: number, archived?: boolean}>}
 */
const products = [
  { id: 1, name: 'Laptop', price: 999.99 },
  { id: 2, name: 'Smartphone', price: 499.99 },
  { id: 3, name: 'Headphones', price: 149.99 },
];

/**
 * GET /products
 * Returns a list of all products that are not archived.
 * @param {express.Request} req - The request object (unused).
 * @param {express.Response} res - The response object; sends 200 with the JSON array of active products, or 500 with { error } on failure.
 * @returns {Promise<void>} Resolves once the response has been sent.
 */
app.get('/products', async (req, res) => {
  try {
    const activeProducts = products.filter(p => !p.archived);
    res.json(activeProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /products
 * Adds a new product to the store.
 * @param {express.Request} req - The request object; req.body must contain a non-empty string `name` and a positive number `price`.
 * @param {express.Response} res - The response object; sends 201 with the created product, 400 with { error } for invalid input, or 500 with { error } on failure.
 * @returns {Promise<void>} Resolves once the response has been sent.
 */
app.post('/products', async (req, res) => {
  try {
    const { name, price } = req.body;

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const newProduct = {
      id: products.length + 1,
      name,
      price,
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /products/:id
 * Returns a single product by its ID.
 * @param {express.Request} req - The request object; req.params.id is the product ID.
 * @param {express.Response} res - The response object; sends 200 with the product, 404 with { error } if not found, or 500 with { error } on failure.
 * @returns {Promise<void>} Resolves once the response has been sent.
 */
app.get('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PUT /products/:id
 * Updates an existing product by its ID.
 * @param {express.Request} req - The request object; req.params.id is the product ID and req.body must contain a non-empty string `name` and a positive number `price`.
 * @param {express.Response} res - The response object; sends 200 with the updated product, 404 with { error } if not found, 400 with { error } for invalid input, or 500 with { error } on failure.
 * @returns {Promise<void>} Resolves once the response has been sent.
 */
app.put('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, price } = req.body;

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    products[productIndex] = { id, name, price };
    res.json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PATCH /products/:id/archive
 * Sets a product as archived.
 * @param {express.Request} req - The request object; req.params.id is the product ID.
 * @param {express.Response} res - The response object; sends 200 with the archived product, 404 with { error } if not found, or 500 with { error } on failure.
 * @returns {Promise<void>} Resolves once the response has been sent.
 */
app.patch('/products/:id/archive', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.archived = true;
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * DELETE /products/:id
 * Removes a product from the store.
 * @param {express.Request} req - The request object; req.params.id is the product ID.
 * @param {express.Response} res - The response object; sends 204 with no body, 404 with { error } if not found, or 500 with { error } on failure.
 * @returns {Promise<void>} Resolves once the response has been sent.
 */
app.delete('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products.splice(productIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;



