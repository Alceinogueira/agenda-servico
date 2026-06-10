import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function main() {
  const telefone = "73981337571";
  const senha = "agendamento10";

  const cliente = await prisma.cliente.findUnique({ where: { telefone } });
  if (!cliente) {
    console.log("❌ Cliente não encontrado");
    return;
  }

  const senhaValida = await bcrypt.compare(senha, cliente.senhaHash);
  if (!senhaValida) {
    console.log("❌ Senha inválida");
    return;
  }

  const role = cliente.telefone === "73981337571" ? "barbeiro" : "cliente";
  const token = jwt.sign(
    { clienteId: cliente.id, role },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "7d" }
  );

  console.log("✅ Login bem-sucedido!");
  console.log({ cliente: { id: cliente.id, nome: cliente.nome, telefone, role }, token });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Erro:", e);
  process.exit(1);
});
