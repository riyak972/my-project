import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../cartSlice';

export default function Cart() {
  const items = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  if (items.length === 0) return <p>Your cart is empty.</p>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id} style={styles.item}>
          <span>
            {item.name} (${item.price})
          </span>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={e =>
              dispatch(
                updateQuantity({ id: item.id, quantity: Number(e.target.value) })
              )
            }
            style={styles.input}
          />
          <button onClick={() => dispatch(removeFromCart(item.id))}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  item: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  input: {
    width: '50px',
    textAlign: 'center',
  },
};
