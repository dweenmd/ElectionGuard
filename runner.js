const { spawn, exec } = require('child_process');
const path = require('path');

console.log("🚀 Starting GonoVote dApp...");

const hardhatBin = path.join(__dirname, 'node_modules', '.bin', /^win/.test(process.platform) ? 'hardhat.cmd' : 'hardhat');
const npmCmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

// 1. Start hardhat node
const node = spawn(hardhatBin, ['node'], { stdio: 'pipe', shell: true });

let deployed = false;

node.stdout.on('data', (data) => {
    const output = data.toString();
    
    // 2. When node is ready, deploy contract
    if (output.includes('Started HTTP and WebSocket JSON-RPC server') && !deployed) {
        deployed = true;
        console.log("✅ Local Hardhat Node is running.");
        console.log("⏳ Deploying smart contracts...");
        
        exec(`"${hardhatBin}" run scripts/deploy.js --network localhost`, { shell: true }, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Deployment failed:");
                console.error(stderr || error.message);
                return;
            }
            console.log(stdout);
            console.log("✅ Deployment complete.");
            
            // 3. Start frontend server
            console.log("🌐 Starting frontend Next.js dev server...");
            const server = spawn(npmCmd, ['run', 'dev'], { cwd: './frontend', stdio: 'inherit', shell: true });
            
            console.log("🎉 Frontend starting! Access it at http://localhost:3000");
        });
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
