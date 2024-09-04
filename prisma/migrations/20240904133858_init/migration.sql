/*
  Warnings:

  - You are about to alter the column `gasUsed` on the `ethereum_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `gasLimit` on the `ethereum_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `baseFeePerGas` on the `ethereum_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `averageGasPrice` on the `ethereum_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `maxGasPrice` on the `ethereum_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `minGasPrice` on the `ethereum_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `gasUsed` on the `polygon_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `gasLimit` on the `polygon_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `baseFeePerGas` on the `polygon_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `averageGasPrice` on the `polygon_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `maxGasPrice` on the `polygon_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `minGasPrice` on the `polygon_blocks` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "ethereum_blocks" ALTER COLUMN "gasUsed" SET DATA TYPE INTEGER,
ALTER COLUMN "gasLimit" SET DATA TYPE INTEGER,
ALTER COLUMN "baseFeePerGas" SET DATA TYPE INTEGER,
ALTER COLUMN "averageGasPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "maxGasPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "minGasPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "polygon_blocks" ALTER COLUMN "gasUsed" SET DATA TYPE INTEGER,
ALTER COLUMN "gasLimit" SET DATA TYPE INTEGER,
ALTER COLUMN "baseFeePerGas" SET DATA TYPE INTEGER,
ALTER COLUMN "averageGasPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "maxGasPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "minGasPrice" SET DATA TYPE INTEGER;
