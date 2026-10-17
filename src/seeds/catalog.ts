// Seed data adapted from DummyJSON (https://dummyjson.com/products)
// Prices are stored in cents to avoid floating point errors (12999 = $129.99)

export interface SeedProduct {
  name: string;
  price: number;
  stock: number;
}

export interface SeedCategory {
  name: string;
  description: string;
  products: SeedProduct[];
}

export const catalog: SeedCategory[] = [
  {
    name: 'Evening Wear',
    description: 'Gowns, suits and statement pieces for special nights',
    products: [
      { name: "Black Women's Gown", price: 12999, stock: 25 },
      { name: 'Corset Leather With Skirt', price: 8999, stock: 30 },
      { name: 'Corset With Black Skirt', price: 7999, stock: 33 },
      { name: 'Dress Pea', price: 4999, stock: 6 },
      { name: 'Marni Red & Black Suit', price: 17999, stock: 62 },
    ],
  },
  {
    name: 'Casual Dresses',
    description: 'Light everyday dresses and frocks',
    products: [
      { name: 'Blue Frock', price: 2999, stock: 52 },
      { name: 'Girl Summer Dress', price: 1999, stock: 43 },
      { name: 'Gray Dress', price: 3499, stock: 55 },
      { name: 'Short Frock', price: 2499, stock: 22 },
      { name: 'Tartan Dress', price: 3999, stock: 73 },
    ],
  },
  {
    name: "Men's Shirts",
    description: 'Check, plaid and short sleeve shirts',
    products: [
      { name: 'Blue & Black Check Shirt', price: 2999, stock: 38 },
      { name: 'Gigabyte Aorus Men Tshirt', price: 2499, stock: 90 },
      { name: 'Man Plaid Shirt', price: 3499, stock: 82 },
      { name: 'Man Short Sleeve Shirt', price: 1999, stock: 2 },
      { name: 'Men Check Shirt', price: 2799, stock: 95 },
    ],
  },
  {
    name: "Women's Shoes",
    description: 'Heels, flats and slippers',
    products: [
      { name: 'Black & Brown Slipper', price: 1999, stock: 3 },
      { name: 'Calvin Klein Heel Shoes', price: 7999, stock: 93 },
      { name: 'Golden Shoes Woman', price: 4999, stock: 88 },
      { name: 'Pampi Shoes', price: 2999, stock: 49 },
      { name: 'Red Shoes', price: 3499, stock: 7 },
    ],
  },
  {
    name: "Men's Shoes",
    description: 'Sneakers, trainers and cleats',
    products: [
      { name: 'Nike Air Jordan 1 Red And Black', price: 14999, stock: 7 },
      { name: 'Nike Baseball Cleats', price: 7999, stock: 12 },
      { name: 'Puma Future Rider Trainers', price: 8999, stock: 90 },
      { name: 'Sports Sneakers Off White & Red', price: 11999, stock: 17 },
      { name: 'Sports Sneakers Off White Red', price: 10999, stock: 62 },
    ],
  },
  {
    name: "Women's Bags",
    description: 'Handbags, leather bags and backpacks',
    products: [
      { name: "Blue Women's Handbag", price: 4999, stock: 76 },
      { name: "Heshe Women's Leather Bag", price: 12999, stock: 99 },
      { name: 'Prada Women Bag', price: 59999, stock: 75 },
      { name: 'White Faux Leather Backpack', price: 3999, stock: 39 },
      { name: 'Women Handbag Black', price: 5999, stock: 11 },
    ],
  },
];