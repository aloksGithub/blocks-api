import { ethers } from "ethers";
import { Block, Chain } from "../types";
import { chains } from "../config/constants";
import prisma from "../config/database";

/**
 * Function to process and format the block data for storage in the database.
 * Calculates gas prices and other block details, then saves them to the DB.
 */
export const fetchBlockData = async (block: ethers.Block) => {
  const transactions = await Promise.all(block.transactions.map(txHash => block.provider.getTransaction(txHash)));

  // Initialize variables for gas price calculations
  let totalGasPrice = 0n;
  let maxGasPrice = 0n;
  let minGasPrice = ethers.MaxUint256;

  // Iterate through the transactions to calculate gas prices
  for (const tx of transactions) {
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

  return formattedBlockData
};

/**
 * Fetches blocks between the given startBlock and toBlock for a specific chain.
 * The blocks are fetched in parallel based on the numParallel setting in the chain configuration.
 * Block data is processed, formatted, and then stored in the database.
 *
 * @param {Chain} chain - The chain to fetch blocks from (e.g., Ethereum, Polygon).
 * @param {number} startBlock - The block number to start fetching from.
 * @param {number} toBlock - The block number to fetch up to (exclusive).
 */
const fetchAndStoreBlocks = async (
  chain: Chain,
  blocks: number[]
) => {
  // Loop through the blocks from startBlock to toBlock, fetching numParallel blocks at a time
  for (let i = 0; i < blocks.length; i += chain.numParallel) {
    // Create an array of block indices to fetch
    const blocksToFetch = blocks.slice(i, i+chain.numParallel);

    // Fetch blocks in parallel using Promise.all
    const fetchedBlockData = await Promise.all(
      blocksToFetch.map(
        async (blockIdx) => (await chain.provider.getBlock(blockIdx + i))!
      )
    );
    const formattedBlockData = await Promise.all(fetchedBlockData.map(block => fetchBlockData(block)))

    // Log the block number of the most recently fetched block
    console.log(
      `${chain.name} blocks at ${
        formattedBlockData[formattedBlockData.length - 1].number
      }`
    );

    // Store the formatted block data in the database
    await chain.model.createMany({
      data: formattedBlockData,
    });
  }
};

/**
 * Creates a block listener that will fetch and store data on every new block for the chain
 *
 * @param {Chain} chain - The chain to fetch blocks for (e.g., Ethereum, Polygon).
 */
const initListener = (chain: Chain) => {
  console.log(`Starting listener for ${chain.name}`)
  // Listen for new blocks
  chain.provider.on("block", async (blockNumber: number) => {
    console.log(`New block received: ${blockNumber} on ${chain.name}`);
    try {
      const blocksToFetch = [...Array(blockNumber - chain.lastUpdatedBlock).keys()].map(i => i + chain.lastUpdatedBlock + 1);
      chain.lastUpdatedBlock = blockNumber
      await fetchAndStoreBlocks(chain, blocksToFetch)
    } catch (error) {
      console.error(
        `Error processing block ${blockNumber} on ${chain.name}:`,
        error
      );
    }
  });
}

/**
 * Continuously fetches and stores block data until reaching the chain's latest block
 * After reaching the latest block, the block listener is initiated
 *
 * @param {Chain} chain - The chain to fetch blocks for (e.g., Ethereum, Polygon).
 */
const startChainUpdates = async (chain: Chain) => {
  while (true) {
    // Calculate which blocks need to be fetched
    const latestRecordedBlock: Block | null = await chain.model.findFirst({
      orderBy: { number: "desc" },
    });
    const latestRecordedBlockNumber = Math.max(latestRecordedBlock?.number || 0, chain.lastUpdatedBlock)
    const latestBlock = (await chain.provider.getBlock("latest"))!;
    const blocksToFetch = [...Array(latestBlock.number - latestRecordedBlockNumber).keys()].map(i => i + latestRecordedBlockNumber + 1);
    chain.lastUpdatedBlock = latestBlock.number

    // Fetch and store all blocks between the last recorded block and the latest block
    await fetchAndStoreBlocks(
      chain,
      blocksToFetch
    );

    // Start listeners if all historical blocks have been indexed
    if (blocksToFetch.length===0) {
      initListener(chain)
      break
    }
  }
};

/**
 * Starts the block fetching process for all configured chains.
 * Each chain's updates are handled in parallel.
 */
export function startBlockUpdates() {
  // Iterate over each chain defined in the configuration and start the block update process
  chains.forEach((chain) => {
    console.log(`Starting block fetcher for ${chain.name}...`);
    startChainUpdates(chain);
  });
}
