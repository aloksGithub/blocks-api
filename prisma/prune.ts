import prisma from "../src/config/database";

async function deleteAllData() {
  try {
    // Get the names of all tables in the database
    const tableNames: any = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      AND table_type='BASE TABLE';
    `;

    // Delete all rows from each table
    for (const { table_name } of tableNames) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table_name}" CASCADE;`);
    }

    console.log('All data has been deleted from all tables.');
  } catch (error) {
    console.error('Error deleting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllData();