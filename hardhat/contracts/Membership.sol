// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Membership is ERC1155, Ownable {
    mapping (uint256 => string) private _tokenURIs;
    mapping (address => mapping (uint256 => bool)) private _hasMinted;

    constructor() ERC1155("") {
        _setTokenURI(1, "https://bafkreidoyww3ffks5w6srfzr77gme2ambfzjuibd4fc3u7fy75xxcw7kui.ipfs.nftstorage.link/");
        _setTokenURI(2, "https://bafkreihu7s2xmkibjwin7ucp4hrxs7k55bkzljq5t7xg5nychrze75bqxy.ipfs.nftstorage.link/");
    }

    function _setTokenURI(uint256 tokenId, string memory uriLink) internal {
        _tokenURIs[tokenId] = uriLink;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function mint(uint256 tokenId) public {
        require(!_hasMinted[msg.sender][tokenId], "You have already minted this token");
        _hasMinted[msg.sender][tokenId] = true;
        _mint(msg.sender, tokenId, 1, "");
    }
}