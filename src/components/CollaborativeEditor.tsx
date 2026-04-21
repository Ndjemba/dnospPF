"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import { WebrtcProvider } from "y-webrtc";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface EditorProps {
  documentId: string;
}

export default function CollaborativeEditor({ documentId }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(documentId, ydoc);
    const ytext = ydoc.getText("quill");

    const quill = new Quill(editorRef.current, {
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          ["image", "code-block"],
        ],
      },
      placeholder: "Commencez à rédiger...",
      theme: "snow",
    });

    quillRef.current = quill;

    const binding = new QuillBinding(ytext, quill, provider.awareness);

    return () => {
      ydoc.destroy();
      provider.destroy();
    };
  }, [documentId]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="p-4 border-b border-surface-50 flex items-center justify-between bg-surface-50/30">
        <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Éditeur Temps Réel</h3>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-primary border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm" title="Utilisateur 1">U1</div>
            <div className="w-7 h-7 rounded-lg bg-brand-accent border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm" title="Utilisateur 2">U2</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div ref={editorRef} className="h-full border-none prose prose-sm max-w-none" />
      </div>
    </div>
  );
}
