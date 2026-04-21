"use client";

import { File, MoreVertical, Download, Share2, Trash2, Loader2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface FileType {
  id: string;
  name: string;
  size: number;
  type: string;
  userId: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

export default function FileList() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/files");
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) return;

    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFiles(files.filter(f => f.id !== fileId));
      } else {
        const error = await res.text();
        alert(error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    fetchFiles();

    // Polling every 5 seconds for other users
    const interval = setInterval(fetchFiles, 5000);

    window.addEventListener("file-uploaded", fetchFiles);
    return () => {
      window.removeEventListener("file-uploaded", fetchFiles);
      clearInterval(interval);
    };
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <File className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Aucun fichier</h3>
        <p className="text-gray-500">Commencez par télécharger votre premier fichier.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-premium overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-50/50 border-b border-surface-200">
              <th className="px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Nom</th>
              <th className="px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Propriétaire</th>
              <th className="px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Taille</th>
              <th className="px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest">Ajouté le</th>
              <th className="px-6 py-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-surface-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <File className="w-5 h-5 text-brand-primary" />
                    </div>
                    <span className="text-sm font-bold text-surface-900">{file.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-surface-200 flex items-center justify-center text-[10px] font-bold text-surface-600">
                      {file.user.name?.[0] || file.user.email?.[0]}
                    </div>
                    <span className="text-xs font-medium text-surface-600">
                      {file.user.name || file.user.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-surface-500">{formatSize(file.size)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-surface-100 text-surface-600 border border-surface-200 uppercase tracking-tighter">
                    {file.type.split("/")[1] || file.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-surface-400">
                  {new Date(file.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Link 
                      href={`/documents/${file.id}`} 
                      className="p-2 text-surface-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all"
                      title="Ouvrir"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <a 
                      href={`/api/files/download/${file.id}`} 
                      className="p-2 text-surface-400 hover:text-brand-secondary hover:bg-brand-secondary/5 rounded-lg transition-all"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {((session?.user as any)?.id === file.userId || (session?.user as any)?.role === "ADMIN") && (
                      <button 
                        onClick={() => handleDelete(file.id)} 
                        className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-gray-200">
        {files.map((file) => (
          <div key={file.id} className="p-4 flex flex-col space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <File className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.name}</h4>
                  <p className="text-xs text-gray-500">{file.user.name || file.user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link href={`/documents/${file.id}`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                  <Eye className="w-5 h-5" />
                </Link>
                <a href={`/api/files/download/${file.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              <span>{formatSize(file.size)}</span>
              <span>{file.type.split("/")[1] || file.type}</span>
              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
              {((session?.user as any)?.id === file.userId || (session?.user as any)?.role === "ADMIN") && (
                <button 
                  onClick={() => handleDelete(file.id)} 
                  className="text-red-600 font-semibold"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
