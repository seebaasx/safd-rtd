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
const ADMIN_EMAILS = ["iris@safd.com"];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]); // Nueva tabla añadida
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % 2), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        setHasEntered(true);
        await fetchAllData(); 
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // CARGA DE AMBAS TABLAS
  async function fetchAllData() {
    try {
      // Cargamos estudiantes
      const { data: stds, error: errStds } = await supabase.from('students').select('*').order('name');
      if (errStds) throw errStds;
      setStudents(stds || []);

      // Cargamos recursos (biblioteca)
      const { data: ress, error: errRess } = await supabase.from('resources').select('*');
      if (errRess) throw errRess;
      setResources(ress || []);

    } catch (err) {
      console.error("Error en la sincronización:", err.message);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: emailInput, 
      password: passInput 
    });
    
    if (error) {
      alert("Acceso Denegado: " + error.message);
    } else {
      setSession(data.session);
      setHasEntered(true);
      fetchAllData();
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-black text-2xl animate-pulse">SINCRO_TOTAL...</div>;

  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Flame className="w-20 h-20 text-red-600 mb-6" />
        <h2 className="text-8xl font-black italic mb-10">SAFD RTD</h2>
        <button onClick={() => setHasEntered(true)} className="bg-red-600 px-16 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all">Inicializar Sistema</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[3rem] p-12 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-10">
              <Flame className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-3xl font-black italic text-white uppercase">Identificación</h1>
            </div>
            <input type="email" placeholder="iris@safd.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-600" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="Código de Seguridad" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-600" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase text-white shadow-lg shadow-red-600/20">Verificar Operador</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-32 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-12 h-screen">
        <Flame className="w-8 h-8 text-red-600 mb-20" />
        <button onClick={() => setActiveTab('alumnos')} className={`p-6 rounded-3xl mb-6 transition-all ${activeTab === 'alumnos' ? 'bg-red-600 shadow-lg shadow-red-600/30' : 'text-zinc-700 hover:text-white'}`}><Users className="w-7 h-7" /></button>
        <button onClick={() => setActiveTab('recursos')} className={`p-6 rounded-3xl mb-6 transition-all ${activeTab === 'recursos' ? 'bg-red-600 shadow-lg shadow-red-600/30' : 'text-zinc-700 hover:text-white'}`}><BookOpen className="w-7 h-7" /></button>
        <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="mt-auto p-6 text-zinc-800 hover:text-red-500 transition-all"><LogOut className="w-7 h-7" /></button>
      </aside>

      <main className="flex-1 p-12 md:p-20 overflow-y-auto">
        <div className="mb-20">
          <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.4em] mb-4 block italic">Operaciones de División</span>
          <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
            {activeTab === 'alumnos' ? 'EXPEDIENTES' : 'BIBLIOTECA'}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'alumnos' ? (
            students.length > 0 ? (
              students.map(s => (
                <div key={s.id} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-red-600/50 transition-all group shadow-xl">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all duration-500"><User className="w-6 h-6" /></div>
                    <span className="text-[9px] font-black uppercase px-4 py-2 border border-zinc-800 rounded-full text-zinc-500 italic">REF_{s.id.slice(0,5)}</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter group-hover:text-red-600 transition-colors">{s.name}</h3>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Aspirante SAFD // Rango 0</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] text-zinc-700 font-black uppercase italic">No se han encontrado expedientes activos</div>
            )
          ) : (
            resources.length > 0 ? (
              resources.map(r => (
                <div key={r.id} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-blue-600/50 transition-all group shadow-xl border-l-4 border-l-blue-600">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500"><FileText className="w-6 h-6" /></div>
                    <span className="text-[9px] font-black uppercase px-4 py-2 border border-zinc-800 rounded-full text-zinc-500 italic">DOC_TYPE</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">{r.title || 'Recurso sin título'}</h3>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-6">{r.category || 'Sin categoría'}</p>
                  <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 hover:text-white transition-colors">Abrir Documento <ExternalLink className="w-3 h-3" /></a>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] text-zinc-700 font-black uppercase italic">Biblioteca vacía: Sin recursos asignados</div>
            )
          )}
        </div>
      </main>
    </div>
  );
}