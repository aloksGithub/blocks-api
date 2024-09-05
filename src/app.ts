import express from "express";
import blockRoutes from "./routes/blocks";
import { startBlockUpdates } from "./blockFetcherEvents";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/blocks", blockRoutes);

startBlockUpdates();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
