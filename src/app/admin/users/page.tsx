import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import UserManagementTable from "@/components/UserManagementTable";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex h-screen bg-white overflow-hidden flex-col lg:flex-row">
      <Sidebar user={session.user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:border-l border-gray-200 pt-16 lg:pt-0">
        <header className="h-16 border-b border-gray-200 flex items-center px-4 lg:px-6 bg-white shrink-0">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          <UserManagementTable initialUsers={users} />
        </div>
      </main>
    </div>
  );
}
