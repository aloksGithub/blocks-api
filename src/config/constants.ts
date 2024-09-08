import { ethers } from "ethers";
import { Chain } from "../types";
import prisma from "./database";
require("dotenv").config();

export const chains: Chain[] = [
  {
    id: 1,
    name: "ethereum",
    provider: new ethers.JsonRpcProvider(
      process.env.ETHEREUM_WSS || "https://rpc.ankr.com/eth"
    ),
    model: prisma.ethereumBlock,
    lastUpdatedBlock: 20670933,
    numParallel: 10,
  },
  {
    id: 137,
    name: "polygon",
    provider: new ethers.JsonRpcProvider(
      process.env.POLYGON_WSS || "https://rpc.ankr.com/polygon"
    ),
    model: prisma.polygonBlock,
    lastUpdatedBlock: 61410051,
    numParallel: 10,
  },
];
