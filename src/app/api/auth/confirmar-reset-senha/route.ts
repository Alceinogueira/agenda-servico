import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const { telefone, codigo, novaSenha } = body;

  if (!telefone || !codigo || !novaSenha) {
    return NextResponse.json(
      { error: "Telefone, código e novaSenha são obrigatórios" },
      { status: 400 }
    );
  }

  const telefoneLimpo = telefone.replace(/\D/g, "");
  const cliente = await prisma.cliente.findUnique({
    where: { telefone: telefoneLimpo },
  });

  if (!cliente) {
    return NextResponse.json({ error: "Telefone não encontrado" }, { status: 404 });
  }

  const codigoValido = await prisma.resetPasswordCode.findFirst({
    where: {
      clienteId: cliente.id,
      codigo,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!codigoValido) {
    return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 401 });
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.cliente.update({
    where: { id: cliente.id },
    data: { senhaHash },
  });

  await prisma.resetPasswordCode.deleteMany({
    where: { clienteId: cliente.id },
  });

  return NextResponse.json({ message: "Senha redefinida com sucesso" });
}
