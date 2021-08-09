pragma solidity >=0.7.6 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract SupportChildrenCollectible is ERC721, VRFConsumerBase {
    uint256 public tokenCounter;
    enum Type{FirstDonation, LastDonation, FullCampaingDonation, CampaignSuccessfullyFinished}
    enum TestRandomness{First, Second, Third, Fourth, Final}
    // add other things
    mapping(bytes32 => address) public requestIdToSender;
    mapping(bytes32 => Type) public requestIdToType;
    mapping(bytes32 => string) public requestIdToTokenURI;
    mapping(uint256 => Type) public tokenIdToType;
    mapping(uint256 => TestRandomness) public tokenIdToTestRandomness;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    event requestedCollectible(bytes32 indexed requestId); 


    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 internal owner;


    modifier owner {
        require(campaigns[_campaignId].creatorAddress == tx.origin, "you must be campaign creator to do this");
        _;
    }
    
    constructor(address _VRFCoordinator, address _LinkToken, bytes32 _keyhash, address owner)
    public 
    VRFConsumerBase(_VRFCoordinator, _LinkToken)
    ERC721("SupportChildrenCollectible", "SCC")
    {
        tokenCounter = 0;
        keyHash = _keyhash;
        fee = 0.1 * 10 ** 18;
        owner = owner;
    }

    function createCollectible(string memory tokenURI, string memory typeId) 
        public returns (bytes32){
            bytes32 requestId = requestRandomness(keyHash, fee);
            requestIdToSender[requestId] = msg.sender;
            requestIdToTokenURI[requestId] = tokenURI;
            requestIdToType[requestId] = Type(typeId);
            emit requestedCollectible(requestId);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber) internal override {
        address owner = requestIdToSender[requestId];
        string memory tokenURI = requestIdToTokenURI[requestId];
        uint256 newItemId = tokenCounter;
        _safeMint(owner, newItemId);
        _setTokenURI(newItemId, tokenURI);
        TestRandomness random = TestRandomness(randomNumber % 5); 
        tokenIdToTestRandomness[newItemId] = random;
        requestIdToTokenId[requestId] = newItemId;
        tokenIdToType[newItemId] = requestIdToType[requestId];
        tokenCounter = tokenCounter + 1;
    }
}