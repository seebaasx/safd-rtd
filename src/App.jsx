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

  // 1. Cargador de Supabase
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

  // 2. Control de Sesión Real
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchAllData(supabase);
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

  useEffect(() => {
    if (selectedStudent && supabase) {
      supabase.from('observations')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => setObservations(data || []));
    }
  }, [selectedStudent, supabase]);

  const instructorName = useMemo(() => session?.user?.email ? session.user.email.split('@')[0].toUpperCase() : "INVITADO", [session]);

  const updateStudentData = async (column, value) => {
    if (!supabase || !selectedStudent) return;
    let finalValue = value;
    if (selectedStudent[column] === value) finalValue = null; // Desmarcar

    const updatePayload = { [column]: finalValue };
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passInput });
    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      setSession(data.session);
      setHasEntered(true);
      fetchAllData();
    }
  };

  if (loading || !supabase) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-red-600 font-black text-2xl animate-pulse italic uppercase">Sincronizando Sistema...</div>;

  // PANTALLA DE LOGIN (Si no hay sesión)
  if (!session) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-12 backdrop-blur-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6 text-center">
            <Flame className="w-12 h-12 text-red-600 mx-auto mb-6" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-white">Identificación</h2>
            <input type="email" placeholder="EMAIL" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 font-bold text-white uppercase italic" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="CÓDIGO" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 font-bold text-white uppercase italic" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white">VERIFICAR</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-24 bg-[#09090b] border-r border-zinc-800/50 flex flex-col items-center py-10 h-screen sticky top-0">
        <div className="mb-16 bg-red-600 p-2.5 rounded-xl"><Flame className="w-6 h-6 text-white" /></div>
        <nav className="flex md:flex-col gap-8">
          <button onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-4 rounded-2xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 text-white' : 'text-zinc-600'}`}><Users /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-4 rounded-2xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 text-white' : 'text-zinc-600'}`}><BarChart3 /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-4 rounded-2xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 text-white' : 'text-zinc-600'}`}><BookOpen /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-4 text-zinc-800 hover:text-red-600"><LogOut /></button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20 mb-8 italic">BIENVENIDO, {instructorName}</div>
          <h1 className="text-8xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.75]">
             {selectedStudent ? 'EXPEDIENTE' : activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'LEADERBOARD' : 'BIBLIOTECA'}
          </h1>
        </header>

        {selectedStudent ? (
          <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            <button onClick={() => setSelectedStudent(null)} className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-12"><ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO</button>

            {/* SECCIÓN VOTACIÓN (Desmarcable) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10">
                  <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-6 italic">Aprobación Técnica</div>
                  <div className="flex justify-between items-end mb-4"><span className="text-4xl font-black italic uppercase tracking-tighter">{selectedStudent.name}</span><span className="text-red-600 font-black italic text-xl">43%</span></div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden"><div className="bg-red-600 h-full w-[43%] shadow-[0_0_15px_rgba(220,38,38,0.4)]"></div></div>
               </div>
               
               <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10">
                  <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-8 italic">Votación del Instructor</div>
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => updateStudentData('voto_instructor', 'apto')} className={`p-8 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${selectedStudent.voto_instructor === 'apto' ? 'bg-green-600/20 border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-zinc-950/50 border-zinc-800 text-zinc-700 hover:border-zinc-600'}`}>
                        <ThumbsUp className="w-6 h-6" /><span className="text-[9px] font-black uppercase">APTO</span>
                     </button>
                     <button onClick={() => updateStudentData('voto_instructor', 'no_apto')} className={`p-8 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${selectedStudent.voto_instructor === 'no_apto' ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-zinc-950/50 border-zinc-800 text-zinc-700 hover:border-zinc-600'}`}>
                        <ThumbsDown className="w-6 h-6" /><span className="text-[9px] font-black uppercase">NO APTO</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* MURO DE COMENTARIOS TÁCTICO */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10 border-t-4 border-t-red-600 shadow-2xl">
               <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic flex items-center gap-2"><MessageSquare className="w-4 h-4 text-red-600" /> Seguimiento Táctico</div>
               <div className="space-y-6 mb-12 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {observations.map(obs => (
                    <div key={obs.id} className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-8 relative shadow-lg group hover:border-red-600/30 transition-all">
                       <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4">
                          <div className="flex items-center gap-3"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div><span className="text-[10px] font-black italic uppercase tracking-tighter text-white">{obs.instructor_name}</span></div>
                          <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">5/5/2026</span>
                       </div>
                       <p className="pl-6 border-l-2 border-red-600/40 text-zinc-400 italic text-sm leading-relaxed tracking-tight">{obs.content}</p>
                    </div>
                  ))}
                  {observations.length === 0 && <div className="text-center py-20 text-zinc-800 text-[10px] font-black uppercase tracking-[0.5em] italic border border-dashed border-zinc-800 rounded-[2.5rem]">Expediente Limpio de Observaciones</div>}
               </div>
               <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-4 flex items-center gap-4 focus-within:border-red-600 transition-all shadow-inner">
                  <textarea value={newObs} onChange={e => setNewObs(e.target.value)} placeholder="Redactar seguimiento táctico..." className="bg-transparent flex-1 outline-none p-4 text-zinc-300 resize-none h-24 text-sm font-medium italic placeholder:text-zinc-800" />
                  <button onClick={sendObservation} className="bg-red-600 p-5 rounded-full shadow-lg shadow-red-600/40 hover:scale-110 active:scale-95 transition-all text-white"><Send className="w-6 h-6" /></button>
               </div>
            </div>
          </div>
        ) : (
          /* GRID DE SECCIONES */
          <div className="animate-in fade-in duration-700">
            {activeTab === 'alumnos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(s => (
                  <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3.5rem] hover:border-red-600 transition-all cursor-pointer relative shadow-xl overflow-hidden">
                    <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10 shadow-inner"><User className="text-zinc-600 group-hover:text-white" /></div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{s.name}</h3>
                    <div className="flex justify-between items-center"><p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] group-hover:text-red-500">{s.rango || 'Rango 0'}</p><ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-600" /></div>
                  </div>
                ))}
              </div>
            )}
            {/* ... Resto de pestañas (Leaderboard, Recursos) igual */}
          </div>
        )}
      </main>
    </div>
  );
}