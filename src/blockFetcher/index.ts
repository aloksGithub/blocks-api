import { ethers } from "ethers"
import { Block, Chain } from "../types"
import { chains } from "../config/constants"

const fetchBlocksBetween = async (chain: Chain, startBlock: number, toBlock: number) => {
  for (let i = startBlock; i<toBlock; i+=chain.numParallel) {
    const blocksToFetch = [...Array(chain.numParallel).keys()]
    const fetchedBlockData = await Promise.all(blocksToFetch.map(async blockIdx => (await chain.provider.getBlock(blockIdx + i))!))
    const formattedBlockData: Block[] = await Promise.all(fetchedBlockData.map(async block => {
      const transactions: ethers.TransactionResponse[] = []
      for (const transaction of block.transactions) {
        const txnResponse = await chain.provider.getTransaction(transaction)
        txnResponse?transactions.push(txnResponse):{}
      }
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
        gasUsed: (block.gasUsed).toString(),
        gasLimit: (block.gasLimit).toString(),
        baseFeePerGas: (block.baseFeePerGas || 0n).toString(),
        averageGasPrice: (averageGasPrice).toString(),
        maxGasPrice: (maxGasPrice).toString(),
        minGasPrice: (minGasPrice.toString())
      }
    }))
    console.log(`${chain.name} blocks at ${formattedBlockData[formattedBlockData.length-1].number}`)
    await chain.model.createMany({
      data: formattedBlockData
    })
  }
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const startChainUpdates = async (chain: Chain) => {
  while (true) {
    const latestRecordedBlock: Block | null = await chain.model.findFirst({
      orderBy: { number: 'desc' }
    });
  
    const latestBlock = (await chain.provider.getBlock("latest"))!
    await fetchBlocksBetween(chain, latestRecordedBlock?.number || chain.startingBlock, latestBlock.number)
    await delay(10000)
  }
}

export function startBlockUpdates() {
  chains.forEach(chain => {
    console.log(`Starting block fetcher for ${chain.name}...`)
    startChainUpdates(chain)
  });
}