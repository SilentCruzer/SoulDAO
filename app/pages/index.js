import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  membershipABI,
  membershipAddress,
  daoABI,
  daoAddress,
} from "@/constants";
import { useRouter } from "next/router";

const provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_RPC_URL
);

export default function MyComponent() {
  const [userAddress, setUserAddress] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [canJoinDao, setCanJoinDao] = useState(false);
  const [mappingResult, setMappingResult] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletErrorMessage, setWalletErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const memberContract = new ethers.Contract(
    membershipAddress,
    membershipABI,
    provider
  );
  const daoContract = new ethers.Contract(daoAddress, daoABI, provider);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (typeof window.ethereum !== "undefined") {
        setIsLoading(true);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          setUserAddress(accounts[0]);
          setIsWalletConnected(true);

          const tokenId = 1;
          const tokenBalance = await memberContract.balanceOf(
            accounts[0],
            tokenId
          );
          const result = await daoContract.members(accounts[0]);

          if (result == 1) setMappingResult(true);
          else setMappingResult(false);

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
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-zinc-800">
        <div>Loading......</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white bg-zinc-800">
      {!isWalletConnected && (
        <div>
          <h1 className="text-2xl font-bold mb-4">
            Please connect your wallet to continue
          </h1>
          <div onClick={connectWallet}>Connect Wallet</div>
          {walletErrorMessage && (
            <p className="text-red-500 text-sm mt-2">{walletErrorMessage}</p>
          )}
        </div>
      )}
      {isWalletConnected && hasToken && mappingResult && (
        <div className="flex flex-col xl:flex-row w-full items-center justify-center h-screen text-white bg-zinc-800 overflow-x-hidden xl:overflow-y-clip">
        <div
          className="flex-grow  h-full w-full flex flex-col justify-end p-16 gap-5 whitespace-normal overflow-hidden bg-gray-700 bg-cover bg-center transition duration-500 ease-in-out transform hover:scale-105"
          style={{ backgroundImage: `url("/Proposals.png")`,}}
        >
          <div className="text-4xl font-extrabold dark:text-white">Proposals</div>
          <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-300">To see all of our current proposals related to Guild/Clan incorporation and 
          badge creation, please access our governance system through our DAO that uses SBTs. From there, you can submit, 
          review, and vote on proposals to help shape the future of SoulDAO.</p>
          <button  onClick={() => router.push("/proposals")} className="border border-white rounded-lg w-fit p-5 text-lg hover:bg-white hover:text-black hover:cursor-pointer">View proposals</button>
        </div>
        <div className=" p-5 w-full flex flex-col items-center justify-center h-full xl:w-1/2 bg-black text-center gap-5" style={{ backgroundImage: `url("/background.jpg")`,}}>
          <img src="/SoulDAO.png" className="w-1/6 xl:w-1/2"/>
          <div className="text-4xl font-bold dark:text-white">SoulDAO</div>
          <div>
            Level up your skills and reputation with SoulDAO - where badges
            represent true expertise!
          </div>
        </div>
        <div
          className="flex-grow h-full w-full flex flex-col justify-end p-16 gap-5 whitespace-normal overflow-hidden bg-gray-700 bg-cover bg-center transition duration-500 ease-in-out transform hover:scale-105"
          style={{ backgroundImage: `url("/SBT.png")`,}}
        >
          <div className="text-4xl font-extrabold dark:text-white">SBT'S</div>
          <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-300">SBTs are earned through a rigorous review process by current members and are a public d
          isplay of expertise in various fields, such as front-end development or dev-ops. To view your current SBTs and the badges you have earned, go through the button below</p>
          <button onClick={() => console.log("View SBT clicked")}  className="border border-white rounded-lg w-fit p-5 text-lg hover:bg-white hover:text-black hover:cursor-pointer">View SBT's</button>
        </div>
      </div>
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
          <button onClick={() => mint()}>Mint Token</button>
        </>
      )}
    </div>
  );
}
