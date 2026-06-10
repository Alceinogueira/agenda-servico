import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const telefone = "73981337571";
  const cliente = await prisma.cliente.findUnique({ where: { telefone } });
  if (!cliente) {
    console.log("NOT_FOUND");
    return;
  }
  const senhaCorreta = await bcrypt.compare("agendamento10", cliente.senhaHash);
  console.log({ cliente: { id: cliente.id, nome: cliente.nome, telefone: cliente.telefone }, senhaCorreta });
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
});
