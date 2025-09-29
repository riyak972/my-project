import React from 'react';
import GroceryItem from './GroceryItem';

const GroceryList = ({ items, onRemoveItem, onUpdateQuantity }) => {
  if (items.length === 0) {
    return (
      <div className="grocery-list">
        <h2>Grocery List</h2>
        <p className="empty-message">Your grocery list is empty. Add some items!</p>
      </div>
    );
  }

  return (
    <div className="grocery-list">
      <h2>Grocery List ({items.length} items)</h2>
      <div className="items-container">
        {items.map(item => (
          <GroceryItem
            key={item.id}
            item={item}
            onRemove={onRemoveItem}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </div>
  );
};

export default GroceryList;