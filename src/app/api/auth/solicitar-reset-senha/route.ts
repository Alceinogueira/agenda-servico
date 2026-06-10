import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarWhatsAppTexto } from "@/lib/whatsapp";

function gerarCodigo(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  const body = await request.json();
  const { telefone } = body;

  if (!telefone) {
    return NextResponse.json(
      { error: "Telefone é obrigatório" },
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

  const codigo = gerarCodigo();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await prisma.resetPasswordCode.create({
    data: {
      clienteId: cliente.id,
      codigo,
      expiresAt,
    },
  });

  const texto = `Seu código de recuperação de senha é *${codigo}*\n\nUse-o nos próximos 15 minutos.`;
  const resultado = await enviarWhatsAppTexto(telefoneLimpo, texto);

  if (!resultado.ok) {
    return NextResponse.json(
      {
        error:
          "Não foi possível enviar o código. Verifique a configuração do WhatsApp e tente novamente.",
        motivo: resultado.motivo,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Código enviado por WhatsApp." });
}
