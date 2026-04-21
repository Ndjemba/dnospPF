"use client";

import { useState, useEffect } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";

interface FilePreviewProps {
  fileId: string;
}

export default function FilePreview({ fileId }: FilePreviewProps) {
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const res = await fetch(`/api/files`);
        if (res.ok) {
          const files = await res.json();
          const file = files.find((f: any) => f.id === fileId);
          setFileInfo(file);
        }
      } catch (error) {
        console.error("Error fetching file info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [fileId]);

  if (loading) return <div className="p-4 text-center">Chargement de l'aperçu...</div>;
  if (!fileInfo) return <div className="p-4 text-center">Fichier introuvable</div>;

  const isPreviewable = ["application/pdf", "image/png", "image/jpeg", "image/gif", "text/plain"].includes(fileInfo.type);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 bg-gray-100 overflow-hidden flex items-center justify-center relative">
        {isPreviewable ? (
          <iframe 
            src={`/api/files/download/${fileId}`} 
            className="w-full h-full border-none"
            title="Aperçu du fichier"
          />
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Aperçu non disponible pour ce type de fichier ({fileInfo.type}).
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Les documents Word/Excel peuvent être visualisés après téléchargement ou via un service tiers.
            </p>
            <a 
              href={`/api/files/download/${fileId}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger pour voir</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
