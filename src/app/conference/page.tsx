import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { Video, Users, ArrowRight } from "lucide-react";

const activeConferences = [
  { id: "doc-1", title: "Réunion Projet Alpha", participants: 3, status: "En cours" },
  { id: "doc-2", title: "Brainstorming Design", participants: 5, status: "En cours" },
];

export default async function ConferencePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden flex-col lg:flex-row">
      <Sidebar user={session.user} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:border-l border-gray-200 pt-16 lg:pt-0">
        <header className="h-16 border-b border-gray-200 flex items-center px-4 lg:px-6 bg-white shrink-0">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">Conférences Vidéo</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Conférences Actives</h3>
              <p className="text-sm text-gray-500">Rejoignez une conférence en cours autour d'un document.</p>
            </div>

            <div className="grid gap-4">
              {activeConferences.map((conf) => (
                <Link
                  key={conf.id}
                  href={`/documents/${conf.id}`}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full animate-pulse">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{conf.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <Users className="w-3 h-3" />
                        <span>{conf.participants} participants</span>
                        <span className="text-green-500 font-medium">• {conf.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Rejoindre <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
              <Video className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-blue-900 mb-2">Démarrer une nouvelle conférence</h3>
              <p className="text-blue-700/70 mb-6 max-w-md mx-auto">
                Pour lancer une conférence, ouvrez un document collaboratif et activez votre caméra.
              </p>
              <Link
                href="/documents"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Aller aux documents
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
