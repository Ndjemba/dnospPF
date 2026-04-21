import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import VideoConference from "@/components/VideoConference";
import DocumentViewWrapper from "@/components/DocumentViewWrapper";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  
  const file = await prisma.file.findUnique({
    where: { id },
    select: { name: true, type: true }
  });

  const title = file ? file.name : `Document: ${id}`;

  return (
    <div className="flex h-screen bg-white overflow-hidden flex-col lg:flex-row">
      <Sidebar user={session.user} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:border-l border-gray-200 pt-16 lg:pt-0">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 bg-white shrink-0">
          <div className="flex items-center space-x-4 min-w-0">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800 truncate">{title}</h2>
            <span className="hidden sm:inline-block px-2 py-1 bg-blue-100 text-blue-700 text-[10px] lg:text-xs font-semibold rounded uppercase">
              Collaboratif
            </span>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 lg:p-4 gap-2 lg:gap-4 bg-gray-50">
          {/* Main Area: Document & Editor */}
          <div className="flex-[3] flex flex-col min-w-0 h-[60%] lg:h-full">
            <DocumentViewWrapper documentId={id} />
          </div>

          {/* Right: Conference */}
          <div className="flex-1 h-[40%] lg:h-full min-w-0 lg:min-w-[320px] lg:max-w-[400px]">
            <VideoConference roomId={id} />
          </div>
        </div>
      </main>
    </div>
  );
}
