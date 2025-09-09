import React from "react";
import "./App.css";

// Reusable ProductCard Component
function ProductCard({ name, price, status }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Price: ${price}</p>
      <p className={status === "In Stock" ? "in-stock" : "out-stock"}>
        Status: {status}
      </p>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <div className="container">
      <h1>Products List</h1>
      <div className="products">
        <ProductCard name="Wireless Mouse" price={25.99} status="In Stock" />
        <ProductCard name="Keyboard" price={45.5} status="Out of Stock" />
        <ProductCard name="Monitor" price={199.99} status="In Stock" />
      </div>
    </div>
  );
}

export default App;
