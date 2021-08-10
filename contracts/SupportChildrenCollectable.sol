pragma solidity >=0.7.6 <0.9.0;

<<<<<<< HEAD
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
=======
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
>>>>>>> a8cdeb530f6cbc21dd2233c62feda4faf286be9e

contract SupportChildrenCollectable is ERC721URIStorage {
    uint256 public tokenCounter;
    enum Type{FirstDonation, LastDonation, FullCampaingDonation, CampaignSuccessfullyFinished}
    
    mapping(uint256 => Type) public tokenIdToType;
<<<<<<< HEAD
    mapping(uint256 => TestRandomness) public tokenIdToTestRandomness;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    event requestedCollectible(bytes32 indexed requestId); 


    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 internal owner;


    // modifier owner {
    //     require(campaigns[_campaignId].creatorAddress == tx.origin, "you must be campaign creator to do this");
    //     _;
    // }
=======
    mapping(address => uint[]) tokenListbyUser;
>>>>>>> a8cdeb530f6cbc21dd2233c62feda4faf286be9e
    
    event NFTCreated (
        uint id,
        uint nftType,
        string tokenUrl
    );

    constructor() ERC721("SupportChildrenCollectible", "SCC") {
        tokenCounter = 0;
    }

<<<<<<< HEAD
    function createCollectible(string memory tokenURI, string memory typeId) 
        public returns (bytes32){
            bytes32 requestId = requestRandomness(keyHash, fee);
            requestIdToSender[requestId] = msg.sender;
            requestIdToTokenURI[requestId] = tokenURI;
            // requestIdToType[requestId] = Type(typeId);
            emit requestedCollectible(requestId);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber) internal override {
        address owner = requestIdToSender[requestId];
        string memory tokenURI = requestIdToTokenURI[requestId];
        uint256 newItemId = tokenCounter;
        _safeMint(owner, newItemId);
        // _setTokenURI(newItemId, tokenURI);
        TestRandomness random = TestRandomness(randomNumber % 5); 
        tokenIdToTestRandomness[newItemId] = random;
        requestIdToTokenId[requestId] = newItemId;
        tokenIdToType[newItemId] = requestIdToType[requestId];
=======

    function createCollectible(string memory tokenURI, uint tokenType) public {
        _safeMint(tx.origin, tokenCounter);
        _setTokenURI(tokenCounter, tokenURI);
        tokenIdToType[tokenCounter] = Type(tokenType);
        tokenListbyUser[tx.origin].push(tokenCounter);
        emit NFTCreated(tokenCounter, tokenType, tokenURI);
>>>>>>> a8cdeb530f6cbc21dd2233c62feda4faf286be9e
        tokenCounter = tokenCounter + 1;
    }
    
    function getCollectibleList(address _donor) view public returns (uint[] memory) {
        return tokenListbyUser[_donor];
    }
}