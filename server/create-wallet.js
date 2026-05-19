import { Wallet } from "ethers";

async function createWallet() {

// Create random wallet
const wallet = Wallet.createRandom();

console.log("Address:");
console.log(wallet.address);

console.log("\nPrivate Key:");
console.log(wallet.privateKey);

console.log("\nMnemonic Phrase:");
console.log(wallet.mnemonic.phrase);
}

createWallet();
