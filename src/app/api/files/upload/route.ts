import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Non autorisé", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("Aucun fichier fourni", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;
    const uploadPath = path.join(process.cwd(), "uploads", filename);

    await writeFile(uploadPath, buffer);

    const savedFile = await prisma.file.create({
      data: {
        name: file.name,
        path: filename,
        size: file.size,
        type: file.type,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json(savedFile);
  } catch (error) {
    console.error("File upload error:", error);
    return new Response("Erreur lors du téléchargement", { status: 500 });
  }
}
