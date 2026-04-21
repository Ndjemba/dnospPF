"use client";

import { Home, Folder, Users, Settings, LogOut, Video, FileText, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Tableau de bord", icon: Home, href: "/" },
    { name: "Partage de fichiers", icon: Folder, href: "/files" },
    { name: "Documents Collaboratifs", icon: FileText, href: "/documents" },
    { name: "Conférence Vidéo", icon: Video, href: "/conference" },
  ];

  if (user?.role === "ADMIN") {
    menuItems.push({ name: "Gestion Utilisateurs", icon: Users, href: "/admin/users" });
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Hamburger Header */}
      <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
        <h1 className="text-xl font-bold font-serif text-blue-600">Dnosp-PF</h1>
        <button onClick={toggleSidebar} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl flex flex-col shrink-0 transform transition-all duration-300 lg:relative lg:translate-x-0 border-r border-surface-200/50 shadow-glass",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 hidden lg:flex items-center px-8 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-surface-900">Dnosp<span className="text-brand-primary">PF</span></h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 mt-16 lg:mt-0">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400">Navigation</p>
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group",
                pathname === item.href
                  ? "bg-brand-primary/10 text-brand-primary shadow-sm shadow-brand-primary/5"
                  : "text-surface-500 hover:bg-surface-100 hover:text-surface-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                pathname === item.href ? "text-brand-primary" : "text-surface-400 group-hover:text-surface-600"
              )} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 bg-surface-50/50 border-t border-surface-100">
          <div className="flex items-center space-x-3 mb-6 p-2 rounded-2xl bg-white shadow-sm border border-surface-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 flex items-center justify-center text-brand-primary font-bold text-lg border border-brand-primary/10">
              {user?.name?.[0] || user?.email?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-surface-900 truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-surface-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-surface-900 hover:bg-surface-800 transition-all shadow-lg shadow-surface-900/10 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
