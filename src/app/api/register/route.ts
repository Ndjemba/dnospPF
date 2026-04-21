import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return new Response("Champs manquants", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response("Cet email est déjà utilisé", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        status: "PENDING",
        role: "USER",
      },
    });

    return new Response(JSON.stringify({ message: "Utilisateur créé avec succès. En attente de validation." }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Register error:", error);
    return new Response("Erreur lors de l'inscription", { status: 500 });
  }
}
