import React, { useState } from 'react';
import { useWeb3 } from '../Web3Context'; // Import the custom hook

const Manufacturer = () => {
    // Access global web3 state and contract instance
    const { isWalletConnected, userRole, contractInstance } = useWeb3();

    // State for the form inputs
    const [itemName, setItemName] = useState('');
    const [authHash, setAuthHash] = useState('');
    const [note, setNote] = useState('');
    
    // State for transaction feedback
    const [txStatus, setTxStatus] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- FUNCTION TO CALL CONTRACT ---
    const handleCreateItem = async (e) => {
        e.preventDefault();
        
        if (!contractInstance) {
            alert("Wallet not connected or contract not initialized.");
            return;
        }

        if (userRole !== 'Manufacturer') {
            alert("Error: You must be connected as a Manufacturer to create items.");
            return;
        }

        // Simple validation
        if (!itemName || !authHash || !note) {
            alert("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        setTxStatus(null);
        setTxHash(null);

        try {
            // 1. Call the contract function
            console.log(`Creating item: ${itemName}, Hash: ${authHash}`);
            const tx = await contractInstance.createItem(itemName, authHash, note);
            
            setTxStatus('Transaction sent. Waiting for confirmation...');
            setTxHash(tx.hash);

            // 2. Wait for the transaction to be mined (tx.wait())
            const receipt = await tx.wait();

            // 3. Success Feedback
            setTxStatus('Item created successfully!');
            console.log('Transaction confirmed:', receipt);
            
            // Clear form
            setItemName('');
            setAuthHash('');
            setNote('');

        } catch (error) {
            console.error("Error creating item:", error);
            // Check for common MetaMask/Ethers errors
            const errorMessage = error.message.includes('revert') 
                ? 'Transaction failed (possible smart contract error).' 
                : 'Transaction failed. Check console for details.';
            setTxStatus(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    // ---------------------------------

    // --- UI RENDERING LOGIC ---
    
    if (!isWalletConnected) {
        return (
            <div style={{ padding: "2rem", color: 'red' }}>
                <h2>Manufacturer Dashboard</h2>
                <p>⚠️ **Please connect your wallet to access this dashboard.**</p>
            </div>
        );
    }

    if (userRole !== 'Manufacturer') {
        return (
            <div style={{ padding: "2rem", color: 'orange' }}>
                <h2>Manufacturer Dashboard</h2>
                <p>🚫 **Access Denied.** Your connected account is **{userRole}** and cannot access Manufacturer functions.</p>
                <p>Try connecting with a Manufacturer address.</p>
            </div>
        );
    }


    // Main Manufacturer Dashboard UI
    return (
        <div style={{ padding: "2rem", maxWidth: '600px', margin: '0 auto' }}>
            <h1>🏭 Manufacturer Dashboard</h1>
            <p style={{ marginBottom: '2rem' }}>Use the form below to initiate a new item in the supply chain.</p>
            
            {/* ITEM CREATION FORM */}
            <form onSubmit={handleCreateItem} style={{ 
                padding: '20px', 
                border: '1px solid #ccc', 
                borderRadius: '8px', 
                backgroundColor: '#f9f9f9' 
            }}>
                <h2>Create New Item</h2>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="itemName" style={{ display: 'block', marginBottom: '5px' }}>Item Name:</label>
                    <input 
                        type="text" 
                        id="itemName"
                        value={itemName} 
                        onChange={(e) => setItemName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="authHash" style={{ display: 'block', marginBottom: '5px' }}>Authenticity Hash (Metadata Hash):</label>
                    <input 
                        type="text" 
                        id="authHash"
                        value={authHash} 
                        onChange={(e) => setAuthHash(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                    />
                    <small>e.g., A unique hash of manufacturing data (IPFS/SHA-256).</small>
                </div>
                
                <div style={{ marginBottom: '25px' }}>
                    <label htmlFor="note" style={{ display: 'block', marginBottom: '5px' }}>Initial Note (e.g., Batch Info):</label>
                    <textarea 
                        id="note"
                        value={note} 
                        onChange={(e) => setNote(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', minHeight: '60px' }}
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        backgroundColor: isLoading ? '#888' : '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '1.1rem'
                    }}
                >
                    {isLoading ? 'Processing Transaction...' : '✅ Create Item on Blockchain'}
                </button>
            </form>

            {/* TRANSACTION FEEDBACK */}
            {txStatus && (
                <div style={{ marginTop: '20px', padding: '15px', borderRadius: '4px', backgroundColor: txStatus.includes('success') ? '#d4edda' : '#f8d7da', border: txStatus.includes('success') ? '1px solid #c3e6cb' : '1px solid #f5c6cb' }}>
                    <p><strong>Status:</strong> {txStatus}</p>
                    {txHash && (
                        <p>
                            <strong>Tx Hash:</strong> 
                            <a 
                                href={`https://etherscan.io/tx/${txHash}`} // Replace Etherscan with your network's explorer if needed
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ wordBreak: 'break-all' }}
                            >
                                {txHash}
                            </a>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Manufacturer;