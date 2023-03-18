import React from "react";
import { useState, useEffect } from "react";

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
        } catch (error) {}

        setIsLoading(false);
      }
    }

    fetchData();
  }, []);
  return <div>proposals</div>;
};

export default proposals;
