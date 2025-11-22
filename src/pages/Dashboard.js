import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">

      {/* PAGE TITLE */}
      <h2 className="page-title">Supply Chain Dashboard</h2>

      {/* METRIC CARDS */}
      <div className="metrics-row">

        <div className="metric-card">
          <h4>Total Products</h4>
          <h2>3</h2>
          <p className="metric-footer positive">+12.5% from last month</p>
        </div>

        <div className="metric-card">
          <h4>Active Shipments</h4>
          <h2>1</h2>
          <p className="metric-footer warning">3.2 days avg delivery</p>
        </div>

        <div className="metric-card">
          <h4>Verified Products</h4>
          <h2>66.7%</h2>
          <p className="metric-footer positive">High authenticity</p>
        </div>

        <div className="metric-card">
          <h4>Network Partners</h4>
          <h2>2</h2>
          <p className="metric-footer danger">-12 active</p>
        </div>

      </div>

      {/* PRODUCT TRACKING */}
      <div className="tracking-box">
        <h3>Product Tracking</h3>
        <div className="tracking-row">
          <input 
            placeholder="Enter Product ID / Hash" 
            className="tracking-input"
          />
          <button className="track-btn">Track Product</button>
          <button className="scan-btn">Scan QR</button>
        </div>
      </div>

      {/* TWO COLUMNS SECTION */}
      <div className="two-col-section">

        {/* RECENT TRANSACTIONS */}
        <div className="panel">
          <h3>Recent Blockchain Transactions</h3>
          <div className="transaction-box">
            <h4>Verification</h4>
            <p>Organic Coffee Beans verified at distributor checkpoint</p>
            <small>27 min ago</small>
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="panel">
          <h3>Supply Chain Analytics</h3>
          <p>Product Categories</p>
          <div className="analytics-bar">
            <span>Food & Beverages</span>
            <div className="bar"><div className="fill" style={{width: "33%"}}></div></div>
          </div>
          <div className="analytics-bar">
            <span>Electronics</span>
            <div className="bar"><div className="fill" style={{width: "33%"}}></div></div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
