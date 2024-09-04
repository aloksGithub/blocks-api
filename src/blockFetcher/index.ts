import { ethers } from "ethers"
import { Block, Chain } from "../types"
import { chains } from "../config/constants"

const fetchBlocksBetween = async (provider: ethers.Provider, startBlock: number, toBlock: number, numParallel: number) => {
  let blocks: Block[] = []
  for (let i = startBlock; i<toBlock; i+=numParallel) {
    const blocksToFetch = [...Array(numParallel).keys()]
    const fetchedBlockData = await Promise.all(blocksToFetch.map(async blockIdx => (await provider.getBlock(blockIdx + i))!))
    const formattedBlockData = await Promise.all(fetchedBlockData.map(async block => {
      const transactions = await Promise.all(block.transactions.map(async transaction => await provider.getTransaction(transaction)))
      let totalGasPrice = 0n
      let maxGasPrice = 0n
      let minGasPrice = ethers.MaxUint256
      for (const transaction of transactions) {
        if (!transaction) continue;
        if (transaction.type<2) {
          if (transaction.gasPrice<minGasPrice) {
            minGasPrice = transaction.gasPrice
          }
          if (transaction.gasPrice>maxGasPrice) {
            maxGasPrice = transaction.gasPrice
          }
          totalGasPrice+=transaction.gasPrice
        } else {
          if (!transaction.maxPriorityFeePerGas || !block.baseFeePerGas) {
            console.log(transaction.hash, block.number)
          }
          let gasPrice = transaction.maxPriorityFeePerGas! + block.baseFeePerGas!
          if (gasPrice>transaction.maxFeePerGas!) {
            gasPrice = transaction.maxFeePerGas!
          }
          if (gasPrice<minGasPrice) {
            minGasPrice = gasPrice
          }
          if (gasPrice>maxGasPrice) {
            maxGasPrice = gasPrice
          }
          totalGasPrice+=gasPrice
        }
      }
      const averageGasPrice = transactions.length>0 ? totalGasPrice / BigInt(transactions.length) : 0n
      minGasPrice = minGasPrice===ethers.MaxUint256?0n:minGasPrice
      return {
        number: block.number,
        timestamp: block.timestamp,
        gasUsed: block.gasUsed,
        gasLimit: block.gasLimit,
        baseFeePerGas: block.baseFeePerGas || 0n,
        averageGasPrice,
        maxGasPrice,
        minGasPrice
      }
    }))
    blocks = [...blocks, ...formattedBlockData]
  }
  return blocks
}

const fetchRecentBlocks = async (chain: Chain) => {
  const latestRecordedBlock: Block | null = await chain.model.findFirst({
    orderBy: { number: 'desc' }
  });

  const latestBlock = (await chain.provider.getBlock("latest"))!
  const newBlocks = await fetchBlocksBetween(chain.provider, latestRecordedBlock?.number || chain.startingBlock, latestBlock.number, chain.numParallel)
  chain.model.createMany({
    data: newBlocks
  })
  console.log(`${chain.name} blocks at ${newBlocks[newBlocks.length-1]}`)
}

export function startBlockUpdates() {
  chains.forEach(chain => {
    console.log(`Starting block fetcher for ${chain.name}...`)
    setInterval(() => fetchRecentBlocks(chain), 10000);
  });
}