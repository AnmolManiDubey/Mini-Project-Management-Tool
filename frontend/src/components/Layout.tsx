// frontend/src/components/Layout.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  title?: string;
};

export default function Layout({ children, title }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">MP</div>
            <div>
              <div className="text-sm text-slate-600">Mini Project Management</div>
              <div className="text-xs text-slate-400">Manage projects & tasks</div>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </a>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
              Teams
            </a>
            <button className="px-3 py-1 bg-slate-100 rounded-md text-sm text-slate-700">Account</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title ? <div className="mb-4 text-slate-700 text-sm font-medium">{title}</div> : null}
        <div>{children}</div>
      </main>
    </div>
  );
}
