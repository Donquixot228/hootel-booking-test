import React, { useState } from "react";
import "./App.css";
import abi from "./contracts/Hotel.json";
import Main from "./components/Main";
import Layout from "./components/Layout";
const ethers = require("ethers");

function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
  });

  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = async () => {
    const contractAddress = "0xAD3B61ea3f432c4B5BAFDBa8E903eFC44428Fa53";
    const contractABI = abi.abi;
    try {
      if (window.ethereums) {
        await window.ethereums.request({
          method: "eth_requestAccounts",
        });

        const provider = new ethers.providers.Web3Provider(window.ethereums);
        const signer = provider?.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setState({ provider, signer, contract });
        setWalletConnected(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      {walletConnected === true && walletConnected.providers ? (
        <>
          <Main state={state} />
        </>
      ) : (
        <div className="App">
          <button id="widget-btn" className="connect-btn" onClick={connectWallet}>Connect Wallet</button>
        </div>
      )}
    </Layout>
  );
}

export default App;

