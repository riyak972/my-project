import React, { useState } from 'react';
import GroceryList from './GroceryList';
import AddItemForm from './AddItemForm';
import './App.css';

function App() {
  const [groceryItems, setGroceryItems] = useState([
    { id: 1, name: 'Apples', quantity: 5 },
    { id: 2, name: 'Milk', quantity: 2 },
    { id: 3, name: 'Bread', quantity: 1 },
    { id: 4, name: 'Eggs', quantity: 12 }
  ]);

  const addGroceryItem = (name, quantity) => {
    const newItem = {
      id: Date.now(),
      name: name.trim(),
      quantity: parseInt(quantity) || 1
    };
    setGroceryItems([...groceryItems, newItem]);
  };

  const removeGroceryItem = (id) => {
    setGroceryItems(groceryItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setGroceryItems(groceryItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  return (
    <div className="App">
      <div className="grocery-container">
        <header className="app-header">
          <h1>Grocery List</h1>
        </header>
        
        <AddItemForm onAddItem={addGroceryItem} />
        <GroceryList 
          items={groceryItems}
          onRemoveItem={removeGroceryItem}
          onUpdateQuantity={updateQuantity}
        />
      </div>
    </div>
  );
}

export default App;