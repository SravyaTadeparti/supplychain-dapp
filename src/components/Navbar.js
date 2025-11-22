import React from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from '../Web3Context'; // <-- Import the hook

const Navbar = () => {
  // 1. Destructure state and function from the global context
  const { isWalletConnected, currentAccount, userRole, connectWallet } = useWeb3();

  // 2. Format the address for display
  const displayAddress = currentAccount 
    ? `${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}` 
    : 'Not Connected';

  const navStyle = {
    padding: "1rem",
    background: "#1e1e1e",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between", // Spread elements
    alignItems: "center",            // Center vertically
    fontSize: "1.1rem"
  };

  const navLinksStyle = {
    display: "flex", 
    gap: "1.5rem"
  };
  
  const statusContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  };

  return (
    <nav style={navStyle}>
      {/* LEFT: Navigation Links */}
      <div style={navLinksStyle}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
        <Link to="/manufacturer" style={{ color: "white", textDecoration: "none" }}>Manufacturer</Link>
        <Link to="/supplier" style={{ color: "white", textDecoration: "none" }}>Supplier</Link>
        <Link to="/distributor" style={{ color: "white", textDecoration: "none" }}>Distributor</Link>
        <Link to="/retailer" style={{ color: "white", textDecoration: "none" }}>Retailer</Link>
        <Link to="/customer" style={{ color: "white", textDecoration: "none" }}>Customer</Link>
      </div>

      {/* RIGHT: Status and Connect Button */}
      <div style={statusContainerStyle}>
        
        {/* User Role Display */}
        <div style={{ padding: '4px 10px', backgroundColor: '#333', borderRadius: '4px' }}>
          Role: <strong style={{ color: '#00bcd4' }}>{userRole}</strong>
        </div>

        {isWalletConnected ? (
          // Display truncated address if connected
          <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{displayAddress}</span>
        ) : (
          // Display Connect Button if not connected
          <button 
            onClick={connectWallet} // <-- Calls the context function
            style={{ 
              padding: '8px 12px', 
              cursor: 'pointer', 
              backgroundColor: '#f6851b', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            🔌 Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;