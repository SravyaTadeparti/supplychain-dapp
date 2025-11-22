import React, { useState } from 'react';
import { useWeb3 } from '../Web3Context'; 

const Distributor = () => {
    const { isWalletConnected, userRole, contractInstance } = useWeb3();

    // --- State for Transfer Item Form ---
    const [transferItemId, setTransferItemId] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [transferNote, setTransferNote] = useState('');
    const [transferTxStatus, setTransferTxStatus] = useState(null);
    const [transferTxHash, setTransferTxHash] = useState(null);
    const [isTransferLoading, setIsTransferLoading] = useState(false);

    // --- State for Mark Rejected Form ---
    const [rejectItemId, setRejectItemId] = useState('');
    const [rejectNote, setRejectNote] = useState('');
    const [rejectTxStatus, setRejectTxStatus] = useState(null);
    const [rejectTxHash, setRejectTxHash] = useState(null);
    const [isRejectLoading, setIsRejectLoading] = useState(false);

    // --- FUNCTION: TRANSFER ITEM (Write Transaction) ---
    const handleTransferItem = async (e) => {
        e.preventDefault();
        
        if (!contractInstance) return alert("Wallet not connected or contract not initialized.");
        // Check for Distributor role
        if (userRole !== 'Distributor') return alert("Error: You must be connected as a Distributor.");
        if (!transferItemId || !toAddress || !transferNote) return alert("Please fill in all fields for transfer.");

        setIsTransferLoading(true);
        setTransferTxStatus(null);
        setTransferTxHash(null);

        try {
            const itemId = parseInt(transferItemId);
            const tx = await contractInstance.transferItem(itemId, toAddress, transferNote);
            
            setTransferTxStatus('Transfer transaction sent. Waiting for confirmation...');
            setTransferTxHash(tx.hash);

            await tx.wait();

            setTransferTxStatus('Item successfully transferred to new recipient!');
            setTransferItemId('');
            setToAddress('');
            setTransferNote('');

        } catch (error) {
            console.error("Error transferring item:", error);
            const errorMessage = error.message.includes('revert') 
                ? 'Transfer failed (Smart Contract Revert: Check item ownership/ID).' 
                : 'Transfer failed. Check console for details.';
            setTransferTxStatus(errorMessage);
        } finally {
            setIsTransferLoading(false);
        }
    };

    // --- FUNCTION: MARK REJECTED (Write Transaction) ---
    const handleMarkRejected = async (e) => {
        e.preventDefault();

        if (!contractInstance) return alert("Wallet not connected or contract not initialized.");
        // Check for Distributor role
        if (userRole !== 'Distributor') return alert("Error: You must be connected as a Distributor.");
        if (!rejectItemId || !rejectNote) return alert("Please enter Item ID and a Note for rejection.");
        
        setIsRejectLoading(true);
        setRejectTxStatus(null);
        setRejectTxHash(null);

        try {
            const itemId = parseInt(rejectItemId);
            console.log(`Marking Item ID ${itemId} as Rejected.`);
            
            // 1. Call the markRejected contract function
            const tx = await contractInstance.markRejected(itemId, rejectNote);
            
            setRejectTxStatus('Rejection transaction sent. Waiting for confirmation...');
            setRejectTxHash(tx.hash);

            // 2. Wait for the transaction to be mined
            await tx.wait();

            // 3. Success Feedback
            setRejectTxStatus('Item successfully marked as "Rejected"! 🚫');
            setRejectItemId('');
            setRejectNote('');

        } catch (error) {
            console.error("Error marking Rejected:", error);
            const errorMessage = error.message.includes('revert') 
                ? 'Rejection failed (Smart Contract Revert: Check item status/ownership).' 
                : 'Rejection failed. Check console for details.';
            setRejectTxStatus(errorMessage);
        } finally {
            setIsRejectLoading(false);
        }
    };

    // --- UI RENDERING LOGIC ---
    if (!isWalletConnected) {
        return (
            <div style={{ padding: "2rem", color: 'red' }}>
                <h2>Distributor Dashboard</h2>
                <p>⚠️ **Please connect your wallet to access this dashboard.**</p>
            </div>
        );
    }

    if (userRole !== 'Distributor') {
        return (
            <div style={{ padding: "2rem", color: 'orange' }}>
                <h2>Distributor Dashboard</h2>
                <p>🚫 **Access Denied.** Your connected account is **{userRole}** and cannot access Distributor functions.</p>
                <p>Try connecting with a Distributor address.</p>
            </div>
        );
    }

    // Main Distributor Dashboard UI
    return (
        <div style={{ padding: "2rem", display: 'flex', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* LEFT SIDE: TRANSFER ITEM */}
            <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h2>🔄 Transfer Item Custody</h2>
                <p>Hand over the item to the next participant (e.g., Retailer).</p>
                
                <form onSubmit={handleTransferItem} style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="transferItemId" style={{ display: 'block', marginBottom: '5px' }}>Item ID:</label>
                        <input 
                            type="number" 
                            id="transferItemId"
                            value={transferItemId} 
                            onChange={(e) => setTransferItemId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="toAddress" style={{ display: 'block', marginBottom: '5px' }}>Recipient Address (0x...):</label>
                        <input 
                            type="text" 
                            id="toAddress"
                            value={toAddress} 
                            onChange={(e) => setToAddress(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                        <label htmlFor="transferNote" style={{ display: 'block', marginBottom: '5px' }}>Transfer Note:</label>
                        <textarea 
                            id="transferNote"
                            value={transferNote} 
                            onChange={(e) => setTransferNote(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', minHeight: '40px' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isTransferLoading}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            backgroundColor: isTransferLoading ? '#888' : '#3498db', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: isTransferLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1.1rem'
                        }}
                    >
                        {isTransferLoading ? 'Processing Transfer...' : '📦 Transfer Item to Next Party'}
                    </button>
                </form>

                {/* Transfer TRANSACTION FEEDBACK */}
                {transferTxStatus && (
                    <div style={{ marginTop: '20px', padding: '15px', borderRadius: '4px', backgroundColor: transferTxStatus.includes('successfully') ? '#d1ecf1' : '#f8d7da', border: '1px solid #ccc' }}>
                        <p><strong>Status:</strong> {transferTxStatus}</p>
                        {transferTxHash && (
                            <p><strong>Tx Hash:</strong> <a href={`https://etherscan.io/tx/${transferTxHash}`} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>{transferTxHash}</a></p>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: MARK REJECTED */}
            <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h2>❌ Mark Item Rejected</h2>
                <p>Use this if the item is damaged, faulty, or fails inspection.</p>
                
                <form onSubmit={handleMarkRejected} style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="rejectItemId" style={{ display: 'block', marginBottom: '5px' }}>Item ID:</label>
                        <input 
                            type="number" 
                            id="rejectItemId"
                            value={rejectItemId} 
                            onChange={(e) => setRejectItemId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                        <label htmlFor="rejectNote" style={{ display: 'block', marginBottom: '5px' }}>Rejection Reason/Note:</label>
                        <textarea 
                            id="rejectNote"
                            value={rejectNote} 
                            onChange={(e) => setRejectNote(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', minHeight: '40px' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isRejectLoading}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            backgroundColor: isRejectLoading ? '#888' : '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: isRejectLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1.1rem'
                        }}
                    >
                        {isRejectLoading ? 'Processing Rejection...' : '🚨 Mark Item Rejected'}
                    </button>
                </form>

                {/* Reject TRANSACTION FEEDBACK */}
                {rejectTxStatus && (
                    <div style={{ marginTop: '20px', padding: '15px', borderRadius: '4px', backgroundColor: rejectTxStatus.includes('successfully') ? '#f8d7da' : '#f8d7da', border: '1px solid #f5c6cb' }}>
                        <p><strong>Status:</strong> {rejectTxStatus}</p>
                        {rejectTxHash && (
                            <p><strong>Tx Hash:</strong> <a href={`https://etherscan.io/tx/${rejectTxHash}`} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>{rejectTxHash}</a></p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Distributor;