import React from "react";
import { useState, useEffect, useRef } from "react";
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
  const [proposals , setProposals] = useState([]);
  const dataFetchedRef = useRef(false);
  const [proposalType, setProposalType] = useState(0);
  const [textValue, setTextValue] = useState("");


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
            const getTotalProposal = await daoContract.getTotalProposals();
            const totalProposal = getTotalProposal.toNumber();
              for(let i=0;i<totalProposal;i++){
                const prop = await daoContract.proposals(i);
                if(!prop.isExecuted)
                  proposals.push(prop);
              }
            console.log(proposals);
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false);
      }
    }
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchData();
  }, []);

  async function createProposal() {
    const typ = proposalType;
    const targetAddress = ethers.utils.hexlify(textValue);
    var data = ""
    console.log(proposalType)
    if(typ==1){
      data = "https://bafkreihu7s2xmkibjwin7ucp4hrxs7k55bkzljq5t7xg5nychrze75bqxy.ipfs.nftstorage.link/"
    }

    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();

    // const create = await daoContract.connect(signer).createProposal(targetAddress, typ, data);

    // console.log("Proposal created")
  }

  const handleSelect = (event) => {
    if (event.target.value === "Promote") {
      setProposalType(1);
    } else {
      setProposalType(0);
    }
    
  };

  const handleTextChange = (event) => {
    setTextValue(event.target.value);
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div>Loading......</div>
      </div>
    );
  }

  return <div className="flex flex-col items-center justify-center h-screen">
    <div className="flex flex-col">
      {proposals.map((proposal, index) => (
        <div key={index} className="flex justify-between items-center bg-gray-100 p-4 mb-4 rounded-lg">
          <div>
            <div className="text-lg font-semibold">Proposer: {proposal.proposer}</div>
            <div className="text-lg font-semibold">Type: {proposal.typ}</div>
            <div className="text-lg font-semibold">Target: {proposal.member}</div>
            <div className="text-lg font-semibold">Yes votes: {proposal.yesVotes.toNumber()}</div>
          </div>
          <div className="flex items-center">
            <button className="bg-zinc-400 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
              Yes
            </button>
            <button className="bg-zinc-400 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              No
            </button>
          </div>
        </div>
      ))}
    </div>
    <div className="flex gap-4">
    <input
        className="py-2 px-4 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        type="text"
        id="textfield"
        onChange={handleTextChange}
        value={textValue}
      />
    <select
      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      onChange={handleSelect}
    >
      <option value="Promote">Promote</option>
      <option value="Issue SBT">Issue SBT</option>
    </select>
    <button className="p-5 rounded-lg border-black border-2" onClick={() => createProposal()}>Create proposal</button>
    </div>
    
  </div>
};

export default proposals;
