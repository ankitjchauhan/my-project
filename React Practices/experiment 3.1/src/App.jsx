import React from 'react';
import './App.css';

// Reusable component that accepts props for dynamic data
const ProductCard = ({ name, price, status }) => {
  return (
    <div className="product-card">
      <h3 className="product-name">{name}</h3>
      <p className="product-price">Price: ${price}</p>
      <p className="product-status">Status: {status}</p>
    </div>
  );
};

// Main App component that renders the product cards
function App() {
  return (
    <div className="container">
      <h1 className="title">Products List</h1>
      <div className="products-container">
        <ProductCard
          name="Wireless Mouse"
          price="25.99"
          status="In Stock"
        />
        <ProductCard
          name="Keyboard"
          price="45.5"
          status="Out of Stock"
        />
        <ProductCard
          name="Monitor"
          price="199.99"
          status="In Stock"
        />
      </div>
    </div>
  );
}

export default App;