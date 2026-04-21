import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { FileText, Plus, Users } from "lucide-react";

export default async function DocumentsListPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const files = await prisma.file.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar user={session.user} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden border-l border-gray-200">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Documents Collaboratifs</h2>
          <Link 
            href="/files"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Document</span>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun document disponible. Téléchargez un fichier pour commencer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400 text-xs">
                      <Users className="w-4 h-4" />
                      <span>Mode collaboratif</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{doc.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">Par {doc.user.name || doc.user.email}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">Ouvrir →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
