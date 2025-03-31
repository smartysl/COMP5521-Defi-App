const { ethers } = require("hardhat");
const addresses = require("/Users/shilinyu/dapp/workspace/frontend/src/utils/deployed-addresses.json"); 

async function main() {
  // Connect to the Hardhat network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Replace with the address of the recipient account
  const recipientAddress = "0x87D1dE6fD9ECF6465c385c8f6E2499e47BA2bb82"; // My address (from MetaMask)

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