# Product API

A small REST API for managing products, built with Express 5. Products are kept in memory, so data resets whenever the server restarts.

## Install

Requires Node.js 18 or later.

```bash
npm install
```

## Run

```bash
npm start
```

The server listens on port `3000` by default. Set the `PORT` environment variable to use another port.

## Test

```bash
npm test
```

This runs Jest with coverage (`jest --coverage`). Tests use Supertest and load a fresh copy of the app before each test, so the in-memory data is reset every time.

## Endpoints

| Method | Path                    | Description                          | Status codes            |
| ------ | ----------------------- | ------------------------------------ | ----------------------- |
| GET    | `/products`             | List all products that are not archived | 200, 500             |
| POST   | `/products`             | Create a product                     | 201, 400, 500           |
| GET    | `/products/:id`         | Get a product by ID                  | 200, 404, 500           |
| PUT    | `/products/:id`         | Replace a product's name and price   | 200, 400, 404, 500      |
| PATCH  | `/products/:id/archive` | Mark a product as archived           | 200, 404, 500           |
| DELETE | `/products/:id`         | Delete a product                     | 204, 404, 500           |

### Request body

`POST /products` and `PUT /products/:id` expect JSON:

```json
{ "name": "Mouse", "price": 25.5 }
```

- `name` must be a non-empty string.
- `price` must be a positive number.

### Errors

All errors are returned as JSON in this shape, with a suitable HTTP status code:

```json
{ "error": "Product not found" }
```

| Status | Message                                |
| ------ | -------------------------------------- |
| 400    | `Name must be a non-empty string`      |
| 400    | `Price must be a positive number`      |
| 404    | `Product not found`                    |
| 500    | `Internal Server Error`                |

For `PUT`, an unknown ID returns 404 before the body is validated.

## Project structure

- `src/app.js`: Express app and routes (exported, does not listen).
- `src/server.js`: starts the server.
- `src/*.test.js`: Jest and Supertest tests.
