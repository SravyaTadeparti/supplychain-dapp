import React, { useState } from 'react';
import { useWeb3 } from '../Web3Context'; 

const Retailer = () => {
    // Access global web3 state and contract instance
    const { isWalletConnected, userRole, contractInstance } = useWeb3();

    // --- State for Delivery Form ---
    const [deliveryItemId, setDeliveryItemId] = useState('');
    const [deliveryNote, setDeliveryNote] = useState('');
    const [deliveryTxStatus, setDeliveryTxStatus] = useState(null);
    const [deliveryTxHash, setDeliveryTxHash] = useState(null);
    const [isDeliveryLoading, setIsDeliveryLoading] = useState(false);

    // --- State for Verification Form ---
    const [verifyItemId, setVerifyItemId] = useState('');
    const [verifyMetadata, setVerifyMetadata] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [isVerifyLoading, setIsVerifyLoading] = useState(false);

    // --- FUNCTION: CONFIRM DELIVERY (Write Transaction) ---
    const handleConfirmDelivery = async (e) => {
        e.preventDefault();
        
        if (!contractInstance) return alert("Wallet not connected or contract not initialized.");
        if (userRole !== 'Retailer') return alert("Error: You must be connected as a Retailer.");
        if (!deliveryItemId || !deliveryNote) return alert("Please enter Item ID and a Note for delivery.");

        setIsDeliveryLoading(true);
        setDeliveryTxStatus(null);
        setDeliveryTxHash(null);

        try {
            // Call the contract function
            const itemId = parseInt(deliveryItemId);
            console.log(`Confirming delivery for Item ID: ${itemId}`);
            
            const tx = await contractInstance.confirmDelivery(itemId, deliveryNote);
            
            setDeliveryTxStatus('Transaction sent. Waiting for confirmation...');
            setDeliveryTxHash(tx.hash);

            // Wait for the transaction to be mined
            await tx.wait();

            // Success Feedback
            setDeliveryTxStatus('Item successfully delivered and added to inventory!');
            setDeliveryItemId('');
            setDeliveryNote('');

        } catch (error) {
            console.error("Error confirming delivery:", error);
            const errorMessage = error.message.includes('revert') 
                ? 'Transaction failed (Smart Contract Revert: Item may not be "In Transit").' 
                : 'Transaction failed. Check console for details.';
            setDeliveryTxStatus(errorMessage);
        } finally {
            setIsDeliveryLoading(false);
        }
    };

    // --- FUNCTION: VERIFY AUTHENTICITY (Read Call) ---
    const handleVerifyAuthenticity = async (e) => {
        e.preventDefault();

        if (!contractInstance) return alert("Wallet not connected or contract not initialized.");
        if (!verifyItemId || !verifyMetadata) return alert("Please enter Item ID and the Metadata Hash to verify.");
        
        setIsVerifyLoading(true);
        setVerificationResult(null);

        try {
            const itemId = parseInt(verifyItemId);

            // Call the read-only contract function
            const isAuthentic = await contractInstance.verifyAuthenticity(itemId, verifyMetadata);
            
            setVerificationResult(isAuthentic);

        } catch (error) {
            console.error("Error verifying authenticity:", error);
            setVerificationResult('Error checking authenticity. Item ID may not exist.');
        } finally {
            setIsVerifyLoading(false);
        }
    };


    // --- UI RENDERING LOGIC ---
    if (!isWalletConnected) {
        return (
            <div style={{ padding: "2rem", color: 'red' }}>
                <h2>Retailer Dashboard</h2>
                <p>⚠️ **Please connect your wallet to access this dashboard.**</p>
            </div>
        );
    }

    if (userRole !== 'Retailer') {
        return (
            <div style={{ padding: "2rem", color: 'orange' }}>
                <h2>Retailer Dashboard</h2>
                <p>🚫 **Access Denied.** Your connected account is **{userRole}** and cannot access Retailer functions.</p>
                <p>Try connecting with a Retailer address.</p>
            </div>
        );
    }

    // Main Retailer Dashboard UI
    return (
        <div style={{ padding: "2rem", display: 'flex', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* LEFT SIDE: CONFIRM DELIVERY */}
            <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h2>📦 Confirm Delivery</h2>
                <p>Mark an item received from the Transporter.</p>
                
                <form onSubmit={handleConfirmDelivery} style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="deliveryItemId" style={{ display: 'block', marginBottom: '5px' }}>Item ID:</label>
                        <input 
                            type="number" 
                            id="deliveryItemId"
                            value={deliveryItemId} 
                            onChange={(e) => setDeliveryItemId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                        <label htmlFor="deliveryNote" style={{ display: 'block', marginBottom: '5px' }}>Delivery Note:</label>
                        <textarea 
                            id="deliveryNote"
                            value={deliveryNote} 
                            onChange={(e) => setDeliveryNote(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', minHeight: '40px' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isDeliveryLoading}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            backgroundColor: isDeliveryLoading ? '#888' : '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: isDeliveryLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1.1rem'
                        }}
                    >
                        {isDeliveryLoading ? 'Processing Transaction...' : '✅ Confirm Delivery'}
                    </button>
                </form>

                {/* Delivery TRANSACTION FEEDBACK */}
                {deliveryTxStatus && (
                    <div style={{ marginTop: '20px', padding: '15px', borderRadius: '4px', backgroundColor: deliveryTxStatus.includes('success') ? '#d4edda' : '#f8d7da', border: '1px solid #ccc' }}>
                        <p><strong>Status:</strong> {deliveryTxStatus}</p>
                        {deliveryTxHash && (
                            <p><strong>Tx Hash:</strong> <a href={`https://etherscan.io/tx/${deliveryTxHash}`} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>{deliveryTxHash}</a></p>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: VERIFY AUTHENTICITY */}
            <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h2>🔎 Verify Authenticity</h2>
                <p>Check the item's current state against its original hash.</p>
                
                <form onSubmit={handleVerifyAuthenticity} style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="verifyItemId" style={{ display: 'block', marginBottom: '5px' }}>Item ID:</label>
                        <input 
                            type="number" 
                            id="verifyItemId"
                            value={verifyItemId} 
                            onChange={(e) => setVerifyItemId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                        <label htmlFor="verifyMetadata" style={{ display: 'block', marginBottom: '5px' }}>Current Metadata Hash to Test:</label>
                        <input 
                            type="text" 
                            id="verifyMetadata"
                            value={verifyMetadata} 
                            onChange={(e) => setVerifyMetadata(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isVerifyLoading}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            backgroundColor: isVerifyLoading ? '#888' : '#ffc107', 
                            color: 'black', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: isVerifyLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1.1rem'
                        }}
                    >
                        {isVerifyLoading ? 'Checking...' : '🔎 Run Authenticity Check'}
                    </button>
                </form>

                {/* Verification Result Feedback */}
                {verificationResult !== null && (
                    <div style={{ marginTop: '20px', padding: '15px', borderRadius: '4px', backgroundColor: verificationResult === true ? '#e2f0d9' : verificationResult === false ? '#f8d7da' : '#f0f0f0' }}>
                        <p><strong>Verification Result:</strong></p>
                        <p style={{ color: verificationResult === true ? 'green' : verificationResult === false ? 'red' : 'black', fontWeight: 'bold' }}>
                            {verificationResult === true ? '✅ Item is Authentic and Matches Original Hash!' : verificationResult === false ? '❌ Item is NOT Authentic or Hash does NOT Match!' : verificationResult}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Retailer;