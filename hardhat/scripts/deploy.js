require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const Membership = await ethers.getContractFactory('Membership');
  const membership = await Membership.deploy();
  await membership.deployed();

  const DAO = await ethers.getContractFactory("SoulDAO");
  dao = await DAO.deploy(membership.address);
  await dao.deployed();

  const SBT = await ethers.getContractFactory("SBT");
  sbt = await SBT.deploy(dao.address);
  await sbt.deployed();

  dao.connect(signer).setSBTAddress(sbt.address);

  const constantsFolderPath = "/home/silentcruzer/dev/blockchain/soulDAO/app/constants";
  if (!fs.existsSync(constantsFolderPath)) {
    fs.mkdirSync(constantsFolderPath);
  }

  const memABI = membership.interface.abi;
  const daoABI = dao.interface.abi;
  const sbtABI = sbt.interface.abi;

  const indexFilePath = path.join(constantsFolderPath, 'index.js');
  const indexFileContent = `
    
    const membershipAddress = '${membership.address}';
    const daoAddress = '${dao.address}';
    const sbtAddress = '${sbt.address}';
    
    const membershipABI = '${memABI}';
    const sbtABI = '${sbtABI}';
    const daoABI = '${daoABI}';

    module.exports = {
      membershipABI,
      membershipAddress,
      daoABI,
      daoAddress,
      sbtABI,
      sbtAddress
    };
  `;
  fs.writeFileSync(indexFilePath, indexFileContent);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});