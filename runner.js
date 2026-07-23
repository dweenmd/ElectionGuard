const { spawn, exec } = require("child_process");
const path = require("path");

console.log("🚀 Starting ElectionGuard dApp...");

const isWindows = process.platform === "win32";

const hardhatBin = path.join(
    __dirname,
    "node_modules",
    ".bin",
    isWindows ? "hardhat.cmd" : "hardhat"
);

const npmCmd = isWindows ? "npm.cmd" : "npm";

let backend;
let frontend;
let hardhatNode;

function openBrowser(url) {
    if (isWindows) {
        exec(`start "" "${url}"`);
    } else if (process.platform === "darwin") {
        exec(`open "${url}"`);
    } else {
        exec(`xdg-open "${url}"`);
    }
}

console.log("⛓ Starting Hardhat Node...");

hardhatNode = spawn(hardhatBin, ["node"], {
    cwd: __dirname,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
});

let deployed = false;

hardhatNode.stdout.on("data", (data) => {
    const output = data.toString();
    process.stdout.write(output);

    if (
        output.includes("Started HTTP and WebSocket JSON-RPC server") &&
        !deployed
    ) {
        deployed = true;

        console.log("\n✅ Hardhat Node Started");
        console.log("📦 Deploying Smart Contract...\n");

        exec(
            `"${hardhatBin}" run scripts/deploy.js --network localhost`,
            {
                cwd: __dirname,
                shell: true,
            },
            (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr || err.message);
                    return;
                }

                console.log(stdout);

                console.log("✅ Contract Deployed");

                console.log("⚡ Starting Backend...");

                backend = spawn(npmCmd, ["run", "dev"], {
                    cwd: path.join(__dirname, "backend"),
                    shell: true,
                    stdio: "inherit",
                });

                console.log("🌐 Starting Frontend...");

                frontend = spawn(npmCmd, ["run", "dev"], {
                    cwd: path.join(__dirname, "frontend"),
                    shell: true,
                    stdio: "inherit",
                });

                console.log("\n🎉 ElectionGuard Started Successfully");
                console.log("Backend : http://localhost:5000");
                console.log("Frontend: http://localhost:3000");

                console.log("\n🌍 Opening Browser...");

                setTimeout(() => {
                    openBrowser("http://localhost:3000");
                }, 8000);
            }
        );
    }
});

hardhatNode.stderr.on("data", (data) => {
    process.stderr.write(data.toString());
});

process.on("SIGINT", () => {
    console.log("\n🛑 Stopping Services...");

    if (frontend) frontend.kill();
    if (backend) backend.kill();
    if (hardhatNode) hardhatNode.kill();

    process.exit();
});