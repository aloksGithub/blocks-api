-- CreateTable
CREATE TABLE "ethereum_blocks" (
    "number" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "gasUsed" BIGINT NOT NULL,
    "gasLimit" BIGINT NOT NULL,
    "baseFeePerGas" BIGINT NOT NULL,
    "averageGasPrice" BIGINT NOT NULL,
    "maxGasPrice" BIGINT NOT NULL,
    "minGasPrice" BIGINT NOT NULL,

    CONSTRAINT "ethereum_blocks_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "polygon_blocks" (
    "number" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "gasUsed" BIGINT NOT NULL,
    "gasLimit" BIGINT NOT NULL,
    "baseFeePerGas" BIGINT NOT NULL,
    "averageGasPrice" BIGINT NOT NULL,
    "maxGasPrice" BIGINT NOT NULL,
    "minGasPrice" BIGINT NOT NULL,

    CONSTRAINT "polygon_blocks_pkey" PRIMARY KEY ("number")
);

-- CreateIndex
CREATE INDEX "ethereum_blocks_timestamp_idx" ON "ethereum_blocks"("timestamp");

-- CreateIndex
CREATE INDEX "polygon_blocks_timestamp_idx" ON "polygon_blocks"("timestamp");
