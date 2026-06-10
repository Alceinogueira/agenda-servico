import { prisma } from "../src/lib/prisma";

async function main() {
  const telefone = "73981337571";
  const cliente = await prisma.cliente.findUnique({ where: { telefone } });
  console.log(cliente ? JSON.stringify(cliente, null, 2) : "NOT_FOUND");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
});
