"use client";

import { useState } from "react";
import FilePreview from "./FilePreview";
import CollaborativeEditor from "./CollaborativeEditor";
import { Eye, Edit3 } from "lucide-react";

interface DocumentViewWrapperProps {
  documentId: string;
}

export default function DocumentViewWrapper({ documentId }: DocumentViewWrapperProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "editor">("editor");

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-premium border border-surface-200 overflow-hidden">
      <div className="flex items-center p-1.5 border-b border-surface-100 bg-surface-50/50">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-1 px-4 py-2.5 text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-300 rounded-2xl ${
            activeTab === "editor" 
              ? "bg-white text-brand-primary shadow-sm ring-1 ring-surface-200" 
              : "text-surface-400 hover:text-surface-600 hover:bg-white/50"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>ÉDITION COLLABORATIVE</span>
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 px-4 py-2.5 text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-300 rounded-2xl ${
            activeTab === "preview" 
              ? "bg-white text-brand-primary shadow-sm ring-1 ring-surface-200" 
              : "text-surface-400 hover:text-surface-600 hover:bg-white/50"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>APERÇU DU DOCUMENT</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === "editor" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
          <CollaborativeEditor documentId={documentId} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === "preview" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
          <FilePreview fileId={documentId} />
        </div>
      </div>
    </div>
  );
}
