# COMP5521-Defi-App
# Defi-App README

## 1. Project Overview
- **Project Name**: Defi-App
- **Brief Introduction**: Our DeFi Swap platform addresses the inefficiencies of traditional finance and complexity of existing DeFi setups. It offers a simplified, local - blockchain - based solution for token swapping and liquidity operations, suitable for both beginners and developers. 
- **Background and Motivation**: In the DeFi space, traditional finance's inefficiencies and Ethereum testnet faucet requirements pose barriers. Existing DeFi swap platforms can be overly complex. Our motivation is to create an accessible, easy - to - understand DeFi Swap platform. By running a local blockchain, we offer a sandbox for learning and experimentation. Simplifications are made to focus on core DeFi concepts and improve user experience. 

## 2. Features
List the key features of the DApp in detail, along with a brief description of each feature's functionality and benefits:

  -  **1. User Registration and Login**

Support the use of Ethereum wallet address for fast registration and login, to ensure user identity security. Users do not need to create additional account passwords, directly log in with the existing Ethereum wallet, using blockchain encryption technology to ensure that user identity information is difficult to tamper with and leak.

  -  **2. Token Exchange (Swap)**

Users can easily exchange ALPHA and BETA tokens on our DeFi Swap platform. This function is based on the Automatic Market Maker (AMM) mechanism, which dynamically determines the exchange rate based on the supply and demand ratio of ALPHA and BETA in the liquidity pool.

- **3. Add Liquidity**

Users can add ALPHA and BETA tokens to the liquidity pool, provide liquidity support to the platform, and receive liquidity provider tokens. These LP tokens represent the user's share in the liquidity pool, that is, the proportion of contributions to the assets in the pool.

  - **4. Remove Liquidity**

When users want to opt out of liquidity provision, they can use the LP tokens they hold to withdraw the corresponding ALPHA and BETA tokens from the liquidity pool. The number of tokens a user can withdraw depends on the share in the pool represented by the LP tokens they hold.

## 3. Technical Architecture
- **Smart Contracts**: 
  - Solidity: Used directly to define the logic and functionality of smart contracts
  - Openzeppeline: Implementation of standard contracts such as ERC-20
  - Hardhat: The development environment of smart contracts covers the functions of the whole process of smart contract development.
- **Front-End Technology Stack**: React, React Bootstrap
- **Back-End Technology Stack**: Node.js.

## 4. Configuration and Setup Guide
- **Environment Requirements**:
  - Node.js: v22.14.0 or later is recommended.
  - npm: The version must be 10.9.2 or later.
  - Code editor: Visual Studio Code (VS Code).
  - Blockchain wallet: MetaMask（Browser plugin wallet）
- **Installation Steps**:
```bash
# Clone the project repository
git clone https://github.com/smartysl/COMP5521-Defi-App.git
# Navigate to the project directory
cd COMP5521-Defi-App/
# Install the dependencies
npm install
# Navigate to the project directory
cd frontend/
# Install the dependencies
npm install
```
- **Configure the MetaMask**：
  1. Install the MetaMask plug-in
  2. Create or import a wallet
  3. Add the local Hardhat network
  4. Obtain the test private key
- **Configuration File**: 
  - Open the.env file and Modify RECIPIENT_ADDRESS: Find the line for RECIPIENT_ADDRESS, and replace the address (MetaMask Wallet private key).
 
## 5. Testing Instructions
Introduce the testing framework and test cases used in the project. 
```bash
# Switch to the directory
cd ..
# Run the tests
npx hardhat test
# Switch to the directory where the front-end project is located
cd frontend/
# Start the development server for the front-end project
npm start
```
## 6. Running and Deployment
- **Local Run**:
```bash
# Switch to the directory
cd ..
# Start Hardhat local development node, at COMP5521-Defi-App/
npx hardhat node

# This command is used to deploy smart contracts on the local Hardhat network.
npx hardhat run --network localhost scripts/deploy.js
# Transfer operations related to tokens or contracts.
npx hardhat run scripts/transferDF.js --network localhost
npx hardhat run scripts/transferALPHA.js --network localhost
npx hardhat run scripts/transferBETA.js --network localhost


# Access the DApp at
http://localhost:3000
```
## 7. Video Demo
[点击下载视频](https://github.com/smartysl/COMP5521-Defi-App/releases/download/v2.0/demo.mp4)
