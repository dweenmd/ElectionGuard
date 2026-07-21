const { spawn, execSync } = require('child_process');

console.log("🚀 Starting GonoVote dApp...");

// 1. Start hardhat node
const npxCmd = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
const node = spawn(npxCmd, ['hardhat', 'node'], { stdio: 'pipe' });

let deployed = false;

node.stdout.on('data', (data) => {
    const output = data.toString();
    // Print the node output if needed, but keeping it silent for cleaner logs
    // console.log(`[Local Node]: ${output.trim()}`);
    
    // 2. When node is ready, deploy contract
    if (output.includes('Started HTTP and WebSocket JSON-RPC server') && !deployed) {
        deployed = true;
        console.log("✅ Local Hardhat Node is running.");
        console.log("⏳ Deploying smart contracts...");
        
        try {
            const deployOut = execSync(`${npxCmd} hardhat run scripts/deploy.js --network localhost`, { encoding: 'utf-8' });
            console.log(deployOut);
            console.log("✅ Deployment complete.");
            
            // 3. Start frontend server
            console.log("🌐 Starting frontend server...");
            const server = spawn(npxCmd, ['http-server', 'frontend', '-p', '8080', '-c-1'], { stdio: 'inherit' });
            
            console.log("🎉 All set! Open your browser at http://localhost:8080");
            
        } catch (error) {
            console.error("❌ Deployment failed:");
            console.error(error.stdout || error.message);
        }
    }
});

node.stderr.on('data', (data) => {
    console.error(`[Node Error]: ${data}`);
});

// Clean up on exit
process.on('SIGINT', () => {
    console.log("Shutting down...");
    node.kill();
    process.exit();
});
