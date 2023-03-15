const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAO Smart Contract Tests", function () {
  this.beforeEach(async function () {
    [account1, account2, account3, account4] = await ethers.getSigners();
    const Membership = await ethers.getContractFactory("Membership");
    membership = await Membership.connect(account1).deploy();

    const DAO = await ethers.getContractFactory("SoulDAO");
    dao = await DAO.connect(account1).deploy(membership.address);

    const SBT = await ethers.getContractFactory("SBT");
    sbt = await SBT.connect(account1).deploy(dao.address);

    dao.connect(account1).setSBTAddress(sbt.address);

    await membership.connect(account2).mint(1);
    dao.connect(account2).joinDao();
    await membership.connect(account4).mint(1);
  });

  it("Non Master setting the sbt address", async function () {
    await expect(
      dao.connect(account2).setSBTAddress(sbt.address)
    ).to.be.revertedWith("Only Masters can edit sbt address");
  });

  it("Only token holders can join DAO", async function () {
    await expect(
        dao.connect(account3).joinDao()
      ).to.be.revertedWith("You must have the required ERC1155 token to join the DAO");
  });

  it("Create Proposal for promoting", async function () {
    await dao.connect(account1).createProposal(account2.address, 1, "");
    const type = await dao.proposals(0x00);

    expect(type.typ).to.equal(1);
  });

  it("Create and Vote on proposals", async function(){
    await dao.connect(account1).createProposal(account2.address, 1, "");
    const type = await dao.proposals(0x00);
    expect(type.yesVotes).to.equal(1);
  })

  it("Create and Vote on proposals and execute promotions", async function(){
    dao.connect(account4).joinDao();

    await dao.connect(account1).createProposal(account2.address, 1, "");
    await dao.connect(account4).voteForProposal(0x00, 1);

    const type = await dao.proposals(0x00);
    expect(type.yesVotes).to.equal(2);
    expect(type.isExecuted).to.equal(true);
    expect(await dao.members(account2.address)).to.equal(1);
  });

  it("Create and Vote on proposals and execute Issue", async function(){
    dao.connect(account4).joinDao();

    await dao.connect(account1).createProposal(account2.address, 0, "https://bafkreihu7s2xmkibjwin7ucp4hrxs7k55bkzljq5t7xg5nychrze75bqxy.ipfs.nftstorage.link/");
    await dao.connect(account4).voteForProposal(0x00, 1);

    const type = await dao.proposals(0x00);
    expect(type.yesVotes).to.equal(2);
    expect(type.isExecuted).to.equal(true);
    expect(await sbt.tokenHolders(0x00)).to.equal(account2.address);
  });
});
