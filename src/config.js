// src/config.js

// --- CONFIGURATION REQUIRED ---
// ⚠️ REPLACE THESE MOCK VALUES WITH YOUR ACTUAL DEPLOYED CONTRACT ADDRESS AND ABI ⚠️

export const CONTRACT_ADDRESS = "0xMockContractAddressFFFFFFFFFFFFFFFFFFFFFFFF"; 

// Only include the ABI entries for the functions you plan to use!
export const ABI = [ 
  // Example ABI entry structure for clarity:
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_authHash", "type": "string" },
      { "internalType": "string", "name": "_note", "type": "string" }
    ],
    "name": "createItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ... Paste the rest of your contract's ABI array here
];

// --- ROLE MAPPING ---
// Map specific addresses to roles for access control. Use lowercase addresses.
export const MOCK_ROLES = {
  '0xmanufacturerMockAddress000000000000000000000': 'Manufacturer',
  '0xsupplierMockAddress111111111111111111111': 'Supplier',
  '0xdistributorMockAddress222222222222222222222': 'Distributor',
  '0xretailerMockAddress333333333333333333333': 'Retailer',
};

// --- STATUS MAPPING ---
// Map the Solidity Status Enum (typically 0, 1, 2, 3...) to a label and color
export const STATUS_MAPPING = {
    0: { label: "Created", color: "#4CAF50" }, // Green
    1: { label: "In Transit", color: "#FF9800" }, // Orange
    2: { label: "Delivered", color: "#2196F3" }, // Blue
    3: { label: "Rejected", color: "#F44336" }, // Red
    // Add other statuses as needed
};