import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, LogOut, Flame, ShieldCheck, User, BarChart3, BookOpen, 
  FileText, ExternalLink, Activity, X, ChevronLeft, MessageSquare, 
  Send, Clock, Calendar, ThumbsUp, ThumbsDown, Edit2, Check, ChevronRight
} from 'lucide-react';

const supabaseUrl = 'https://bwisxczbkjlxyunpqqld.supabase.co'; 
const supabaseKey = 'sb_publishable_MEosBztTd-5Ot5Rb-jhaHg_BEeiWZ19';
const ADMIN_EMAILS = ["iris@safd.com"];
const RANGOS = ["Rango 0", "Aspirante", "Bombero II", "Bombero I", "Oficial"];

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [observations, setObservations] = useState([]);
  const [newObs, setNewObs] = useState('');
  
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  // 1. Cargador dinámico de Supabase
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => {
      const client = window.supabase.createClient(supabaseUrl, supabaseKey);
      setSupabase(client);
    };
    document.body.appendChild(script);
  }, []);

  // 2. Auth y Sincronización
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) { setSession(s); setHasEntered(true); fetchAllData(supabase); }
      setLoading(false);
    });
  }, [supabase]);

  async function fetchAllData(client = supabase) {
    if (!client) return;
    const { data: stds } = await client.from('students').select('*').order('name');
    const { data: ress } = await client.from('resources').select('*');
    setStudents(stds || []);
    setResources(ress || []);
  }

  // Cargar comentarios visuales
  useEffect(() => {
    if (selectedStudent && supabase) {
      supabase.from('observations')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => setObservations(data || []));
    }
  }, [selectedStudent, supabase]);

  const isAdmin = useMemo(() => session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()), [session]);
  const instructorName = useMemo(() => session?.user?.email ? session.user.email.split('@')[0].toUpperCase() : "INVITADO", [session]);

  // FUNCIÓN PARA ACTUALIZAR Y DESMARCAR
  const updateStudentData = async (column, value) => {
    if (!supabase || !selectedStudent) return;
    let finalValue = value;
    
    // Si ya está marcado lo mismo, lo quitamos (Desmarcar)
    if (selectedStudent[column] === value) finalValue = null;

    const updatePayload = { [column]: finalValue };
    
    // Lógica de validador para habilidades
    const skills = ['actitud', 'mando', 'interna', 'radio', 'primeros_aux', 'excarcelacion_hab', 'incendios_hab'];
    if (skills.includes(column)) {
      updatePayload[`${column}_validador`] = finalValue ? instructorName : null;
      updatePayload[`${column}_fecha`] = finalValue ? "5/5/2026" : null;
    }
    
    // Si es voto, guardar fecha
    if (column === 'voto_instructor') updatePayload['voto_fecha'] = finalValue ? "5/5/2026" : null;

    const { error } = await supabase.from('students').update(updatePayload).eq('id', selectedStudent.id);
    if (!error) {
      setSelectedStudent({ ...selectedStudent, ...updatePayload });
      fetchAllData();
    }
  };

  const sendObservation = async () => {
    if (!newObs.trim() || !supabase) return;
    const { data, error } = await supabase.from('observations').insert([
      { student_id: selectedStudent.id, instructor_name: instructorName, content: newObs }
    ]).select();
    if (!error) { setObservations([...observations, data[0]]); setNewObs(''); }
  };

  if (loading || !supabase) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-red-600 font-black text-2xl animate-pulse italic uppercase">Sincronizando Sistema...</div>;

  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <Flame className="w-24 h-24 text-red-600 mb-8 animate-pulse" />
        <h1 className="text-9xl font-black italic mb-12 uppercase tracking-tighter">SAFD <span className="text-red-600">RTD</span></h1>
        <button onClick={() => setHasEntered(true)} className="bg-red-600 px-16 py-6 rounded-full font-black uppercase text-xs tracking-widest hover:scale-110 transition-all shadow-2xl shadow-red-600/20">ACCEDER AL PORTAL</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row font-sans">
      {/* SIDEBAR - CORREGIDO */}
      <aside className="w-full md:w-24 bg-[#09090b] border-r border-zinc-800/50 flex flex-col items-center py-10 h-screen sticky top-0 z-50">
        <div className="mb-16 bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-600/20"><Flame className="w-6 h-6 text-white" /></div>
        <nav className="flex md:flex-col gap-8">
          <button onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-4 rounded-2xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><Users className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-4 rounded-2xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BarChart3 className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-4 rounded-2xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BookOpen className="w-6 h-6" /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-4 text-zinc-800 hover:text-red-600"><LogOut className="w-6 h-6" /></button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20 mb-8 italic">BIENVENIDO, {instructorName}</div>
          <h1 className="text-8xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.75]">
             {selectedStudent ? 'EXPEDIENTE' : activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'LEADERBOARD' : 'BIBLIOTECA'}
          </h1>
        </header>

        {selectedStudent ? (
          /* VISTA DETALLE EXPEDIENTE */
          <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            <button onClick={() => setSelectedStudent(null)} className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-12"><ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO</button>

            {/* SECCIÓN EVALUACIÓN Y BOTONES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10">
                  <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-6 italic">Aprobación Técnica</div>
                  <div className="flex justify-between items-end mb-4"><span className="text-4xl font-black italic uppercase tracking-tighter">Justin Severide</span><span className="text-red-600 font-black italic text-xl">43%</span></div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden"><div className="bg-red-600 h-full w-[43%] shadow-[0_0_15px_rgba(220,38,38,0.4)]"></div></div>
               </div>
               
               <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10 flex flex-col justify-center">
                  <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-8 italic">Votación del Instructor</div>
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => updateStudentData('voto_instructor', 'apto')} className={`p-8 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${selectedStudent.voto_instructor === 'apto' ? 'bg-green-600/20 border-green-500 text-green-500' : 'bg-zinc-950/50 border-zinc-800 text-zinc-700 hover:border-zinc-600'}`}>
                        <ThumbsUp className="w-6 h-6" /><span className="text-[9px] font-black uppercase">APTO</span>
                     </button>
                     <button onClick={() => updateStudentData('voto_instructor', 'no_apto')} className={`p-8 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${selectedStudent.voto_instructor === 'no_apto' ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-zinc-950/50 border-zinc-800 text-zinc-700 hover:border-zinc-600'}`}>
                        <ThumbsDown className="w-6 h-6" /><span className="text-[9px] font-black uppercase">NO APTO</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* COMENTARIOS VISUALES (TIPO CHAT) */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10 border-t-4 border-t-red-600">
               <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic flex items-center gap-2"><MessageSquare className="w-4 h-4 text-red-600" /> Observaciones del Caso</div>
               <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {observations.map(obs => (
                    <div key={obs.id} className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-8 relative shadow-xl">
                       <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div><span className="text-[10px] font-black italic uppercase tracking-tighter">{obs.instructor_name}</span></div>
                          <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">5/5/2026</span>
                       </div>
                       <p className="pl-5 border-l-2 border-red-600/30 text-zinc-400 italic text-sm leading-relaxed">{obs.content}</p>
                    </div>
                  ))}
                  {observations.length === 0 && <div className="text-center py-12 text-zinc-700 text-[10px] font-black uppercase tracking-widest italic border border-dashed border-zinc-800 rounded-[2rem]">Sin registros tácticos en el expediente</div>}
               </div>
               <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-4 flex items-center gap-4 focus-within:border-red-600 transition-all shadow-inner shadow-black">
                  <textarea value={newObs} onChange={e => setNewObs(e.target.value)} placeholder="Redactar seguimiento táctico..." className="bg-transparent flex-1 outline-none p-4 text-zinc-300 resize-none h-24 text-sm font-medium italic" />
                  <button onClick={sendObservation} className="bg-red-600 p-5 rounded-full shadow-lg shadow-red-600/40 hover:scale-110 active:scale-95 transition-all text-white"><Send className="w-6 h-6" /></button>
               </div>
            </div>
          </div>
        ) : (
          /* VISTAS GRID SEGÚN PESTAÑA */
          <div className="animate-in fade-in duration-500">
            {activeTab === 'alumnos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(s => (
                  <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3.5rem] hover:border-red-600 transition-all cursor-pointer shadow-xl shadow-black/20 relative overflow-hidden">
                    <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10 shadow-inner"><User className="text-zinc-600 group-hover:text-white" /></div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{s.name}</h3>
                    <div className="flex justify-between items-center"><p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] group-hover:text-red-500">{s.rango || 'Rango 0'}</p><ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-600" /></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'progreso' && (
              <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] p-12">
                <div className="space-y-4">
                  {students.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-8 p-10 bg-zinc-950/30 rounded-[2.5rem] border border-zinc-800/30 hover:border-red-600/20 transition-all">
                      <span className="text-5xl font-black italic text-zinc-900 w-20 tracking-tighter">#{i+1}</span>
                      <div className="flex-1">
                        <span className="text-2xl font-black uppercase italic tracking-tighter block mb-4">{s.name}</span>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden"><div className="bg-red-600 h-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-1000" style={{ width: '45%' }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recursos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resources.map(r => (
                  <div key={r.id} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3rem] hover:border-blue-600/50 transition-all relative overflow-hidden">
                    <FileText className="w-12 h-12 text-blue-600 mb-10" />
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 leading-tight">{r.title}</h3>
                    <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center px-10 bg-zinc-950 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-blue-600 transition-all shadow-xl">ABRIR DOCUMENTO</a>
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