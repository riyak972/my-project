import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(response => {
        setProducts(response.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching products:', err)
        setError('Failed to fetch products')
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading products...</p>
  if (error) return <p>{error}</p>

  return (
    <div className="container">
      <h1>Product List</h1>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p>Price: ${product.price}</p>
            <button>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
