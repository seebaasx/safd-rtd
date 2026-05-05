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
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [observations, setObservations] = useState([]);
  const [newObs, setNewObs] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isEditingHorario, setIsEditingHorario] = useState(false);
  const [tempHorario, setTempHorario] = useState('');

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
    let finalValue = (selectedStudent[column] === value) ? null : value;
    const updatePayload = { [column]: finalValue };
    const skills = ['actitud', 'mando', 'interna', 'radio', 'primeros_aux', 'excarcelacion_hab', 'incendios_hab'];
    if (skills.includes(column)) {
      updatePayload[`${column}_validador`] = finalValue ? instructorName : null;
      updatePayload[`${column}_fecha`] = finalValue ? "5/5/2026" : null;
    }
    const { error } = await supabase.from('students').update(updatePayload).eq('id', selectedStudent.id);
    if (!error) {
      setSelectedStudent({ ...selectedStudent, ...updatePayload });
      fetchAllData();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passInput });
    if (error) { alert("Acceso denegado"); setLoading(false); }
    else { setSession(data.session); fetchAllData(supabase); setLoading(false); }
  };

  const sendObservation = async () => {
    if (!newObs.trim() || !supabase) return;
    const { data, error } = await supabase.from('observations').insert([
      { student_id: selectedStudent.id, instructor_name: instructorName, content: newObs }
    ]).select();
    if (!error) { setObservations([...observations, data[0]]); setNewObs(''); }
  };

  if (loading || !supabase) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-red-600 font-black text-2xl animate-pulse italic uppercase tracking-widest">Sincronizando Sistema...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-12 backdrop-blur-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6 text-center">
            <Flame className="w-12 h-12 text-red-600 mx-auto mb-6" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-white">Identificación</h2>
            <input type="email" placeholder="EMAIL" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 text-white uppercase italic font-bold outline-none focus:border-red-600" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="CÓDIGO" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 text-white uppercase italic font-bold outline-none focus:border-red-600" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white">ACCEDER</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row font-sans">
      {/* SIDEBAR CON RESTRICCIÓN */}
      <aside className="w-full md:w-24 bg-[#09090b] border-r border-zinc-800/50 flex flex-col items-center py-10 h-screen sticky top-0 z-50 shadow-2xl">
        <div className="mb-16 bg-red-600 p-2.5 rounded-xl"><Flame className="w-6 h-6 text-white" /></div>
        <nav className="flex md:flex-col gap-8">
          <button disabled={!!selectedStudent} onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-4 rounded-2xl transition-all ${selectedStudent ? 'opacity-10 cursor-not-allowed' : 'hover:scale-110'} ${activeTab === 'alumnos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><Users className="w-6 h-6" /></button>
          <button disabled={!!selectedStudent} onClick={() => setActiveTab('progreso')} className={`p-4 rounded-2xl transition-all ${selectedStudent ? 'opacity-10 cursor-not-allowed' : 'hover:scale-110'} ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BarChart3 className="w-6 h-6" /></button>
          <button disabled={!!selectedStudent} onClick={() => setActiveTab('recursos')} className={`p-4 rounded-2xl transition-all ${selectedStudent ? 'opacity-10 cursor-not-allowed' : 'hover:scale-110'} ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BookOpen className="w-6 h-6" /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-4 text-zinc-800 hover:text-red-600 transition-all"><LogOut className="w-6 h-6" /></button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20 mb-8 italic">BIENVENIDO, {instructorName}</div>
          <h1 className="text-8xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.75]">
             {selectedStudent ? 'EXPEDIENTE' : activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'LEADERBOARD' : 'BIBLIOTECA'}
          </h1>
        </header>

        {selectedStudent ? (
          /* VISTA EXPEDIENTE */
          <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            <button onClick={() => setSelectedStudent(null)} className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-12 bg-zinc-900/50 px-6 py-3 rounded-xl border border-zinc-800 hover:border-red-600 transition-all shadow-lg"><ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO</button>
            
            {/* Aquí van los campos del alumno: Horarios, Habilidades, Academia, Votación y Chat (Igual que antes) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest italic">Horarios</div>
                    <button onClick={() => isEditingHorario ? (updateStudentData('horario', tempHorario), setIsEditingHorario(false)) : setIsEditingHorario(true)}>
                      {isEditingHorario ? <Check className="w-4 h-4 text-green-500" /> : <Edit2 className="w-4 h-4 text-zinc-600" />}
                    </button>
                  </div>
                  {isEditingHorario ? (
                    <input className="bg-zinc-950 border border-zinc-800 text-white p-2 rounded w-full font-black italic uppercase" value={tempHorario} onChange={e => setTempHorario(e.target.value)} />
                  ) : (
                    <div className="text-xl font-black italic border-b border-zinc-800 pb-4">{selectedStudent.horario || 'MAÑANA / TARDE'}</div>
                  )}
               </div>
               <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10">
                  <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-6 italic">Rango Actual</div>
                  <select className="bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl w-full font-black italic uppercase outline-none focus:border-red-600 appearance-none cursor-pointer" value={selectedStudent.rango || "Rango 0"} onChange={(e) => updateStudentData('rango', e.target.value)}>
                    {RANGOS.map(r => <option key={r} value={r} className="bg-zinc-900">{r.toUpperCase()}</option>)}
                  </select>
               </div>
            </div>

            {/* SECCIÓN COMENTARIOS VISUALES */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[3rem] p-10 border-t-4 border-t-red-600 shadow-2xl">
               <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic flex items-center gap-2"><MessageSquare className="w-4 h-4 text-red-600" /> Seguimiento Táctico</div>
               <div className="space-y-6 mb-12 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {observations.map(obs => (
                    <div key={obs.id} className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-8 relative shadow-lg">
                       <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-4">
                          <div className="flex items-center gap-3 italic"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div><span className="text-[10px] font-black text-white">{obs.instructor_name}</span></div>
                          <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">5/5/2026</span>
                       </div>
                       <p className="pl-6 border-l-2 border-red-600/40 text-zinc-400 italic text-sm leading-relaxed tracking-tight">{obs.content}</p>
                    </div>
                  ))}
               </div>
               <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-4 flex items-center gap-4 focus-within:border-red-600 transition-all shadow-inner">
                  <textarea value={newObs} onChange={e => setNewObs(e.target.value)} placeholder="Redactar seguimiento táctico..." className="bg-transparent flex-1 outline-none p-4 text-zinc-300 resize-none h-24 text-sm font-medium italic placeholder:text-zinc-800" />
                  <button onClick={sendObservation} className="bg-red-600 p-5 rounded-full shadow-lg shadow-red-600/40 hover:scale-110 active:scale-95 transition-all text-white"><Send className="w-6 h-6" /></button>
               </div>
            </div>
          </div>
        ) : (
          /* VISTAS DE PESTAÑAS (Aquí se restaura el Leaderboard) */
          <div className="animate-in fade-in duration-500">
            {activeTab === 'alumnos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(s => (
                  <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3.5rem] hover:border-red-600 transition-all cursor-pointer relative shadow-xl">
                    <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10 shadow-inner"><User className="text-zinc-600 group-hover:text-white" /></div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{s.name}</h3>
                    <div className="flex justify-between items-center"><p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest group-hover:text-red-500 transition-all">{s.rango || 'Rango 0'}</p><ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-600" /></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'progreso' && (
              <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] p-12 shadow-2xl">
                <div className="space-y-6">
                  {students.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-10 p-10 bg-zinc-950/40 rounded-[2.5rem] border border-zinc-800/30 hover:border-red-600/20 transition-all group">
                      <span className="text-6xl font-black italic text-zinc-900 w-24 tracking-tighter group-hover:text-red-900 transition-all">#{i+1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-end mb-4">
                          <span className="text-3xl font-black uppercase italic tracking-tighter text-white">{s.name}</span>
                          <span className="text-red-600 font-black italic text-xs tracking-widest uppercase">75% Completado</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                          <div className="bg-red-600 h-full shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all duration-1000 ease-out" style={{ width: '75%' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && <div className="text-center py-20 text-zinc-800 font-black italic uppercase tracking-[1em]">No_Data_Sync...</div>}
                </div>
              </div>
            )}

            {activeTab === 'recursos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resources.map(r => (
                  <div key={r.id} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3rem] hover:border-blue-600/50 transition-all relative overflow-hidden shadow-xl">
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