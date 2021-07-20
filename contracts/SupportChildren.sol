pragma solidity >=0.7.0 <0.9.0;

contract ChildrenSupport {
    
    uint campaignIndex;
    uint count;
    
    struct Campaign {
        uint id;
        string name; 
        string description;
        string creatorEmail; 
        uint32 targetAmount;
        address targetAccount;
    }
    
    Campaign[] campaigns;
    
    mapping(uint => string[]) campaignDonationsEmails;
    mapping(uint => uint) public campaignDonationsAmounts;
    mapping(uint => uint) public campaignDonationsTargetAmounts;
    
    function createCampaign(string memory _name, string memory _description, string memory _creatorEmail, uint32 _targetAmount, address _targetAccount) public {
         campaigns.push(Campaign({
            id: count,
            name: _name,
            description: _description,
            creatorEmail: _creatorEmail,
            targetAmount: _targetAmount,
            targetAccount: _targetAccount
        }));
        campaignDonationsTargetAmounts[count] = _targetAmount;
        
        count++;
    }
    
    // Fiktivno slanje para za test samo
    function donateTest(uint _campaignId, string memory _donorEmail, uint32 _amount) public {
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaignDonationsAmounts[_campaignId] = campaignDonationsAmounts[_campaignId] + _amount;
        
        campaigns[_campaignId].targetAmount = campaigns[_campaignId].targetAmount + _amount;
    }

    // Stvarno slanje ETH
    function donate(uint _campaignId, string memory _donorEmail) payable public {
        campaignDonationsEmails[_campaignId].push(_donorEmail);
        campaignDonationsAmounts[_campaignId] = campaignDonationsAmounts[_campaignId] + msg.value;
    }
    
    function getDonatorEmails(uint _campaignId) view public returns (string[] memory) {
        return campaignDonationsEmails[_campaignId];
    }
    
    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }
    
}