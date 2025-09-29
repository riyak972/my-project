import React, { useState } from 'react';

const AddItemForm = ({ onAddItem }) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (itemName.trim() === '') {
      alert('Please enter an item name');
      return;
    }

    onAddItem(itemName, quantity);
    setItemName('');
    setQuantity(1);
  };

  return (
    <form onSubmit={handleSubmit} className="add-item-form">
      <h2>Add New Item</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Enter item name..."
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="item-input"
        />
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="quantity-input"
        />
        <button type="submit" className="add-button">
          Add Item
        </button>
      </div>
    </form>
  );
};

export default AddItemForm;