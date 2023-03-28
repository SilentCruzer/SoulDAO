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
      data = "https://bafkreieru5s6d3febncebsbpnurapg5bkc35ydb5koyyjp6l7eixihvckq.ipfs.nftstorage.link/"
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    await daoContract.connect(signer).createProposal(targetAddress, typ, data);

    console.log("Proposal created")
  }

  async function vote(id, vote) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    await daoContract.connect(signer).voteForProposal(id, vote);
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
      <div className="flex flex-col items-center justify-center h-screen text-white bg-zinc-800">
        <div>Loading......</div>
      </div>
    );
  }

  return <div className="flex flex-col items-center justify-center h-screen text-white bg-zinc-800">
    <div className="flex flex-col">
      {proposals.map((proposal, index) => (
        <div key={index} className="flex justify-between items-center bg-zinc-900 p-4 mb-4 rounded-lg text-white">
          <div>
            <div className="text-lg font-semibold"><span className=" text-blue-500">Proposer: </span>{proposal.proposer}</div>
            <div className="text-lg font-semibold"><span className=" text-blue-500">Type: </span>{proposal.typ == 0 ? "Issue" : "Promote"}</div>
            <div className="text-lg font-semibold"><span className=" text-blue-500">Target: </span>{proposal.member}</div>
            <div className="text-lg font-semibold"><span className=" text-blue-500">Yes votes: </span>{proposal.yesVotes.toNumber()}</div>
          </div>
          <div className="flex items-center">
            <button onClick={() => vote(proposal.id, 1)} className="bg-zinc-900 hover:bg-gray-700 border border-gray-300 text-white cursor-pointer font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
              Yes
            </button>
            <button onClick={() => vote(proposal.id, 0)}className="bg-zinc-900 hover:bg-gray-700 border border-gray-300  text-white cursor-pointer font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              No
            </button>
          </div>
        </div>
      ))}
    </div>
    <div className="flex gap-4 h-12">
    <input
        className="py-2 px-4 h-full mb-4 border border-gray-300 bg-zinc-900 text-white rounded-md shadow-sm focus:outline-none sm:text-sm"
        type="text"
        id="textfield"
        enterKeyHint="hi"
        placeholder="address eg: 0x98.."
        onChange={handleTextChange}
        value={textValue}
      />
    <select
      className="h-full border border-gray-300 bg-zinc-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      onChange={handleSelect}
    >
      <option value="Promote">Promote</option>
      <option value="Issue SBT">Issue SBT</option>
    </select>
    <button className="h-full px-5 rounded-lg border-black bg-zinc-900 hover:bg-gray-700 cursor-pointer border-2" onClick={() => createProposal()}>Create proposal</button>
    </div>
    
  </div>
};

export default proposals;
