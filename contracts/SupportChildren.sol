// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9.0;
pragma abicoder v2;

import "https://github.com/Uniswap/uniswap-v3-periphery/blob/main/contracts/interfaces/ISwapRouter.sol";
import "https://github.com/Uniswap/uniswap-v3-periphery/blob/main/contracts/interfaces/IQuoter.sol";

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

interface IUniswap {
    function swapExactTokensForETH(
        uint amountIn, 
        uint amountOutMin, 
        address[] calldata path, 
        address to, 
        uint deadline)
        external
        returns (uint[] memory amounts);
    function WETH() external pure returns (address);
}

interface IERC20 {
    function transferFrom(
        address sender, 
        address recipient, 
        uint256 amount) 
        external 
        returns (bool);
    function approve(address spender, uint tokens)  external returns (bool);
}
    
contract SupportChildren {
      IUniswapRouter public constant uniswapRouter = IUniswapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
  IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
  address private constant multiDaiKovan = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
  address private constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  function convertExactEthToToken(address token) internal {
    require(msg.value > 0, "Must pass non 0 ETH amount");

    uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
    address tokenIn = WETH9;
    address tokenOut = token;
    uint24 fee = 3000;
    address recipient = address(this);
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
  
  function convertTokenToExactEth(address token, uint amountOut, uint amountInMaximum) internal returns (uint256) {
    uint256 allowance = IERC20(token).allowance(msg.sender, address(this));
    require(allowance >= amountInMaximum, "Check the token allowance");
    IERC20(token).transferFrom(msg.sender, address(this), amountInMaximum);
    uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
    address tokenIn = token;
    address tokenOut = WETH9;
    uint24 fee = 3000;
    address recipient = address(this);
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
    
    uint256 amountOfTokenUsed = uniswapRouter.exactOutputSingle(params);
    uint256 remainderOfTokens = amountInMaximum-amountOfTokenUsed;
    // refund leftover Tokens to user
    (bool success) = IERC20(token).transfer(msg.sender, remainderOfTokens);
    require(success, "refund failed");
    
    return amountOfTokenUsed;
  }
  
  function convertTokenToExactToken(address tokenIn, address tokenOut, uint amountOut, uint amountInMaximum) internal returns (uint256) {
    uint256 allowance = IERC20(tokenIn).allowance(msg.sender, address(this));
    require(allowance >= amountInMaximum, "Check the token allowance");
    IERC20(tokenIn).transferFrom(msg.sender, address(this), amountInMaximum);
    uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
    uint24 fee = 3000;
    address recipient = address(this);
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
    
    uint256 amountOfTokenUsed = uniswapRouter.exactOutputSingle(params);
    uint256 remainderOfTokens = amountInMaximum-amountOfTokenUsed;
    
    // refund leftover Tokens to user
    (bool success) = IERC20(tokenIn).transfer(msg.sender, remainderOfTokens);
    require(success, "refund failed");
    
    return amountOfTokenUsed;
  }
  
  // do not used on-chain, gas inefficient!
  function getEstimatedETHforDAI(uint daiAmount) internal returns (uint256) {
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
  
    event DonationMade (
        uint campaignId,
        uint donationAmount,
        string notifyEmail,
        address token
    );

    event CampaignCreated (
        uint campaignId
    );

    event CampaignFinished (
        uint campaignId,
        uint currentAmount,
        string[] notifyEmails
    );
    
    uint campaignIndex;
    uint count;
    
    struct Campaign {
        uint id;
        string name; 
        string description;
        string creatorEmail; 
        string image; 
        uint targetCurrency; 
        uint targetAmount;
        uint currentAmount;
        address payable beneficiaryAddress;
        address creatorAddress;
        bool active;
        uint endTimestamp;
    }
    
    Campaign[] campaigns;
    
    mapping(uint => string[]) campaignDonationsEmails;
    mapping(address => uint[]) campaignDonors;
    
    modifier campaignCreator(uint _campaignId) {
        require(campaigns[_campaignId].creatorAddress == tx.origin, "you must be campaign creator to do this");
        _;
    }
    
    modifier notCampaignCreator(uint _campaignId) {
        require(campaigns[_campaignId].creatorAddress != tx.origin, "you can't be campaign creator to do this");
        _;
    }

    modifier ethCampaign(uint _campaignId) {
        require(campaigns[_campaignId].targetCurrency == 0, "This is not ETH campaign");
        _;
    }

    modifier notCampaignBenefactor(uint _campaignId) {
        require(campaigns[_campaignId].beneficiaryAddress != tx.origin, "you can't be campaign benefactor to do this");
        _;
    }

    modifier campaignActive(uint _campaignId) {
        require(campaigns[_campaignId].active == true, "campaing has finished");
        _;
    }

    function createCampaign(string memory _name, string memory _description, string memory _creatorEmail, string memory _image, uint _endTimestamp, uint _targetCurrency, uint _targetAmount, address payable _beneficiaryAddress) public {
        require(_targetAmount > 0, "campaign target amount must be larger than 0");
        require(_endTimestamp > block.timestamp, "Campaign must end in the future");
        // TODO: save keccak256(bytes("ETH") as variable to reduce gas fee's
        require(_targetCurrency == 1 || _targetCurrency == 0, "campaing target currency must be ETH or DAI");
        campaigns.push(Campaign({
            id: count,
            name: _name,
            description: _description,
            creatorEmail: _creatorEmail,
            image: _image,
            targetAmount: _targetAmount,
            targetCurrency: _targetCurrency,
            currentAmount: 0,
            beneficiaryAddress: _beneficiaryAddress,
            creatorAddress: tx.origin,
            active: true,
            endTimestamp: _endTimestamp 
        }));

        emit CampaignCreated(count);
        
        count++;
    }

    function endCampaign(uint _campaignId) public campaignActive(_campaignId) campaignCreator(_campaignId) {
        if (campaigns[_campaignId].currentAmount > 0) {
            finishCampaign(_campaignId);
        } else {
            emit CampaignFinished(_campaignId, 0, campaignDonationsEmails[_campaignId]);
            campaigns[_campaignId].active = false;
        }
    }

    function editCampaign(uint _campaignId, string memory _name, string memory _description, string memory _creatorEmail, string memory _image) public campaignActive(_campaignId) campaignCreator(_campaignId) {
        campaigns[_campaignId].name = _name;
        campaigns[_campaignId].description = _description;
        campaigns[_campaignId].creatorEmail = _creatorEmail;
        campaigns[_campaignId].image = _image;
    }

    function finishCampaign(uint _campaignId) private {
        emit CampaignFinished(_campaignId, campaigns[_campaignId].currentAmount, campaignDonationsEmails[_campaignId]);
        // Send ETH to the address of the child
        campaigns[_campaignId].beneficiaryAddress.transfer(campaigns[_campaignId].currentAmount);
        campaigns[_campaignId].active = false;
    }


    // ETH to ETH
    function donateEthToEthCampaign(uint _campaignId, string memory _donorEmail) payable public campaignActive(_campaignId) notCampaignCreator(_campaignId) notCampaignBenefactor(_campaignId) ethCampaign(_campaignId) {
        require(msg.value > 0, "donation must be larger than 0");
        require(campaigns[_campaignId].endTimestamp > block.timestamp, "Campaign already finished");

        // curentamount must be fetched from frontend
        require((campaigns[_campaignId].currentAmount  + msg.value) * 10 < 11 * campaigns[_campaignId].targetAmount, "Target amount exceded");
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaignDonors[tx.origin].push(_campaignId);
        campaigns[_campaignId].currentAmount = campaigns[_campaignId].currentAmount  + msg.value;

        emit DonationMade(_campaignId, msg.value, campaigns[_campaignId].creatorEmail, address(this));

        if (campaigns[_campaignId].currentAmount >= campaigns[_campaignId].targetAmount) {
            finishCampaign(_campaignId);
        }
    }

    // Token to ETH
    function donateTokenToETHCampaign(uint _campaignId, string memory _donorEmail, address token, uint amountOut, uint amountInMax) public {
        (uint256 tokensSpent) = convertTokenToExactEth(token, amountOut, amountInMax);
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaignDonors[tx.origin].push(_campaignId);
        campaigns[_campaignId].currentAmount = campaigns[_campaignId].currentAmount + amountOut;
        emit DonationMade(_campaignId, tokensSpent, campaigns[_campaignId].creatorEmail, token);

        if (campaigns[_campaignId].currentAmount >= campaigns[_campaignId].targetAmount) {
            finishCampaign(_campaignId);
        }
    }
    // Token to Token
    function donateTokenToETHCampaign(uint _campaignId, string memory _donorEmail, address tokenIn, address tokenOut, uint amountOut, uint amountInMax) public {
        (uint256 tokensSpent) = convertTokenToExactToken(tokenIn, tokenOut, amountOut, amountInMax);
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaignDonors[tx.origin].push(_campaignId);
        campaigns[_campaignId].currentAmount = campaigns[_campaignId].currentAmount + amountOut;
        emit DonationMade(_campaignId, tokensSpent, campaigns[_campaignId].creatorEmail, tokenIn);

        if (campaigns[_campaignId].currentAmount >= campaigns[_campaignId].targetAmount) {
            finishCampaign(_campaignId);
        }
    }
    
    function getDonorEmails(uint _campaignId) view public returns (string[] memory) {
        return campaignDonationsEmails[_campaignId];
    }
    
    function getDonorsCampaingsList(address _donor) view public returns (uint[] memory) {
        return campaignDonors[_donor];
    }
    
    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }

    function getCampaignAmount(uint _campaignId) public view returns (uint) {
        return campaigns[_campaignId].currentAmount;
    }
}