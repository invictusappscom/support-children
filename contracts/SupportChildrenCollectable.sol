pragma solidity >=0.7.6 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SupportChildrenCollectable is ERC721URIStorage {
    uint256 public tokenCounter;
    enum Type{FirstDonation, LastDonation, FullCampaingDonation, CampaignSuccessfullyFinished}
    
    mapping(uint256 => Type) public tokenIdToType;
    mapping(address => uint[]) tokenListbyUser;
    
    event NFTCreated (
        uint id,
        uint nftType,
        string tokenUrl
    );

    constructor() ERC721("SupportChildrenCollectible", "SCC") {
        tokenCounter = 0;
    }


    function createCollectible(string memory tokenURI, uint tokenType) public {
        _safeMint(tx.origin, tokenCounter);
        _setTokenURI(tokenCounter, tokenURI);
        tokenIdToType[tokenCounter] = Type(tokenType);
        tokenListbyUser[tx.origin].push(tokenCounter);
        emit NFTCreated(tokenCounter, tokenType, tokenURI);
        tokenCounter = tokenCounter + 1;
    }
    
    function getCollectibleList(address _donor) view public returns (uint[] memory) {
        return tokenListbyUser[_donor];
    }
}