import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Non autorisé", { status: 401 });
    }

    const { id } = await params;
    const fileRecord = await prisma.file.findUnique({
      where: { id },
    });

    if (!fileRecord) {
      return new Response("Fichier non trouvé", { status: 404 });
    }

    const filePath = path.join(process.cwd(), "uploads", fileRecord.path);
    const fileBuffer = await readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": fileRecord.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileRecord.name}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response("Erreur lors du téléchargement", { status: 500 });
  }
}
