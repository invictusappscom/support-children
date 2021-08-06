// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

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

    IUniswap public constant uniswap = IUniswap(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    
    event DonationMade (
        uint campaignId,
        uint donationAmount,
        string notifyEmail,
        string currency
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

    modifier daiCampaign(uint _campaignId) {
        require(campaigns[_campaignId].targetCurrency == 1, "This is not DAI campaign");
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

    function createCampaign(string memory _name, string memory _description, string memory _creatorEmail, string memory _image, uint _targetCurrency, uint _targetAmount, address payable _beneficiaryAddress) public {
        require(_targetAmount > 0, "campaign target amount must be larger than 0");
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
            active: true
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
        // curentamount must be fetched from frontend
        require((campaigns[_campaignId].currentAmount  + msg.value) * 10 < 11 * campaigns[_campaignId].targetAmount, "Target amount exceded");
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaignDonors[tx.origin].push(_campaignId);
        campaigns[_campaignId].currentAmount = campaigns[_campaignId].currentAmount  + msg.value;

        emit DonationMade(_campaignId, msg.value, campaigns[_campaignId].creatorEmail, "ETH");

        if (campaigns[_campaignId].currentAmount >= campaigns[_campaignId].targetAmount) {
            finishCampaign(_campaignId);
        }
    }

    // Token to ETH
    function donateTokenToETHCampaign(uint _campaignId, string memory _donorEmail, address token, uint amountIn, uint amountOutMin, uint deadline) public {
        IERC20(token).approve(address(uniswap), amountIn);
        address[] memory path = new address[](2);
        path[0] = address(0x6B175474E89094C44Da98b954EedeAC495271d0F);
        path[1] = uniswap.WETH();
        IERC20(token).approve(address(uniswap), amountIn);
        uniswap.swapExactTokensForETH(
            amountIn, 
            amountOutMin, 
            path, 
            address(this), 
            deadline
        );

        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaignDonors[tx.origin].push(_campaignId);
        campaigns[_campaignId].currentAmount = campaigns[_campaignId].currentAmount + amountOutMin;
        emit DonationMade(_campaignId, amountIn, campaigns[_campaignId].creatorEmail, "DAI");

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