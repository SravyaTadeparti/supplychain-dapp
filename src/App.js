import React, { useState } from "react";
import { connectWallet } from "./eth";

function App() {
  const [addr, setAddr] = useState(null);
  const [err, setErr] = useState(null);

  async function handleConnect() {
    try {
      const { address } = await connectWallet();
      setAddr(address);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>SupplyChain DApp — Frontend</h1>
      {addr ? (
        <div>
          Connected: <code>{addr}</code>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect MetaMask</button>
      )}
      {err && <div style={{ color: "red" }}>{err}</div>}
    </div>
  );
}

export default App;
