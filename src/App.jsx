import React, { useState, useEffect, useMemo } from 'react';
import './index.css'; 
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, Plus, Trash2, Search, ChevronRight, Flame, 
  ShieldCheck, User, BarChart3, BookOpen, FileText, ExternalLink, 
  Activity, X, ChevronLeft, MoreHorizontal
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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const slides = [
    { title: "RTD PORTAL", subtitle: "RECRUITMENT & TRAINING DIVISION", image: "https://images.unsplash.com/photo-1582213700411-9faaa2b8b935?q=80&w=2070" },
    { title: "ACADEMY OPS", subtitle: "SISTEMA DE EVALUACIÓN TÁCTICA", image: "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?q=80&w=2070" }
  ];

  const isAdmin = useMemo(() => session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()), [session]);
  const instructorName = useMemo(() => session?.user?.email ? session.user.email.split('@')[0].toUpperCase() : "INVITADO", [session]);

  useEffect(() => {
    if (!hasEntered) {
      const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000);
      return () => clearInterval(timer);
    }
  }, [hasEntered]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setSession(session); setHasEntered(true); fetchAllData(); }
      setLoading(false);
    });
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

  // LANDING
  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans overflow-hidden text-white relative">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-zinc-950/60 z-10" />
            <img src={slide.image} className="w-full h-full object-cover grayscale opacity-40" alt="" />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-7xl md:text-[10rem] font-black italic mb-2 tracking-tighter leading-none">{slide.title}</h2>
              <p className="text-red-600 font-black italic mb-12 tracking-[0.5em] uppercase text-sm md:text-xl">{slide.subtitle}</p>
              <button onClick={() => setHasEntered(true)} className="bg-red-600 text-white px-16 py-6 rounded-full font-black uppercase text-xs tracking-widest hover:scale-110 transition-all">ACCEDER AL SISTEMA</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // LOGIN
  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-12 backdrop-blur-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6 text-center">
            <Flame className="w-12 h-12 text-red-600 mx-auto mb-6" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10">Identificación</h2>
            <input type="email" placeholder="EMAIL OPERATIVO" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 font-bold" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="CÓDIGO" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 font-bold" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px]">VERIFICAR CREDENCIALES</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row font-sans selection:bg-red-600/30">
      {/* SIDEBAR ORIGINAL CANVAS */}
      <aside className="w-full md:w-24 bg-[#09090b] border-r border-zinc-800/50 flex flex-col items-center py-10 h-screen sticky top-0 z-50">
        <div className="mb-16 bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-600/20 active:scale-90 transition-all cursor-pointer">
          <Flame className="w-6 h-6 text-white fill-current" />
        </div>
        <nav className="flex md:flex-col gap-8">
          <button onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-4 rounded-2xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><Users className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-4 rounded-2xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BarChart3 className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-4 rounded-2xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BookOpen className="w-6 h-6" /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-4 text-zinc-800 hover:text-red-600 transition-all"><LogOut className="w-6 h-6" /></button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20 mb-8">
            BIENVENIDO, {instructorName} {isAdmin && <ShieldCheck className="w-3.5 h-3.5 ml-1" />}
          </div>
          <div className="flex justify-between items-end">
            <h1 className="text-8xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.75]">
              {selectedStudent ? 'EXPEDIENTE' : activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'LEADERBOARD' : 'BIBLIOTECA'}
            </h1>
            {isAdmin && activeTab === 'alumnos' && !selectedStudent && (
              <button onClick={() => setIsModalOpen(true)} className="bg-white text-black h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all">+ NUEVO ASPIRANTE</button>
            )}
          </div>
        </header>

        {selectedStudent ? (
          /* VISTA DETALLE ORIGINAL CANVAS */
          <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10 backdrop-blur-sm">
            <button onClick={() => setSelectedStudent(null)} className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-[0.2em] mb-12 flex items-center gap-2 transition-all">
              <ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO
            </button>
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start border-b border-zinc-800/50 pb-16">
              <div className="w-36 h-36 bg-red-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-red-600/20"><User className="w-16 h-16 text-white" /></div>
              <div className="text-center md:text-left">
                <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-4">{selectedStudent.name}</h2>
                <div className="flex gap-4 justify-center md:justify-start">
                   <span className="bg-green-600/10 text-green-500 border border-green-500/20 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase">ESTADO: OPERATIVO</span>
                   <span className="bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase">ID: {selectedStudent.id.slice(0,8).toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
               <div className="p-10 bg-zinc-950/40 border border-zinc-800/40 rounded-[2.5rem]">
                  <h4 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-6">NOTAS DEL INSTRUCTOR</h4>
                  <p className="italic text-zinc-500 text-sm">Sin observaciones registradas en este expediente operativo.</p>
               </div>
               <div className="p-10 bg-zinc-950/40 border border-zinc-800/40 rounded-[2.5rem]">
                  <h4 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-6">RENDIMIENTO ACADÉMICO</h4>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full mt-2 overflow-hidden"><div className="h-full bg-red-600 w-1/3 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)]"></div></div>
               </div>
            </div>
          </div>
        ) : (
          /* VISTA GRID ORIGINAL CANVAS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'alumnos' && students.map(s => (
              <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3rem] hover:border-red-600/50 transition-all cursor-pointer relative overflow-hidden">
                <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10"><User className="text-zinc-600 group-hover:text-white w-6 h-6" /></div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{s.name}</h3>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-zinc-600 tracking-widest group-hover:text-red-500 transition-all">VER EXPEDIENTE <ChevronRight className="w-3.5 h-3.5" /></div>
              </div>
            ))}

            {activeTab === 'recursos' && resources.map(r => (
              <div key={r.id} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3rem] hover:border-blue-600/50 transition-all relative overflow-hidden">
                <FileText className="w-12 h-12 text-blue-600 mb-10" />
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 leading-tight">{r.title}</h3>
                <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center px-6 bg-zinc-950 border border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-blue-600 transition-all">ABRIR RECURSO</a>
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD ORIGINAL CANVAS */}
        {activeTab === 'progreso' && (
          <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] p-12 overflow-hidden shadow-2xl">
            <div className="space-y-4">
              {students.map((s, i) => (
                <div key={s.id} className="flex items-center gap-8 p-10 bg-zinc-950/30 rounded-[2.5rem] border border-zinc-800/30 hover:border-red-600/20 transition-all">
                  <span className="text-5xl font-black italic text-zinc-900 w-20 tracking-tighter">#{i+1}</span>
                  <div className="flex-1">
                    <span className="text-2xl font-black uppercase italic tracking-tighter block mb-4">{s.name}</span>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden"><div className="bg-red-600 h-full shadow-[0_0_20px_rgba(220,38,38,0.4)]" style={{ width: '45%' }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL ORIGINAL CANVAS */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <div className="bg-[#09090b] border border-zinc-800 w-full max-w-xl rounded-[3.5rem] p-16 shadow-2xl">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Alta de Aspirante</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-700 hover:text-white transition-all"><X className="w-8 h-8" /></button>
              </div>
              <form onSubmit={handleCreateStudent} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] ml-6">NOMBRE DEL EXPEDIENTE</label>
                  <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-6 px-10 outline-none focus:border-red-600 transition-all font-black uppercase italic text-white text-xl" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required autoFocus />
                </div>
                <button type="submit" className="w-full bg-red-600 py-7 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-red-600/20 active:scale-95 transition-all">REGISTRAR EN RTD</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}