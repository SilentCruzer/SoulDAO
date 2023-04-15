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
  const [isLoading, setIsLoading] = useState(false);
  const [proposals , setProposals] = useState([]);
  const dataFetchedRef = useRef(false);
  const [proposalType, setProposalType] = useState(0);
  const [textValue, setTextValue] = useState("");
  const [totalMembers, setTotalMembers] = useState(0);

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
            const getTotalMembers = await daoContract.totalMembers();
            setTotalMembers(getTotalMembers.toNumber());

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

  return <div className="flex flex-row items-center justify-center h-screen gap-2 py-32 px-10 text-white bg-[#121416]">
    <div className="flex flex-col border border-zinc-700 w-2/3 rounded-xl h-full">
  <div className="overflow-x-auto">
    <div className="inline-block min-w-full">
      <div className="overflow-hidden">
        <table className="min-w-full h-full bg-[#121416] rounded-xl" style={{ scrollbarWidth: 'none' }}>
          <thead className="border-b border-zinc-700">
            <tr>
              <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                Sl no
              </th>
              <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                Proposer
              </th>
              <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                Type
              </th>
              <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                Target
              </th>
              <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                Votes
              </th>
              <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
          {proposals.map((proposal, index) => (
        <tr className="border-b border-zinc-700 transition duration-300 ease-in-out hover:bg-gray-800">
              <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                {index+1}
              </td>
              <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
              {proposal.proposer}
              </td>
              <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
              {proposal.typ == 0 ? "Issue" : "Promote"}
              </td>
              <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
              {proposal.member}
              </td>
              <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
              {proposal.yesVotes.toNumber()}
              </td>
              <td onClick={() => vote(proposal.id, 0)}  className="text-sm text-white font-light px-6 py-4 whitespace-nowrap hover:cursor-pointer hover:underline">
                Vote yes
              </td>
            </tr>
            
      ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
    <div className=" flex flex-col gap-1 w-1/3 h-full">
    <div className="border flex-col border-zinc-700 p-5 rounded-xl h-1/2">
    <div className=" text-xl text-bold">Active Members</div>
    <div className="overflow-x-auto">
    <div className="inline-block min-w-full">
      <div className="overflow-hidden">
    <table className="min-w-full h-full bg-[#121416] rounded-xl">
    <thead className="border-b border-zinc-700">
            <tr>
              <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                Address
              </th>
              <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
          <tr className="border-b border-zinc-700 transition duration-300 ease-in-out hover:bg-gray-800">
          <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
          0x112fDeB9bF37aDBAFD2cB9927355AD742FB51F3c
              </td>
              <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
              Master
              </td>
          </tr>
          </tbody>
      </table>
      </div>
      </div>
      </div>
    </div>

    <div className=" flex flex-col gap-4 border border-zinc-700 p-5 rounded-xl h-1/2">
      <div className=" text-xl text-bold">Create Proposals</div>
      <input
        className="py-2 px-4 h-full mb-4 border border-zinc-700 bg-zinc-900 text-white rounded-md shadow-sm focus:outline-none sm:text-sm"
        type="text"
        id="textfield"
        enterKeyHint="hi"
        placeholder="address eg: 0x98.."
        onChange={handleTextChange}
        value={textValue}
      />
    <select
      className="h-full border border-zinc-700 bg-zinc-900 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      onChange={handleSelect}
    >
      <option value="Promote">Promote</option>
      <option value="Issue SBT">Issue SBT</option>
    </select>
    <button className="h-full px-5 rounded-lg border-black bg-zinc-900 hover:bg-gray-700 cursor-pointer border-2" onClick={() => createProposal()}>Create proposal</button>
    </div>
    </div>
    
  </div>
};

export default proposals;
