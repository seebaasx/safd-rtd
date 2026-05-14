import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, LogOut, Flame, ShieldCheck, User, BarChart3, BookOpen, 
  FileText, ExternalLink, Activity, X, ChevronLeft, MessageSquare, 
  Send, Clock, Calendar, ThumbsUp, ThumbsDown, Edit2, Check, ChevronRight,
  TrendingUp, CheckCircle2, AlertCircle, Plus, Trash2, FileJson, FileCode, 
  FileImage, File, Search, Filter, Tag
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bwisxczbkjlxyunpqqld.supabase.co'; 
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_MEosBztTd-5Ot5Rb-jhaHg_BEeiWZ19';

const RESOURCE_CATEGORIES = [
  { id: 'manuales', label: 'Manuales', color: 'blue' },
  { id: 'procedimientos', label: 'Procedimientos', color: 'purple' },
  { id: 'formatos', label: 'Formatos', color: 'green' },
  { id: 'entrenamientos', label: 'Entrenamientos', color: 'orange' }
];

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
  const [newRes, setNewRes] = useState({ title: '', description: '', url: '', category: 'manuales' });
  
  // Estados para edición de recursos
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isEditingHorario, setIsEditingHorario] = useState(false);
  const [tempHorario, setTempHorario] = useState('');
  
  // Búsqueda y filtros para biblioteca
  const [searchResource, setSearchResource] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');

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

  useEffect(() => { if (!session) { const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000); return () => clearInterval(timer); } }, [session, slides.length]);

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

  // Validar URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Obtener ícono según tipo de recurso
  const getResourceIcon = (url) => {
    if (!url) return FileText;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('docs.google') || lowerUrl.includes('.docx')) return FileText;
    if (lowerUrl.includes('sheets.google') || lowerUrl.includes('.xlsx')) return FileJson;
    if (lowerUrl.includes('pdf')) return FileCode;
    if (lowerUrl.includes('drive.google')) return File;
    return FileText;
  };

  async function fetchAllData(client = supabase) {
    if (!client) return;
    try {
      const { data: stds, error: stdErr } = await client.from('students').select('*').order('name');
      const { data: ress, error: resErr } = await client.from('resources').select('*').order('created_at', { ascending: false });
      
      if (stdErr) console.error('Error fetching students:', stdErr);
      if (resErr) console.error('Error fetching resources:', resErr);
      
      setStudents(stds || []);
      setResources(ress || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
    
    // 1. Validaciones iniciales
    if (!newRes.title || !newRes.url || !newRes.description) {
      alert("Todos los campos son requeridos");
      return;
    }
    
    if (!isValidUrl(newRes.url)) {
      alert("La URL no es válida");
      return;
    }
    
    try {
      // 2. Inserción en Supabase
      // NOTA: Usamos 'link' para coincidir con la columna de la tabla en Supabase
      const { error } = await supabase.from('resources').insert([{ 
        title: newRes.title, 
        description: newRes.description,
        link: newRes.url, // Mapear estado url a columna link
        category: newRes.category
      }]);
      
      if (!error) { 
        // 3. Limpieza y actualización tras éxito
        setNewRes({ title: '', url: '', description: '', category: 'manuales' }); 
        setIsResModalOpen(false); 
        fetchAllData(); 
        alert("✓ Recurso publicado con éxito");
      } else { 
        // Captura el error específico
        alert("Error de base de datos: " + error.message); 
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      alert("Error crítico al conectar con el servidor");
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    await supabase.from('students').insert([{ name: newStudentName, rango: 'Academy', horario: 'Mañana / Tarde' }]);
    setNewStudentName(''); setIsModalOpen(false); fetchAllData();
  };

  const deleteStudent = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("¿ELIMINAR ALUMNO?")) { await supabase.from('students').delete().eq('id', id); fetchAllData(); }
  };

  const deleteResource = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("¿ELIMINAR ESTE RECURSO?")) { 
      try {
        await supabase.from('resources').delete().eq('id', id); 
        fetchAllData();
        alert("✓ Recurso eliminado correctamente");
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert("Error al eliminar el recurso");
      }
    }
  };

  const openEditResource = (resource, e) => {
    e.stopPropagation();
    setNewRes({ 
      title: resource.title, 
      description: resource.description, 
      url: resource.link,  // El campo en BD es 'link'
      category: resource.category 
    });
    setEditingResourceId(resource.id);
    setIsEditingResource(true);
  };

  const handleEditResource = async (e) => {
    e.preventDefault();
    
    if (!newRes.title || !newRes.url || !newRes.description) {
      alert("Todos los campos son requeridos");
      return;
    }
    
    if (!isValidUrl(newRes.url)) {
      alert("La URL no es válida");
      return;
    }
    
    try {
      const { error } = await supabase.from('resources')
        .update({ 
          title: newRes.title, 
          description: newRes.description,
          link: newRes.url,
          category: newRes.category
        })
        .eq('id', editingResourceId);
      
      if (!error) { 
        setNewRes({ title: '', url: '', description: '', category: 'manuales' }); 
        setIsEditingResource(false);
        setEditingResourceId(null);
        fetchAllData(); 
        alert("✓ Recurso actualizado con éxito");
      } else { 
        alert("Error de base de datos: " + error.message); 
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      alert("Error crítico al conectar con el servidor");
    }
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

  if (loading || !supabase) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-600 font-black text-2xl animate-pulse italic uppercase tracking-widest">Sincronizando Sistema...</div>;

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
                  <input type="email" placeholder="EMAIL" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white italic font-bold outline-none focus:border-red-600" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
                  <input type="password" placeholder="CÓDIGO" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white italic font-bold outline-none focus:border-red-600" value={passInput} onChange={e => setPassInput(e.target.value)} required />
                  <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase text-[10px] text-white">AUTENTICAR</button>
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
          <button onClick={() => { setActiveTab('progreso'); setSelectedStudent(null); }} className={`p-4 rounded-2xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BarChart3 className="w-6 h-6" /></button>
          <button onClick={() => { setActiveTab('recursos'); setSelectedStudent(null); }} className={`p-4 rounded-2xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BookOpen className="w-6 h-6" /></button>
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
            {isAdmin && !selectedStudent && activeTab === 'alumnos' && (
              <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl">+ ALTA ASPIRANTE</button>
            )}
            {isAdmin && !selectedStudent && activeTab === 'recursos' && (
              <button onClick={() => setIsResModalOpen(true)} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">+ NUEVO RECURSO</button>
            )}
          </div>
        </header>

        {selectedStudent ? (
          /* --- DISEÑO EXPEDIENTE TÁCTICO RECONSTRUIDO --- */
          <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            <button onClick={() => setSelectedStudent(null)} className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-12 bg-white/5 px-6 py-3 rounded-xl border border-white/5 backdrop-blur-md shadow-lg transition-all"><ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO</button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl">
                  <div className="flex justify-between items-center mb-6"><div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest italic">Horarios</div><button onClick={() => isEditingHorario ? (updateStudentData('horario', tempHorario), setIsEditingHorario(false)) : setIsEditingHorario(true)}><Edit2 className="w-4 h-4 text-zinc-600" /></button></div>
                  {isEditingHorario ? <input className="bg-black/60 border border-white/10 text-white p-2 rounded w-full font-black uppercase outline-none focus:border-red-600" value={tempHorario} onChange={e => setTempHorario(e.target.value)} /> : <div className="text-xl font-black italic border-b border-zinc-800 pb-4 uppercase tracking-tighter">{selectedStudent.horario}</div>}
               </div>
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl">
                  <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-6">Rango Academia</div>
                  <select className="bg-black/40 border border-white/10 text-white p-3 rounded-xl w-full font-black italic uppercase outline-none focus:border-red-600 cursor-pointer" value={selectedStudent.rango || "Academy"} onChange={(e) => updateStudentData('rango', e.target.value)}>{RANGOS_ACADEMIA.map(r => <option key={r} value={r} className="bg-zinc-900">{r.toUpperCase()}</option>)}</select>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl">
                  <div className="flex justify-between items-center mb-6"><span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest italic">Rendimiento</span><span className="text-red-600 font-black italic text-xl">43%</span></div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden"><div className="bg-red-600 h-full w-[43%] shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div></div>
               </div>
            </div>

            {/* TABLA ASISTENCIA */}
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 border-t-4 border-t-green-600 backdrop-blur-md shadow-2xl">
              <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 flex items-center gap-2"><Calendar className="w-4 h-4 text-green-600" /> Días Academia</div>
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead><tr className="text-zinc-600 text-[9px] font-black uppercase tracking-widest italic"><th className="pb-4 text-left px-4">Módulo</th><th className="pb-4 text-right px-4">Estado de Sesión</th></tr></thead>
                <tbody className="text-[10px] font-black uppercase italic">
                  {[ { key: 'asis_radio', label: 'RADIO & DISPATCH' }, { key: 'asis_auxilios', label: 'PRIMEROS AUXILIOS' }, { key: 'asis_incendios', label: 'INCENDIOS' }, { key: 'asis_excarcelacion', label: 'EXCARCELACIÓN' } ].map(mod => (
                    <tr key={mod.key} className="bg-black/20"><td className="py-5 px-4 text-zinc-400 text-left">{mod.label}</td>
                      <td className="py-5 text-right px-4"><div className="flex justify-end gap-4">
                        <button onClick={() => updateStudentData(mod.key, 'realizado')} className={`px-6 py-2 rounded-xl border transition-all ${selectedStudent[mod.key] === 'realizado' ? 'bg-green-600 border-green-400 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>REALIZADO</button>
                        <button onClick={() => updateStudentData(mod.key, 'no_realizado')} className={`px-6 py-2 rounded-xl border transition-all ${selectedStudent[mod.key] === 'no_realizado' ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>NO REALIZADO</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* HABILIDADES */}
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-10 text-white/90">Habilidades de Campo</h2>
              {[ { key: 'actitud', label: 'ACTITUD' }, { key: 'mando', label: 'MANDO' }, { key: 'interna', label: 'BUEN USO DE INTERNA' }, { key: 'radio', label: 'COMUNICACIÓN POR RADIO' }, { key: 'primeros_aux', label: 'PRIMEROS AUXILIOS' }, { key: 'excarcelacion_hab', label: 'EXCARCELACIONES' }, { key: 'incendios_hab', label: 'INCENDIOS' }
              ].map((skill) => (
                <div key={skill.key} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between md:items-center gap-6 backdrop-blur-md shadow-xl hover:border-red-600/30 transition-all">
                  <div><div className="font-black italic text-xl uppercase mb-2 tracking-tighter">{skill.label}</div><div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">{selectedStudent[skill.key] && selectedStudent[skill.key] !== 'no' ? `FIRMADO: ${selectedStudent[`${skill.key}_validador`]} — ${selectedStudent[`${skill.key}_fecha`] || '5/5/2026'}` : 'Pte. Validación'}</div></div>
                  <div className="flex gap-2">{['no', 'cursando', 'aprendido'].map(status => (<button key={status} onClick={() => updateStudentData(skill.key, status)} className={`px-6 py-2 rounded-xl text-[9px] font-black transition-all ${selectedStudent[skill.key] === status ? (status === 'aprendido' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : status === 'cursando' ? 'bg-yellow-600 text-white shadow-lg' : 'bg-zinc-700 text-white') : 'bg-black/20 text-zinc-600'}`}>{status.toUpperCase()}</button>))}</div>
                </div>
              ))}
            </div>

            {/* VOTO Y REGISTRO SEGUIMIENTO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 border-t-4 border-t-blue-600 backdrop-blur-md h-fit shadow-2xl">
                  <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic">Estado Final</div>
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => updateStudentData('voto_instructor', 'apto')} className={`p-8 bg-black/40 border rounded-3xl transition-all flex flex-col items-center gap-2 group ${selectedStudent.voto_instructor === 'apto' ? 'border-green-600 bg-green-600/10' : 'border-white/10 hover:border-green-600'}`}><ThumbsUp className={`w-6 h-6 ${selectedStudent.voto_instructor === 'apto' ? 'text-green-500' : 'text-zinc-700 group-hover:text-green-500'}`} /><span className="text-[9px] font-black uppercase">APTO</span></button>
                     <button onClick={() => updateStudentData('voto_instructor', 'no_apto')} className={`p-8 bg-black/40 border rounded-3xl transition-all flex flex-col items-center gap-2 group ${selectedStudent.voto_instructor === 'no_apto' ? 'border-red-600 bg-red-600/10' : 'border-white/10 hover:border-red-600'}`}><ThumbsDown className={`w-6 h-6 ${selectedStudent.voto_instructor === 'no_apto' ? 'text-red-500' : 'text-zinc-700 group-hover:text-red-500'}`} /><span className="text-[9px] font-black uppercase">NO APTO</span></button>
                  </div>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 border-t-4 border-t-red-600 backdrop-blur-md shadow-2xl">
                  <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic flex items-center gap-2"><MessageSquare className="w-4 h-4 text-red-600" /> Registro Seguimiento</div>
                  <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                     {observations.map(obs => (
                       <div key={obs.id} className="bg-black/40 border border-white/5 rounded-3xl p-8 shadow-inner group relative">
                          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4"><div className="flex items-center gap-3 italic"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-md shadow-red-600/50"></div><span className="text-[10px] font-black text-white">{obs.instructor_name}</span></div><span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest italic">{formatDate(obs.created_at)}</span></div>
                          <p className="pl-6 border-l-2 border-red-600/40 text-zinc-400 italic text-sm leading-relaxed">{obs.content}</p>
                       </div>
                     ))}
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-[2.5rem] p-4 flex items-center gap-4 focus-within:border-red-600 transition-all shadow-inner">
                     <textarea value={newObs} onChange={e => setNewObs(e.target.value)} placeholder="Redactar seguimiento táctico..." className="bg-transparent flex-1 outline-none p-4 text-zinc-300 resize-none h-24 text-sm font-medium italic" />
                     <button onClick={sendObservation} className="bg-red-600 p-5 rounded-full shadow-lg shadow-red-600/40 hover:scale-110 active:scale-95 transition-all text-white"><Send className="w-6 h-6" /></button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          /* --- VISTA DE LISTADOS (ALUMNOS, RESUMEN, BIBLIOTECA) --- */
          <div className="animate-in fade-in duration-700">
            {activeTab === 'alumnos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {students.map(s => (
                  <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-white/5 border border-white/10 p-12 rounded-[3.5rem] hover:border-red-600 transition-all cursor-pointer relative shadow-2xl overflow-hidden backdrop-blur-sm">
                    {isAdmin && <button onClick={(e) => deleteStudent(s.id, e)} className="absolute top-8 right-8 text-zinc-700 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 z-20"><Plus className="w-5 h-5 rotate-45" /></button>}
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10 shadow-inner shadow-black/50"><User className="text-zinc-600 group-hover:text-white" /></div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">{s.name}</h3>
                    <div className="flex justify-between items-center"><p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest group-hover:text-red-500 transition-all">{s.rango || 'Academy'}</p><ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-600 transition-all" /></div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'progreso' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-md shadow-xl"><TrendingUp className="text-zinc-600 mb-6 w-8 h-8" /><div className="text-6xl font-black italic mb-2 tracking-tighter">{students.length}</div><div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Aspirantes</div></div>
                <div className="bg-white/5 border border-green-900/20 rounded-[2.5rem] p-10 backdrop-blur-md shadow-xl"><CheckCircle2 className="text-green-600 mb-6 w-8 h-8" /><div className="text-6xl font-black italic mb-2 tracking-tighter text-green-500">{students.filter(s => s.voto_instructor === 'apto').length}</div><div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Graduados</div></div>
                <div className="bg-white/5 border border-yellow-900/20 rounded-[2.5rem] p-10 backdrop-blur-md shadow-xl"><AlertCircle className="text-yellow-600 mb-6 w-8 h-8" /><div className="text-6xl font-black italic mb-2 tracking-tighter text-yellow-500">{students.filter(s => s.voto_instructor === null).length}</div><div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Evaluando</div></div>
              </div>
            )}

            {activeTab === 'recursos' && (
              <div className="space-y-12">
                {/* CONTROLES DE BÚSQUEDA Y FILTRO */}
                <div className="space-y-6">
                  {/* Buscador */}
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                    <input 
                      type="text" 
                      placeholder="Buscar recurso..." 
                      value={searchResource}
                      onChange={e => setSearchResource(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-14 text-white font-bold outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* Filtros por Categoría */}
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setFilterCategory('todos')}
                      className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filterCategory === 'todos' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'}`}
                    >
                      TODOS ({resources.length})
                    </button>
                    {RESOURCE_CATEGORIES.map(cat => {
                      const count = resources.filter(r => r.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setFilterCategory(cat.id)}
                          className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 ${filterCategory === cat.id ? `bg-${cat.color}-600 text-white shadow-lg` : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'}`}
                        >
                          <Tag className="w-3 h-3" />
                          {cat.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RECURSOS FILTRADOS */}
                {(() => {
                  const filtered = resources.filter(r => {
                    const matchSearch = r.title.toLowerCase().includes(searchResource.toLowerCase()) || 
                                       (r.description || '').toLowerCase().includes(searchResource.toLowerCase());
                    const matchCategory = filterCategory === 'todos' || r.category === filterCategory;
                    return matchSearch && matchCategory;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-24 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-sm">
                        <BookOpen className="w-16 h-16 text-zinc-700 mb-6" />
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">NO HAY RECURSOS</h3>
                        <p className="text-zinc-600 text-sm italic">
                          {searchResource || filterCategory !== 'todos' 
                            ? "No se encontraron resultados para tu búsqueda"
                            : "Comienza agregando documentos a la biblioteca"}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filtered.map(r => {
                        const Icon = getResourceIcon(r.link);
                        const category = RESOURCE_CATEGORIES.find(c => c.id === r.category);
                        const categoryColor = category ? category.color : 'blue';
                        
                        return (
                          <div key={r.id} className="group bg-white/5 border border-white/10 p-10 rounded-[3.5rem] hover:border-blue-600/50 transition-all relative shadow-xl flex flex-col h-full backdrop-blur-sm overflow-hidden">
                            {/* Edit & Delete Buttons */}
                            {isAdmin && (
                              <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                                <button 
                                  onClick={(e) => openEditResource(r, e)} 
                                  className="p-3 bg-blue-600/30 border border-blue-600/50 rounded-full text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                                  title="Editar recurso"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => deleteResource(r.id, e)} 
                                  className="p-3 bg-red-600/30 border border-red-600/50 rounded-full text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                                  title="Eliminar recurso"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            
                            {/* Gradient Background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${categoryColor}-600/10 blur-3xl -z-0 group-hover:bg-${categoryColor}-600/20 transition-all`} />
                            
                            {/* Content */}
                            <div className="relative z-10">
                              {/* Icon & Category */}
                              <div className="flex items-start justify-between mb-8">
                                <div className={`w-14 h-14 bg-${categoryColor}-600/20 rounded-2xl flex items-center justify-center`}>
                                  <Icon className={`text-${categoryColor}-500 w-7 h-7`} />
                                </div>
                                <span className={`px-3 py-1.5 bg-${categoryColor}-600/30 border border-${categoryColor}-600/50 rounded-full text-[8px] font-black uppercase tracking-widest text-${categoryColor}-400`}>
                                  {category?.label || 'Recurso'}
                                </span>
                              </div>
                              
                              {/* Title */}
                              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors">
                                {r.title}
                              </h3>
                              
                              {/* Description */}
                              <p className="text-zinc-500 italic text-sm mb-8 line-clamp-3 flex-1 group-hover:text-zinc-400 transition-colors">
                                {r.description || "Documento oficial SAFD"}
                              </p>
                              
                              {/* Meta Info */}
                              <div className="flex items-center gap-2 mb-8 text-[8px] font-black text-zinc-700 uppercase tracking-widest italic">
                                <Clock className="w-3 h-3" />
                                {formatDate(r.created_at)}
                              </div>
                              
                              {/* CTA Button */}
                              <a 
                                href={r.link}
                                target="_blank" 
                                rel="noreferrer" 
                                className={`inline-flex w-full h-14 items-center justify-center px-10 gap-3 bg-${categoryColor}-600/20 border border-${categoryColor}-600/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-${categoryColor}-400 hover:text-white hover:bg-${categoryColor}-600 hover:border-${categoryColor}-600 transition-all shadow-xl group/link`}
                              >
                                <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                ABRIR RECURSO
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* MODALES RECONSTRUIDOS */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-xl rounded-[3.5rem] p-16 shadow-2xl text-white">
              <div className="flex justify-between items-center mb-12"><h2 className="text-4xl font-black italic uppercase tracking-tighter">Alta Aspirante</h2><button onClick={() => setIsModalOpen(false)} className="text-zinc-700 hover:text-white"><X className="w-8 h-8" /></button></div>
              <form onSubmit={handleCreateStudent} className="space-y-10">
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-10 outline-none focus:border-red-600 font-black uppercase italic text-white text-xl" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="NOMBRE COMPLETO" required autoFocus />
                <button type="submit" className="w-full bg-red-600 py-7 rounded-2xl font-black uppercase text-[11px] text-white">REGISTRAR EN RTD</button>
              </form>
            </div>
          </div>
        )}

        {isResModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl text-white overflow-y-auto">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-16 shadow-2xl my-auto">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Nuevo Recurso</h2>
                <button onClick={() => setIsResModalOpen(false)} className="text-zinc-700 hover:text-white"><X className="w-8 h-8" /></button>
              </div>
              <form onSubmit={handleCreateResource} className="space-y-8">
                {/* Título */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">TÍTULO DEL RECURSO</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic uppercase outline-none focus:border-blue-600 transition-all" 
                    value={newRes.title} 
                    onChange={e => setNewRes({...newRes, title: e.target.value})} 
                    placeholder="Ej: MANUAL DE PROCEDIMIENTOS" 
                    required 
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">DESCRIPCIÓN / RESUMEN</label>
                  <textarea 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic outline-none focus:border-blue-600 h-32 resize-none transition-all" 
                    value={newRes.description} 
                    onChange={e => setNewRes({...newRes, description: e.target.value})} 
                    placeholder="Describe brevemente el contenido de este recurso..." 
                    required 
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">CATEGORÍA</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic uppercase outline-none focus:border-blue-600 cursor-pointer transition-all" 
                    value={newRes.category}
                    onChange={e => setNewRes({...newRes, category: e.target.value})}
                  >
                    {RESOURCE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.label.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">URL (DRIVE, DOCS, PDF, ETC)</label>
                  <input 
                    type="url" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic outline-none focus:border-blue-600 transition-all" 
                    value={newRes.url} 
                    onChange={e => setNewRes({...newRes, url: e.target.value})} 
                    placeholder="https://..." 
                    required 
                  />
                  <p className="text-[8px] text-zinc-600 italic mt-2">Ej: https://docs.google.com/... o https://drive.google.com/...</p>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-7 rounded-2xl font-black uppercase text-[11px] text-white transition-all shadow-lg shadow-blue-600/30 mt-10"
                >
                  ✓ PUBLICAR RECURSO
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDICIÓN DE RECURSO */}
        {isEditingResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl text-white overflow-y-auto">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-16 shadow-2xl my-auto">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Editar Recurso</h2>
                <button onClick={() => { setIsEditingResource(false); setEditingResourceId(null); setNewRes({ title: '', url: '', description: '', category: 'manuales' }); }} className="text-zinc-700 hover:text-white"><X className="w-8 h-8" /></button>
              </div>
              <form onSubmit={handleEditResource} className="space-y-8">
                {/* Título */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">TÍTULO DEL RECURSO</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic uppercase outline-none focus:border-blue-600 transition-all" 
                    value={newRes.title} 
                    onChange={e => setNewRes({...newRes, title: e.target.value})} 
                    placeholder="Ej: MANUAL DE PROCEDIMIENTOS" 
                    required 
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">DESCRIPCIÓN / RESUMEN</label>
                  <textarea 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic outline-none focus:border-blue-600 h-32 resize-none transition-all" 
                    value={newRes.description} 
                    onChange={e => setNewRes({...newRes, description: e.target.value})} 
                    placeholder="Describe brevemente el contenido de este recurso..." 
                    required 
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">CATEGORÍA</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic uppercase outline-none focus:border-blue-600 cursor-pointer transition-all" 
                    value={newRes.category}
                    onChange={e => setNewRes({...newRes, category: e.target.value})}
                  >
                    {RESOURCE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.label.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 italic">URL (DRIVE, DOCS, PDF, ETC)</label>
                  <input 
                    type="url" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white font-black italic outline-none focus:border-blue-600 transition-all" 
                    value={newRes.url} 
                    onChange={e => setNewRes({...newRes, url: e.target.value})} 
                    placeholder="https://..." 
                    required 
                  />
                  <p className="text-[8px] text-zinc-600 italic mt-2">Ej: https://docs.google.com/... o https://drive.google.com/...</p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-7 rounded-2xl font-black uppercase text-[11px] text-white transition-all shadow-lg shadow-blue-600/30 mt-10"
                  >
                    ✓ GUARDAR CAMBIOS
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsEditingResource(false); setEditingResourceId(null); setNewRes({ title: '', url: '', description: '', category: 'manuales' }); }}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-7 rounded-2xl font-black uppercase text-[11px] text-white transition-all shadow-lg mt-10"
                  >
                    ✕ CANCELAR
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}