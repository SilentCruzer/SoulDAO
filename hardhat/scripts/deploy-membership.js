const hre = require("hardhat");

async function main() {
  const Membership = await hre.ethers.getContractFactory("Membership");
  const membership = await Membership.deploy();

  await membership.deployed();

  console.log(
    `Membership deployed to ${membership.address}`
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});