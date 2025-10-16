# Redux Toolkit Shopping Cart

A React application demonstrating global state management using Redux Toolkit to implement a shopping cart.

---

## Objective
- Learn to manage global state in a React project using Redux Toolkit.
- Understand slices, actions, reducers, and connecting components to the Redux store.
- Implement real-time cart updates that reflect changes immediately in the UI.

---

## Task Description
- Display a list of products in a React application.
- Allow users to add products to a shopping cart.
- Manage cart state globally using Redux Toolkit:
  - Actions for adding items, removing items, and updating quantities
  - Cart state accessible across all components
- Create a cart component displaying items, their price, and quantity.
- Use `useSelector` and `useDispatch` hooks to connect React components to the Redux store.
- Test by adding, updating, and removing items, verifying that UI updates instantly.

---

## Architecture

| Layer         | Technology          | Responsibility                     |
|---------------|-------------------|-----------------------------------|
| Frontend      | React + Redux Toolkit | Display products, manage cart state |
| Backend       | Node.js + Express | Provide backend API support        |
| Communication | HTTP + JSON       | Data transfer between frontend and backend |

---

## Explanation

### Backend
- Simple Express server running on port 5000.
- CORS enabled for frontend requests.
- Provides basic endpoint confirming backend is running.

### Frontend (React)
- `ProductList` component displays all products.
- `Cart` component shows items added to the cart with their quantities and prices.
- Redux Toolkit manages cart state globally, allowing any component to access and modify the cart.

### State Management (Redux Toolkit)
- **Slice** defines cart state and reducers for add, remove, and update actions.
- **Actions** dispatched using `useDispatch`.
- **State** accessed using `useSelector`.

### UI Components
- **Product List**: Displays available products with add-to-cart option.
- **Cart Component**: Shows selected items with quantity and price.
- **Buttons**: Add, remove, and adjust quantities in the cart.

---

## Setup

### Backend
1. Navigate to backend folder
2. Install dependencies: `npm install`
3. Start server: `node server.js` (Port: 5000)

### Frontend
1. Navigate to frontend folder
2. Install dependencies: `npm install`
3. Start React app: `npm start`
4. Open `http://localhost:3000` in browser

---

## Testing
- Product list displays correctly
- Adding/removing items from cart works
- Quantities update correctly
- Cart state changes reflect immediately in UI

---

## Learning Outcomes
- Understand global state management using Redux Toolkit
- Learn to create slices, actions, and reducers
- Connect React components to Redux store using hooks
- Manage asynchronous data and UI updates
- Build a responsive shopping cart application
