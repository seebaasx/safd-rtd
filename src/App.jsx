import React, { useState, useEffect, useMemo } from 'react';
import './index.css'; 
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, Plus, Trash2, Search, ChevronRight, Flame, 
  LogIn, LayoutDashboard, ShieldCheck, ChevronLeft, MessageSquare, 
  Send, User, Lock, BarChart3, Clock, Award, ChevronDown, 
  Activity, TrendingUp, BookOpen, FileText, ExternalLink, 
  ThumbsUp, ThumbsDown, UserCheck, Calendar 
} from 'lucide-react';

// --- CONFIGURACIÓN ---
const supabaseUrl = 'https://bwisxczbkjlxyunpqqld.supabase.co'; 
const supabaseKey = 'sb_publishable_MEosBztTd-5Ot5Rb-jhaHg_BEeiWZ19';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 🛡️ ADMINS ---
const ADMIN_EMAILS = ["iris@safd.com"];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');

  // Lógica de Admin y Bienvenida
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

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-black text-2xl animate-pulse">SINCRO_SISTEMA...</div>;

  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950" />
        <Flame className="w-24 h-24 text-red-600 mb-8 animate-pulse z-10" />
        <h1 className="text-9xl font-black italic tracking-tighter z-10 mb-12">SAFD <span className="text-red-600">RTD</span></h1>
        <button onClick={() => setHasEntered(true)} className="z-10 bg-white text-black px-16 py-6 rounded-full font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all scale-110 shadow-2xl">Abrir Protocolo</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-12 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-3xl font-black italic text-center text-white mb-10 uppercase tracking-tighter">Identificación Operativa</h2>
            <input type="email" placeholder="Email" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-600/20">Verificar Credenciales</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-32 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-12 h-screen sticky top-0">
        <div className="mb-20 bg-red-600 p-3 rounded-2xl shadow-xl shadow-red-600/20"><Flame className="w-8 h-8 text-white" /></div>
        <nav className="flex md:flex-col gap-10">
          <button onClick={() => setActiveTab('alumnos')} className={`p-6 rounded-3xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600' : 'text-zinc-800 hover:text-white'}`}><Users /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-6 rounded-3xl transition-all ${activeTab === 'progreso' ? 'bg-red-600' : 'text-zinc-800 hover:text-white'}`}><BarChart3 /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-6 rounded-3xl transition-all ${activeTab === 'recursos' ? 'bg-red-600' : 'text-zinc-800 hover:text-white'}`}><BookOpen /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="mt-auto p-6 text-zinc-800 hover:text-red-500 transition-all"><LogOut /></button>
      </aside>

      <main className="flex-1 p-8 md:p-20 overflow-y-auto">
        {/* CABECERA CON BIENVENIDA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-red-600/10 text-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-600/20">
                Bienvenido, {instructorName}
              </span>
              {isAdmin && <ShieldCheck className="w-5 h-5 text-red-600" />}
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
              {activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'LEADERBOARD' : 'BIBLIOTECA'}
            </h1>
          </div>
          {isAdmin && activeTab === 'alumnos' && (
            <button className="bg-white text-black px-12 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Nuevo Aspirante</button>
          )}
        </div>

        {/* CONTENIDO SEGÚN TAB */}
        {activeTab === 'alumnos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {students.map(s => (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] hover:border-red-600 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all"><User /></div>
                  <span className="text-[10px] text-zinc-600 font-black">ID_{s.id.slice(0,5)}</span>
                </div>
                <h3 className="text-3xl font-black italic uppercase mb-2">{s.name}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500">
                  <Activity className="w-4 h-4 text-green-500" /> Estado: Activo
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'progreso' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-12">
            <h2 className="text-4xl font-black italic mb-12 uppercase tracking-tighter">Estadísticas de Entrenamiento</h2>
            <div className="space-y-6">
              {students.map((s, i) => (
                <div key={s.id} className="flex items-center gap-6 p-6 bg-zinc-950 rounded-3xl border border-zinc-800/50">
                  <span className="text-2xl font-black italic text-zinc-800 w-12">#{i+1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="font-black uppercase italic">{s.name}</span>
                      <span className="text-red-600 font-black">75%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-600 h-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recursos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resources.map(r => (
              <div key={r.id} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] hover:border-blue-600 transition-all">
                <FileText className="w-10 h-10 text-blue-600 mb-6" />
                <h3 className="text-2xl font-black italic uppercase mb-4">{r.title}</h3>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-zinc-500 hover:text-blue-500 flex items-center gap-2">Abrir Documentación <ExternalLink className="w-4 h-4" /></a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}