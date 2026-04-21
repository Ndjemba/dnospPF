import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Non autorisé", { status: 401 });
    }

    const { id } = await params;
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return new Response("Fichier non trouvé", { status: 404 });
    }

    // Check if the user is the owner or an admin
    if (file.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
      return new Response("Vous n'avez pas l'autorisation de supprimer ce fichier", { status: 403 });
    }

    // Delete from filesystem
    try {
      const filePath = path.join(process.cwd(), "uploads", file.path);
      await unlink(filePath);
    } catch (err) {
      console.error("FileSystem delete error:", err);
      // Continue even if file is missing from disk
    }

    // Delete from database
    await prisma.file.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Fichier supprimé avec succès" });
  } catch (error) {
    console.error("Delete file error:", error);
    return new Response("Erreur lors de la suppression", { status: 500 });
  }
}
