import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Non autorisé", { status: 401 });
    }

    const files = await prisma.file.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Fetch files error:", error);
    return new Response("Erreur serveur", { status: 500 });
  }
}
