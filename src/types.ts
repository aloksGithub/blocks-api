import { ethers } from "ethers";

export interface Block {
  number: number;
  timestamp: number;
  gasUsed: string;
  gasLimit: string;
  baseFeePerGas: string;
  averageGasPrice: string;
  maxGasPrice: string;
  minGasPrice: string;
}

export interface Chain {
  id: number;
  name: SupportedChain;
  provider: ethers.Provider;
  model: any;
  lastUpdatedBlock: number;
  numParallel: number;
}
[];

export type SupportedChain = "ethereum" | "polygon";
