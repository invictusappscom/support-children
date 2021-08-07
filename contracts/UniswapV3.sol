// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9.0;
pragma abicoder v2;

// import "https://github.com/Uniswap/uniswap-v3-periphery/blob/main/contracts/interfaces/ISwapRouter.sol";
// import "https://github.com/Uniswap/uniswap-v3-periphery/blob/main/contracts/interfaces/IQuoter.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

interface IUniswapRouter is ISwapRouter {
    function refundETH() external payable;
}

interface IERC20 {
    function transferFrom(
        address sender, 
        address recipient, 
        uint256 amount) 
        external 
        returns (bool);
    function approve(address spender, uint tokens)  external returns (bool);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract Uniswap3 {
  IUniswapRouter public constant uniswapRouter = IUniswapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
  address private constant multiDaiKovan = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
  address private constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  function convertExactEthToToken(address token) external payable {
    require(msg.value > 0, "Must pass non 0 ETH amount");

    uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
    address tokenIn = WETH9;
    address tokenOut = token;
    uint24 fee = 3000;
    address recipient = msg.sender;
    uint256 amountIn = msg.value;
    uint256 amountOutMinimum = 1;
    uint160 sqrtPriceLimitX96 = 0;
    
    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
        tokenIn,
        tokenOut,
        fee,
        recipient,
        deadline,
        amountIn,
        amountOutMinimum,
        sqrtPriceLimitX96
    );
    
    uniswapRouter.exactInputSingle{ value: msg.value }(params);
    uniswapRouter.refundETH();
    
    // refund leftover ETH to user
    (bool success,) = msg.sender.call{ value: address(this).balance }("");
    require(success, "refund failed");
  }
  
  function convertTokenToExactEth(address token, uint amountOut, uint amountInMaximum) external {
    uint256 allowance = IERC20(token).allowance(msg.sender, address(this));
    require(allowance >= amountInMaximum, "Check the token allowance");
    IERC20(token).transferFrom(msg.sender, address(this), amountInMaximum);
    uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
    address tokenIn = token;
    address tokenOut = WETH9;
    uint24 fee = 3000;
    address recipient = msg.sender;
    uint160 sqrtPriceLimitX96 = 0;
    IERC20(token).approve(address(uniswapRouter), amountInMaximum);
    
    ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams(
        tokenIn,
        tokenOut,
        fee,
        recipient,
        deadline,
        amountOut,
        amountInMaximum,
        sqrtPriceLimitX96
    );
    
    uint256 amountOFTokenUsed = uniswapRouter.exactOutputSingle(params);
    
    // refund leftover Tokens to user
    (bool success) = IERC20(token).transfer(msg.sender, amountInMaximum-amountOFTokenUsed);
    require(success, "refund failed");
  }
  
  function convertTokenToExactToken(address tokenIn, address tokenOut, uint amountOut, uint amountInMaximum) external {
    uint256 allowance = IERC20(tokenIn).allowance(msg.sender, address(this));
    require(allowance >= amountInMaximum, "Check the token allowance");
    IERC20(tokenIn).transferFrom(msg.sender, address(this), amountInMaximum);
    uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
    uint24 fee = 3000;
    address recipient = msg.sender;
    uint160 sqrtPriceLimitX96 = 0;
    IERC20(tokenIn).approve(address(uniswapRouter), amountInMaximum);
    
    ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams(
        tokenIn,
        tokenOut,
        fee,
        recipient,
        deadline,
        amountOut,
        amountInMaximum,
        sqrtPriceLimitX96
    );
    
    uint256 amountOFTokenUsed = uniswapRouter.exactOutputSingle(params);
    
    // refund leftover Tokens to user
    (bool success) = IERC20(tokenIn).transfer(msg.sender, amountInMaximum-amountOFTokenUsed);
    require(success, "refund failed");
  }
  
  // do not used on-chain, gas inefficient!
  function getEstimatedETHforDAI(uint daiAmount) external payable returns (uint256) {
    address tokenIn = WETH9;
    address tokenOut = multiDaiKovan;
    uint24 fee = 3000;
    uint160 sqrtPriceLimitX96 = 0;

    return quoter.quoteExactOutputSingle(
        tokenIn,
        tokenOut,
        fee,
        daiAmount,
        sqrtPriceLimitX96
    );
  }
  
  // important to receive ETH
  receive() payable external {}
}