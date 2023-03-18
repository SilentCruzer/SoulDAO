import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { membershipABI, membershipAddress, daoABI, daoAddress } from "@/constants";
import { useRouter } from "next/router";

const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

export default function MyComponent() {
  const [userAddress, setUserAddress] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [canJoinDao, setCanJoinDao] = useState(false);
  const [mappingResult, setMappingResult] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletErrorMessage, setWalletErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const memberContract = new ethers.Contract(membershipAddress, membershipABI, provider);
  const daoContract = new ethers.Contract(daoAddress, daoABI, provider);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      
      if (typeof window.ethereum !== "undefined") {
        setIsLoading(true);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          setUserAddress(accounts[0]);
          setIsWalletConnected(true);

          const tokenId = 1;
          const tokenBalance = await memberContract.balanceOf(accounts[0], tokenId);
          const result = await daoContract.members(accounts[0]);

          if(result ==1)
            setMappingResult(true);
          else
            setMappingResult(false);

          setHasToken(tokenBalance > 0);
          setMappingResult(result);
          setCanJoinDao(tokenBalance > 0 && !result);
          setIsLoading(false);
        } catch (error) {
          setWalletErrorMessage(error.message);
          setIsWalletConnected(false);
          setIsLoading(false);
        }
      }
    }

    fetchData();
  }, []);

  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsWalletConnected(true);
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        setUserAddress(accounts[0]);
      } catch (error) {
        setWalletErrorMessage(error.message);
        setIsWalletConnected(false);
      }
    }
  }

  async function mint() {
    if (!isWalletConnected) {
      alert("Please connect your wallet first");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const tx = await memberContract.connect(signer).mint(1);
    await tx.wait();
    alert("Token minted successfully");
  
  }

  async function joinDAO() {
    if (!isWalletConnected) {
      alert("Please connect your wallet first");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const tx = await daoContract.connect(signer).joinDao();
    await tx.wait();
    alert("Joined DAO successfully");
  }

  if(isLoading){
    return <div className="flex flex-col items-center justify-center h-screen">
      <div>Loading......</div>
    </div>
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!isWalletConnected && (
        <>
          <h1 className="text-2xl font-bold mb-4">Please connect your wallet to continue</h1>
          <div onClick={connectWallet}>Connect Wallet</div>
          {walletErrorMessage && (
            <p className="text-red-500 text-sm mt-2">{walletErrorMessage}</p>
          )}
        </>
      )}
      {isWalletConnected && hasToken && mappingResult && (
        <>
          <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
          <div className="flex flex-row gap-4">
            <button onClick={() => router.push("/proposals")}>
              View Proposals
            </button>
            <button onClick={() => console.log("View SBT clicked")}>
              View SBT
            </button>
          </div>
        </>
      )}
      {isWalletConnected && hasToken && !mappingResult && (
        <>
          <h1 className="text-2xl font-bold mb-4">Join our DAO!</h1>
          <button onClick={() => joinDAO()}>Join</button>
          </>
      )}
      {isWalletConnected && !hasToken && (
        <>
          <h1 className="text-2xl font-bold mb-4">Mint your ERC1155 token</h1>
          <button onClick={() => mint()}>
            Mint Token
          </button>
        </>
      )}
    </div>
  );
}
