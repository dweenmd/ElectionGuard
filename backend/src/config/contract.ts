import { ethers } from "ethers";

// Hardhat local node RPC
const RPC_URL = process.env["RPC_URL"] || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env["CONTRACT_ADDRESS"] || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Full ABI matching ElectionGuard.sol
const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function state() view returns (uint8)",
  "function electionName() view returns (string)",
  "function candidatesCount() view returns (uint256)",
  "function addCandidate(string, string) returns ()",
  "function registerVoter(address, bytes32) returns ()",
  "function startElection() returns ()",
  "function endElection() returns ()",
  "function vote(uint256) returns ()",
  "function getCandidate(uint256) view returns (uint256, string, string, uint256)",
  "function getAllCandidates() view returns (tuple(uint256 id, string name, string party, uint256 voteCount)[])",
  "function totalRegisteredVoters() view returns (uint256)",
  "function totalVotesCast() view returns (uint256)",
  "function voters(address) view returns (bool isRegistered, bool hasVoted, bytes32 nidHash)",
  "event CandidateAdded(uint256 id, string name, string party)",
  "event VoterRegistered(address indexed voter)",
  "event VoteCast(address indexed voter, uint256 indexed candidateId)",
  "event ElectionStarted(string name)",
  "event ElectionEnded()",
];

export const provider = new ethers.JsonRpcProvider(RPC_URL);

// Hardhat account #0 is the deployer/admin
export const adminSigner = new ethers.Wallet(
  // Hardhat default account #0 private key
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);

export const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, adminSigner);

// Read-only contract instance (no signer needed)
export const contractReadOnly = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

export const ELECTION_STATES = ["NotStarted", "Ongoing", "Ended"] as const;
export type ElectionStateName = (typeof ELECTION_STATES)[number];

export function getElectionStateName(stateIndex: number): ElectionStateName {
  return ELECTION_STATES[stateIndex] ?? "NotStarted";
}
