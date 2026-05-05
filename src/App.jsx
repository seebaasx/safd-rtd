import React, { useState, useEffect, useMemo } from 'react';
import './index.css'; 
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, Flame, ShieldCheck, User, BarChart3, BookOpen, 
  FileText, ExternalLink, Activity, X, ChevronLeft, MessageSquare, 
  Send, Clock, Calendar, ThumbsUp, ThumbsDown, Edit2, Check, ChevronRight
} from 'lucide-react';

const supabaseUrl = 'https://bwisxczbkjlxyunpqqld.supabase.co'; 
const supabaseKey = 'sb_publishable_MEosBztTd-5Ot5Rb-jhaHg_BEeiWZ19';
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAILS = ["iris@safd.com"];
const RANGOS_DISPONIBLES = ["Rango 0", "Aspirante", "Bombero II", "Bombero I", "Oficial"];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [observations, setObservations] = useState([]);
  const [newObs, setNewObs] = useState('');
  
  const [isEditingHorario, setIsEditingHorario] = useState(false);
  const [tempHorario, setTempHorario] = useState('');

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

  async function fetchAllData() {
    const { data: stds } = await supabase.from('students').select('*').order('name');
    if (stds) setStudents(stds);
  }

  useEffect(() => {
    if (selectedStudent) {
      supabase.from('observations')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => setObservations(data || []));
      setTempHorario(selectedStudent.horario || 'Mañana / Tarde');
    }
  }, [selectedStudent]);

  const updateStudentData = async (column, value) => {
    const today = "5/5/2026"; 
    let finalValue = value;
    const updatePayload = {};

    // Lógica de desmarcado: Si vuelves a pulsar lo que ya está marcado, vuelve a 'no'
    if (selectedStudent[column] === value) {
      finalValue = 'no';
    }

    updatePayload[column] = finalValue;
    
    // Manejo de validadores
    const skillKeys = ['actitud', 'mando', 'interna', 'radio', 'primeros_aux', 'excarcelacion_hab', 'incendios_hab'];
    if (skillKeys.includes(column)) {
      if (finalValue === 'no') {
        updatePayload[`${column}_validador`] = null;
        updatePayload[`${column}_fecha`] = null;
      } else {
        updatePayload[`${column}_validador`] = instructorName;
        updatePayload[`${column}_fecha`] = today;
      }
    }

    const { error } = await supabase.from('students').update(updatePayload).eq('id', selectedStudent.id);
    if (!error) {
      setSelectedStudent(prev => ({ ...prev, ...updatePayload }));
      fetchAllData();
    }
  };

  const sendObservation = async () => {
    if (!newObs.trim()) return;
    const { data, error } = await supabase.from('observations').insert([
      { student_id: selectedStudent.id, instructor_name: instructorName, content: newObs }
    ]).select();
    if (!error) { setObservations([...observations, data[0]]); setNewObs(''); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passInput });
    if (error) alert(error.message);
    else { setSession(data.session); setHasEntered(true); fetchAllData(); }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-black text-2xl animate-pulse italic">SINCRO_SISTEMA...</div>;

  if (!hasEntered && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6">
        <Flame className="w-24 h-24 text-red-600 mb-8 animate-pulse" />
        <h1 className="text-8xl font-black italic tracking-tighter mb-12 uppercase">SAFD <span className="text-red-600">RTD</span></h1>
        <button onClick={() => setHasEntered(true)} className="bg-red-600 text-white px-16 py-6 rounded-full font-black uppercase text-xs tracking-widest hover:scale-110 transition-all">ENTRAR</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-12 backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-6 text-center">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10">Identificación</h2>
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
          <button onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-4 rounded-2xl ${activeTab === 'alumnos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600'}`}><Users className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('progreso')} className={`p-4 rounded-2xl ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600'}`}><BarChart3 className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('recursos')} className={`p-4 rounded-2xl ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600'}`}><BookOpen className="w-6 h-6" /></button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); window.localStorage.clear(); window.location.reload(); }} className="mt-auto p-4 text-zinc-800 hover:text-red-600 transition-all"><LogOut className="w-6 h-6" /></button>
      </aside>

      <main className="flex-1 p-6 md:p-16 overflow-y-auto">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20 mb-8 italic">BIENVENIDO, {instructorName}</div>
          <h1 className="text-8xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.75]">
             {selectedStudent ? selectedStudent.name : 'EXPEDIENTES'}
          </h1>
        </header>

        {selectedStudent ? (
          <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setSelectedStudent(null)} className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 mb-8 transition-all"><ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO</button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3 text-zinc-600 text-[9px] font-black uppercase tracking-widest"><Clock className="w-4 h-4" /> Horarios de Formación</div>
                  {isAdmin && (
                    <button onClick={() => isEditingHorario ? (updateStudentData('horario', tempHorario), setIsEditingHorario(false)) : setIsEditingHorario(true)}>
                      {isEditingHorario ? <Check className="w-4 h-4 text-green-500" /> : <Edit2 className="w-4 h-4 text-zinc-500" />}
                    </button>
                  )}
                </div>
                {isEditingHorario ? (
                  <input className="bg-zinc-950 border border-zinc-800 text-white p-2 rounded w-full font-black italic uppercase" value={tempHorario} onChange={e => setTempHorario(e.target.value)} />
                ) : (
                  <div className="text-xl font-black italic border-b border-zinc-800 pb-4">{selectedStudent.horario || 'MAÑANA / TARDE'}</div>
                )}
              </div>
              
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10">
                <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-6">Rango de Aspirante</div>
                <select 
                  className="bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl w-full font-black italic uppercase outline-none focus:border-red-600"
                  value={selectedStudent.rango || "Rango 0"}
                  onChange={(e) => updateStudentData('rango', e.target.value)}
                >
                  {RANGOS_DISPONIBLES.map(r => <option key={r} value={r} className="bg-zinc-900">{r.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-6 mb-10"><h2 className="text-4xl font-black italic uppercase tracking-tighter">Habilidades de Campo</h2><div className="h-px flex-1 bg-zinc-800/50"></div></div>
              <div className="space-y-4">
                {[
                  { key: 'actitud', label: 'ACTITUD' },
                  { key: 'mando', label: 'MANDO' },
                  { key: 'interna', label: 'BUEN USO DE INTERNA' },
                  { key: 'radio', label: 'COMUNICACIÓN POR RADIO' },
                  { key: 'primeros_aux', label: 'PRIMEROS AUXILIOS' },
                  { key: 'excarcelacion_hab', label: 'EXCARCELACIONES' },
                  { key: 'incendios_hab', label: 'INCENDIOS' }
                ].map((skill) => (
                  <div key={skill.key} className="bg-zinc-900/30 border border-zinc-800/60 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                      <div className="font-black italic text-xl uppercase mb-2">{skill.label}</div>
                      <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                        {selectedStudent[skill.key] !== 'no' && selectedStudent[`${skill.key}_validador`] 
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

            {/* SECCIÓN ASISTENCIA */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10 border-t-4 border-t-green-600">
              <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 flex items-center gap-2"><Calendar className="w-4 h-4 text-green-600" /> Días Academia</div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                    <th className="pb-6 italic">Módulo</th><th className="pb-6 text-center">P</th><th className="pb-6 text-center">A</th><th className="pb-6 text-center">R</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-black uppercase italic">
                  {[
                    { key: 'asis_radio', label: 'RADIO & DISPATCH' },
                    { key: 'asis_auxilios', label: 'PRIMEROS AUXILIOS' },
                    { key: 'asis_incendios', label: 'INCENDIOS' },
                    { key: 'asis_excarcelacion', label: 'EXCARCELACIÓN' }
                  ].map(mod => (
                    <tr key={mod.key} className="border-t border-zinc-800/30">
                      <td className="py-5 text-zinc-400">{mod.label}</td>
                      {['p', 'a', 'r'].map(type => (
                        <td key={type} className="py-5 text-center">
                          <button onClick={() => updateStudentData(mod.key, type)} className={`w-5 h-5 rounded-md mx-auto border transition-all ${selectedStudent[mod.key] === type ? (type === 'p' ? 'bg-green-500 border-green-400' : type === 'a' ? 'bg-red-500 border-red-400' : 'bg-blue-600 border-blue-400') : 'bg-zinc-900 border-zinc-800'}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECCIÓN VOTACIÓN */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10 border-t-4 border-t-blue-600">
               <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic">Votación Instructores</div>
               {selectedStudent.voto_instructor && (
                 <div className="bg-green-950/20 border border-green-900/30 p-6 rounded-2xl mb-8 flex justify-between items-center">
                    <div className="text-[10px] font-black">{instructorName} — <span className="text-zinc-600 italic">5/5/2026</span></div>
                    <div className="px-4 py-1 rounded-full text-[8px] font-black uppercase bg-green-900/40 text-green-500 border border-green-600/20">APTO</div>
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

            {/* OBSERVACIONES */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-10 border-t-4 border-t-red-600">
               <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic flex items-center gap-2"><MessageSquare className="w-4 h-4 text-red-600" /> Observaciones</div>
               <div className="space-y-4 mb-10">
                  {observations.map(obs => (
                    <div key={obs.id} className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
                       <div className="flex justify-between items-center mb-4 text-[10px] font-black italic">
                          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div> {obs.instructor_name}</div>
                          <div className="text-zinc-700">5/5/2026</div>
                       </div>
                       <div className="pl-4 border-l border-red-600/40 text-zinc-400 italic text-sm">{obs.content}</div>
                    </div>
                  ))}
               </div>
               <div className="bg-zinc-950/50 border border-zinc-800 rounded-[2.5rem] p-4 flex items-center gap-4 focus-within:border-red-600 transition-all">
                  <textarea value={newObs} onChange={e => setNewObs(e.target.value)} placeholder="Redactar seguimiento táctico..." className="bg-transparent flex-1 outline-none p-4 text-zinc-300 resize-none h-24 text-sm" />
                  <button onClick={sendObservation} className="bg-red-600 p-4 rounded-full shadow-lg shadow-red-600/40 hover:scale-110 active:scale-95 transition-all"><Send className="w-5 h-5 text-white" /></button>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {students.map(s => (
              <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-zinc-900/20 border border-zinc-800/40 p-10 rounded-[3rem] hover:border-red-600 transition-all cursor-pointer relative">
                <div className="w-14 h-14 bg-zinc-800/50 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10 shadow-inner shadow-black/50"><User className="text-zinc-600 group-hover:text-white w-6 h-6" /></div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{s.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest group-hover:text-red-500">{s.rango || 'Rango 0'}</p>
                  <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}