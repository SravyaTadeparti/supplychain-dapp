import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const navStyle = {
    padding: "1rem",
    background: "#1e1e1e",
    color: "#fff",
    display: "flex",
    gap: "1.5rem",
    fontSize: "1.1rem"
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
      <Link to="/manufacturer" style={{ color: "white", textDecoration: "none" }}>Manufacturer</Link>
      <Link to="/supplier" style={{ color: "white", textDecoration: "none" }}>Supplier</Link>
      <Link to="/distributor" style={{ color: "white", textDecoration: "none" }}>Distributor</Link>
      <Link to="/retailer" style={{ color: "white", textDecoration: "none" }}>Retailer</Link>
      <Link to="/customer" style={{ color: "white", textDecoration: "none" }}>Customer</Link>
    </nav>
  );
};

export default Navbar;
