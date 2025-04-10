"use client"

import "./App.css"
import "bootstrap/dist/css/bootstrap.min.css"

/* User Interface */
import { Card, Button } from "react-bootstrap"

/* Interaction with Backend */
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import {
  getAmountOut,
  getContracts,
  getPoolInfo,
  getTokenBalances,
  getRequiredAmount1,
  swapTokens,
  addLiquidity,
  getLiquidity,
  withdrawLiquidity,
} from "./utils/contract"

function App() {
  /* wallet related */
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [contracts, setContracts] = useState(null)
  const [provider, setProvider] = useState(null)

  /* balance related */
  const [balance0, setBalance0] = useState(0)
  const [balance1, setBalance1] = useState(0)
  const [poolInfo, setPoolInfo] = useState({ token0Balance: "0", token1Balance: "0" })
  const [userLiquidity, setUserLiquidity] = useState("0")

  /* swap related */
  const [fromToken, setFromToken] = useState("ALPHA")
  const [toToken, setToToken] = useState("BETA")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")

  /* add liquidity related */
  const [token0Amount, setToken0Amount] = useState("")
  const [token1Amount, setToken1Amount] = useState("")
  const [addLiquidityAmount, setAddLiquidityAmount] = useState("")
  const [withdrawLiquidityAmount, setWithdrawLiquidityAmount] = useState("")

  /* active tab */
  const [activeTab, setActiveTab] = useState("swap")
  const [activeLiquidityTab, setActiveLiquidityTab] = useState("add")

  useEffect(() => {
    const initializeContractsAndPool = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("MetaMask not installed")
        }
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()

        const initializedContracts = await getContracts(signer)

        setProvider(provider)
        setAccount(accounts[0])
        setContracts(initializedContracts)
        setIsWalletConnected(true)

        // get balance
        const balances = await getTokenBalances(initializedContracts, accounts[0])
        setBalance0(balances.token0)
        setBalance1(balances.token1)

        // get pool info
        const info = await getPoolInfo(initializedContracts)
        setPoolInfo(info)

        // get user liquidity
        const liquidity = await getLiquidity(initializedContracts, accounts[0])
        setUserLiquidity(liquidity)
      } catch (error) {
        console.error("Detailed connection error:", error)
      }
    }
    initializeContractsAndPool()
  }, [])

  // switch token button
  const handleTokenSwitch = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("")
    setToAmount("")
  }

  const calculateOutputAmount = async (inputAmount, tokenIn, tokenOut) => {
    if (!inputAmount || !contracts || !tokenIn || !tokenOut) {
      return "0"
    }

    try {
      const mappedTokenIn = tokenIn === "ALPHA" ? "token0" : "token1"
      const mappedTokenOut = tokenOut === "ALPHA" ? "token0" : "token1"

      const result = await getAmountOut(contracts, mappedTokenIn, inputAmount, mappedTokenOut)
      return result
    } catch (error) {
      console.error("Error calculating output amount:", error)
      return "0"
    }
  }

  const handleFromAmountChange = async (e) => {
    const value = e.target.value
    setFromAmount(value)

    if (value && !isNaN(value)) {
      const output = await calculateOutputAmount(value, fromToken, toToken)
      setToAmount(output)
    } else {
      setToAmount("")
    }
  }

  const handleToken0AmountChange = async (e) => {
    const value = e.target.value
    setToken0Amount(value)

    if (value && !isNaN(value)) {
      const token1Amount = await calculateToken1Amount(value)
      setToken1Amount(token1Amount)
    } else {
      setToken1Amount("")
    }
  }

  const handleAddLiquidityInputChange = (e) => {
    setAddLiquidityAmount(e.target.value)
  }

  const calculateToken1Amount = async (amount0) => {
    if (!amount0 || !contracts || isNaN(amount0) || amount0 <= 0) {
      return "0"
    }

    try {
      const result = await getRequiredAmount1(contracts, amount0)
      return result
    } catch (error) {
      console.error("Error calculating token1 amount:", error)
      return "0"
    }
  }

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed")
      }
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()

      const initializedContracts = await getContracts(signer)

      setProvider(provider)
      setAccount(accounts[0])
      setContracts(initializedContracts)
      setIsWalletConnected(true)

      // get balance
      const balances = await getTokenBalances(initializedContracts, accounts[0])
      setBalance0(balances.token0)
      setBalance1(balances.token1)

      // get pool info
      const info = await getPoolInfo(initializedContracts)
      setPoolInfo(info)

      // get user liquidity
      const liquidity = await getLiquidity(initializedContracts, accounts[0])
      setUserLiquidity(liquidity)
    } catch (error) {
      console.error("Detailed connection error:", error)
    }
  }

  const handleSwap = async () => {
    try {
      if (!contracts) return

      const tokenIn = fromToken === "ALPHA" ? "token0" : "token1"
      const tokenOut = toToken === "ALPHA" ? "token0" : "token1"

      await swapTokens(contracts, tokenIn, fromAmount, tokenOut)

      // update balance
      const balances = await getTokenBalances(contracts, account)
      setBalance0(balances.token0)
      setBalance1(balances.token1)

      // update pool info
      const newPoolInfo = await getPoolInfo(contracts)
      setPoolInfo(newPoolInfo)

      // update user liquidity
      const liquidity = await getLiquidity(contracts, account)
      setUserLiquidity(liquidity)

      setFromAmount("")
      setToAmount("")
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddLiquidity = async () => {
    try {
      if (!contracts || !account) {
        throw new Error("Contracts or account not initialized")
      }

      await addLiquidity(contracts, token0Amount)

      // update balance
      const balances = await getTokenBalances(contracts, account)
      setBalance0(balances.token0)
      setBalance1(balances.token1)

      // update pool info
      const newPoolInfo = await getPoolInfo(contracts)
      setPoolInfo(newPoolInfo)

      // update user liquidity
      const liquidity = await getLiquidity(contracts, account)
      setUserLiquidity(liquidity)

      setToken0Amount("")
      setToken1Amount("")
    } catch (error) {
      console.error("Detailed error:", error)
    }
  }

  const handleDirectAddLiquidity = async () => {
    try {
      if (!contracts || !account || !addLiquidityAmount) {
        throw new Error("Contracts, account not initialized or amount not provided")
      }

      await addLiquidity(contracts, addLiquidityAmount)

      // update balance
      const balances = await getTokenBalances(contracts, account)
      setBalance0(balances.token0)
      setBalance1(balances.token1)

      // update pool info
      const newPoolInfo = await getPoolInfo(contracts)
      setPoolInfo(newPoolInfo)

      // update user liquidity
      const liquidity = await getLiquidity(contracts, account)
      setUserLiquidity(liquidity)

      setAddLiquidityAmount("")
    } catch (error) {
      console.error("Detailed error:", error)
    }
  }

  const handleWithdrawLiquidityInputChange = (e) => {
    setWithdrawLiquidityAmount(e.target.value)
  }

  const handleWithdrawLiquidity = async () => {
    try {
      if (!contracts || !account || !withdrawLiquidityAmount) {
        throw new Error("Contracts, account not initialized or amount not provided")
      }

      await withdrawLiquidity(contracts, withdrawLiquidityAmount)

      // update balance
      const balances = await getTokenBalances(contracts, account)
      setBalance0(balances.token0)
      setBalance1(balances.token1)

      // update pool info
      const newPoolInfo = await getPoolInfo(contracts)
      setPoolInfo(newPoolInfo)

      // update user liquidity
      const liquidity = await getLiquidity(contracts, account)
      setUserLiquidity(liquidity)

      setWithdrawLiquidityAmount("")
    } catch (error) {
      console.error("Detailed error:", error)
    }
  }

  return (
    <div className="app-container">
      <div className="app-content">
        <div className="app-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                <line x1="12" y1="6" x2="12" y2="18"></line>
              </svg>
            </div>
            <h1>DeFi Exchange</h1>
          </div>
          {!isWalletConnected ? (
            <Button variant="primary" className="connect-wallet-btn" onClick={handleConnectWallet}>
              Connect Wallet
            </Button>
          ) : (
            <div className="wallet-info">
              <span className="wallet-address">
                {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
              </span>
              <div className="wallet-status connected"></div>
            </div>
          )}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-left">
            <Card className="pool-info-card">
              <Card.Body>
                <Card.Title>Liquidity Pool</Card.Title>
                <div className="pool-balances">
                  <div className="token-balance">
                    <div className="token-amount">{Number.parseFloat(poolInfo.token0Balance).toFixed(4)}</div>
                    <div className="token-symbol">ALPHA</div>
                  </div>
                  <div className="token-balance">
                    <div className="token-amount">{Number.parseFloat(poolInfo.token1Balance).toFixed(4)}</div>
                    <div className="token-symbol">BETA</div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {isWalletConnected && (
              <Card className="user-liquidity-card">
                <Card.Body>
                  <Card.Title>Your Liquidity</Card.Title>
                  <div className="liquidity-amount">
                    <span>{Number.parseFloat(userLiquidity).toFixed(6)}</span>
                    <span className="liquidity-label">LP Tokens</span>
                  </div>
                </Card.Body>
              </Card>
            )}

            {isWalletConnected && (
              <Card className="wallet-balances-card">
                <Card.Body>
                  <Card.Title>Your Wallet</Card.Title>
                  <div className="wallet-balances">
                    <div className="token-balance">
                      <div className="token-amount">{Number.parseFloat(balance0).toFixed(4)}</div>
                      <div className="token-symbol">ALPHA</div>
                    </div>
                    <div className="token-balance">
                      <div className="token-amount">{Number.parseFloat(balance1).toFixed(4)}</div>
                      <div className="token-symbol">BETA</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>

          <div className="dashboard-right">
            <Card className="main-card">
              <Card.Body>
                <div className="main-tabs">
                  <div className="tab-buttons">
                    <button
                      className={`tab-button ${activeTab === "swap" ? "active" : ""}`}
                      onClick={() => setActiveTab("swap")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="17 1 21 5 17 9"></polyline>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                        <polyline points="7 23 3 19 7 15"></polyline>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                      </svg>
                      Swap
                    </button>
                    <button
                      className={`tab-button ${activeTab === "liquidity" ? "active" : ""}`}
                      onClick={() => setActiveTab("liquidity")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v20M2 12h20"></path>
                      </svg>
                      Liquidity
                    </button>
                  </div>

                  {activeTab === "swap" && (
                    <div className="swap-container">
                      <div className="token-input-container">
                        <div className="token-input-label">From</div>
                        <div className="token-input-wrapper">
                          <input
                            type="number"
                            placeholder="0"
                            value={fromAmount}
                            onChange={handleFromAmountChange}
                            className="token-input"
                          />
                          <select
                            value={fromToken}
                            onChange={(e) => {
                              setFromToken(e.target.value)
                              if (e.target.value === toToken) {
                                setToToken(fromToken)
                              }
                              setFromAmount("")
                              setToAmount("")
                            }}
                            className="token-select"
                          >
                            <option value="ALPHA">ALPHA</option>
                            <option value="BETA">BETA</option>
                          </select>
                        </div>
                        {isWalletConnected && (
                          <div className="balance-display">Balance: {fromToken === "ALPHA" ? balance0 : balance1}</div>
                        )}
                      </div>

                      <div className="swap-divider" onClick={handleTokenSwitch}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                      </div>

                      <div className="token-input-container">
                        <div className="token-input-label">To</div>
                        <div className="token-input-wrapper">
                          <input type="number" placeholder="0" value={toAmount} disabled className="token-input" />
                          <select
                            value={toToken}
                            onChange={(e) => {
                              setToToken(e.target.value)
                              if (e.target.value === fromToken) {
                                setFromToken(toToken)
                              }
                              setFromAmount("")
                              setToAmount("")
                            }}
                            className="token-select"
                          >
                            <option value="ALPHA">ALPHA</option>
                            <option value="BETA">BETA</option>
                          </select>
                        </div>
                        {isWalletConnected && (
                          <div className="balance-display">Balance: {toToken === "ALPHA" ? balance0 : balance1}</div>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        className="action-button"
                        onClick={handleSwap}
                        disabled={!isWalletConnected || !fromAmount || fromAmount === "0"}
                      >
                        {!isWalletConnected ? "Connect Wallet to Swap" : "Swap"}
                      </Button>
                    </div>
                  )}

                  {activeTab === "liquidity" && (
                    <div className="liquidity-container">
                      <div className="liquidity-tabs">
                        <button
                          className={`liquidity-tab-button ${activeLiquidityTab === "add" ? "active" : ""}`}
                          onClick={() => setActiveLiquidityTab("add")}
                        >
                          Add Liquidity
                        </button>
                        <button
                          className={`liquidity-tab-button ${activeLiquidityTab === "withdraw" ? "active" : ""}`}
                          onClick={() => setActiveLiquidityTab("withdraw")}
                        >
                          Withdraw Liquidity
                        </button>
                      </div>

                      {activeLiquidityTab === "add" && (
                        <>
                          <div className="token-input-container">
                            <div className="token-input-label">ALPHA Amount</div>
                            <div className="token-input-wrapper">
                              <input
                                type="number"
                                placeholder="0"
                                value={token0Amount}
                                onChange={handleToken0AmountChange}
                                className="token-input"
                              />
                              <div className="token-label">ALPHA</div>
                            </div>
                            {isWalletConnected && <div className="balance-display">Balance: {balance0}</div>}
                          </div>

                          <div className="plus-divider">+</div>

                          <div className="token-input-container">
                            <div className="token-input-label">BETA Amount (calculated)</div>
                            <div className="token-input-wrapper">
                              <input
                                type="number"
                                placeholder="0"
                                value={token1Amount}
                                disabled
                                className="token-input"
                              />
                              <div className="token-label">BETA</div>
                            </div>
                            {isWalletConnected && <div className="balance-display">Balance: {balance1}</div>}
                          </div>

                          <Button
                            variant="primary"
                            className="action-button"
                            onClick={handleAddLiquidity}
                            disabled={!isWalletConnected || !token0Amount || token0Amount === "0"}
                          >
                            {!isWalletConnected ? "Connect Wallet to Add Liquidity" : "Add Liquidity"}
                          </Button>

                          <div className="quick-add-container">
                            <div className="quick-add-label">Quick Add:</div>
                            <input
                              type="number"
                              placeholder="Enter ALPHA amount"
                              value={addLiquidityAmount}
                              onChange={handleAddLiquidityInputChange}
                              className="quick-add-input"
                            />
                            <Button
                              variant="primary"
                              className="quick-add-button"
                              onClick={handleDirectAddLiquidity}
                              disabled={!isWalletConnected || !addLiquidityAmount || addLiquidityAmount === "0"}
                            >
                              Add
                            </Button>
                          </div>
                        </>
                      )}

                      {activeLiquidityTab === "withdraw" && (
                        <div className="withdraw-container">
                          <div className="token-input-container">
                            <div className="token-input-label">LP Token Amount</div>
                            <div className="token-input-wrapper">
                              <input
                                type="number"
                                placeholder="0"
                                value={withdrawLiquidityAmount}
                                onChange={handleWithdrawLiquidityInputChange}
                                className="token-input"
                              />
                              <div className="token-label">LP</div>
                            </div>
                            {isWalletConnected && (
                              <div className="balance-display">
                                Available: {Number.parseFloat(userLiquidity).toFixed(6)} LP
                              </div>
                            )}
                          </div>

                          <div className="withdraw-info">
                            <div className="withdraw-info-item">
                              <span>You will receive:</span>
                              <div className="withdraw-tokens">
                                <div className="withdraw-token">
                                  <span className="token-icon alpha">α</span>
                                  <span>ALPHA</span>
                                </div>
                                <div className="withdraw-token">
                                  <span className="token-icon beta">β</span>
                                  <span>BETA</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            className="action-button withdraw-button"
                            onClick={handleWithdrawLiquidity}
                            disabled={
                              !isWalletConnected ||
                              !withdrawLiquidityAmount ||
                              withdrawLiquidityAmount === "0" ||
                              Number.parseFloat(withdrawLiquidityAmount) > Number.parseFloat(userLiquidity)
                            }
                          >
                            {!isWalletConnected ? "Connect Wallet to Withdraw" : "Withdraw Liquidity"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

