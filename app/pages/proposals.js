import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
    daoABI,
    daoAddress,
  } from "@/constants";

const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL
  );

  const daoContract = new ethers.Contract(daoAddress, daoABI, provider);

  

const proposals = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletErrorMessage, setWalletErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (typeof window.ethereum !== "undefined") {
        setIsLoading(true);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setIsWalletConnected(true);

        try {
            const result = await daoContract.getTotalProposals();
            console.log(result.toNumber());
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  async function createProposal() {
    const typ = 0;
    const targetAddress = ethers.utils.hexlify("<insert target address here>");
    const data = ""

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const create = await daoContract.connect(signer).createProposal(targetAddress, typ, data);

    console.log("Proposal created")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div>Loading......</div>
      </div>
    );
  }

  return <div className="flex flex-col items-center justify-center h-screen">

    <button className="p-5 rounded-lg border-black border-2" onClick={() => createProposal()}>Create proposal</button>
  </div>;
};

export default proposals;
