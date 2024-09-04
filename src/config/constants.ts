import { ethers } from "ethers";
import { Chain } from "../types";
import prisma from "./database";

export const chains: Chain[] = [
  {
    id: 1,
    name: "ethereum",
    provider: new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC || "https://rpc.ankr.com/eth"
    ),
    model: prisma.ethereumBlock,
    startingBlock: 20670933,
    numParallel: 10,
  },
  {
    id: 137,
    name: "polygon",
    provider: new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC || "https://rpc.ankr.com/polygon"
    ),
    model: prisma.polygonBlock,
    startingBlock: 61410051,
    numParallel: 10,
  },
];