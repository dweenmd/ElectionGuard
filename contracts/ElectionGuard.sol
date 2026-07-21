// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title ElectionGuard - A secure, scalable Ethereum voting contract
/// @notice Features hidden vote counts until the election ends.
contract ElectionGuard {
    address public admin;
    enum ElectionState { NotStarted, Ongoing, Ended }
    ElectionState public state;
    string public electionName;

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        bytes32 nidHash; // keccak256(NID + salt)
    }

    mapping(uint256 => Candidate) private candidates;
    uint256 public candidatesCount;

    mapping(address => Voter) public voters;
    address[] public registeredVoterList;
    mapping(bytes32 => bool) public usedNidHashes;

    event CandidateAdded(uint256 id, string name, string party);
    event VoterRegistered(address indexed voter);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event ElectionStarted(string name);
    event ElectionEnded();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor(string memory _electionName) {
        admin = msg.sender;
        electionName = _electionName;
    }

    // ---------- Admin actions ----------

    function addCandidate(string calldata _name, string calldata _party) external onlyAdmin {
        require(state == ElectionState.NotStarted, "Cannot add candidates after election starts");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _party, 0);
        emit CandidateAdded(candidatesCount, _name, _party);
    }

    function registerVoter(address _voter, bytes32 _nidHash) external onlyAdmin {
        require(!voters[_voter].isRegistered, "Already registered");
        require(!usedNidHashes[_nidHash], "NID already registered");
        voters[_voter] = Voter(true, false, _nidHash);
        registeredVoterList.push(_voter);
        usedNidHashes[_nidHash] = true;
        emit VoterRegistered(_voter);
    }

    function startElection() external onlyAdmin {
        require(candidatesCount > 0, "Add at least one candidate first");
        require(state == ElectionState.NotStarted, "Already started");
        state = ElectionState.Ongoing;
        emit ElectionStarted(electionName);
    }

    function endElection() external onlyAdmin {
        require(state == ElectionState.Ongoing, "Election is not ongoing");
        state = ElectionState.Ended;
        emit ElectionEnded();
    }

    // ---------- Voter action ----------

    function vote(uint256 _candidateId) external {
        require(state == ElectionState.Ongoing, "Election is not ongoing");

        Voter storage sender = voters[msg.sender];
        require(sender.isRegistered, "You are not a registered voter");
        require(!sender.hasVoted, "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate id");

        sender.hasVoted = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    // ---------- Read-only helpers ----------

    function getCandidate(uint256 _id)
        external
        view
        returns (uint256 id, string memory name, string memory party, uint256 voteCount)
    {
        Candidate storage c = candidates[_id];
        // Hide vote counts unless election has ended
        uint256 visibleVotes = (state == ElectionState.Ended) ? c.voteCount : 0;
        return (c.id, c.name, c.party, visibleVotes);
    }

    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory list = new Candidate[](candidatesCount);
        for (uint256 i = 1; i <= candidatesCount; i++) {
            list[i - 1] = candidates[i];
            // Hide vote counts unless election has ended
            if (state != ElectionState.Ended) {
                list[i - 1].voteCount = 0;
            }
        }
        return list;
    }

    function totalRegisteredVoters() external view returns (uint256) {
        return registeredVoterList.length;
    }

    function totalVotesCast() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= candidatesCount; i++) {
            total += candidates[i].voteCount;
        }
        // Total votes cast could be hidden too, or left public.
        // Usually, the turnout is public even if individual candidate votes are hidden.
        return total;
    }
}
