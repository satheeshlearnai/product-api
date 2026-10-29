const products = [
  { id: 1, name: 'Keyboard', price: 1500, archived: false },
  { id: 2, name: 'Mouse', price: 700, archived: true },
  { id: 3, name: 'Monitor', price: 9000 },
];

/**
 * Returns the products that are not archived.
 * @param {Array<{archived?: boolean}>} list - Products to filter.
 * @returns {Array<object>} Active products.
 */
function getActiveProducts(list) {
  return list.filter((p) => !p.archived);
}

/**
 * Sums the prices of the given products.
 * @param {Array<{price: number}>} items - Products to total.
 * @returns {number} Sum of all prices.
 */
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

/**
 * Finds a product's name by id.
 * @param {number} id - Product id to look up.
 * @returns {string} The product name, or 'Not found'.
 */
function findProductName(id) {
  return products.find((p) => p.id === id)?.name ?? 'Not found';
}

const active = getActiveProducts(products);
console.log('Active:', active.length);
console.log('Total:', calculateTotal(active));
console.log('Product 9:', findProductName(9));
