import React, { useState } from "react";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username || !password) {
      setMessage("⚠️ Please fill in both fields!");
      return;
    }

    // Check credentials
    if (username === "BYTEXL" && password === "12345") {
      setMessage("✅ Login successful! Welcome, BYTEXL!");
      console.log("Login successful!");
    } else {
      setMessage("❌ Invalid username or password!");
      console.log("Login failed!");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login Form</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={formData.username}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
        />

        {message && <p style={styles.message}>{message}</p>}

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: "320px",
    margin: "80px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f8f9fa",
  },
  title: {
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginBottom: "10px",
    padding: "10px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
  },
};

export default LoginForm;
