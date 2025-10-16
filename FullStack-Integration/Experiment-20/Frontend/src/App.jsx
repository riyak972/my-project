import React from 'react';
import Cart from './components/Cart';
import ProductList from './components/ProductList';

function App() {
  return (
    <div>
      <h1>My Store</h1>
      <ProductList />
      <Cart />
    </div>
  );
}

export default App;
