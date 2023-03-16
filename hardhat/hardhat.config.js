require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { RPC_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {},
    goerli: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
