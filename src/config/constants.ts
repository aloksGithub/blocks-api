import { ethers } from "ethers";
import { Chain } from "../types";
import prisma from "./database";
require("dotenv").config();

export const chains: Chain[] = [
  {
    id: 1,
    name: "ethereum",
    provider: new ethers.WebSocketProvider(
      process.env.ETHEREUM_WSS ||
        //alchemy wss endpoint with api key from .env file
        "wss://eth-mainnet.ws.alchemyapi.io/v2/" + process.env.ALCHEMY_KEY
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
        "wss://polygon-mainnet.g.alchemy.com/v2/" + process.env.ALCHEMY_KEY
    ),
    model: prisma.polygonBlock,
    startingBlock: 61410051,
    numParallel: 10,
  },
];
