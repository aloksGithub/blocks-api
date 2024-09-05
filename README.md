# Blocks API

Blocks API is a Node.js-based backend service that uses WebSocket connections to listen for new blocks on multiple blockchain networks (e.g., Ethereum, Polygon) and stores relevant block data, including gas prices and transaction details, into a PostgreSQL database. This project is designed to work across multiple environments (development, staging, and production), each with its own database.

## TODO

Better endpoints for quering
README
Revise the data fetching logic (wss rpc, listen to events for new blocks)
Look at digital ocean for hosting
