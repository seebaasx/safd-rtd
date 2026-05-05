import React, { useState, useEffect, useMemo } from 'react';
import './index.css'; 
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, Plus, Trash2, Search, ChevronRight, Flame, 
  ShieldCheck, User, BarChart3, BookOpen, FileText, ExternalLink, 
  Activity, X
} from 'lucide-react';

const supabaseUrl = 'https://bwisxczbkjlxyunpqqld.supabase.co'; 
const supabaseKey = 'sb_publishable_MEosBztTd-5Ot5Rb-jhaHg_BEeiWZ19';
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAILS = ["iris@safd.com"];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  
  // Estados para creación de alumnos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const isAdmin = useMemo(() => {
    return session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase());
  }, [session]);

  const instructorName = useMemo(() => {
    return session?.user?.email ? session.user.email.split('@')[0].toUpperCase() : "INVITADO";
  }, [session]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        setHasEntered(true);
        fetchAllData();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  async function fetchAllData() {
    const { data: stds } = await supabase.from('students').select('*').order('name');
    const { data: ress } = await supabase.from('resources').select('*');
    if (stds) setStudents(stds);
    if (ress) setResources(ress);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passInput });
    if (error) alert("Error: " + error.message);
    else { setSession(data.session); setHasEntered(true); fetchAllData(); }
  };

  // FUNCIÓN PARA CREAR ALUMNO
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const { error } = await supabase.from('students').insert([
      { name: newStudentName, status: 'Activo' }
    ]);

    if (error) {
      alert("Error al crear: " + error.message);
    } else {
      setNewStudentName('');
      setIsModalOpen(false);
      fetchAllData(); // Refrescar lista
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-black text-2xl animate-pulse">SINCRO_SISTEMA...</div>;

  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <Flame className="w-24 h-24 text-red-600 mb-8 animate-pulse" />
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-12 uppercase">SAFD <span className="text-red-600">RTD</span></h1>
        <button onClick={() => setHasEntered(true)} className="bg-white text-black px-16 py-6 rounded-full font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl">Abrir Protocolo</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-12 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-3xl font-black italic text-center text-white mb-10 uppercase tracking-tighter">Identificación Operativa</h2>
            <input type="email" placeholder="Email" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-red-600/20">Verificar Credenciales</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      {/* Sidebar Lateral */}
      <aside className="w-full md:w-32 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-12 h-screen sticky top-0 shadow-2xl">
        <div className="mb-20 bg-red-600 p-3 rounded-2xl shadow-xl shadow-red-600/20"><Flame className="w-8 h-8 text-white" /></div>
        <nav className="flex md:flex-col gap-10">
          <button onClick={() => setActiveTab('alumnos')} className={`p-6 rounded-3xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/30' : 'text-zinc-800 hover:text-white'}`}><Users className="w-7 h-7" /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-6 rounded-3xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/30' : 'text-zinc-800 hover:text-white'}`}><BarChart3 className="w-7 h-7" /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-6 rounded-3xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/30' : 'text-zinc-800 hover:text-white'}`}><BookOpen className="w-7 h-7" /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-6 text-zinc-800 hover:text-red-500 transition-all"><LogOut className="w-7 h-7" /></button>
      </aside>

      <main className="flex-1 p-8 md:p-20 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-red-600/10 text-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-600/20 shadow-sm">
                Bienvenido, {instructorName}
              </span>
              {isAdmin && <ShieldCheck className="w-5 h-5 text-red-600" />}
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
              {activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'LEADERBOARD' : 'BIBLIOTECA'}
            </h1>
          </div>
          {isAdmin && activeTab === 'alumnos' && (
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-12 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95">
              + Nuevo Aspirante
            </button>
          )}
        </header>

        {/* MODAL PARA CREAR (Se abre al dar al botón) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[3rem] p-12 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Alta de Aspirante</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X /></button>
              </div>
              <form onSubmit={handleCreateStudent} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Nombre Completo</label>
                  <input type="text" placeholder="Ej: John Doe" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 transition-all font-bold" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required autoFocus />
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-500 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-600/20">Registrar en Base de Datos</button>
              </form>
            </div>
          </div>
        )}

        {/* LISTADO DE ALUMNOS */}
        {activeTab === 'alumnos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {students.map(s => (
              <div key={s.id} className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[3rem] hover:border-red-600 transition-all group shadow-xl">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all duration-500 shadow-inner"><User className="text-zinc-500 group-hover:text-white" /></div>
                  <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">ID_{s.id.slice(0,5)}</span>
                </div>
                <h3 className="text-3xl font-black italic uppercase mb-2 tracking-tighter">{s.name}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                  <Activity className="w-4 h-4 text-green-500 animate-pulse" /> Estado: Activo
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD (TAB PROGRESO) */}
        {activeTab === 'progreso' && (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-[3rem] p-12">
            <h2 className="text-4xl font-black italic mb-12 uppercase tracking-tighter text-zinc-400">Ranking Académico</h2>
            <div className="space-y-6">
              {students.map((s, i) => (
                <div key={s.id} className="flex items-center gap-8 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50 hover:border-red-600/30 transition-all">
                  <span className="text-4xl font-black italic text-zinc-800 w-16">#{i+1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-3 items-end">
                      <span className="text-2xl font-black uppercase italic tracking-tighter">{s.name}</span>
                      <span className="text-red-600 font-black text-xs tracking-widest">75% COMPLETADO</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-red-900 to-red-600 h-full shadow-[0_0_15px_rgba(220,38,38,0.4)]" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BIBLIOTECA */}
        {activeTab === 'recursos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resources.map(r => (
              <div key={r.id} className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[3rem] hover:border-blue-600 transition-all group shadow-xl">
                <FileText className="w-12 h-12 text-blue-600 mb-8" />
                <h3 className="text-3xl font-black italic uppercase mb-6 tracking-tighter">{r.title}</h3>
                <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors tracking-widest">Descargar Documento <ExternalLink className="w-4 h-4" /></a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}