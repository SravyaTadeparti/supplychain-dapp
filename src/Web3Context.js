import React, { createContext, useState } from 'react';
import { ethers } from 'ethers'; // Make sure you run: npm install ethers

// --- MOCK DATA SECTION (REPLACE WITH REAL VALUES LATER) ---
const MOCK_ROLES = {
  // Use lower-case addresses for reliable comparison
  '0xmanufacturerMockAddress000000000000000000000': 'Manufacturer',
  '0xsupplierMockAddress111111111111111111111': 'Supplier',
  '0xretailerMockAddress222222222222222222222': 'Retailer',
  // You can add Distributor and others here later
};

const CONTRACT_ADDRESS = '0xMockContractAddressFFFFFFFFFFFFFFFFFFFFFFFF';
// This ABI array is crucial for ethers.js to know what functions exist.
// We only need the functions required for role determination and item creation/viewing for now.
const ABI = [ 
    /* The real contract ABI goes here */ 
    { "inputs": [], "name": "manufacturerAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
    // Add other required ABI entries later (createItem, getItemBasic, etc.)
];
// --- END MOCK DATA SECTION ---


// 1. Context Creation
export const Web3Context = createContext({
  isWalletConnected: false,
  currentAccount: null,
  userRole: 'Others', // Manufacturer, Supplier, Retailer, Others
  contractInstance: null,
  connectWallet: () => {},
});

// Helper to determine the role based on the connected address
const getRole = (address) => {
    if (!address) return 'Others';
    
    // Check against mock roles (simple matching for now)
    const role = MOCK_ROLES[address.toLowerCase()];
    return role || 'Others';
};

// 2. The Provider Component
export const Web3Provider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [userRole, setUserRole] = useState('Others');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it to use this DApp.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Initialize Contract with the signer so we can send transactions
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      setCurrentAccount(account);
      setUserRole(getRole(account)); // Determine role based on connected account
      setContractInstance(contract);

      // Add listeners for account/network changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        // Reloading the page is often the simplest way to handle account changes
        window.location.reload(); 
      });

    } catch (error) {
      console.error("Connection failed:", error);
      alert("Failed to connect wallet. See console for details.");
    }
  };
  
  // The context value
  const contextValue = {
    isWalletConnected: !!currentAccount,
    currentAccount,
    userRole,
    contractInstance,
    connectWallet,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// 3. Custom Hook for easy access
export const useWeb3 = () => React.useContext(Web3Context);