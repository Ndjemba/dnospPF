"use client";

import { useState } from "react";
import { Check, X, User } from "lucide-react";

interface UserType {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}

export default function UserManagementTable({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState<UserType[]>(initialUsers);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.name || "N/A"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    user.status === "APPROVED" ? "bg-green-100 text-green-700" :
                    user.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.status === "PENDING" && (
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(user.id, "APPROVED")}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Approuver"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(user.id, "REJECTED")}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Refuser"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {user.status !== "PENDING" && user.role !== "ADMIN" && (
                     <button
                     onClick={() => handleUpdateStatus(user.id, "PENDING")}
                     className="text-xs text-gray-400 hover:text-gray-600"
                   >
                     Réinitialiser
                   </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.id} className="p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{user.name || "N/A"}</h4>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                user.status === "APPROVED" ? "bg-green-100 text-green-700" :
                user.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {user.status}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <span className="text-xs text-gray-500 font-medium">Rôle: {user.role}</span>
              <div className="flex items-center space-x-3">
                {user.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(user.id, "APPROVED")}
                      className="text-xs font-bold text-green-600"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(user.id, "REJECTED")}
                      className="text-xs font-bold text-red-600"
                    >
                      Refuser
                    </button>
                  </>
                )}
                {user.status !== "PENDING" && user.role !== "ADMIN" && (
                   <button
                   onClick={() => handleUpdateStatus(user.id, "PENDING")}
                   className="text-xs text-blue-500 font-semibold"
                 >
                   Réinitialiser
                 </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
