import React, { Component, useEffect, useState } from "react";
import Web3 from "web3";
import Token from "../abis/Token.json";
import EthSwap from "../abis/EthSwap.json";
import Navbar from "./Navbar";
import Main from "./Main";
import "./App.css";

export const App = () => {
  const [account, setAccount] = useState("");
  const [ethBalance, setEthBalance] = useState("");
  const [tokenContract, setTokenContract] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const [ethSwap, setEthSwap] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();

    const _ethBalance = await web3.eth.getBalance(accounts[0]);
    setEthBalance(_ethBalance);
    setAccount(accounts[0]);
    console.log(accounts);
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[networkId];

    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      setTokenContract(token);
      let tokenBalanceData = await token.methods.balanceOf(accounts[0]).call();
      setTokenBalance(tokenBalanceData.toString());
    } else {
      window.alert("Token contract not deployed to connected network");
    }
    const ethSwapData = EthSwap.networks[networkId];
    if (ethSwapData) {
      const ethSwapContract = new web3.eth.Contract(
        EthSwap.abi,
        ethSwapData.address
      );
      setEthSwap(ethSwapContract);
    } else {
      window.alert("EthSwap contract not deployed to detected network.");
    }
    setLoading(false);
  };
  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };
  const buyTokens = (etherAmount) => {
    setLoading(true);
    ethSwap.methods
      .buyTokens()
      .send({ value: etherAmount, from: account })
      .on("transactionHash", (hash) => {
        setLoading(false);
      });
  };
  const sellTokens = (tokenAmount) => {
    setLoading(true);
    tokenContract.methods
      .approve(ethSwap.address, tokenAmount)
      .send({ from: account })
      .on("transactionHash", (hash) => {
        ethSwap.methods
          .sellTokens(tokenAmount)
          .send({ from: account })
          .on("transactionHash", (hash) => {
            setLoading(false);
          });
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 ml-auto mr-auto"
            style={{ maxWidth: "600px" }}
          >
            <div className="content mr-auto ml-auto">
              <a
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
              ></a>

              <Main
                ethBalance={ethBalance}
                tokenBalance={tokenBalance}
                buyTokens={buyTokens}
                sellTokens={sellTokens}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
