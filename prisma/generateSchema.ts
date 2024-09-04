import fs from 'fs';
import { execSync } from 'child_process';
import { chains } from '../src/config/constants';
import { Chain } from '../src/types';

function generatePrismaSchema(chains: Chain[]): string {
let schema = `
generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url      = env("DATABASE_URL")
}
`;

chains.forEach(chain => {
const chainName = chain.name[0].toUpperCase() + chain.name.slice(1)
const modelName = `${chainName}Block`;
const tableName = `${chain.name.toLowerCase()}_blocks`;

schema += `
model ${modelName} {
  number          Int      @id
  timestamp       Int
  gasUsed         String
  gasLimit        String
  baseFeePerGas   String
  averageGasPrice String
  maxGasPrice     String
  minGasPrice     String

  @@index([timestamp])
  @@map("${tableName}")
}
`;
});

return schema;
}

function writeSchemaToFile(schema: string): void {
  fs.writeFileSync('./prisma/schema.prisma', schema);
  console.log('Schema file generated successfully.');
}

function runPrismaGenerate(): void {
  try {
    console.log('Running Prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma client generated successfully.');
  } catch (error) {
    console.error('Error running Prisma generate:', error);
  }
}

function runPrismaMigrate(): void {
  try {
    console.log('Running Prisma migrate...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Error running Prisma migrate:', error);
  }
}

function main(): void {
  const schema = generatePrismaSchema(chains);
  writeSchemaToFile(schema);
  runPrismaGenerate();
  runPrismaMigrate();
}

main();