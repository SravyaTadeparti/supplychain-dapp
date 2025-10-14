// src/eth.js
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./config";

export let provider;
export let signer;
export let contract;

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not found. Install MetaMask.");

  // Request accounts
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // Create provider and signer
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();

  // Create contract instance connected to signer
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  // Get current address
  const address = await signer.getAddress();

  // Optional: listen for account/chain changes
  window.ethereum.on("accountsChanged", (accounts) => {
    // handle UI update when account changes
    window.location.reload();
  });
  window.ethereum.on("chainChanged", (chainId) => {
    // handle chain change (reload recommended)
    window.location.reload();
  });

  return { address, provider, signer, contract };
}
