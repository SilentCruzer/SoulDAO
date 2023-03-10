// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface ISBT{
    function mintSBT(address recipient, string memory tokenURI) external;
}


contract SoulDAO {
    enum MemberType {Master, Apprentice}
    enum VoteStates {Absent, Yes, No}
    mapping (address => MemberType ) public members;
    address private erc1155Address;
    address public sbtAddress;
    uint tokenId;

    constructor(address _erc1155Address, address _sbtAddress){
        erc1155Address=_erc1155Address;
        sbtAddress=_sbtAddress;
        members[msg.sender] = MemberType.Master;
        tokenId = 1;
    }

    function joinDao() external {
        require(members[msg.sender] != MemberType.Apprentice, "User already has Apprentice role in DAO");
        require(members[msg.sender] != MemberType.Master, "User already has Master role in DAO");

        IERC1155 erc1155 = IERC1155(erc1155Address);

        require(erc1155.balanceOf(msg.sender, tokenId) > 0, "You must have the required ERC1155 token to join the DAO");
        members[msg.sender] = MemberType.Apprentice;
    }

    function promoteMember(address member) internal {
        require(members[member] == MemberType.Apprentice, "Specified user does not have a Apprentice role");
        members[member] = MemberType.Master;
    }

    function setSBTAddress(address _sbtAddress) external {
        sbtAddress = _sbtAddress;
    }

    function issueSBT(address recipient, string memory tokenURI) internal {
        ISBT isbt = ISBT(sbtAddress);
        isbt.mintSBT(recipient, tokenURI);
    }

}