# Connecting React Frontend to Express API Using Axios

A simple full-stack project demonstrating how to connect a React frontend to an Express.js backend API using Axios for data fetching.

---

## Objective
- Learn to integrate a React frontend with a backend Express.js API.
- Understand handling HTTP requests, loading states, and error management in React.
- Display dynamic data fetched from a backend API in a user-friendly layout.

---

## Task Description
- Build an Express.js backend API that returns a list of products (name and price).
- Create a React frontend component that fetches product data using Axios.
- Display the product list with name, price, and a "Buy Now" button.
- Handle loading states and errors during data fetching.
- Test the connection by running frontend and backend locally and verifying real-time data rendering.

---

## Architecture

| Layer         | Technology      | Responsibility                    |
|---------------|----------------|----------------------------------|
| Frontend      | React + Axios  | Fetch and display product data   |
| Backend       | Node.js + Express | Serve product API               |
| Communication | HTTP/HTTPS      | Data transfer between frontend and backend |

---

## Explanation

### Backend (Express.js)
- Set up a simple Express server running on port 5000.
- Use CORS middleware to allow frontend requests.
- Define a `/api/products` endpoint returning an array of product objects.

### Frontend (React)
- Use `useState` to manage product list, loading, and error states.
- Fetch product data from the backend using Axios inside `useEffect`.
- Display products dynamically with name, price, and "Buy Now" button.
- Show a loading message while fetching and handle errors gracefully.

### Data Flow
1. React component mounts.
2. Axios sends GET request to backend `/api/products`.
3. Backend returns product list as JSON.
4. React updates state and renders products in UI.

### UI Components
- **Product List**: Displays all products from API.
- **Loading/Error Display**: Shows messages during data fetching or on error.
- **Product Card**: Shows product name, price, and "Buy Now" button.

---

## Setup

### Backend
1. Navigate to backend folder
2. Install dependencies: `npm install`
3. Start server: `node server.js` (Port: 5000)

### Frontend
1. Navigate to frontend folder
2. Install dependencies: `npm install`
3. Start React app: `npm start` (Port: 3000)
4. Open `http://localhost:3000` in browser to view product list

---

## Testing
- API returns product list correctly
- React app fetches and displays products
- Loading and error states handled correctly
- Real-time updates reflected after backend changes

---

## Learning Outcomes
- Understand frontend-backend integration using Axios
- Manage state and side-effects in React with `useState` and `useEffect`
- Handle asynchronous HTTP requests and error handling
- Build dynamic UI rendering based on backend data
- Learn basic Express.js API development with CORS
