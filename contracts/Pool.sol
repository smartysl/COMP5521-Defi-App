// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";
import "./LPToken.sol";

contract Pool is LPToken, ReentrancyGuard {
    IERC20 immutable i_token0;
    IERC20 immutable i_token1;

    address immutable i_token0_address;
    address immutable i_token1_address;

    uint256 constant INITIAL_RATIO = 2; //token0:token1 = 1:2

    uint256 constant FEE_RATE = 30; // 0.3% exchange fee
    uint256 constant FEE_BASE = 10000;

    mapping(address => uint256) tokenBalances;

    event AddedLiquidity(
        uint256 indexed lpToken,
        address token0,
        uint256 indexed amount0,
        address token1,
        uint256 indexed amount1
    );

    event WithdrawnLiquidity(
        uint256 indexed lpToken,
        address token0,
        uint256 indexed amount0,
        address token1,
        uint256 indexed amount1
    );

    event Swapped(
        address tokenIn,
        uint256 indexed amountIn,
        address tokenOut,
        uint256 indexed amountOut
    );

    constructor(address token0, address token1) LPToken("LPToken", "LPT") {

        i_token0 = IERC20(token0);
        i_token1 = IERC20(token1);

        i_token0_address = token0;
        i_token1_address = token1;
    }

    function getReserves() public view returns (uint256, uint256) {
        return (tokenBalances[i_token0_address], tokenBalances[i_token1_address]);
    }

    function getAmountOut(address tokenIn, uint256 amountIn, address tokenOut) public view returns (uint256) {

        uint256 fee = (amountIn * FEE_RATE) / FEE_BASE;
        uint256 amountInAfterFee = amountIn - fee;

        uint256 balanceOut = tokenBalances[tokenOut];
        uint256 balanceIn = tokenBalances[tokenIn];
        uint256 amountOut = (balanceOut * amountInAfterFee) / (balanceIn + amountInAfterFee);
        
        return amountOut;
    }

    function getWithdrawalAmount(uint256 amountLP) public view returns (uint256, uint256) {
        uint256 totalLP = totalSupply();
        uint256 amount0 = (tokenBalances[i_token0_address] * amountLP) / totalLP;
        uint256 amount1 = (tokenBalances[i_token1_address] * amountLP) / totalLP;
        return (amount0, amount1);
    }

    function swap(address tokenIn, uint256 amountIn, address tokenOut) public nonReentrant {
        
        // input validity checks
        require(tokenIn != tokenOut, "Same tokens");
        require(tokenIn == i_token0_address || tokenIn == i_token1_address, "Invalid token");
        require(tokenOut == i_token0_address || tokenOut == i_token1_address, "Invalid token");
        require(amountIn > 0, "Zero amount");

        uint256 amountOut = getAmountOut(tokenIn, amountIn, tokenOut);

        // swapping tokens
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "Swap Failed");
        require(IERC20(tokenOut).transfer(msg.sender, amountOut), "Swap Failed");
        
        // update pool balances
        tokenBalances[tokenIn] += amountIn;
        tokenBalances[tokenOut] -= amountOut;

        emit Swapped(tokenIn, amountIn, tokenOut, amountOut);

    }

    function getRequiredAmount1(uint256 amount0) public view returns(uint256) {

        uint256 balance0 = tokenBalances[i_token0_address];
        uint256 balance1 = tokenBalances[i_token1_address];
        
        if (balance0 == 0 || balance1 == 0) {
            return amount0 * INITIAL_RATIO;
        }
        return (amount0 * balance1) / balance0;

    }

    function addLiquidity(uint256 amount0) public nonReentrant {
    
        // input validity check
        require(amount0 > 0, "Amount must be greater than 0");
        
        // calculate and mint liquidity tokens
        uint256 amount1 = getRequiredAmount1(amount0);
        uint256 amountLP;
        if (totalSupply() > 0) {
            amountLP = (amount0 * totalSupply()) / tokenBalances[i_token0_address];
        } else {
            amountLP = amount0;
        }
        _mint(msg.sender, amountLP);

        // deposit token0
        require(i_token0.transferFrom(msg.sender, address(this), amount0), "Transfer Alpha failed");
        tokenBalances[i_token0_address] += amount0;
        
        // deposit token1
        require(i_token1.transferFrom(msg.sender, address(this), amount1), "Transfer Beta failed");
        tokenBalances[i_token1_address] += amount1;
        
        emit AddedLiquidity(amountLP, i_token0_address, amount0, i_token1_address, amount1);

    }

    function withdrawLiquidity(uint256 amountLP) public nonReentrant {
        require(amountLP > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amountLP, "Insufficient LP balance");

        (uint256 amount0, uint256 amount1) = getWithdrawalAmount(amountLP);

        _burn(msg.sender, amountLP);

        tokenBalances[i_token0_address] -= amount0;
        tokenBalances[i_token1_address] -= amount1;

        require(i_token0.transfer(msg.sender, amount0), "Transfer token0 failed");
        require(i_token1.transfer(msg.sender, amount1), "Transfer token1 failed");

        emit WithdrawnLiquidity(amountLP, i_token0_address, amount0, i_token1_address, amount1);
    }
}