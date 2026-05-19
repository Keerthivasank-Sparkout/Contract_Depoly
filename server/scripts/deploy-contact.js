import { network } from "hardhat";

const { viem, networkName } = await network.create();

console.log(`Deploying MyContact to ${networkName}...`);

const [walletClient] = await viem.getWalletClients();

const contact = await viem.deployContract("MyContact", ["Hello, World!", ""],
  {
    client: {
      wallet: walletClient,
    },
    gas: 3000000n,
  }
);

console.log("MyContact address:", contact.address);

console.log("Deployment successful.");
