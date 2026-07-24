// ============================================================
// ElectionGuard dApp — one-command startup script
// ============================================================
// Ei script ekta full stack (Postgres DB + Hardhat blockchain +
// backend + frontend) ek shathe start kore. Order ta important:
//   1. Postgres (DB na uthle backend crash korbe)
//   2. Hardhat local blockchain node
//   3. Smart contract deploy (hardhat node upar depend kore)
//   4. Backend (DB + deployed contract, duitai lagbe)
//   5. Frontend (backend upar depend kore)
// ============================================================

const { spawn, exec } = require("child_process");
const path = require("path");

console.log("🚀 Starting ElectionGuard dApp...");

// Windows e .cmd extension lage, Mac/Linux e lage na — tai OS check kore
// sothik binary path/command name select kortesi.
const isWindows = process.platform === "win32";

// Hardhat CLI-r local (project-er ভিতরের node_modules/.bin) binary path.
// Globally install kora hardhat use na kore, project-er nijer version
// use korার jonno eভাবে full path banano hoise.
const hardhatBin = path.join(
    __dirname,
    "node_modules",
    ".bin",
    isWindows ? "hardhat.cmd" : "hardhat"
);

const npmCmd = isWindows ? "npm.cmd" : "npm";
const dockerCmd = isWindows ? "docker.exe" : "docker";

// Ei 3ta variable e child process gulor reference rakha hocche, jate
// SIGINT (Ctrl+C) er somoy shobgulo properly kill kora jay.
let backend;
let frontend;
let hardhatNode;

// Shob kichu start howar por browser e frontend auto-open korার helper.
function openBrowser(url) {
    if (isWindows) {
        exec(`start "" "${url}"`);
    } else if (process.platform === "darwin") {
        exec(`open "${url}"`);
    } else {
        exec(`xdg-open "${url}"`);
    }
}

// exec() ke Promise-based banano hoise, jate async/await diye
// sequentially command run kora jay (e.g. "docker compose up" shesh
// na howa porjonto porer step start na hoy).
function run(cmd, args, opts) {
    return new Promise((resolve, reject) => {
        exec([cmd, ...args].join(" "), opts, (err, stdout, stderr) => {
            if (err) reject({ err, stdout, stderr });
            else resolve({ stdout, stderr });
        });
    });
}

// Postgres container "up" hoye gele-o, database service actually
// connection nite ready hote koyek second lagte pare. Tai "docker
// compose up -d" er por sathe sathe backend start na kore, ekhane
// `pg_isready` diye protি second check kora hocche — jotokkhon na DB
// shotti-i ready, totokkhon wait kora hocche (max 20 bar, mane ~20 sec).
function waitForPostgres(maxTries = 20) {
    return new Promise((resolve, reject) => {
        let tries = 0;
        const check = () => {
            tries++;
            exec(
                `${dockerCmd} exec electionguard-db pg_isready -U electionguard`,
                (err) => {
                    if (!err) {
                        // pg_isready exit code 0 = DB ready
                        resolve();
                    } else if (tries >= maxTries) {
                        reject(new Error("Postgres did not become ready in time"));
                    } else {
                        // 1 second wait kore abar check
                        setTimeout(check, 1000);
                    }
                }
            );
        };
        check();
    });
}

// Step 1: Docker diye Postgres container start + ready hওয়া porjonto wait.
// "docker compose up -d" ta backend/ folder er docker-compose.yml file
// use kore container chalay ("-d" mane detached/background mode).
async function startPostgres() {
    console.log("🐘 Starting PostgreSQL (Docker)...");
    try {
        await run(dockerCmd, ["compose", "up", "-d"], {
            cwd: path.join(__dirname, "backend"), // docker-compose.yml ekhane ache
            shell: true,
        });
        console.log("⏳ Waiting for PostgreSQL to be ready...");
        await waitForPostgres();
        console.log("✅ PostgreSQL is ready");
    } catch (e) {
        // Docker Desktop chalu na thakle "docker compose up" fail korbe —
        // eikhane clear error diye pura script bondho kore ditesi, jate
        // backend porey confusing "DB connection failed" error na dey.
        console.error("❌ Could not start PostgreSQL. Is Docker Desktop running?");
        console.error(e.stderr || e.message || e);
        process.exit(1);
    }
}

async function main() {
    // Shob kichur age DB ready thaka lagbe.
    await startPostgres();

    console.log("⛓ Starting Hardhat Node...");

    // Local blockchain node start kortesi. stdio "pipe" use kora hocche
    // (inherit na) karon amader nicher output check korte hobe (kokhon
    // node fully ready hoise seta jante), shudhu terminal e dekhale hoto na.
    hardhatNode = spawn(hardhatBin, ["node"], {
        cwd: __dirname,
        shell: true,
        stdio: ["ignore", "pipe", "pipe"], // [stdin, stdout, stderr]
    });

    // Contract deploy shudhu ekbar-i korte chai, tai flag diye guard kora.
    let deployed = false;

    hardhatNode.stdout.on("data", (data) => {
        const output = data.toString();
        process.stdout.write(output); // hardhat er nijer log o dekhabo

        // Hardhat node fully start hole ei specific line ta print hoy —
        // eta dekhle bujhbo ekhon contract deploy kora jabe.
        if (
            output.includes("Started HTTP and WebSocket JSON-RPC server") &&
            !deployed
        ) {
            deployed = true;

            console.log("\n✅ Hardhat Node Started");
            console.log("📦 Deploying Smart Contract...\n");

            // Step 3: Smart contract deploy — ekbar mattro, hardhat node
            // upar run kore. Deploy shesh hole callback e backend/frontend
            // start kora hocche.
            exec(
                `"${hardhatBin}" run scripts/deploy.js --network localhost`,
                {
                    cwd: __dirname,
                    shell: true,
                },
                (err, stdout, stderr) => {
                    if (err) {
                        console.error(stderr || err.message);
                        return; // deploy fail korle backend/frontend start korbo na
                    }

                    console.log(stdout);
                    console.log("✅ Contract Deployed");

                    // Step 4: Backend start — Postgres + deployed contract
                    // duitai already ready ache ekhon.
                    console.log("⚡ Starting Backend...");
                    backend = spawn(npmCmd, ["run", "dev"], {
                        cwd: path.join(__dirname, "backend"),
                        shell: true,
                        stdio: "inherit", // backend er log terminal e directly dekhabo
                    });

                    // Step 5: Frontend start.
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

                    // Frontend (Next.js) fully compile+ready hote kichuta
                    // somoy lage, tai 8 second wait kore tারপর browser open.
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
}

main();

// Ctrl+C dile shob child process (frontend, backend, hardhat node) properly
// kill korার jonno. Note: Postgres docker container ekhane kill kora hoy na
// ইচ্ছাকৃতভাবে — pরের বার আবার "docker compose up -d" dile eta already-running
// container ke reuse korবে, notun kore start howar wait korte hobe na.
process.on("SIGINT", () => {
    console.log("\n🛑 Stopping Services...");

    if (frontend) frontend.kill();
    if (backend) backend.kill();
    if (hardhatNode) hardhatNode.kill();

    process.exit();
});