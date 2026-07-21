"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import toast from 'react-hot-toast';

// You will need to replace this with your deployed ElectionGuard address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Local hardhat default first deploy
const CONTRACT_ABI = [
  "function state() view returns (uint8)",
  "function electionName() view returns (string)",
  "function getCandidate(uint256) view returns (uint256, string, string, uint256)",
  "function getAllCandidates() view returns (tuple(uint256 id, string name, string party, uint256 voteCount)[])",
  "function totalRegisteredVoters() view returns (uint256)",
  "function totalVotesCast() view returns (uint256)",
  "function vote(uint256) returns ()",
  "function addCandidate(string, string) returns ()",
  "function registerVoter(address, bytes32) returns ()",
  "function startElection() returns ()",
  "function endElection() returns ()"
];

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: Contract | null;
  address: string | null;
  connectWallet: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  address: null,
  connectWallet: async () => {},
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const initEthers = async (accounts: string[]) => {
    if (window.ethereum) {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);
      
      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);
      setAddress(accounts[0]);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) initEthers(accounts);
      });

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          initEthers(accounts);
        } else {
          setAddress(null);
          setSigner(null);
          setContract(null);
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        await initEthers(accounts);
        toast.success("Wallet connected successfully!");
      } catch (error: any) {
        console.error("Wallet connection failed", error);
        toast.error("Failed to connect wallet: " + (error.message || "Unknown error"));
      }
    } else {
      toast.error("MetaMask is not installed. Please install it to continue.", {
        duration: 5000,
        icon: '🦊',
      });
    }
  };

  return (
    <Web3Context.Provider value={{ provider, signer, contract, address, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);
