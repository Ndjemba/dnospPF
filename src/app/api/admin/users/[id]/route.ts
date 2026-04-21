import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return new Response("Non autorisé", { status: 401 });
    }

    const { status } = await req.json();
    const { id } = await params;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Admin user update error:", error);
    return new Response("Erreur serveur", { status: 500 });
  }
}
