import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, LogOut, Flame, ShieldCheck, User, BarChart3, BookOpen, 
  FileText, ExternalLink, Activity, X, ChevronLeft, MessageSquare, 
  Send, Clock, Calendar, ThumbsUp, ThumbsDown, Edit2, Check, ChevronRight,
  TrendingUp, CheckCircle2, AlertCircle
} from 'lucide-react';

const supabaseUrl = 'https://bwisxczbkjlxyunpqqld.supabase.co'; 
const supabaseKey = 'sb_publishable_MEosBztTd-5Ot5Rb-jhaHg_BEeiWZ19';

// --- CONFIGURACIÓN DE RANGOS DE USUARIOS (AQUÍ LOS PERSONALIZAS TÚ) ---
const USER_ROLES = {
  "iris@safd.com": "Jefa de batallón",
  "carlo@safd.com": "SARGENTO",
  "pedro@safd.com": "OFICIAL III",
  "juan@safd.com": "INSTRUCTOR",
  // Añade aquí todos los correos y el rango que quieras que tengan
};

const RANGOS_ACADEMIA = ["Rango 0", "Aspirante", "Bombero II", "Bombero I", "Oficial"];

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [observations, setObservations] = useState([]);
  const [newObs, setNewObs] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isEditingHorario, setIsEditingHorario] = useState(false);
  const [tempHorario, setTempHorario] = useState('');

  const slides = [
    { title: "RTD PORTAL", subtitle: "RECRUITMENT & TRAINING DIVISION", image: "https://images.unsplash.com/photo-1582213700411-9faaa2b8b935?q=80&w=2070" },
    { title: "ACADEMY OPS", subtitle: "SISTEMA DE EVALUACIÓN TÁCTICA", image: "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?q=80&w=2070" }
  ];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => {
      const client = window.supabase.createClient(supabaseUrl, supabaseKey);
      setSupabase(client);
      client.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        if (s) fetchAllData(client);
        setLoading(false);
      });
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!session) {
      const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000);
      return () => clearInterval(timer);
    }
  }, [session]);

  // --- LÓGICA DE IDENTIDAD PERSONALIZADA ---
  const instructorInfo = useMemo(() => {
    if (!session?.user?.email) return { name: "INVITADO", rango: "VISITANTE", fullTag: "[VISITANTE] INVITADO" };
    const email = session.user.email.toLowerCase();
    const name = email.split('@')[0].toUpperCase();
    const rango = USER_ROLES[email] || "INSTRUCTOR"; // Rango por defecto si no está en la lista
    return { name, rango, fullTag: `[${rango}] ${name}` };
  }, [session]);

  async function fetchAllData(client = supabase) {
    if (!client) return;
    const { data: stds } = await client.from('students').select('*').order('name');
    const { data: ress } = await client.from('resources').select('*');
    setStudents(stds || []);
    setResources(ress || []);
  }

  useEffect(() => {
    if (selectedStudent && supabase) {
      supabase.from('observations').select('*').eq('student_id', selectedStudent.id).order('created_at', { ascending: true })
        .then(({ data }) => setObservations(data || []));
    }
  }, [selectedStudent, supabase]);

  const stats = useMemo(() => {
    const total = students.length;
    const aptos = students.filter(s => s.voto_instructor === 'apto').length;
    const enCurso = students.filter(s => s.voto_instructor === null).length;
    return { total, aptos, enCurso };
  }, [students]);

  const updateStudentData = async (column, value) => {
    if (!supabase || !selectedStudent) return;
    let finalValue = (selectedStudent[column] === value) ? null : value;
    const updatePayload = { [column]: finalValue };
    
    const skills = ['actitud', 'mando', 'interna', 'radio', 'primeros_aux', 'excarcelacion_hab', 'incendios_hab'];
    if (skills.includes(column)) {
      updatePayload[`${column}_validador`] = finalValue ? instructorInfo.fullTag : null;
      updatePayload[`${column}_fecha`] = finalValue ? "5/5/2026" : null;
    }

    const { error } = await supabase.from('students').update(updatePayload).eq('id', selectedStudent.id);
    if (!error) { setSelectedStudent({ ...selectedStudent, ...updatePayload }); fetchAllData(); }
  };

  const sendObservation = async () => {
    if (!newObs.trim() || !supabase) return;
    const { data, error } = await supabase.from('observations').insert([
      { student_id: selectedStudent.id, instructor_name: instructorInfo.fullTag, content: newObs }
    ]).select();
    if (!error) { setObservations([...observations, data[0]]); setNewObs(''); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passInput });
    if (error) { alert("Acceso denegado"); setLoading(false); }
    else { setSession(data.session); fetchAllData(supabase); setLoading(false); }
  };

  if (loading || !supabase) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-red-600 font-black text-2xl animate-pulse italic uppercase">RTD_PROTOCOL_SYNC...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans overflow-hidden text-white relative">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-zinc-950/70 z-10" />
            <img src={slide.image} className="w-full h-full object-cover grayscale opacity-40 scale-105" alt="" />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-7xl md:text-[9rem] font-black italic mb-2 tracking-tighter leading-none">{slide.title}</h2>
              <p className="text-red-600 font-black italic mb-12 tracking-[0.5em] uppercase text-sm md:text-xl">{slide.subtitle}</p>
              <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-10 backdrop-blur-2xl shadow-2xl">
                <form onSubmit={handleLogin} className="space-y-6">
                  <input type="email" placeholder="EMAIL DE FACCIÓN" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-white uppercase italic font-bold outline-none focus:border-red-600" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
                  <input type="password" placeholder="CÓDIGO OPERATIVO" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-6 text-white uppercase italic font-bold outline-none focus:border-red-600" value={passInput} onChange={e => setPassInput(e.target.value)} required />
                  <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white">ACCEDER</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-24 bg-[#09090b] border-r border-zinc-800/50 flex flex-col items-center py-10 h-screen sticky top-0 z-50">
        <div className="mb-16 bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-600/20"><Flame className="w-6 h-6 text-white fill-current" /></div>
        <nav className="flex md:flex-col gap-8">
          <button disabled={!!selectedStudent} onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-4 rounded-2xl transition-all ${selectedStudent ? 'opacity-10' : 'hover:scale-110'} ${activeTab === 'alumnos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><Users /></button>
          <button disabled={!!selectedStudent} onClick={() => setActiveTab('progreso')} className={`p-4 rounded-2xl transition-all ${selectedStudent ? 'opacity-10' : 'hover:scale-110'} ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BarChart3 /></button>
          <button disabled={!!selectedStudent} onClick={() => setActiveTab('recursos')} className={`p-4 rounded-2xl transition-all ${selectedStudent ? 'opacity-10' : 'hover:scale-110'} ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BookOpen /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-4 text-zinc-800 hover:text-red-600"><LogOut /></button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20 mb-8 italic">
            OPERADOR: {instructorInfo.fullTag}
          </div>
          <h1 className="text-8xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.75]">
             {selectedStudent ? 'EXPEDIENTE' : activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'RESUMEN' : 'BIBLIOTECA'}
          </h1>
        </header>

        {selectedStudent ? (
          <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            <button onClick={() => setSelectedStudent(null)} className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-12 bg-zinc-900/50 px-6 py-3 rounded-xl border border-zinc-800 transition-all"><ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* MURO DE REGISTRO CON FIRMAS PERSONALIZADAS */}
               <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10 border-t-4 border-t-red-600 shadow-2xl">
                  <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic flex items-center gap-2"><MessageSquare className="w-4 h-4 text-red-600" /> Registro de Seguimiento</div>
                  <div className="space-y-6 mb-12 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                     {observations.map(obs => (
                       <div key={obs.id} className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-8 shadow-lg group hover:border-red-600/30 transition-all">
                          <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-4">
                             <div className="flex items-center gap-3 italic"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div><span className="text-[10px] font-black text-white">{obs.instructor_name}</span></div>
                             <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest italic">5/5/2026</span>
                          </div>
                          <p className="pl-6 border-l-2 border-red-600/40 text-zinc-400 italic text-sm leading-relaxed tracking-tight">{obs.content}</p>
                       </div>
                     ))}
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-4 flex items-center gap-4 shadow-inner shadow-black/50">
                     <textarea value={newObs} onChange={e => setNewObs(e.target.value)} placeholder="Redactar seguimiento táctico..." className="bg-transparent flex-1 outline-none p-4 text-zinc-300 resize-none h-24 text-sm font-medium italic" />
                     <button onClick={sendObservation} className="bg-red-600 p-5 rounded-full shadow-lg shadow-red-600/40 hover:scale-110 active:scale-95 transition-all text-white"><Send className="w-6 h-6" /></button>
                  </div>
               </div>

               {/* HABILIDADES CON VALIDACIÓN POR RANGO */}
               <div className="space-y-4">
                  {[ { key: 'actitud', label: 'ACTITUD' }, { key: 'mando', label: 'MANDO' }, { key: 'interna', label: 'BUEN USO DE INTERNA' } ].map((skill) => (
                    <div key={skill.key} className="bg-zinc-900/30 border border-zinc-800/60 p-8 rounded-[2rem] flex flex-col justify-between gap-4">
                      <div>
                        <div className="font-black italic text-xl uppercase tracking-tighter">{skill.label}</div>
                        <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">
                          {selectedStudent[skill.key] && selectedStudent[skill.key] !== 'no' 
                             ? `VALIDADO POR: ${selectedStudent[`${skill.key}_validador`]}` 
                             : 'Pte. de Validación Operativa'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {['no', 'cursando', 'aprendido'].map(status => (
                          <button key={status} onClick={() => updateStudentData(skill.key, status)} className={`flex-1 py-3 rounded-xl text-[9px] font-black transition-all ${selectedStudent[skill.key] === status ? (status === 'aprendido' ? 'bg-green-600 text-white' : status === 'cursando' ? 'bg-yellow-600 text-white' : 'bg-zinc-700 text-white') : 'bg-zinc-800/30 text-zinc-600 hover:bg-zinc-800'}`}>{status.toUpperCase()}</button>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          /* VISTAS DE RESUMEN Y LISTADO (Mismo diseño anterior) */
          <div className="animate-in fade-in duration-500">
            {activeTab === 'progreso' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10">
                    <TrendingUp className="text-zinc-600 mb-6 w-8 h-8" /><div className="text-6xl font-black italic mb-2 tracking-tighter">{stats.total}</div><div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-center">Aspirantes Activos</div>
                  </div>
                  <div className="bg-zinc-900/30 border border-green-900/30 rounded-[2.5rem] p-10">
                    <CheckCircle2 className="text-green-600 mb-6 w-8 h-8" /><div className="text-6xl font-black italic mb-2 tracking-tighter text-green-500">{stats.aptos}</div><div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-center">Graduados RTD</div>
                  </div>
                  <div className="bg-zinc-900/30 border border-yellow-900/30 rounded-[2.5rem] p-10">
                    <AlertCircle className="text-yellow-600 mb-6 w-8 h-8" /><div className="text-6xl font-black italic mb-2 tracking-tighter text-yellow-500">{stats.enCurso}</div><div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-center">En Evaluación</div>
                  </div>
                </div>
                {/* Tabla de Rendimiento igual que antes... */}
              </div>
            )}
            {activeTab === 'alumnos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(s => (
                  <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3.5rem] hover:border-red-600 transition-all cursor-pointer relative shadow-xl overflow-hidden">
                    <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10 shadow-inner"><User className="text-zinc-600 group-hover:text-white" /></div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{s.name}</h3>
                    <div className="flex justify-between items-center"><p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest group-hover:text-red-500 transition-all">{s.rango || 'Rango 0'}</p><ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-600 transition-all" /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}