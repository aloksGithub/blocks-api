import { ethers } from "ethers";

export interface Block {
  number: number;
  timestamp: number;
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas: bigint;
  averageGasPrice: bigint;
  maxGasPrice: bigint;
  minGasPrice: bigint;
}

export interface Chain {
  id: number;
  name: SupportedChain;
  provider: ethers.Provider;
  model: any;
  startingBlock: number;
  numParallel: number;
}[]

export type SupportedChain = "ethereum" | "polygon"