import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../cartSlice';

const products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Keyboard', price: 45 },
];

export default function ProductList() {
  const dispatch = useDispatch();

  return (
    <div style={styles.container}>
      {products.map(product => (
        <div key={product.id} style={styles.card}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button onClick={() => dispatch(addToCart(product))}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  card: {
    border: '1px solid #ddd',
    padding: '10px',
    borderRadius: '8px',
    width: '150px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
};
