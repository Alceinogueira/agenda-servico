import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleFromTelefone } from "@/lib/auth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const body = await request.json();
  const { telefone, senha } = body;

  if (!telefone || !senha) {
    return NextResponse.json(
      { error: "telefone e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const telefoneLimpo = String(telefone).replace(/\D/g, "");

  const cliente = await prisma.cliente.findUnique({
    where: { telefone: telefoneLimpo },
  });

  if (!cliente) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const senhaValida = await bcrypt.compare(senha, cliente.senhaHash);

  if (!senhaValida) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const role = roleFromTelefone(cliente.telefone);

  const token = jwt.sign(
    { clienteId: cliente.id, role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return NextResponse.json({
    token,
    cliente: {
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone,
      role,
    },
  });
}
