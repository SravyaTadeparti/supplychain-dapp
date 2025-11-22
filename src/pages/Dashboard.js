import React, { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../Web3Context";
import { STATUS_MAPPING } from "../config";
import "./Dashboard.css"; // Keep your CSS import

const Dashboard = () => {
    // 👇 ALL HOOK CALLS MUST BE HERE, AT THE TOP LEVEL 👇
    const { 
        isWalletConnected, 
        currentAccount, 
        contractInstance,
        userRole // Extracted at top level to obey Rules of Hooks
    } = useWeb3(); 
    
    // State for the item tracking search
    const [trackId, setTrackId] = useState('');

    // State for the list of items owned by the current user
    const [ownedItems, setOwnedItems] = useState([]);
    const [loadingOwned, setLoadingOwned] = useState(false);
    
    // State for the global metric cards (MOCKED/SCANNED)
    const [metrics, setMetrics] = useState({
        totalItems: 0,
        inTransit: 0,
        delivered: 0,
        rejected: 0,
    });

    // --- FUNCTION: Fetch Item Details (Single Item) ---
    const fetchItemDetails = useCallback(async (itemId) => {
        if (!contractInstance) return null;
        try {
            const details = await contractInstance.getItemBasic(itemId);
            
            if (details.itemId.toNumber() === 0) {
                return null;
            }

            const statusInfo = STATUS_MAPPING[details.status.toNumber()] || { label: "Unknown", color: "gray" };

            return {
                itemId: details.itemId.toNumber(),
                name: details.name,
                owner: details.currentOwner,
                status: statusInfo.label,
                statusColor: statusInfo.color
            };
        } catch (error) {
            console.error(`Error fetching details for item ${itemId}:`, error);
            return null;
        }
    }, [contractInstance]);
    

    // --- EFFECT: Load Data for the Connected User ---
    useEffect(() => {
        const loadOwnedItems = async () => {
            if (!isWalletConnected || !contractInstance || !currentAccount) {
                setOwnedItems([]);
                return;
            }

            setLoadingOwned(true);
            
            // NOTE: Mock scan up to ID 10 for demonstration. Replace with actual logic 
            // (e.g., fetching total item count from contract) in production.
            const MAX_SCAN_ID = 10; 
            let items = [];
            let counts = { created: 0, inTransit: 0, delivered: 0, rejected: 0 };
            let total = 0;

            for (let i = 1; i <= MAX_SCAN_ID; i++) {
                const item = await fetchItemDetails(i);
                if (item) {
                    total++;
                    
                    if (item.owner.toLowerCase() === currentAccount.toLowerCase()) {
                        items.push(item);
                    }
                    
                    if (item.status === 'In Transit') counts.inTransit++;
                    if (item.status === 'Delivered') counts.delivered++;
                    if (item.status === 'Rejected') counts.rejected++;
                    if (item.status === 'Created') counts.created++;
                }
            }

            setOwnedItems(items);
            setMetrics({
                totalItems: total,
                inTransit: counts.inTransit,
                delivered: counts.delivered,
                rejected: counts.rejected,
            });
            setLoadingOwned(false);
        };

        loadOwnedItems();

    }, [isWalletConnected, currentAccount, contractInstance, fetchItemDetails]);


    // --- FUNCTION: Handle Tracking Search ---
    const handleTrackSearch = () => {
        if (trackId) {
            alert(`Simulating redirect to Customer page for Item ID: ${trackId}`);
            // In a real app: use navigate('/customer', { state: { itemId: trackId } })
        }
    };


    // --- UI RENDERING ---
    const totalActiveShipments = metrics.inTransit + metrics.created;

    if (!isWalletConnected) {
        return (
            <div className="dashboard-container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Supply Chain Dashboard</h2>
                <p style={{ color: 'red' }}>⚠️ **Please connect your MetaMask wallet to view the dashboard data.**</p>
            </div>
        );
    }
    
    return (
        <div className="dashboard-container">
            {/* PAGE TITLE - Using the top-level userRole variable */}
            <h2 className="page-title">Supply Chain Dashboard (Role: {userRole})</h2>

            {/* METRIC CARDS - USING REAL-TIME DATA */}
            <div className="metrics-row">

                <div className="metric-card">
                    <h4>Total Products on Chain</h4>
                    <h2>{metrics.totalItems}</h2> 
                    <p className="metric-footer positive">Total items ever created (up to mock scan ID)</p>
                </div>

                <div className="metric-card">
                    <h4>Items Owned By You</h4>
                    <h2>{ownedItems.length}</h2>
                    <p className="metric-footer positive">Ready for your next action</p>
                </div>

                <div className="metric-card">
                    <h4>Active Shipments</h4>
                    <h2>{totalActiveShipments}</h2>
                    <p className="metric-footer warning">{metrics.inTransit} In Transit, {metrics.created} Created/Awaiting Pickup</p>
                </div>

                <div className="metric-card">
                    <h4>Rejected Items</h4>
                    <h2>{metrics.rejected}</h2>
                    <p className="metric-footer danger">Requires attention (Global Count)</p>
                </div>

            </div>

            {/* PRODUCT TRACKING */}
            <div className="tracking-box">
                <h3>Product Tracking (Search)</h3>
                <div className="tracking-row">
                    <input 
                        placeholder="Enter Product ID (e.g., 1, 2)" 
                        className="tracking-input"
                        type="number"
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                    />
                    <button className="track-btn" onClick={handleTrackSearch}>Track Product</button>
                    <button className="scan-btn" disabled>Scan QR</button> 
                </div>
            </div>

            {/* TWO COLUMNS SECTION */}
            <div className="two-col-section">

                {/* ITEMS OWNED BY YOU */}
                <div className="panel">
                    <h3>Items Awaiting Your Action ({ownedItems.length})</h3>
                    {loadingOwned ? (
                        <p>Loading your item inventory...</p>
                    ) : ownedItems.length === 0 ? (
                        <p>You currently do not own any items or have not created any.</p>
                    ) : (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {ownedItems.map(item => (
                                <div key={item.itemId} className="transaction-box" style={{ borderLeft: `5px solid ${item.statusColor || '#ccc'}` }}>
                                    <h4>Item ID: {item.itemId} &mdash; {item.name}</h4>
                                    <p>Status: <strong style={{ color: item.statusColor }}>{item.status}</strong></p>
                                    <small>Owned since last transaction</small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ANALYTICS SECTION (MOCKED) */}
                <div className="panel">
                    <h3>Global Supply Chain Analytics (Mocked)</h3>
                    <p>Product Categories</p>
                    <div className="analytics-bar">
                        <span>Food & Beverages</span>
                        <div className="bar"><div className="fill" style={{width: "33%", backgroundColor: '#4CAF50'}}></div></div>
                    </div>
                    <div className="analytics-bar">
                        <span>Electronics</span>
                        <div className="bar"><div className="fill" style={{width: "33%", backgroundColor: '#007bff'}}></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;