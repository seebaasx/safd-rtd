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

const skillsOrder = ["Actitud", "Mando", "Buen uso de interna", "Comunicación por radio", "Primeros auxilios", "Excarcelaciones", "Incendios"];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');

  const slides = [
    { title: "RTD PORTAL", subtitle: "RECRUITMENT & TRAINING DIVISION", image: "https://images.unsplash.com/photo-1582213700411-9faaa2b8b935?q=80&w=2070" },
    { title: "ACADEMY OPS", subtitle: "SISTEMA DE EVALUACIÓN TÁCTICA", image: "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?q=80&w=2070" }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log("Iniciando verificación de sesión...");
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { 
        console.log("Sesión activa detectada para:", session.user.email);
        setHasEntered(true); 
        fetchData(); 
      }
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    console.log("Intentando descargar lista de alumnos...");
    const { data, error } = await supabase.from('students').select('*').order('name');
    if (error) {
      console.error("Error al obtener alumnos (¿RLS activo?):", error.message);
    }
    if (data) {
      console.log("Alumnos cargados:", data.length);
      setStudents(data);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Enviando credenciales para:", emailInput);
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: emailInput, 
      password: passInput 
    });

    if (error) {
      console.error("Fallo de autenticación:", error.message);
      alert("Error de acceso: " + error.message);
    } else {
      console.log("Acceso concedido para:", data.user.email);
      setHasEntered(true); 
      fetchData(); 
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-black tracking-tighter text-2xl animate-pulse">SINCRO_SISTEMA...</div>;

  // PANTALLA 1: CARRUSEL INICIAL
  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans overflow-hidden text-white">
        <nav className="fixed top-0 w-full z-50 px-12 py-8 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-2 rounded-lg"><Flame className="w-8 h-8 text-white" /></div>
            <span className="text-2xl font-black italic tracking-tighter">SAFD <span className="text-red-600">RTD</span></span>
          </div>
          <button onClick={() => setHasEntered(true)} className="px-8 py-3 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg">Acceder al Sistema</button>
        </nav>
        
        <div className="relative flex-1 flex items-center justify-center">
          {slides.map((slide, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-zinc-950/70 z-10" />
              <img src={slide.image} className="w-full h-full object-cover grayscale opacity-40 scale-105" alt="" />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                <h2 className="text-7xl md:text-[10rem] font-black italic mb-2 tracking-tighter leading-none">{slide.title}</h2>
                <p className="text-red-600 font-black italic mb-12 tracking-[0.5em] uppercase text-sm md:text-xl">{slide.subtitle}</p>
                <button onClick={() => setHasEntered(true)} className="bg-red-600 text-white px-16 py-6 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:scale-110 transition-all shadow-[0_0_50px_rgba(220,38,38,0.5)]">Inicializar Protocolo</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PANTALLA 2: LOGIN
  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-12 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center mb-12">
            <Flame className="w-16 h-16 text-red-600 mb-6 animate-pulse" />
            <h1 className="text-4xl font-black italic tracking-tighter text-center leading-tight uppercase">Identificación Operativa</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">Acceso Restringido SAFD</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-4 text-zinc-500">Email Operativo</label>
              <input type="email" placeholder="iris@safd.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 transition-all font-bold" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-4 text-zinc-500">Código de Seguridad</label>
              <input type="password" placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 transition-all font-bold" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-lg shadow-red-600/20">Verificar Credenciales</button>
            <button type="button" onClick={() => setHasEntered(false)} className="w-full text-zinc-700 text-[9px] uppercase font-black mt-6 tracking-widest hover:text-zinc-400">Abortar Conexión</button>
          </form>
        </div>
      </div>
    );
  }

  // PANTALLA 3: DASHBOARD
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-32 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-12 z-50 sticky top-0 md:h-screen">
        <div className="mb-20 bg-red-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)]"><Flame className="w-8 h-8 text-white" /></div>
        <nav className="flex md:flex-col gap-12 flex-1">
          <button onClick={() => setActiveTab('alumnos')} className={`p-6 rounded-3xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 text-white scale-110 shadow-xl shadow-red-600/20' : 'text-zinc-700 hover:text-white'}`}><Users className="w-7 h-7" /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-6 rounded-3xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 text-white scale-110 shadow-xl shadow-red-600/20' : 'text-zinc-700 hover:text-white'}`}><BarChart3 className="w-7 h-7" /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-6 rounded-3xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 text-white scale-110 shadow-xl shadow-red-600/20' : 'text-zinc-700 hover:text-white'}`}><BookOpen className="w-7 h-7" /></button>
        </nav>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="mt-auto p-6 text-zinc-800 hover:text-red-500 transition-all"><LogOut className="w-7 h-7" /></button>
      </aside>

      <main className="flex-1 px-8 py-12 md:px-20 md:py-20 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <div>
            <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.4em] mb-4 block">División de Reclutamiento</span>
            <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] mb-6">
              {activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'ESTADÍSTICAS' : 'BIBLIOTECA'}
            </h1>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
              <Activity className="w-4 h-4 text-red-600 animate-pulse" />
              Estado: <span className="text-white">Operativo</span>
              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
              Terminal: <span className="text-white">{session.user.email.split('@')[0].toUpperCase()}</span>
            </div>
          </div>
          {activeTab === 'alumnos' && (
            <button className="bg-white text-black px-12 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl shadow-white/5">Nuevo Aspirante</button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {students.length === 0 ? (
             <div className="col-span-full border border-dashed border-zinc-800 rounded-3xl p-20 text-center text-zinc-600 uppercase font-black text-xs tracking-widest">
                No hay expedientes activos en la base de datos
             </div>
           ) : (
             students.map(student => (
               <div key={student.id} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-red-600/50 transition-all group cursor-pointer shadow-xl">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-colors duration-500"><User className="w-6 h-6 text-zinc-400 group-hover:text-white" /></div>
                    <span className="text-[9px] font-black uppercase px-4 py-2 border border-zinc-800 rounded-full text-zinc-500">ID_REF: {student.id.slice(0,5)}</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter group-hover:text-red-600 transition-colors">{student.name}</h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-8">Aspirante SAFD // Rango 0</p>
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-900" />)}
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-red-600 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
               </div>
             ))
           )}
        </div>
      </main>
    </div>
  );
}