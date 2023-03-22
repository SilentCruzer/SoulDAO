// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol"; 

interface ISBT {
    function mintSBT(address recipient, string memory tokenURI) external;
    function burn(uint256 tokenId) external;
}

contract SoulDAO {
    enum MemberType {Rogue,Master, Apprentice}
    enum VoteStates {Absent, Yes, No}
    enum ProposalType {Issue, Promote}

    struct Proposal {
        uint id;
        address proposer;
        ProposalType typ;
        address member;
        string tokenURI;
        uint yesVotes;
        uint noVotes;
        bool isExecuted;
        mapping(address => bool) hasVoted;
    }

    using Counters for Counters.Counter;
 
    Counters.Counter private _proposalIdCounter;


    mapping (address => MemberType ) public members;
    mapping(uint256 => Proposal) public proposals;
    address private erc1155Address;
    address public sbtAddress;
    uint tokenId;
    uint256[] public proposalIds;
    uint256 public totalMembers;
    

    constructor(address _erc1155Address){
        erc1155Address=_erc1155Address;
        members[msg.sender] = MemberType.Master;
        tokenId = 1;
        totalMembers=1;
    }

    function joinDao() external {
        require(members[msg.sender] != MemberType.Apprentice, "User already has Apprentice role in DAO");
        require(members[msg.sender] != MemberType.Master, "User already has Master role in DAO");

        IERC1155 erc1155 = IERC1155(erc1155Address);

        require(erc1155.balanceOf(msg.sender, tokenId) > 0, "You must have the required ERC1155 token to join the DAO");
        members[msg.sender] = MemberType.Apprentice;
        totalMembers++;
    }

    function createProposal(address targetMember, uint typ, string memory _tokenURI) external returns(uint){
        require(members[msg.sender] == MemberType.Master || members[msg.sender] == MemberType.Apprentice, "Only DAO members can create a proposal");

        uint256 id = _proposalIdCounter.current();
        _proposalIdCounter.increment();

        Proposal storage p = proposals[id];
        p.id = id;
        p.proposer = msg.sender;
        p.member = targetMember;
        p.typ = ProposalType(typ);
        p.tokenURI = _tokenURI;
        p.yesVotes = 0;
        p.noVotes = 0;
        p.isExecuted = false;

        proposalIds.push(id);

        voteForProposal(id, 1);

        return id;
    }

    function voteForProposal(uint id, uint vote) public {
        require(members[msg.sender] == MemberType.Master || members[msg.sender] == MemberType.Apprentice, "Only DAO members can create a proposal");
        require(!proposals[id].isExecuted, "Proposal has already been executed");
        require(!proposals[id].hasVoted[msg.sender], "Member has already voted for this proposal");

        if(vote == 1 ){
            proposals[id].yesVotes++;
        } else {
            proposals[id].noVotes++;
        }

        proposals[id].hasVoted[msg.sender] = true;

        if (proposals[id].yesVotes > totalMembers/2) {
            executeProposal(id);
        }
    }

    function executeProposal(uint256 id) private {
        require(!proposals[id].isExecuted, "Proposal has already been executed");
        if (proposals[id].typ == ProposalType.Issue) {
            issueSBT(proposals[id].member, proposals[id].tokenURI);
        }

        if (proposals[id].typ == ProposalType.Promote) {
            promoteMember(proposals[id].member);
        }

        proposals[id].isExecuted = true;
    }

    function promoteMember(address member) private {
        require(members[member] == MemberType.Apprentice, "Specified user does not have a Apprentice role");
        members[member] = MemberType.Master;
    }

    function setSBTAddress(address _sbtAddress) external {
        require(members[msg.sender] == MemberType.Master, "Only Masters can edit sbt address");
        sbtAddress = _sbtAddress;
    }

    function issueSBT(address recipient, string memory tokenURI) internal {
        ISBT isbt = ISBT(sbtAddress);
        isbt.mintSBT(recipient, tokenURI);
    }

    function getTotalProposals() public view returns(uint) {
        return proposalIds.length;
    }
}