import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Manufacturer from "./pages/Manufacturer";
import Supplier from "./pages/Supplier";
import Distributor from "./pages/Distributor";
import Retailer from "./pages/Retailer";
import Customer from "./pages/Customer";
import Dashboard from "./pages/Dashboard";


// Components
import Navbar from "./components/Navbar";
import { Web3Provider } from "./Web3Context"; // <-- NEW IMPORT

function App() {
  return (
    <Web3Provider>
      <Router>
        <Navbar />

        <Routes>

          {/* Home / Landing Page */}
          <Route
            path="/"
            element={
              <div style={{ padding: "2rem" }}>
                <h1>Welcome to the Supply Chain DApp</h1>
                <p>Select your role from the navigation bar.</p>
              </div>
            }
          />

          {/* Role Pages */}
          <Route path="/manufacturer" element={<Manufacturer />} />
          <Route path="/supplier" element={<Supplier />} />
          <Route path="/distributor" element={<Distributor />} />
          <Route path="/retailer" element={<Retailer />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/dashboard" element={<Dashboard />} />


          {/* 404 Fallback Route */}
          <Route
            path="*"
            element={
              <div style={{ padding: "2rem" }}>
                <h1>404 Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            }
          />

        </Routes>
      </Router>
    </Web3Provider>
  );
}

export default App;
