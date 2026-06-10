import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const telefone = "73981337571";
  const senha = "agendamento10";
  const senhaHash = await bcrypt.hash(senha, 10);

  const existing = await prisma.cliente.findUnique({ where: { telefone } });
  if (existing) {
    console.log("Já existe cliente:", JSON.stringify(existing, null, 2));
  } else {
    const cliente = await prisma.cliente.create({
      data: {
        nome: "Administrador",
        telefone,
        senhaHash,
      },
    });
    console.log("Cliente criado:", JSON.stringify(cliente, null, 2));
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
});
