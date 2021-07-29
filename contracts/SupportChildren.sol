// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract SupportChildren {

    event DonationMade (
        uint campaignId,
        uint donationAmount,
        string notifyEmail
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
        string targetCurrency; 
        uint targetAmount;
        uint currentAmount;
        address payable beneficiaryAddress;
        address creatorAddress;
        bool active;
    }
    
    Campaign[] campaigns;
    
    mapping(uint => string[]) campaignDonationsEmails;
    mapping(address => uint[]) campaignDonors;
    
    function createCampaign(string memory _name, string memory _description, string memory _creatorEmail, string memory _image, string memory _targetCurrency, uint _targetAmount, address payable _beneficiaryAddress) public {
        require(_targetAmount > 0, "campaign target amount must be larger than 0");
        // TODO: save keccak256(bytes("ETH") as variable to reduce gas fee's
        require(keccak256(bytes(_targetCurrency)) == keccak256(bytes("ETH")) || keccak256(bytes(_targetCurrency)) == keccak256(bytes("DAI")), "campaing target currency must be ETH or DAI");
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

    modifier campaignCreator(uint _campaignId) {
        require(campaigns[_campaignId].creatorAddress == tx.origin, "you must be creator of campaign");
        _;
    }

    modifier campaignActive(uint _campaignId) {
        require(campaigns[_campaignId].active == true, "campaing has finished");
        _;
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

    // Real ETH donation
    function donate(uint _campaignId, string memory _donorEmail) payable public campaignActive(_campaignId) campaignCreator(_campaignId) {
        require(campaigns[_campaignId].beneficiaryAddress != tx.origin, "can't donate to your own campaign");
        require(msg.value > 0, "donation must be larger than 0");
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaignDonors[tx.origin].push(_campaignId);
        campaigns[_campaignId].currentAmount = campaigns[_campaignId].currentAmount  + msg.value;

        emit DonationMade(_campaignId, msg.value, campaigns[_campaignId].creatorEmail);

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