// frontend/src/components/Layout.tsx
import React from "react";

export default function Layout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold">
              MP
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700">
                Mini Project Manager
              </div>
              <div className="text-xs text-slate-500">
                Organize tasks & collaborate
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {title && (
          <h1 className="text-xl font-semibold text-slate-800 mb-6">
            {title}
          </h1>
        )}
        {children}
      </main>
    </div>
  );
}
