import React, { useState, useEffect, useMemo } from 'react';
import './index.css'; 
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, Plus, Trash2, Search, ChevronRight, Flame, 
  ShieldCheck, User, BarChart3, BookOpen, FileText, ExternalLink, 
  Activity, X, ChevronLeft
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
  const [selectedStudent, setSelectedStudent] = useState(null); // Para hacer clic en alumno
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const slides = [
    { title: "RTD PORTAL", subtitle: "RECRUITMENT & TRAINING DIVISION", image: "https://images.unsplash.com/photo-1582213700411-9faaa2b8b935?q=80&w=2070" },
    { title: "ACADEMY OPS", subtitle: "SISTEMA DE EVALUACIÓN TÁCTICA", image: "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?q=80&w=2070" }
  ];

  const isAdmin = useMemo(() => {
    return session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase());
  }, [session]);

  const instructorName = useMemo(() => {
    return session?.user?.email ? session.user.email.split('@')[0].toUpperCase() : "INVITADO";
  }, [session]);

  // Carrusel del Hero
  useEffect(() => {
    if (!hasEntered) {
      const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000);
      return () => clearInterval(timer);
    }
  }, [hasEntered]);

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

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('students').insert([{ name: newStudentName, status: 'Activo' }]);
    if (error) alert(error.message);
    else { setNewStudentName(''); setIsModalOpen(false); fetchAllData(); }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-black text-2xl animate-pulse italic">INICIANDO_SISTEMA...</div>;

  // LANDING CON CARRUSEL HERO
  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans overflow-hidden text-white relative">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-zinc-950/60 z-10" />
            <img src={slide.image} className="w-full h-full object-cover grayscale opacity-40 scale-110" alt="" />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-7xl md:text-[10rem] font-black italic mb-2 tracking-tighter leading-none">{slide.title}</h2>
              <p className="text-red-600 font-black italic mb-12 tracking-[0.5em] uppercase text-sm md:text-xl">{slide.subtitle}</p>
              <button onClick={() => setHasEntered(true)} className="bg-red-600 text-white px-16 py-6 rounded-full font-black uppercase text-xs tracking-widest hover:scale-110 transition-all shadow-[0_0_50px_rgba(220,38,38,0.5)]">Inicializar Protocolo</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-12 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-3xl font-black italic text-center text-white mb-10 uppercase tracking-tighter">Identificación</h2>
            <input type="email" placeholder="Email" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-600/20">Verificar Credenciales</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-32 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-12 h-screen sticky top-0">
        <div className="mb-20 bg-red-600 p-3 rounded-2xl"><Flame className="w-8 h-8 text-white" /></div>
        <nav className="flex md:flex-col gap-10">
          <button onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-6 rounded-3xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 shadow-xl' : 'text-zinc-800 hover:text-white'}`}><Users /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-6 rounded-3xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 shadow-xl' : 'text-zinc-800 hover:text-white'}`}><BarChart3 /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-6 rounded-3xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 shadow-xl' : 'text-zinc-800 hover:text-white'}`}><BookOpen /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-6 text-zinc-800 hover:text-red-500"><LogOut /></button>
      </aside>

      <main className="flex-1 p-8 md:p-20 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <div>
            <span className="bg-red-600/10 text-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-red-600/20 mb-6 block w-fit">Bienvenido, {instructorName}</span>
            <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
              {selectedStudent ? 'EXPEDIENTE' : activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'LEADERBOARD' : 'BIBLIOTECA'}
            </h1>
          </div>
          {isAdmin && activeTab === 'alumnos' && !selectedStudent && (
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-12 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95">+ Nuevo Aspirante</button>
          )}
        </header>

        {/* VISTA DETALLE ALUMNO (Hacer click funciona) */}
        {selectedStudent ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-10 uppercase font-black text-[10px] tracking-widest transition-all"><ChevronLeft className="w-4 h-4" /> Volver al listado</button>
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="w-32 h-32 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-600/20"><User className="w-16 h-16 text-white" /></div>
              <div>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">{selectedStudent.name}</h2>
                <div className="flex gap-4">
                   <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">Estado: Operativo</span>
                   <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase italic">ID: {selectedStudent.id.slice(0,8)}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
               <div className="p-8 bg-zinc-950 rounded-[2rem] border border-zinc-800/50">
                  <h4 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Notas del Instructor</h4>
                  <p className="italic text-zinc-400">Sin observaciones registradas en este expediente.</p>
               </div>
               <div className="p-8 bg-zinc-950 rounded-[2rem] border border-zinc-800/50">
                  <h4 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Rendimiento Académico</h4>
                  <div className="h-2 w-full bg-zinc-900 rounded-full mt-4"><div className="h-full bg-red-600 w-1/3 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div></div>
               </div>
            </div>
          </div>
        ) : (
          /* VISTAS NORMALES */
          <>
            {activeTab === 'alumnos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {students.map(s => (
                  <div key={s.id} onClick={() => setSelectedStudent(s)} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] hover:border-red-600 transition-all group cursor-pointer shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-6 h-6 text-red-600" /></div>
                    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-8 shadow-inner"><User className="text-zinc-500 group-hover:text-white" /></div>
                    <h3 className="text-3xl font-black italic uppercase mb-2 tracking-tighter">{s.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest"><Activity className="w-4 h-4 text-green-500" /> Ver Expediente</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'recursos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resources.map(r => (
                  <div key={r.id} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] hover:border-blue-600 transition-all group shadow-xl">
                    <FileText className="w-12 h-12 text-blue-600 mb-8" />
                    <h3 className="text-3xl font-black italic uppercase mb-6 tracking-tighter">{r.title}</h3>
                    <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors tracking-widest bg-zinc-950 px-8 py-4 rounded-2xl border border-zinc-800 group-hover:bg-blue-600 group-hover:border-blue-500">Abrir Documento <ExternalLink className="w-4 h-4" /></a>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'progreso' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-12 shadow-2xl">
                <div className="space-y-6">
                  {students.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-8 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50 hover:border-red-600/30 transition-all">
                      <span className="text-4xl font-black italic text-zinc-800 w-16">#{i+1}</span>
                      <div className="flex-1">
                        <span className="text-2xl font-black uppercase italic tracking-tighter block mb-3">{s.name}</span>
                        <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden"><div className="bg-red-600 h-full shadow-[0_0_15px_rgba(220,38,38,0.4)]" style={{ width: '60%' }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* MODAL CREAR ALUMNO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[3rem] p-12 shadow-2xl">
              <div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black italic uppercase tracking-tighter">Alta de Aspirante</h2><button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X /></button></div>
              <form onSubmit={handleCreateStudent} className="space-y-8"><div className="space-y-3"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Nombre Completo</label><input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 transition-all font-bold text-white" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required autoFocus /></div><button type="submit" className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-600/20">Registrar</button></form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}