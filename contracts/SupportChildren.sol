// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract SupportChildren {
    
    uint campaignIndex;
    uint count;
    
    struct Campaign {
        uint id;
        string name; 
        string description;
        string creatorEmail; 
        uint targetAmount;
        uint currentAmount;
        address targetAccount;
    }
    
    Campaign[] campaigns;
    
    mapping(uint => string[]) campaignDonationsEmails;
    
    function createCampaign(string memory _name, string memory _description, string memory _creatorEmail, uint32 _targetAmount, address _targetAccount) public {
         campaigns.push(Campaign({
            id: count,
            name: _name,
            description: _description,
            creatorEmail: _creatorEmail,
            targetAmount: _targetAmount,
            currentAmount: 0,
            targetAccount: _targetAccount
        }));
        
        count++;
    }
    
    // Fiktivno slanje para za test samo
    function donateTest(uint _campaignId, string memory _donorEmail, uint _amount) public {
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        
        campaigns[_campaignId].targetAmount = campaigns[_campaignId].currentAmount + _amount;
    }

    // Stvarno slanje ETH
    function donate(uint _campaignId, string memory _donorEmail) payable public {
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaigns[_campaignId].currentAmount = campaigns[_campaignId].currentAmount  + msg.value;
    }
    
    function getDonatorEmails(uint _campaignId) view public returns (string[] memory) {
        return campaignDonationsEmails[_campaignId];
    }
    
    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }

    function getCampaignAmount(uint _campaignId) public view returns (uint) {
        return campaigns[_campaignId].currentAmount;
    }
    
}