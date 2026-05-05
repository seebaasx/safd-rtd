// ... (imports y configuración de Supabase arriba igual)

const ADMIN_EMAILS = ["iris@safd.com"]; // ASEGÚRATE DE QUE ESTE SEA TU EMAIL EXACTO

export default function App() {
  // ... (tus estados de siempre)

  // ESTO ES LO QUE ACTIVA LAS OPCIONES
  const isAdmin = useMemo(() => {
    return session?.user?.email && ADMIN_EMAILS.includes(session.user.email);
  }, [session]);

  // ... (useEffect y handleLogin igual)

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-32 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-12 h-screen">
        <div className="mb-20 bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/20"><Flame className="w-8 h-8 text-white" /></div>
        <nav className="flex md:flex-col gap-10">
          <button onClick={() => setActiveTab('alumnos')} className={`p-6 rounded-3xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 shadow-xl' : 'text-zinc-800 hover:text-white'}`}><Users className="w-7 h-7" /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-6 rounded-3xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 shadow-xl' : 'text-zinc-800 hover:text-white'}`}><BookOpen className="w-7 h-7" /></button>
        </nav>
        
        {/* INDICADOR DE ADMIN EN EL SIDEBAR */}
        {isAdmin && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-600 animate-pulse" />
            <span className="text-[8px] font-black uppercase text-red-600 tracking-widest">Admin</span>
          </div>
        )}

        <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="mt-auto p-6 text-zinc-800 hover:text-red-500"><LogOut className="w-7 h-7" /></button>
      </aside>

      <main className="flex-1 p-12 md:p-20 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <div>
            <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] mb-6">
              {activeTab === 'alumnos' ? 'EXPEDIENTES' : 'BIBLIOTECA'}
            </h1>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
               <Activity className="w-4 h-4 text-red-600 animate-pulse" /> 
               Operativo: <span className="text-white italic">{session?.user?.email}</span>
            </div>
          </div>

          {/* ESTE BOTÓN SOLO APARECE SI isAdmin ES TRUE */}
          {activeTab === 'alumnos' && isAdmin && (
            <button className="bg-white text-black px-12 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95">
              + Nuevo Aspirante
            </button>
          )}
        </div>

        {/* ... (el resto del grid de alumnos y recursos igual) */}
      </main>
    </div>
  );
}