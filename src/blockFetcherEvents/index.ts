import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { Chain, Block, SupportedChain } from "../types"; // Adjust the import path as needed
import { chains } from "../config/constants"; // Ensure this is correctly imported

const prisma = new PrismaClient();

/**
 * Function to process and format the block data for storage in the database.
 * Calculates gas prices and other block details, then saves them to the DB.
 */
const processBlock = async (block: ethers.Block, chainName: SupportedChain) => {
  const transactions = block.transactions;

  // Initialize variables for gas price calculations
  let totalGasPrice = 0n;
  let maxGasPrice = 0n;
  let minGasPrice = ethers.MaxUint256;

  // Iterate through the transactions to calculate gas prices
  for (const txHash of transactions) {
    const tx = await block.provider.getTransaction(txHash);
    if (!tx) continue;

    let gasPrice = 0n;

    if (tx.type === 0 || tx.type === 1) {
      // Legacy or EIP-2930 transaction
      gasPrice = tx.gasPrice ?? 0n;
    } else if (tx.type === 2) {
      // EIP-1559 transaction
      const baseFee = block.baseFeePerGas ?? 0n;
      const maxPriorityFeePerGas = tx.maxPriorityFeePerGas ?? 0n;
      const maxFeePerGas = tx.maxFeePerGas ?? 0n;

      gasPrice = baseFee + maxPriorityFeePerGas;
      if (gasPrice > maxFeePerGas) {
        gasPrice = maxFeePerGas;
      }
    }

    // Update min, max, and total gas prices
    minGasPrice = gasPrice < minGasPrice ? gasPrice : minGasPrice;
    maxGasPrice = gasPrice > maxGasPrice ? gasPrice : maxGasPrice;
    totalGasPrice += gasPrice;
  }

  // Calculate average gas price
  const averageGasPrice =
    transactions.length > 0 ? totalGasPrice / BigInt(transactions.length) : 0n;
  minGasPrice = minGasPrice === ethers.MaxUint256 ? 0n : minGasPrice;

  // Format block data
  const formattedBlockData: Block = {
    number: block.number,
    timestamp: block.timestamp,
    gasUsed: block.gasUsed.toString(),
    gasLimit: block.gasLimit.toString(),
    baseFeePerGas: block.baseFeePerGas ? block.baseFeePerGas.toString() : "0",
    averageGasPrice: averageGasPrice.toString(),
    maxGasPrice: maxGasPrice.toString(),
    minGasPrice: minGasPrice.toString(),
  };

  console.log(`Storing block ${block.number} for ${chainName}`);

  // Store block data in the database
  await (prisma as any)[`${chainName}Block`].create({
    data: formattedBlockData,
  });
};

/**
 * Function to set up the WebSocket connection and listen for new blocks on a chain.
 */
const startChainUpdates = (chain: Chain) => {
  const provider = chain.provider as ethers.WebSocketProvider;

  // Listen for new blocks
  provider.on("block", async (blockNumber: number) => {
    console.log(`New block received: ${blockNumber} on ${chain.name}`);
    try {
      // Fetch the block with transaction details
      const block = await provider.getBlock(blockNumber);
      if (block) {
        // Process and store the block data
        await processBlock(block, chain.name);
      }
    } catch (error) {
      console.error(
        `Error processing block ${blockNumber} on ${chain.name}:`,
        error
      );
    }
  });

  // You can log connection status events using the provider's event listeners, like when connecting
  provider.on("network", (newNetwork, oldNetwork) => {
    if (oldNetwork) {
      console.log(`Reconnected to ${chain.name}, new network:`, newNetwork);
    }
  });
};

/**
 * Function to start block updates for all configured chains.
 */
export function startBlockUpdates() {
  chains.forEach((chain) => {
    console.log(`Starting WebSocket listener for ${chain.name}`);
    startChainUpdates(chain);
  });
}

// Start the block updates when this module is imported
startBlockUpdates();
