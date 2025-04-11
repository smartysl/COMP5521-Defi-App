require('dotenv').config();

const { ethers } = require("hardhat");
const addresses = require("../frontend/src/utils/deployed-addresses.json"); 

async function main() {
  // Connect to the Hardhat network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Replace with the address of the recipient account
  const recipientAddress = process.env.RECIPIENT_ADDRESS;

  const NewToken = await hre.ethers.getContractFactory("NewToken");
  const Beta = NewToken.attach(addresses.token1)
  
  const amount = ethers.parseEther("500000");
  await Beta.transfer(recipientAddress, amount)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });