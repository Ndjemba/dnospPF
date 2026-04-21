"use client";

import { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadButton() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.refresh();
        // Trigger a custom event to notify FileList to re-fetch
        window.dispatchEvent(new Event("file-uploaded"));
      } else {
        alert("Erreur lors du téléchargement");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        <span>{uploading ? "Téléchargement..." : "Nouveau Fichier"}</span>
      </button>
    </div>
  );
}
