import React, { useState, useCallback } from 'react';
import { useWeb3 } from '../Web3Context'; 
import { STATUS_MAPPING } from '../config'; // Assuming you added STATUS_MAPPING to config.js

const Customer = () => {
    // Access global web3 state and contract instance (signer not strictly needed for read-only)
    const { isWalletConnected, contractInstance } = useWeb3();

    // State for Search Form
    const [searchItemId, setSearchItemId] = useState('');
    
    // State for fetched item data
    const [itemDetails, setItemDetails] = useState(null);
    const [itemHistory, setItemHistory] = useState([]);
    
    // State for loading and error feedback
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- HELPER FUNCTION: Fetch and display item history ---
    const fetchItemHistory = useCallback(async (itemId) => {
        const historyCount = await contractInstance.getItemHistoryCount(itemId);
        const historyArray = [];

        // Loop through the history entries
        for (let i = 0; i < historyCount.toNumber(); i++) {
            const entry = await contractInstance.getItemHistoryEntry(itemId, i);
            historyArray.push({
                action: entry.action,
                role: entry.role,
                address: entry.participantAddress,
                note: entry.note,
                timestamp: new Date(entry.timestamp.toNumber() * 1000).toLocaleString(),
            });
        }
        setItemHistory(historyArray);
    }, [contractInstance]);


    // --- FUNCTION: HANDLE ITEM LOOKUP ---
    const handleItemLookup = async (e) => {
        e.preventDefault();
        
        if (!contractInstance) return setError("Wallet not connected. Please connect to read data.");
        if (!searchItemId) return setError("Please enter an Item ID.");

        setIsLoading(true);
        setError(null);
        setItemDetails(null);
        setItemHistory([]);

        try {
            const itemId = parseInt(searchItemId);

            // 1. Fetch Basic Item Details (Read-only call)
            const details = await contractInstance.getItemBasic(itemId);

            // Check if item exists (often signaled by ID or status not being default/0)
            if (details.itemId.toNumber() === 0 && details.name === "") {
                 throw new Error("Item ID not found on the blockchain.");
            }

            // Map status code to label/color using the imported STATUS_MAPPING
            const statusInfo = STATUS_MAPPING[details.status.toNumber()] || { label: "Unknown", color: "gray" };

            setItemDetails({
                itemId: details.itemId.toNumber(),
                name: details.name,
                owner: details.currentOwner,
                manufacturer: details.manufacturer,
                authHash: details.authHash,
                status: statusInfo.label,
                statusColor: statusInfo.color
            });

            // 2. Fetch Item History
            await fetchItemHistory(itemId);

        } catch (err) {
            console.error("Error fetching item data:", err);
            setError(err.message || "Failed to fetch item data. Check console.");
        } finally {
            setIsLoading(false);
        }
    };
    // ------------------------------------

    // --- UI RENDERING LOGIC ---
    return (
        <div style={{ padding: "2rem", maxWidth: '900px', margin: '0 auto' }}>
            <h1>🔎 Customer Traceability Dashboard</h1>
            <p style={{ marginBottom: '2rem' }}>Enter the product's unique Item ID to trace its journey and verify its authenticity.</p>
            
            {/* SEARCH FORM */}
            <form onSubmit={handleItemLookup} style={{ 
                padding: '20px', 
                border: '1px solid #007bff', 
                borderRadius: '8px', 
                backgroundColor: '#e9f5ff',
                marginBottom: '20px'
            }}>
                <label htmlFor="searchItemId" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Enter Item ID:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="number" 
                        id="searchItemId"
                        value={searchItemId} 
                        onChange={(e) => setSearchItemId(e.target.value)}
                        required
                        placeholder="e.g., 1, 2, 3..."
                        style={{ flexGrow: 1, padding: '10px', boxSizing: 'border-box' }}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !isWalletConnected}
                        style={{ 
                            padding: '10px 20px', 
                            backgroundColor: isLoading ? '#888' : '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Searching...' : 'Search Item'}
                    </button>
                </div>
                {!isWalletConnected && <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>Please connect your wallet to read data.</small>}
            </form>

            {/* FEEDBACK/RESULTS SECTION */}
            
            {error && (
                <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '20px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {itemDetails && (
                <>
                    {/* ITEM BASIC DETAILS */}
                    <div style={{ marginBottom: '30px', border: '1px solid #333', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
                        <h2>Product Details (Item ID: {itemDetails.itemId})</h2>
                        <p><strong>Name:</strong> {itemDetails.name}</p>
                        <p><strong>Manufacturer:</strong> {itemDetails.manufacturer}</p>
                        <p><strong>Current Owner:</strong> {itemDetails.owner}</p>
                        <p><strong>Authenticity Hash (Original Metadata):</strong> <code style={{ wordBreak: 'break-all' }}>{itemDetails.authHash}</code></p>
                        <p>
                            <strong>Current Status:</strong> 
                            <span style={{ 
                                fontWeight: 'bold', 
                                color: 'white', 
                                backgroundColor: itemDetails.statusColor, 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                marginLeft: '10px' 
                            }}>
                                {itemDetails.status}
                            </span>
                        </p>
                    </div>

                    {/* ITEM HISTORY TIMELINE */}
                    <h2>📦 Supply Chain History</h2>
                    <HistoryTimeline history={itemHistory} /> {/* Use a helper component for cleaner display */}
                </>
            )}
        </div>
    );
};

// --- History Timeline Helper Component (for cleaner UI) ---
const HistoryTimeline = ({ history }) => {
    if (history.length === 0) {
        return <p>No history found for this item.</p>;
    }

    return (
        <div style={{ borderLeft: '2px solid #ccc', paddingLeft: '20px' }}>
            {history.map((entry, index) => (
                <div key={index} style={{ marginBottom: '20px', position: 'relative' }}>
                    {/* Timeline Dot */}
                    <div style={{ 
                        position: 'absolute', 
                        left: '-28px', 
                        top: '0px', 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '50%', 
                        backgroundColor: '#333',
                        border: '3px solid white'
                    }}></div>

                    <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                        <p style={{ margin: 0 }}>
                            <strong style={{ color: '#007bff' }}>{entry.action}</strong> 
                            &mdash; Done by {entry.role} ({entry.address.substring(0, 6)}...)
                        </p>
                        <p style={{ margin: '5px 0' }}>**Note:** {entry.note}</p>
                        <small style={{ color: '#6c757d' }}>{entry.timestamp}</small>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Customer;