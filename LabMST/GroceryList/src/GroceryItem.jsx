import React from 'react';

const GroceryItem = ({ item, onRemove, onUpdateQuantity }) => {
  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="grocery-item">
      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <div className="quantity-controls">
          <button 
            className="quantity-btn" 
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="quantity-display">{item.quantity}</span>
          <button className="quantity-btn" onClick={handleIncrement}>
            +
          </button>
        </div>
      </div>
      <button 
        className="remove-btn"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
      >
        REMOVE
      </button>
    </div>
  );
};

export default GroceryItem;