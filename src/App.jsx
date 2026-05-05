import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, Plus, Trash2, Search, ChevronRight, Flame, 
  LogIn, LayoutDashboard, ShieldCheck, ChevronLeft, MessageSquare, 
  Send, User, Lock, BarChart3, Clock, Award, ChevronDown, 
  Activity, TrendingUp, BookOpen, FileText, ExternalLink, 
  ThumbsUp, ThumbsDown, UserCheck, Calendar 
} from 'lucide-react';

// --- CONFIGURACIÓN SUPABASE ---
// URL corregida con el protocolo https:// necesario para la conexión
const supabaseUrl = 'https://bwisxczbkjlxyunpqqld.supabase.co'; 
const supabaseKey = 'sb_publishable_MEosBztTd-5Ot5Rb-jhaHg_BEeiWZ19';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 🛡️ CONFIGURACIÓN DE PODERES ADMIN ---
// Se ha corregido la sintaxis de la variable y asignado el admin solicitado
const ADMIN_EMAILS = ["iris@safd.com"];

const skillsOrder = [
  "Actitud", "Mando", "Buen uso de interna", 
  "Comunicación por radio", "Primeros auxilios", 
  "Excarcelaciones", "Incendios"
];

const StatusBadge = ({ status }) => {
  const colors = {
    'Activo': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Suspendido': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Graduado': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'En Pruebas': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${colors[status] || 'bg-zinc-800 text-zinc-400'}`}>
      {status || 'Activo'}
    </span>
  );
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: "RTD PORTAL", subtitle: "RECRUITMENT & TRAINING DIVISION", image: "https://images.unsplash.com/photo-1582213700411-9faaa2b8b935?q=80&w=2070" },
    { title: "ACADEMY OPS", subtitle: "SISTEMA DE EVALUACIÓN TÁCTICA", image: "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?q=80&w=2070" }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { setHasEntered(true); fetchData(); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchData() {
    try {
      const { data: stds } = await supabase.from('students').select('*').order('name');
      const { data: ress } = await supabase.from('resources').select('*');
      if (stds) setStudents(stds);
      if (ress) setResources(ress);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  }

  const isAdmin = useMemo(() => session && ADMIN_EMAILS.includes(session.user.email), [session]);
  const instructorName = useMemo(() => session?.user.email.split('@')[0].toUpperCase(), [session]);
  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passInput });
    if (error) alert("Usuario o contraseña incorrectos");
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !isAdmin) return;
    const initialGoals = {};
    skillsOrder.forEach(s => initialGoals[s] = { status: 'no', date: '', instructor: '' });
    await supabase.from('students').insert([{ 
      name: newStudentName, goals: initialGoals, status: 'Activo',
      attendance: { "RADIO": {p:false,a:false,r:false}, "P. AUX": {p:false,a:false,r:false}, "INCENDIOS": {p:false,a:false,r:false}, "EXCARCEL.": {p:false,a:false,r:false} }
    }]);
    setNewStudentName(''); setIsAddingStudent(false); fetchData();
  };

  const updateStudent = async (id, updates) => {
    await supabase.from('students').update(updates).eq('id', id);
    fetchData();
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-black tracking-widest">SINCRO...</div>;

  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans overflow-hidden text-white">
        <nav className="fixed top-0 w-full z-50 px-12 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4"><Flame className="w-10 h-10 text-red-600" /><span className="text-2xl font-black italic">SAFD RTD</span></div>
          <button onClick={() => setHasEntered(true)} className="px-8 py-3 bg-red-600 rounded-full font-black uppercase text-xs hover:bg-red-500 transition-colors">Acceder</button>
        </nav>
        <div className="relative flex-1 flex items-center justify-center">
          {slides.map((slide, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-black/60 z-10" />
              <img src={slide.image} className="w-full h-full object-cover grayscale opacity-30" alt="" />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-6xl md:text-8xl font-black italic mb-4">{slide.title}</h2>
                <p className="text-zinc-400 italic mb-10 tracking-widest uppercase">{slide.subtitle}</p>
                <button onClick={() => setHasEntered(true)} className="bg-white text-black px-12 py-5 rounded-full font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-2xl">Abrir Sistema</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-10"><Flame className="w-12 h-12 text-red-600 mb-4" /><h1 className="text-3xl font-black italic">PORTAL SAFD</h1></div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Usuario (ej: iris@safd.com)" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 outline-none focus:border-red-600 transition-colors" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 outline-none focus:border-red-600 transition-colors" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95">Entrar</button>
            <button type="button" onClick={() => setHasEntered(false)} className="w-full text-zinc-600 text-[10px] uppercase font-black mt-4 hover:text-zinc-400 transition-colors">Volver al Inicio</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-28 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-10 z-50 sticky top-0 md:h-screen shadow-xl">
        <div className="mb-16 cursor-pointer" onClick={() => setSelectedStudentId(null)}><Flame className="w-12 h-12 text-red-600" /></div>
        <nav className="flex md:flex-col gap-10 flex-1">
          <button onClick={() => {setActiveTab('alumnos'); setSelectedStudentId(null);}} className={`p-5 rounded-2xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 text-white shadow-xl' : 'text-zinc-600 hover:text-white'}`}><Users className="w-6 h-6" /></button>
          <button onClick={() => {setActiveTab('progreso'); setSelectedStudentId(null);}} className={`p-5 rounded-2xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl' : 'text-zinc-600 hover:text-white'}`}><BarChart3 className="w-6 h-6" /></button>
          <button onClick={() => {setActiveTab('recursos'); setSelectedStudentId(null);}} className={`p-5 rounded-2xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl' : 'text-zinc-600 hover:text-white'}`}><BookOpen className="w-6 h-6" /></button>
        </nav>
        <button onClick={() => supabase.auth.signOut()} className="mt-auto p-5 text-zinc-700 hover:text-red-500 transition-all"><LogOut className="w-6 h-6" /></button>
      </aside>

      <main className="flex-1 overflow-y-auto px-6 py-12 md:px-16 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                {activeTab === 'alumnos' ? 'Expedientes' : activeTab === 'progreso' ? 'Estadísticas' : 'Biblioteca'}
            </h1>
            <p className="text-[10px] text-zinc-500 font-black uppercase mt-5 flex items-center gap-3">
              <Activity className="w-4 h-4 text-red-600 animate-pulse" /> 
              Operativo: <span className="text-white underline decoration-red-900 decoration-4">Inst. {instructorName}</span>
              {isAdmin && <span className="bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black ml-2 shadow-lg">ADMIN</span>}
            </p>
          </div>
          {activeTab === 'alumnos' && !selectedStudentId && isAdmin && (
            <button onClick={() => setIsAddingStudent(!isAddingStudent)} className="bg-white text-black hover:bg-red-600 hover:text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl">
              {isAddingStudent ? 'Volver' : 'Nuevo Aspirante'}
            </button>
          )}
        </div>

        {/* Aquí iría la lógica de renderizado de tablas/lista (Omitida por brevedad para centrarme en la configuración) */}
        
        <div className="fixed bottom-6 right-6 p-4 text-zinc-700 text-[10px] italic bg-zinc-950/80 rounded-lg">
            Sistema de Gestión de Personal SAFD v2.0 - Conexión Supabase Activa
        </div>
      </main>
    </div>
  );
}