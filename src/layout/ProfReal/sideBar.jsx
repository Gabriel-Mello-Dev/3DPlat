import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: 'Ver professores', path: '/', icon: '👩‍🏫' },
    { label: 'Cadastrar', path: '/Turmas', icon: '＋' },

  ];

  return (
    <aside className="w-64 bg-[#27406a] text-white min-h-screen flex flex-col p-6">
      <div className="mb-8 text-center">
        <div className="text-lg font-bold">Nome<br/>Site</div>
      </div>

      <nav className="flex-1 space-y-2" aria-label="Menu principal">
        {items.map((it) => {
          const active = location.pathname === it.path;
          return (
            <button
              key={it.path}
              onClick={() => navigate(it.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                active ? 'bg-white/15 ring-2 ring-white/10' : 'hover:bg-white/5'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="text-2xl" >{it.icon}</span>
              <span className="text-sm" style={{fontWeight: 600}}>{it.label}</span>
              <span className="ml-auto text-white/60" style={{fontWeight: 600}}>›</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 text-xs text-white/60">© Sistema Escolar</div>
    </aside>
  );
};

export  {Sidebar};