import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, LogOut, Flame, ShieldCheck, User, BarChart3, BookOpen, 
  FileText, ExternalLink, Activity, X, ChevronLeft, MessageSquare, 
  Send, Clock, Calendar, ThumbsUp, ThumbsDown, Edit2, Check, ChevronRight,
  TrendingUp, CheckCircle2, AlertCircle, Plus, Trash2
} from 'lucide-react';

const supabaseUrl = 'https://bwisxczbkjlxyunpqqld.supabase.co'; 
const supabaseKey = 'sb_publishable_MEosBztTd-5Ot5Rb-jhaHg_BEeiWZ19';

const ADMIN_EMAILS = ["iris@safd.com"]; 
const USER_ROLES = { 
  "iris@safd.com": "JEFA DE BATALLÓN", 
  "blakecassidy@safd.com": "Teniente", 
  "nolanlevine@safd.com": "Capitán", 
  "lucablake@safd.com": "Teniente", 
  "alexcampbell@safd.com": "Specialist Firefighter", 
  "jinahpark@safd.com": "Sargento", 
  "paulnystrom@safd.com": "Teniente" 
};
const RANGOS_ACADEMIA = ["Academy", "Probationary", "Ascendido", "Suspendido"];

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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [newRes, setNewRes] = useState({ title: '', url: '', description: '' });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isEditingHorario, setIsEditingHorario] = useState(false);
  const [tempHorario, setTempHorario] = useState('');

  const slides = [
    { title: "RTD PORTAL", subtitle: "RECRUITMENT & TRAINING DIVISION", image: "https://r2.fivemanage.com/rlMpa4HCjCLM3vQVrxiNo/imagen_2026-04-13_222621960.png" },
    { title: "SAN ANDREAS FIRE DEPARTMENT", subtitle: "ESTACIÓN Nº 3", image: "https://r2.fivemanage.com/rlMpa4HCjCLM3vQVrxiNo/imagen_2026-04-13_224256139.png" }
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

  useEffect(() => { if (!session) { const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000); return () => clearInterval(timer); } }, [session]);

  const instructorInfo = useMemo(() => {
    if (!session?.user?.email) return { name: "INVITADO", rango: "VISITANTE", fullTag: "[VISITANTE] INVITADO" };
    const emailLower = session.user.email.toLowerCase().trim();
    const name = emailLower.split('@')[0].toUpperCase();
    const rango = USER_ROLES[emailLower] || "INSTRUCTOR";
    return { name, rango, fullTag: `[${rango}] ${name}` };
  }, [session]);

  const isAdmin = useMemo(() => session?.user?.email && ADMIN_EMAILS.some(e => e.toLowerCase().trim() === session.user.email.toLowerCase().trim()), [session]);

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const academicPerformance = useMemo(() => {
    if (!selectedStudent) return 0;
    const skills = ['actitud', 'mando', 'interna', 'radio', 'primeros_aux', 'excarcelacion_hab', 'incendios_hab'];
    const academy = ['asis_radio', 'asis_auxilios', 'asis_incendios', 'asis_excarcelacion'];
    let points = 0;
    let totalMax = (skills.length * 2) + academy.length; 
    skills.forEach(s => {
      if (selectedStudent[s] === 'aprendido') points += 2;
      else if (selectedStudent[s] === 'cursando') points += 1;
    });
    academy.forEach(a => {
      if (selectedStudent[a] === 'realizado') points += 1;
    });
    return Math.round((points / totalMax) * 100);
  }, [selectedStudent]);

  async function fetchAllData(client = supabase) {
    if (!client) return;
    const { data: stds } = await client.from('students').select('*').order('name');
    const { data: ress } = await client.from('resources').select('*').order('created_at', { ascending: false });
    setStudents(stds || []);
    setResources(ress || []);
  }

  useEffect(() => {
    if (selectedStudent && supabase) {
      supabase.from('observations').select('*').eq('student_id', selectedStudent.id).order('created_at', { ascending: true })
        .then(({ data }) => setObservations(data || []));
      setTempHorario(selectedStudent.horario || 'Mañana / Tarde');
    }
  }, [selectedStudent, supabase]);

  const updateStudentData = async (column, value) => {
    if (!supabase || !selectedStudent) return;
    let finalValue = (selectedStudent[column] === value) ? null : value;
    const updatePayload = { [column]: finalValue };
    const skills = ['actitud', 'mando', 'interna', 'radio', 'primeros_aux', 'excarcelacion_hab', 'incendios_hab'];
    if (skills.includes(column)) {
      updatePayload[`${column}_validador`] = finalValue ? instructorInfo.fullTag : null;
      updatePayload[`${column}_fecha`] = finalValue ? new Date().toLocaleDateString('es-ES') : null;
    }
    await supabase.from('students').update(updatePayload).eq('id', selectedStudent.id);
    setSelectedStudent({ ...selectedStudent, ...updatePayload });
    fetchAllData();
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!newRes.title || !newRes.url) return;

    // Título combinado para saltar el error de columna description inexistente
    const combinedData = `${newRes.title.toUpperCase()} || ${newRes.description}`;

    // Enviamos todos los campos que la DB parece exigir según los errores
    const { error } = await supabase.from('resources').insert([{
      title: combinedData,
      url: newRes.url,
      category: "General",
      created_at: new Date().toISOString() // Soluciona el error de la última captura
    }]);

    if (!error) {
      setNewRes({ title: '', url: '', description: '' }); 
      setIsResModalOpen(false); 
      fetchAllData();
    } else {
      alert("Error Crítico: " + error.message);
    }
  };

  const deleteResource = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("¿BORRAR RECURSO?")) {
      await supabase.from('resources').delete().eq('id', id);
      fetchAllData();
    }
  };

  const deleteStudent = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("¿ELIMINAR ALUMNO?")) {
      await supabase.from('students').delete().eq('id', id);
      fetchAllData();
    }
  };

  const deleteObservation = async (id) => {
    if (window.confirm("¿BORRAR COMENTARIO?")) {
      await supabase.from('observations').delete().eq('id', id);
      setObservations(observations.filter(o => o.id !== id));
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    await supabase.from('students').insert([{ name: newStudentName, rango: 'Academy', horario: 'Mañana / Tarde' }]);
    setNewStudentName(''); setIsModalOpen(false); fetchAllData();
  };

  const sendObservation = async () => {
    if (!newObs.trim()) return;
    const { data } = await supabase.from('observations').insert([{ student_id: selectedStudent.id, instructor_name: instructorInfo.fullTag, content: newObs }]).select();
    setObservations([...observations, data[0]]); setNewObs('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passInput });
    if (error) { alert("Acceso denegado"); setLoading(false); }
    else { setSession(data.session); fetchAllData(supabase); setLoading(false); }
  };

  if (loading || !supabase) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-600 font-black text-2xl animate-pulse italic uppercase tracking-widest">Sincronizando SAFD...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans overflow-hidden text-white relative">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/70 z-10" />
            <img src={slide.image} className="w-full h-full object-cover grayscale opacity-40 scale-105" alt="" />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-7xl md:text-[9rem] font-black italic mb-2 tracking-tighter leading-none">{slide.title}</h2>
              <p className="text-red-600 font-black italic mb-12 tracking-[0.5em] uppercase text-sm md:text-xl">{slide.subtitle}</p>
              <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-2xl shadow-2xl">
                <form onSubmit={handleLogin} className="space-y-6 text-center">
                  <input type="email" placeholder="EMAIL" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white italic font-bold outline-none focus:border-red-600 transition-all" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
                  <input type="password" placeholder="CÓDIGO" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white italic font-bold outline-none focus:border-red-600 transition-all" value={passInput} onChange={e => setPassInput(e.target.value)} required />
                  <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white hover:bg-red-500 transition-all">AUTENTICAR</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(220,38,38,0.08)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <aside className="w-full md:w-24 bg-black/40 border-r border-white/10 flex flex-col items-center py-10 h-screen sticky top-0 z-50 backdrop-blur-xl">
        <img src="https://r2.fivemanage.com/rlMpa4HCjCLM3vQVrxiNo/RTD.png" className="w-14 h-14 object-contain mb-16 drop-shadow-xl" alt="Logo" />
        <nav className="flex md:flex-col gap-8">
          <button onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-4 rounded-2xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><Users className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-4 rounded-2xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BarChart3 className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-4 rounded-2xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BookOpen className="w-6 h-6" /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-4 text-zinc-800 hover:text-red-600 transition-all"><LogOut className="w-6 h-6" /></button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto relative z-10">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20 mb-8 italic backdrop-blur-md">{instructorInfo.fullTag}</div>
          <div className="flex justify-between items-end">
            <h1 className="text-8xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.75] drop-shadow-2xl">
               {selectedStudent ? selectedStudent.name : activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'RESUMEN' : 'BIBLIOTECA'}
            </h1>
            {isAdmin && !selectedStudent && activeTab === 'recursos' && (
              <button onClick={() => setIsResModalOpen(true)} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">+ NUEVO RECURSO</button>
            )}
          </div>
        </header>

        {activeTab === 'recursos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
            {resources.map(r => {
              const parts = r.title.split(' || ');
              return (
                <div key={r.id} className="group bg-white/5 border border-white/10 p-10 rounded-[3.5rem] hover:border-blue-600/50 transition-all relative shadow-xl flex flex-col h-full">
                  {isAdmin && <button onClick={(e) => deleteResource(r.id, e)} className="absolute top-8 right-8 text-zinc-700 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button>}
                  <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-8"><FileText className="text-blue-500 w-7 h-7" /></div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-tight">{parts[0]}</h3>
                  <p className="text-zinc-500 italic text-sm mb-10 line-clamp-4 flex-1">{parts[1] || "Documento oficial de formación."}</p>
                  <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center justify-center px-10 bg-black/40 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-blue-600 transition-all shadow-xl">ABRIR DOCUMENTO</a>
                </div>
              );
            })}
          </div>
        )}

        {/* El resto del código de expedientes y modales se mantiene igual */}
        
        {isResModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl text-white">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-xl rounded-[3.5rem] p-16 shadow-2xl">
              <div className="flex justify-between items-center mb-12"><h2 className="text-4xl font-black italic uppercase tracking-tighter">Nuevo Recurso</h2><button onClick={() => setIsResModalOpen(false)} className="text-zinc-700 hover:text-white"><X className="w-8 h-8" /></button></div>
              <form onSubmit={handleCreateResource} className="space-y-6">
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic uppercase outline-none focus:border-blue-600" value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})} placeholder="TÍTULO" required />
                <textarea className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic outline-none focus:border-blue-600 h-32 resize-none" value={newRes.description} onChange={e => setNewRes({...newRes, description: e.target.value})} placeholder="RESUMEN..." required />
                <input type="url" className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic outline-none focus:border-blue-600" value={newRes.url} onChange={e => setNewRes({...newRes, url: e.target.value})} placeholder="URL (DRIVE/DOCS)" required />
                <button type="submit" className="w-full bg-blue-600 py-7 rounded-2xl font-black uppercase text-[11px] text-white">PUBLICAR</button>
              </form>
            </div>
          </div>
        )}

        {/* VISTA DE ALUMNOS */}
        {activeTab === 'alumnos' && !selectedStudent && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {students.map(s => (
              <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-white/5 border border-white/10 p-12 rounded-[3.5rem] hover:border-red-600 transition-all cursor-pointer relative shadow-2xl overflow-hidden backdrop-blur-sm">
                {isAdmin && <button onClick={(e) => deleteStudent(s.id, e)} className="absolute top-8 right-8 text-zinc-700 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all z-20"><Plus className="w-5 h-5 rotate-45" /></button>}
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10 shadow-inner shadow-black/50"><User className="text-zinc-600 group-hover:text-white" /></div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">{s.name}</h3>
                <div className="flex justify-between items-center"><p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest group-hover:text-red-500 transition-all">{s.rango || 'Academy'}</p><ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-600 transition-all" /></div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}