// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol"; 


contract SBT is Ownable, ERC721URIStorage {
    mapping(uint => address) public tokenHolders;
    address public daoAddress;

    using Counters for Counters.Counter;
 
    Counters.Counter private _tokenIdCounter;
    
     constructor(address _daoAddress) ERC721("SoulBoundToken", "SBT") {
        daoAddress=_daoAddress;
     }

     function mintSBT(address recipient, string memory tokenURI) external{
        require(msg.sender == daoAddress, "Tokens can only be minted by the SoulDAO contract");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenHolders[tokenId] = recipient;
     }

     function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the token can burn it.");
        _burn(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256) pure internal {
        require(from == address(0) || to == address(0), "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner.");
    }

}