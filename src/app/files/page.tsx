import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import FileList from "@/components/FileList";
import UploadButton from "@/components/UploadButton";

export default async function FilesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden flex-col lg:flex-row">
      <Sidebar user={session.user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:border-l border-gray-200 pt-16 lg:pt-0">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 bg-white shrink-0">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">Partage de Fichiers</h2>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <UploadButton />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          <FileList />
        </div>
      </main>
    </div>
  );
}
