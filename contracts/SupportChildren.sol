// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract SupportChildren {

    event DonationMade (
        uint campaignId,
        uint donationAmount,
        string notifyEmail
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
        uint targetAmount;
        uint currentAmount;
        address payable beneficiaryAddress;
        bool active;
    }
    
    Campaign[] campaigns;
    
    mapping(uint => string[]) campaignDonationsEmails;
    
    function createCampaign(string memory _name, string memory _description, string memory _creatorEmail, uint _targetAmount, address payable _beneficiaryAddress) public {
         campaigns.push(Campaign({
            id: count,
            name: _name,
            description: _description,
            creatorEmail: _creatorEmail,
            targetAmount: _targetAmount,
            currentAmount: 0,
            beneficiaryAddress: _beneficiaryAddress,
            active: true
        }));
        
        count++;
    }
    
    // Only for test
    function donateTest(uint _campaignId, string memory _donorEmail, uint _amount) public {
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        
        campaigns[_campaignId].targetAmount = campaigns[_campaignId].currentAmount + _amount;
    }

    // Real ETH donation
    function donate(uint _campaignId, string memory _donorEmail) payable public {
        require(campaigns[_campaignId].active, "campaign is not active");
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaigns[_campaignId].currentAmount = campaigns[_campaignId].currentAmount  + msg.value;

        emit DonationMade(_campaignId, msg.value, campaigns[_campaignId].creatorEmail);

        if (campaigns[_campaignId].currentAmount >= campaigns[_campaignId].targetAmount) {
            emit CampaignFinished(_campaignId, campaigns[_campaignId].currentAmount, campaignDonationsEmails[_campaignId]);
            // Send ETH to the address of the child
            campaigns[_campaignId].beneficiaryAddress.transfer(campaigns[_campaignId].currentAmount);
            campaigns[_campaignId].active = false;
        }
    }
    
    function getDonorEmails(uint _campaignId) view public returns (string[] memory) {
        return campaignDonationsEmails[_campaignId];
    }
    
    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }

    function getCampaignAmount(uint _campaignId) public view returns (uint) {
        return campaigns[_campaignId].currentAmount;
    }
    
}