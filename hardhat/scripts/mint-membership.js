// 0x80Af2c12EFBdA66E18Dfaea336d1feE7b58277C3
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const RPC = process.env.API_URL;
  const contractAddress = "0x80Af2c12EFBdA66E18Dfaea336d1feE7b58277C3";
  const tokenId = 1;
  const provider = new ethers.providers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contractABI = JSON.parse(fs.readFileSync("./artifacts/contracts/Membership.sol/Membership.json")).abi;

  const contract = new ethers.Contract(contractAddress, contractABI , wallet);

  const tx = await contract.mint(tokenId);
  await tx.wait();

  console.log(`Token ${tokenId} minted successfully!`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
