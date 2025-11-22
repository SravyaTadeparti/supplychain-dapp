import React, { useState } from 'react';
import { useWeb3 } from '../Web3Context'; 

const Supplier = () => {
    const { isWalletConnected, userRole, contractInstance } = useWeb3();

    // --- State for Transfer Item Form ---
    const [transferItemId, setTransferItemId] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [transferNote, setTransferNote] = useState('');
    const [transferTxStatus, setTransferTxStatus] = useState(null);
    const [transferTxHash, setTransferTxHash] = useState(null);
    const [isTransferLoading, setIsTransferLoading] = useState(false);

    // --- State for Mark In Transit Form ---
    const [inTransitItemId, setInTransitItemId] = useState('');
    const [inTransitNote, setInTransitNote] = useState('');
    const [inTransitTxStatus, setInTransitTxStatus] = useState(null);
    const [inTransitTxHash, setInTransitTxHash] = useState(null);
    const [isInTransitLoading, setIsInTransitLoading] = useState(false);

    // --- FUNCTION: TRANSFER ITEM (Write Transaction) ---
    const handleTransferItem = async (e) => {
        e.preventDefault();
        
        if (!contractInstance) return alert("Wallet not connected or contract not initialized.");
        if (userRole !== 'Supplier') return alert("Error: You must be connected as a Supplier.");
        if (!transferItemId || !toAddress || !transferNote) return alert("Please fill in all fields for transfer.");

        setIsTransferLoading(true);
        setTransferTxStatus(null);
        setTransferTxHash(null);

        try {
            const itemId = parseInt(transferItemId);
            console.log(`Transferring Item ID ${itemId} to ${toAddress}`);
            
            // 1. Call the transferItem contract function
            const tx = await contractInstance.transferItem(itemId, toAddress, transferNote);
            
            setTransferTxStatus('Transfer transaction sent. Waiting for confirmation...');
            setTransferTxHash(tx.hash);

            // 2. Wait for the transaction to be mined
            await tx.wait();

            // 3. Success Feedback
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

    // --- FUNCTION: MARK IN TRANSIT (Write Transaction) ---
    const handleMarkInTransit = async (e) => {
        e.preventDefault();

        if (!contractInstance) return alert("Wallet not connected or contract not initialized.");
        if (userRole !== 'Supplier') return alert("Error: You must be connected as a Supplier.");
        if (!inTransitItemId || !inTransitNote) return alert("Please enter Item ID and a Note for 'In Transit'.");
        
        setIsInTransitLoading(true);
        setInTransitTxStatus(null);
        setInTransitTxHash(null);

        try {
            const itemId = parseInt(inTransitItemId);
            console.log(`Marking Item ID ${itemId} as In Transit.`);
            
            // 1. Call the markInTransit contract function
            const tx = await contractInstance.markInTransit(itemId, inTransitNote);
            
            setInTransitTxStatus('In Transit transaction sent. Waiting for confirmation...');
            setInTransitTxHash(tx.hash);

            // 2. Wait for the transaction to be mined
            await tx.wait();

            // 3. Success Feedback
            setInTransitTxStatus('Item successfully marked as "In Transit"! 🚚');
            setInTransitItemId('');
            setInTransitNote('');

        } catch (error) {
            console.error("Error marking In Transit:", error);
            const errorMessage = error.message.includes('revert') 
                ? 'In Transit failed (Smart Contract Revert: Check item status/ownership).' 
                : 'In Transit failed. Check console for details.';
            setInTransitTxStatus(errorMessage);
        } finally {
            setIsInTransitLoading(false);
        }
    };

    // --- UI RENDERING LOGIC ---
    if (!isWalletConnected) {
        return (
            <div style={{ padding: "2rem", color: 'red' }}>
                <h2>Supplier Dashboard</h2>
                <p>⚠️ **Please connect your wallet to access this dashboard.**</p>
            </div>
        );
    }

    if (userRole !== 'Supplier') {
        return (
            <div style={{ padding: "2rem", color: 'orange' }}>
                <h2>Supplier Dashboard</h2>
                <p>🚫 **Access Denied.** Your connected account is **{userRole}** and cannot access Supplier functions.</p>
                <p>Try connecting with a Supplier address.</p>
            </div>
        );
    }

    // Main Supplier Dashboard UI
    return (
        <div style={{ padding: "2rem", display: 'flex', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* LEFT SIDE: TRANSFER ITEM */}
            <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h2>🔄 Transfer Item Ownership</h2>
                <p>Transfer the item's custody to the next party (e.g., Distributor or Retailer).</p>
                
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
                            backgroundColor: isTransferLoading ? '#888' : '#6c757d', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: isTransferLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1.1rem'
                        }}
                    >
                        {isTransferLoading ? 'Processing Transfer...' : '🚀 Transfer Item'}
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

            {/* RIGHT SIDE: MARK IN TRANSIT */}
            <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h2>🚚 Mark Item In Transit</h2>
                <p>Update the item's status to **In Transit** after transfer.</p>
                
                <form onSubmit={handleMarkInTransit} style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="inTransitItemId" style={{ display: 'block', marginBottom: '5px' }}>Item ID:</label>
                        <input 
                            type="number" 
                            id="inTransitItemId"
                            value={inTransitItemId} 
                            onChange={(e) => setInTransitItemId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                        <label htmlFor="inTransitNote" style={{ display: 'block', marginBottom: '5px' }}>Transit Note (e.g., Courier/Tracking):</label>
                        <textarea 
                            id="inTransitNote"
                            value={inTransitNote} 
                            onChange={(e) => setInTransitNote(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', minHeight: '40px' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isInTransitLoading}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            backgroundColor: isInTransitLoading ? '#888' : '#ff9800', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: isInTransitLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1.1rem'
                        }}
                    >
                        {isInTransitLoading ? 'Processing Transit...' : '➡️ Mark In Transit'}
                    </button>
                </form>

                {/* In Transit TRANSACTION FEEDBACK */}
                {inTransitTxStatus && (
                    <div style={{ marginTop: '20px', padding: '15px', borderRadius: '4px', backgroundColor: inTransitTxStatus.includes('successfully') ? '#fff3cd' : '#f8d7da', border: '1px solid #ccc' }}>
                        <p><strong>Status:</strong> {inTransitTxStatus}</p>
                        {inTransitTxHash && (
                            <p><strong>Tx Hash:</strong> <a href={`https://etherscan.io/tx/${inTransitTxHash}`} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>{inTransitTxHash}</a></p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Supplier;