import React, { useState, useEffect, useMemo } from 'react';
import './index.css'; 
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, Flame, ShieldCheck, User, BarChart3, BookOpen, 
  FileText, ExternalLink, Activity, X, ChevronLeft, MessageSquare, 
  Send, Clock, Calendar, ThumbsUp, ThumbsDown, ChevronRight
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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [observations, setObservations] = useState([]);
  const [newObs, setNewObs] = useState('');
  
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');

  const isAdmin = useMemo(() => session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()), [session]);
  const instructorName = useMemo(() => session?.user?.email ? session.user.email.split('@')[0].toUpperCase() : "INVITADO", [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setSession(session); setHasEntered(true); fetchAllData(); }
      setLoading(false);
    });
  }, []);

  // Carga inicial y actualización
  async function fetchAllData() {
    const { data: stds } = await supabase.from('students').select('*').order('name');
    if (stds) setStudents(stds);
  }

  // Cargar observaciones cuando se abre un alumno
  useEffect(() => {
    if (selectedStudent) {
      supabase.from('observations')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => setObservations(data || []));
    }
  }, [selectedStudent]);

  // FUNCIÓN PARA ACTUALIZAR HABILIDADES O ASISTENCIAS
  const updateStudentData = async (column, value) => {
    const today = new Date().toLocaleDateString();
    const updatePayload = { [column]: value };
    
    // Si es una habilidad, también guardamos quién y cuándo
    if (['actitud', 'mando', 'interna'].includes(column)) {
      updatePayload[`${column}_validador`] = instructorName;
      updatePayload[`${column}_fecha`] = today;
    }

    const { error } = await supabase.from('students').update(updatePayload).eq('id', selectedStudent.id);
    
    if (!error) {
      // Actualizamos el estado local para que se vea el cambio sin recargar
      setSelectedStudent(prev => ({ ...prev, ...updatePayload }));
      fetchAllData();
    }
  };

  // FUNCIÓN PARA ENVIAR OBSERVACIÓN
  const sendObservation = async () => {
    if (!newObs.trim()) return;
    const { data, error } = await supabase.from('observations').insert([
      { student_id: selectedStudent.id, instructor_name: instructorName, content: newObs }
    ]).select();

    if (!error) {
      setObservations([...observations, data[0]]);
      setNewObs('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passInput });
    if (error) alert(error.message);
    else { setSession(data.session); setHasEntered(true); fetchAllData(); }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-black text-2xl animate-pulse italic">SINCRO_SISTEMA...</div>;

  // --- INTERFAZ --- (Basada en tus capturas de Canvas)
  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <Flame className="w-24 h-24 text-red-600 mb-8 animate-pulse z-10" />
        <h1 className="text-9xl font-black italic tracking-tighter z-10 mb-12">SAFD <span className="text-red-600">RTD</span></h1>
        <button onClick={() => setHasEntered(true)} className="z-10 bg-white text-black px-16 py-6 rounded-full font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl">ENTRAR</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-12 backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-6 text-center">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10">Acceso SAFD</h2>
            <input type="email" placeholder="EMAIL" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 font-bold" value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
            <input type="password" placeholder="CÓDIGO" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-red-600 font-bold" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px]">VERIFICAR</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-24 bg-[#09090b] border-r border-zinc-800/50 flex flex-col items-center py-10 h-screen sticky top-0">
        <div className="mb-16 bg-red-600 p-2.5 rounded-xl"><Flame className="w-6 h-6 text-white fill-current" /></div>
        <nav className="flex md:flex-col gap-8">
          <button onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-4 rounded-2xl ${activeTab === 'alumnos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><Users className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-4 rounded-2xl ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BarChart3 className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-4 rounded-2xl ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BookOpen className="w-6 h-6" /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-4 text-zinc-800 hover:text-red-600 transition-all"><LogOut className="w-6 h-6" /></button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20 mb-8 italic">
            BIENVENIDO, {instructorName}
          </div>
          <h1 className="text-8xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.75]">
             {selectedStudent ? selectedStudent.name : 'EXPEDIENTES'}
          </h1>
        </header>

        {selectedStudent ? (
          <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setSelectedStudent(null)} className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-8 transition-all"><ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO</button>

            {/* SECCIÓN 1: HORARIOS Y APROBACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10">
                <div className="flex items-center gap-3 text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-6"><Clock className="w-4 h-4" /> Horarios de Formación</div>
                <div className="text-xl font-black italic border-b border-zinc-800 pb-4">{selectedStudent.horario}</div>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Aprobación Técnica</span>
                   <span className="text-red-600 font-black italic text-xl">43%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden"><div className="bg-red-600 h-full w-[43%] transition-all duration-1000 shadow-[0_0_15px_rgba(220,38,38,0.4)]"></div></div>
              </div>
            </div>

            {/* SECCIÓN 2: HABILIDADES DE CAMPO (DINÁMICO) */}
            <div>
              <div className="flex items-center gap-6 mb-10"><h2 className="text-4xl font-black italic uppercase tracking-tighter">Habilidades de Campo</h2><div className="h-px flex-1 bg-zinc-800/50"></div></div>
              <div className="space-y-4">
                {[
                  { key: 'actitud', label: 'ACTITUD' },
                  { key: 'mando', label: 'MANDO' },
                  { key: 'interna', label: 'BUEN USO DE INTERNA' }
                ].map((skill) => (
                  <div key={skill.key} className="bg-zinc-900/30 border border-zinc-800/60 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                      <div className="font-black italic text-xl uppercase mb-2">{skill.label}</div>
                      <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                        {selectedStudent[`${skill.key}_validador`] 
                          ? `Validado por: ${selectedStudent[`${skill.key}_validador`]} — ${selectedStudent[`${skill.key}_fecha`]}`
                          : 'Sin Evaluar'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {['no', 'cursando', 'aprendido'].map(status => (
                         <button 
                            key={status}
                            onClick={() => updateStudentData(skill.key, status)}
                            className={`px-6 py-2 rounded-xl text-[9px] font-black transition-all ${
                              selectedStudent[skill.key] === status 
                                ? (status === 'aprendido' ? 'bg-green-600 text-white' : status === 'cursando' ? 'bg-yellow-600 text-white' : 'bg-zinc-700 text-white')
                                : 'bg-zinc-800/30 text-zinc-600 hover:bg-zinc-800'
                            }`}
                         >
                           {status.toUpperCase()}
                         </button>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 3: DÍAS ACADEMIA (INTERACTIVO) */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10 border-t-4 border-t-green-600">
              <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 flex items-center gap-2"><Calendar className="w-4 h-4 text-green-600" /> Días Academia</div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                    <th className="pb-6 italic">Módulo</th>
                    <th className="pb-6 text-center">P</th><th className="pb-6 text-center">A</th><th className="pb-6 text-center">R</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-black uppercase">
                  {[
                    { key: 'asis_radio', label: 'RADIO & DISPATCH' },
                    { key: 'asis_auxilios', label: 'PRIMEROS AUXILIOS' },
                    { key: 'asis_incendios', label: 'INCENDIOS' },
                    { key: 'asis_excarcelacion', label: 'EXCARCELACIÓN' }
                  ].map(mod => (
                    <tr key={mod.key} className="border-t border-zinc-800/30">
                      <td className="py-5 text-zinc-400 italic">{mod.label}</td>
                      {['p', 'a', 'r'].map(type => (
                        <td key={type} className="py-5 text-center">
                          <button 
                            onClick={() => updateStudentData(mod.key, type)}
                            className={`w-5 h-5 rounded-md mx-auto border transition-all ${
                              selectedStudent[mod.key] === type 
                                ? (type === 'p' ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/30' : type === 'a' ? 'bg-red-500 border-red-400' : 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30')
                                : 'bg-zinc-900 border-zinc-800'
                            }`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECCIÓN 4: VOTACIÓN */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10 border-t-4 border-t-blue-600">
               <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic">Votación Instructores</div>
               {selectedStudent.voto_instructor && (
                 <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl mb-8 flex justify-between items-center">
                    <div className="text-[10px] font-black">{instructorName} — <span className="text-zinc-600 italic">{selectedStudent.voto_fecha}</span></div>
                    <div className={`px-4 py-1 rounded-full text-[8px] font-black ${selectedStudent.voto_instructor === 'apto' ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}>
                      {selectedStudent.voto_instructor.toUpperCase()}
                    </div>
                 </div>
               )}
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => updateStudentData('voto_instructor', 'apto')} className="flex flex-col items-center gap-2 p-8 bg-zinc-950/50 border border-zinc-800 rounded-3xl hover:border-green-600 group transition-all">
                    <ThumbsUp className="w-6 h-6 text-zinc-700 group-hover:text-green-500" /><span className="text-[9px] font-black text-zinc-700 group-hover:text-white uppercase">APTO</span>
                  </button>
                  <button onClick={() => updateStudentData('voto_instructor', 'no_apto')} className="flex flex-col items-center gap-2 p-8 bg-zinc-950/50 border border-zinc-800 rounded-3xl hover:border-red-600 group transition-all">
                    <ThumbsDown className="w-6 h-6 text-zinc-700 group-hover:text-red-500" /><span className="text-[9px] font-black text-zinc-700 group-hover:text-white uppercase">NO APTO</span>
                  </button>
               </div>
            </div>

            {/* SECCIÓN 5: OBSERVACIONES (CHAT REAL) */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10 border-t-4 border-t-red-600">
               <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic">Seguimiento Táctico</div>
               <div className="space-y-4 mb-10">
                  {observations.map(obs => (
                    <div key={obs.id} className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
                       <div className="flex justify-between items-center mb-4">
                          <div className="text-[10px] font-black italic flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div> {obs.instructor_name}</div>
                          <div className="text-[8px] text-zinc-700 uppercase">{new Date(obs.created_at).toLocaleString()}</div>
                       </div>
                       <div className="pl-4 border-l border-red-600/30 text-zinc-400 italic text-sm">{obs.content}</div>
                    </div>
                  ))}
               </div>
               <div className="bg-zinc-950/50 border border-zinc-800 rounded-[2.5rem] p-4 flex items-center gap-4 group focus-within:border-red-600 transition-all">
                  <textarea 
                    value={newObs}
                    onChange={(e) => setNewObs(e.target.value)}
                    placeholder="Redactar seguimiento táctico..." 
                    className="bg-transparent flex-1 outline-none p-4 text-zinc-300 resize-none h-24 text-sm"
                  ></textarea>
                  <button onClick={sendObservation} className="bg-red-600 p-4 rounded-full shadow-lg shadow-red-600/40 hover:scale-110 active:scale-95 transition-all"><Send className="w-5 h-5" /></button>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {students.map(s => (
              <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3rem] hover:border-red-600 transition-all cursor-pointer relative overflow-hidden">
                <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10"><User className="text-zinc-600 group-hover:text-white" /></div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{s.name}</h3>
                <div className="text-[9px] font-black text-zinc-600 tracking-[0.2em] group-hover:text-red-500 transition-all uppercase">Abrir Expediente</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}