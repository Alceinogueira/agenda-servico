import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { roleFromTelefone } from "../src/lib/auth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function main() {
  const telefone = "73981337571";
  const senha = "Teste12345";

  const cliente = await prisma.cliente.findUnique({ where: { telefone } });
  if (!cliente) {
    console.log("❌ Cliente não encontrado");
    await prisma.$disconnect();
    process.exit(1);
  }

  const senhaValida = await bcrypt.compare(senha, cliente.senhaHash);
  if (!senhaValida) {
    console.log("❌ Senha inválida");
    await prisma.$disconnect();
    process.exit(1);
  }

  const role = roleFromTelefone(cliente.telefone);
  if (role !== "barbeiro") {
    console.log("❌ Role esperada: barbeiro");
    await prisma.$disconnect();
    process.exit(1);
  }

  const token = jwt.sign(
    { clienteId: cliente.id, role },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "7d" }
  );

  console.log("✅ Login bem-sucedido!");
  console.log({
    cliente: { id: cliente.id, nome: cliente.nome, telefone, role },
    tokenPreview: `${token.slice(0, 24)}...`,
  });
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ Erro:", e);
  await prisma.$disconnect();
  process.exit(1);
});
