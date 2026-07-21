const hre = require("hardhat");

async function main() {
  const electionName = "GonoVote Final Year Demo Election 2026";

  const ElectionGuard = await hre.ethers.getContractFactory("ElectionGuard");
  const electionGuard = await ElectionGuard.deploy(electionName);
  await electionGuard.waitForDeployment();

  const address = await electionGuard.getAddress();
  console.log("=================================================");
  console.log(" ElectionGuard contract deployed!");
  console.log(" Election:", electionName);
  console.log(" Address :", address);
  console.log("=================================================");
  console.log(" Copy this address into frontend/config.js");

  // Optional: seed a couple of demo candidates automatically.
  // Comment this out if you want to add candidates manually from the frontend.
  const tx1 = await electionGuard.addCandidate("Green Wave Party", "GWP");
  await tx1.wait();
  const tx2 = await electionGuard.addCandidate("Sunrise Alliance", "SRA");
  await tx2.wait();
  const tx3 = await electionGuard.addCandidate("River Forum", "RF");
  await tx3.wait();
  console.log(" Seeded 3 demo candidates.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
