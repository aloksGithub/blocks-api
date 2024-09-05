import { ethers } from "ethers";
import { Chain } from "../types";
import prisma from "./database";

export const chains: Chain[] = [
  {
    id: 1,
    name: "ethereum",
    provider: new ethers.WebSocketProvider(
      process.env.ETHEREUM_WSS ||
        "wss://eth-mainnet.g.alchemy.com/v2/tdlRFhX6HRYC-q7paO9WNc3NpIIRetC3" // Use Infura or another provider for WebSocket
    ),
    model: prisma.ethereumBlock,
    startingBlock: 20670933,
    numParallel: 10,
  },
  {
    id: 137,
    name: "polygon",
    provider: new ethers.WebSocketProvider(
      process.env.POLYGON_WSS ||
        "wss://polygon-mainnet.g.alchemy.com/v2/tdlRFhX6HRYC-q7paO9WNc3NpIIRetC3" // Public Polygon WebSocket endpoint
    ),
    model: prisma.polygonBlock,
    startingBlock: 61410051,
    numParallel: 10,
  },
];
