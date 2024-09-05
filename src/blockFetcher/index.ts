import { ethers } from "ethers";
import { Block, Chain } from "../types";
import { chains } from "../config/constants";

/**
 * Fetches blocks between the given startBlock and toBlock for a specific chain.
 * The blocks are fetched in parallel based on the numParallel setting in the chain configuration.
 * Block data is processed, formatted, and then stored in the database.
 *
 * @param {Chain} chain - The chain to fetch blocks from (e.g., Ethereum, Polygon).
 * @param {number} startBlock - The block number to start fetching from.
 * @param {number} toBlock - The block number to fetch up to (exclusive).
 */
const fetchBlocksBetween = async (
  chain: Chain,
  startBlock: number,
  toBlock: number
) => {
  // Loop through the blocks from startBlock to toBlock, fetching numParallel blocks at a time
  for (let i = startBlock; i < toBlock; i += chain.numParallel) {
    // Create an array of block indices to fetch
    const blocksToFetch = [...Array(chain.numParallel).keys()];

    // Fetch blocks in parallel using Promise.all
    const fetchedBlockData = await Promise.all(
      blocksToFetch.map(
        async (blockIdx) => (await chain.provider.getBlock(blockIdx + i))!
      )
    );

    // Format each block's data (including transactions) before storing it
    const formattedBlockData: Block[] = await Promise.all(
      fetchedBlockData.map(async (block) => {
        const transactions: ethers.TransactionResponse[] = [];

        // Fetch transaction details for each transaction in the block
        for (const transaction of block.transactions) {
          const txnResponse = await chain.provider.getTransaction(transaction);
          txnResponse ? transactions.push(txnResponse) : {};
        }

        // Initialize variables for gas price calculations
        let totalGasPrice = 0n;
        let maxGasPrice = 0n;
        let minGasPrice = ethers.MaxUint256;

        // Iterate through the transactions and calculate min, max, and average gas prices
        for (const transaction of transactions) {
          if (!transaction) continue;

          if (transaction.type < 2) {
            // Pre-EIP-1559 transaction
            if (transaction.gasPrice < minGasPrice) {
              minGasPrice = transaction.gasPrice;
            }
            if (transaction.gasPrice > maxGasPrice) {
              maxGasPrice = transaction.gasPrice;
            }
            totalGasPrice += transaction.gasPrice;
          } else {
            // Post-EIP-1559 transaction
            let gasPrice =
              transaction.maxPriorityFeePerGas! + block.baseFeePerGas!;
            if (gasPrice > transaction.maxFeePerGas!) {
              gasPrice = transaction.maxFeePerGas!;
            }
            if (gasPrice < minGasPrice) {
              minGasPrice = gasPrice;
            }
            if (gasPrice > maxGasPrice) {
              maxGasPrice = gasPrice;
            }
            totalGasPrice += gasPrice;
          }
        }

        // Calculate average gas price for the block
        const averageGasPrice =
          transactions.length > 0
            ? totalGasPrice / BigInt(transactions.length)
            : 0n;
        minGasPrice = minGasPrice === ethers.MaxUint256 ? 0n : minGasPrice;

        // Return the formatted block data object
        return {
          number: block.number,
          timestamp: block.timestamp,
          gasUsed: block.gasUsed.toString(),
          gasLimit: block.gasLimit.toString(),
          baseFeePerGas: (block.baseFeePerGas || 0n).toString(),
          averageGasPrice: averageGasPrice.toString(),
          maxGasPrice: maxGasPrice.toString(),
          minGasPrice: minGasPrice.toString(),
        };
      })
    );

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
 * Simple delay function to pause execution for a specified number of milliseconds.
 * Used to introduce a delay between block fetches.
 *
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Continuously fetches and updates blocks for a specific chain.
 * Finds the latest block stored in the database and fetches any new blocks since then.
 * Introduces a delay between fetch cycles to prevent overloading the provider.
 *
 * @param {Chain} chain - The chain to fetch blocks for (e.g., Ethereum, Polygon).
 */
const startChainUpdates = async (chain: Chain) => {
  while (true) {
    // Fetch the most recent block recorded in the database
    const latestRecordedBlock: Block | null = await chain.model.findFirst({
      orderBy: { number: "desc" },
    });

    // Fetch the latest block number from the blockchain
    const latestBlock = (await chain.provider.getBlock("latest"))!;

    // Fetch and store all blocks between the last recorded block and the latest block
    await fetchBlocksBetween(
      chain,
      latestRecordedBlock?.number || chain.startingBlock,
      latestBlock.number
    );

    // Wait for 10 seconds before fetching the next set of blocks
    await delay(10000);
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
