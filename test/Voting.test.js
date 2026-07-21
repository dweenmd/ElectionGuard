const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let voting, admin, voter1, voter2, outsider;

  beforeEach(async function () {
    [admin, voter1, voter2, outsider] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy("Test Election");
    await voting.waitForDeployment();
  });

  it("sets the deployer as admin", async function () {
    expect(await voting.admin()).to.equal(admin.address);
  });

  it("lets admin add candidates before the election starts", async function () {
    await voting.addCandidate("Alice", "Party A");
    await voting.addCandidate("Bob", "Party B");
    expect(await voting.candidatesCount()).to.equal(2);
  });

  it("prevents non-admin from adding candidates", async function () {
    await expect(
      voting.connect(voter1).addCandidate("Eve", "Party E")
    ).to.be.revertedWith("Only admin can call this");
  });

  it("registers voters with a hashed NID", async function () {
    const nidHash = ethers.keccak256(ethers.toUtf8Bytes("1029384756-salt"));
    await voting.registerVoter(voter1.address, nidHash);
    const v = await voting.voters(voter1.address);
    expect(v.isRegistered).to.equal(true);
    expect(v.hasVoted).to.equal(false);
  });

  it("full flow: add candidates, register voters, start, vote, end", async function () {
    await voting.addCandidate("Alice", "Party A");
    await voting.addCandidate("Bob", "Party B");

    const hash1 = ethers.keccak256(ethers.toUtf8Bytes("nid1"));
    const hash2 = ethers.keccak256(ethers.toUtf8Bytes("nid2"));
    await voting.registerVoter(voter1.address, hash1);
    await voting.registerVoter(voter2.address, hash2);

    await voting.startElection();

    await voting.connect(voter1).vote(1);
    await voting.connect(voter2).vote(2);

    const c1 = await voting.getCandidate(1);
    const c2 = await voting.getCandidate(2);
    expect(c1.voteCount).to.equal(1);
    expect(c2.voteCount).to.equal(1);

    await expect(voting.connect(voter1).vote(2)).to.be.revertedWith(
      "You have already voted"
    );

    await expect(voting.connect(outsider).vote(1)).to.be.revertedWith(
      "You are not a registered voter"
    );

    await voting.endElection();
    await expect(voting.connect(voter2).vote(1)).to.be.revertedWith(
      "Election has ended"
    );
  });

  it("rejects voting before the election starts", async function () {
    await voting.addCandidate("Alice", "Party A");
    const hash1 = ethers.keccak256(ethers.toUtf8Bytes("nid1"));
    await voting.registerVoter(voter1.address, hash1);
    await expect(voting.connect(voter1).vote(1)).to.be.revertedWith(
      "Election has not started yet"
    );
  });
});
