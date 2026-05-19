import express from "express";
import dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactPath = path.join(
  __dirname,
  "../artifacts/contracts/Contacts.sol/MyContact.json"
);
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const {
  PORT = 3000,
  CLIENT_URL,
  HOODI_RPC_URL,
  HOODI_PRIVATE_KEY,
  CONTRACT_ADDRESS,
} = process.env;
// Validate required environment variables
if (!HOODI_RPC_URL || !HOODI_PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("Missing required environment variables");
  process.exit(1);
}

if (!Number.isInteger(Number(PORT))) {
  console.error("PORT must be a number, for example: PORT=3000");
  process.exit(1);
}

if (!ethers.isAddress(CONTRACT_ADDRESS)) {
  console.error("CONTRACT_ADDRESS must be a deployed contract address like 0x...");
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", CLIENT_URL);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Blockchain setup
const provider = new ethers.JsonRpcProvider(HOODI_RPC_URL);

const signer = new ethers.Wallet(
  HOODI_PRIVATE_KEY,
  provider
);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  artifact.abi,
  signer
);

// Get user details
app.get("/api/user-details", async (_, res) => {
  try {
    const [name, mobile] =
      await contract.getUserDetails();

    res.json({
      success: true,
      data: {
        name,
        mobile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch user details",
      error: error.message,
    });
  }
});

// Save user details
app.post("/api/user-details", async (req, res) => {
  try {
    const { name, mobile, walletAddress } = req.body;

    if (!name || !mobile || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile, and wallet address are required",
      });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    const tx = await contract.setUserDetails(
      name,
      mobile
    );

    await tx.wait();

    res.json({
      success: true,
      message: "Details saved successfully",
      transactionHash: tx.hash,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to save details",
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
