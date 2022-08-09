const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  // Address of the whitelist contract
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a CryptoDev NFT
  const metadataURL = METADATA_URL;
  /**
   * A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts, 
   * so cryptoDevsContract here is a factory for instances of the CryptoDevs contract.
   */
  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

  // deploy contract
  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
    metadataURL,
    whitelistContract
  );

  console.log("CryptoDevs Contract Address: ", deployedCryptoDevsContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
