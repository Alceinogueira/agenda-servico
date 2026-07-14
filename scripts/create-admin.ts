import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { BARBEIRO_TELEFONE } from "../src/lib/auth";

async function main() {
  const telefone = BARBEIRO_TELEFONE;
  const senha = "Teste12345";
  const senhaHash = await bcrypt.hash(senha, 10);

  const existing = await prisma.cliente.findUnique({ where: { telefone } });
  if (existing) {
    const cliente = await prisma.cliente.update({
      where: { telefone },
      data: {
        nome: "Administrador",
        senhaHash,
      },
    });
    console.log("Admin atualizado:", JSON.stringify(cliente, null, 2));
  } else {
    const cliente = await prisma.cliente.create({
      data: {
        nome: "Administrador",
        telefone,
        senhaHash,
      },
    });
    console.log("Admin criado:", JSON.stringify(cliente, null, 2));
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
});
