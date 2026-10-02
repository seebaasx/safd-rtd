import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
const INGRESO_TIPOS = [
  { id: 'academia', label: 'Miembros de Academia' },
  { id: 'traslado', label: 'Miembros de Traslado' }
];
const INTERVIEW_QUESTION_BANK = [
  {
    category: 'Para conocer al candidato',
    questions: [
      { id: 'presentacion', text: 'Presentación: edad, de dónde viene y objetivos en el cuerpo.' },
      { id: 'licencias', text: '¿Posee las licencias de coche y camión vigentes?' },
      { id: 'adaptacion-veteranos', text: 'Como comprobarás próximamente, vas a ser uno de los bomberos novatos en una estación con veteranos de muchos años de experiencia. ¿Cómo piensas adaptarte a su dinámica y qué harás para ganarte su respeto?' },
      { id: 'virtudes-defectos', text: 'Dime tres virtudes y tres defectos tuyos.' },
      { id: 'prevencion-comunidad', text: 'El trabajo de bombero no solo implica apagar incendios, sino también educar a la comunidad sobre prevención. ¿Cómo explicarías brevemente a los ciudadanos cómo actuar ante un incendio o accidente?' },
      { id: 'caracter-trabajo', text: 'Si tuvieras que describirte con tres palabras que definen tu carácter y personalidad en el trabajo, ¿cuáles serían y por qué?' },
      { id: 'aprendizaje-frustracion', text: 'Este trabajo implica aprender constantemente nuevas técnicas y adaptarse a los cambios. ¿Cómo manejas el aprendizaje y cómo enfrentas la frustración cuando algo no te sale bien?' },
      { id: 'diferencia-aspirantes', text: '¿Qué crees que te diferencia del resto de aspirantes?' },
      { id: 'lider-ejecutor', text: '¿Te consideras más líder o más ejecutor?' },
      { id: 'inseguridad', text: '¿Qué situaciones te hacen sentir inseguro?' },
      { id: 'impacto-psicologico', text: '¿Has pensado en el impacto psicológico de nuestra profesión por todo lo que vemos a diario? ¿Te ves capaz de lidiar con ello?' }
    ]
  },
  {
    category: 'Situacionales',
    questions: [
      { id: 'dos-victimas', text: 'Estás dentro de un edificio en llamas y te encuentras con dos personas atrapadas: una está consciente pero tiene heridas graves, la otra está inconsciente pero parece estable. Solo puedes cargar a una. ¿Cómo decides a quién sacar?' },
      { id: 'riesgo-colapso', text: 'Durante una intervención en un edificio en llamas, te das cuenta de que la estructura muestra señales de colapso inminente. Tienes órdenes de un superior de continuar con el rescate, pero tu instinto te dice que es demasiado peligroso. ¿Qué harías?' },
      { id: 'tres-rescates', text: 'Llegas a un edificio en llamas y te informan que hay tres personas atrapadas en distintos puntos. Uno es un niño en el tercer piso, otro es un adulto mayor en el primer piso y el tercero es un compañero bombero herido en el segundo piso. ¿Cómo decides a quién rescatar primero y por qué?' },
      { id: 'salida-bloqueada', text: 'Si durante un incendio estructural el techo comienza a colapsar y tu única salida queda bloqueada, ¿qué harías para encontrar una vía segura de escape?' },
      { id: 'oxigeno-diez', text: 'Si encuentras a una persona inconsciente en un ambiente con poca visibilidad y denso humo, pero tu tanque de oxígeno está al 10 %, ¿qué harías para intentar sacarla con vida sin comprometer la tuya?' },
      { id: 'nino-escondido', text: 'En un incendio residencial, un niño asustado se esconde debajo de la cama en lugar de salir cuando lo llamas. ¿Cómo lo sacarías sin asustarlo aún más ni poner en peligro la operación?' },
      { id: 'persona-cercana', text: 'Te encuentras en un incendio estructural, escuchas gritos de dos puertas diferentes y reconoces una voz: es alguien muy cercano a ti. La otra no la reconoces. Por radio te dicen que han salido todos salvo tú y que tienes que salir de inmediato; solo puedes cargar con uno. ¿A quién escogerías y por qué?' },
      { id: 'orden-insegura', text: 'Durante una emergencia, un compañero de tu mismo rango y experiencia te ordena hacer algo que consideras inseguro y poco ético. ¿Cómo abordarías esta situación en medio de un operativo?' },
      { id: 'error-companero', text: 'Un compañero bombero comete un error grave en una intervención, pero nadie más se da cuenta. Si lo reportas, podría enfrentar consecuencias serias; si lo ocultas, podrías estar poniendo en riesgo futuras operaciones. ¿Qué harías?' },
      { id: 'rechazo-rescate', text: 'Una persona atrapada en un accidente de tráfico te pide que no sigas con el rescate porque está demasiado herida y no quiere vivir con sus lesiones. ¿Cómo abordarías esta solicitud sabiendo que debes salvarle la vida a toda costa?' }
    ]
  }
];

const ADMIN_EMAILS = ["sya@safd.com"]; 
const USER_ROLES = { 
  "sya@safd.com": "JEFA DE BATALLÓN", 
  "drewcalloway@safd.com": "Teniente", 
  "wilhelm@safd.com": "Teniente", 
  "zanebrooks@safd.com": "Teniente", 
  "alexcampbell@safd.com": "Specialist Firefighter", 
  "scarletaylor@safd.com": "Sargento", 
  "eros@safd.com": "Capitan",
  "markuskraver@safd.com": "Shift Commander",
};
const RANGOS_ACADEMIA = ["Academy", "Probationary", "Ascendido", "Suspendido"];
const ACADEMIC_MODULES = ['asis_radio', 'asis_auxilios', 'asis_incendios', 'asis_excarcelacion'];
const FIELD_SKILLS = ['actitud', 'mando', 'interna', 'radio', 'primeros_aux', 'excarcelacion_hab', 'incendios_hab'];
const MODULE_LABELS = {
  asis_radio: 'RADIO & DISPATCH',
  asis_auxilios: 'PRIMEROS AUXILIOS',
  asis_incendios: 'INCENDIOS',
  asis_excarcelacion: 'EXCARCELACIÓN'
};

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alumnos');
  const [students, setStudents] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [observations, setObservations] = useState([]);
  const [studentObservations, setStudentObservations] = useState({});
  const [newObs, setNewObs] = useState('');
  const [activityLog, setActivityLog] = useState([]);
  const [interviews, setInterviews] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem('rtd-interviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newInterviewName, setNewInterviewName] = useState('');
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [newInterviewQuestion, setNewInterviewQuestion] = useState('');
  const [newInterviewAnswer, setNewInterviewAnswer] = useState('');
  const [questionToFocusId, setQuestionToFocusId] = useState(null);
  const [interviewAnswerDrafts, setInterviewAnswerDrafts] = useState({});
  const [interviewBankCategory, setInterviewBankCategory] = useState(INTERVIEW_QUESTION_BANK[0].category);
  const [isInterviewBankOpen, setIsInterviewBankOpen] = useState(false);
  const [interviewBankSearch, setInterviewBankSearch] = useState('');
  const [interviewSyncError, setInterviewSyncError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentOrigin, setNewStudentOrigin] = useState('academia');
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
  const [tempFechaIngreso, setTempFechaIngreso] = useState('');
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const dateInputRef = useRef(null);
  
  // Búsqueda y filtros para biblioteca
  const [searchResource, setSearchResource] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [controlFilter, setControlFilter] = useState('todos');

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLog = window.localStorage.getItem('rtd-control-log');
      if (savedLog) {
        try {
          setActivityLog(JSON.parse(savedLog));
        } catch {
          setActivityLog([]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('rtd-interviews', JSON.stringify(interviews));
    }
  }, [interviews]);

  useEffect(() => {
    if (!questionToFocusId) return;
    const answerField = document.getElementById(`interview-answer-${questionToFocusId}`);
    if (!answerField) return;
    answerField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    answerField.focus({ preventScroll: true });
    setQuestionToFocusId(null);
  }, [questionToFocusId, interviews]);

  useEffect(() => { if (!session) { const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000); return () => clearInterval(timer); } }, [session, slides.length]);

  const instructorInfo = useMemo(() => {
    if (!session?.user?.email) return { name: "INVITADO", rango: "VISITANTE", fullTag: "[VISITANTE] INVITADO" };
    const emailLower = session.user.email.toLowerCase().trim();
    const name = emailLower.split('@')[0].toUpperCase();
    const rango = USER_ROLES[emailLower] || "INSTRUCTOR";
    return { name, rango, fullTag: `[${rango}] ${name}` };
  }, [session]);

  const registeredUsers = useMemo(() => {
    return Object.entries(USER_ROLES).map(([email, role]) => {
      const name = email.split('@')[0].toUpperCase();
      return {
        email: email.toLowerCase(),
        name,
        role,
        fullTag: `[${role}] ${name}`
      };
    });
  }, []);

  const isAdmin = useMemo(() => session?.user?.email && ADMIN_EMAILS.some(e => e.toLowerCase().trim() === session.user.email.toLowerCase().trim()), [session]);
  const getStudentOrigin = (student) => (student?.tipo_ingreso || 'academia').toLowerCase();
  const academyStudents = useMemo(() => students.filter(student => getStudentOrigin(student) === 'academia'), [students]);
  const trasladoStudents = useMemo(() => students.filter(student => getStudentOrigin(student) === 'traslado'), [students]);
  const isTrasladoStudent = useMemo(() => getStudentOrigin(selectedStudent) === 'traslado', [selectedStudent]);

  const studentProgressRanking = useMemo(() => {
    return students
      .map(student => {
        const completedModules = ACADEMIC_MODULES.filter(key => student[key] === 'realizado').length;
        const masteredSkills = FIELD_SKILLS.filter(key => student[key] === 'aprendido').length;
        const currentSkills = FIELD_SKILLS.filter(key => student[key] === 'cursando').length;
        const activeSkills = masteredSkills + currentSkills;
        const pendingSkills = FIELD_SKILLS.filter(key => student[key] === 'no' || !student[key]).length;
        const observationCount = studentObservations[student.id]?.length || 0;
        const fechaBase = student.fecha_ingreso || student.created_at;
        const daysInProgram = fechaBase
          ? Math.max(0, Math.floor((new Date() - new Date(fechaBase)) / (1000 * 60 * 60 * 24)))
          : 0;

        const moduleProgress = (completedModules / ACADEMIC_MODULES.length) * 40;
        const skillProgress = ((masteredSkills + (currentSkills * 0.5)) / FIELD_SKILLS.length) * 45;
        const commentProgress = Math.min(observationCount, 5) / 5 * 10;
        const voteBonus = student.voto_instructor === 'apto' ? 5 : 0;
        const progressPercent = Math.min(100, Math.round(moduleProgress + skillProgress + commentProgress + voteBonus));
        const leadershipScore = Math.round(
          (masteredSkills * 2.5) +
          (currentSkills * 2) +
          (completedModules * 3) +
          (observationCount * 1.5) +
          voteBonus
        );

        return {
          ...student,
          completedModules,
          masteredSkills,
          currentSkills,
          activeSkills,
          pendingSkills,
          observationCount,
          totalSkills: FIELD_SKILLS.length,
          daysInProgram,
          progressPercent,
          leadershipScore
        };
      })
      .sort((a, b) => b.leadershipScore - a.leadershipScore);
  }, [students, studentObservations]);

  const summaryStats = useMemo(() => {
    const totalStudents = students.length;
    const totalObservations = Object.values(studentObservations).reduce((sum, list) => sum + list.length, 0);
    const averageProgress = totalStudents
      ? Math.round(studentProgressRanking.reduce((sum, student) => sum + student.progressPercent, 0) / totalStudents)
      : 0;
    const averageDays = totalStudents
      ? Math.round(studentProgressRanking.reduce((sum, student) => sum + student.daysInProgram, 0) / totalStudents)
      : 0;
    const masteredTotal = studentProgressRanking.reduce((sum, student) => sum + student.masteredSkills, 0);
    const currentTotal = studentProgressRanking.reduce((sum, student) => sum + student.currentSkills, 0);
    const pendingTotal = studentProgressRanking.reduce((sum, student) => sum + student.pendingSkills, 0);
    const aptos = students.filter(student => student.voto_instructor === 'apto').length;
    const evaluando = students.filter(student => student.voto_instructor === null).length;
    const traslado = students.filter(student => getStudentOrigin(student) === 'traslado').length;
    const academia = students.filter(student => getStudentOrigin(student) === 'academia').length;

    return {
      totalStudents,
      totalObservations,
      averageProgress,
      averageDays,
      masteredTotal,
      currentTotal,
      pendingTotal,
      aptos,
      evaluando,
      traslado,
      academia,
      totalSkills: FIELD_SKILLS.length * totalStudents
    };
  }, [students, studentProgressRanking, studentObservations]);

  const controlBoard = useMemo(() => {
    const dataByUser = registeredUsers.reduce((acc, user) => {
      acc[user.email] = {
        reports: 0,
        changes: 0,
        latest: null,
        lastStudent: 'Sin miembro',
        totalActions: 0
      };
      return acc;
    }, {});

    observations.forEach(item => {
      const matchedUser = registeredUsers.find(user => item.instructor_name?.toLowerCase().includes(user.name.toLowerCase()));
      if (!matchedUser) return;
      dataByUser[matchedUser.email].reports += 1;
      const timestamp = new Date(item.created_at).getTime();
      if (!dataByUser[matchedUser.email].latest || timestamp > new Date(dataByUser[matchedUser.email].latest).getTime()) {
        dataByUser[matchedUser.email].latest = item.created_at;
        dataByUser[matchedUser.email].lastStudent = students.find(student => student.id === item.student_id)?.name || 'Sin miembro';
      }
    });

    activityLog.forEach(item => {
      const user = registeredUsers.find(candidate => candidate.email === item.email);
      if (!user) return;
      if (item.type === 'informe') dataByUser[user.email].reports += 1;
      if (item.type === 'change' || item.type === 'save') dataByUser[user.email].changes += 1;
      const timestamp = new Date(item.created_at).getTime();
      if (!dataByUser[user.email].latest || timestamp > new Date(dataByUser[user.email].latest).getTime()) {
        dataByUser[user.email].latest = item.created_at;
        dataByUser[user.email].lastStudent = item.studentName || 'Sin miembro';
      }
    });

    return registeredUsers.map(user => {
      const userStats = dataByUser[user.email];
      const reports = userStats.reports || 0;
      const changes = userStats.changes || 0;
      const totalActions = reports + changes;
      const latest = userStats.latest;
      const daysSinceAction = latest ? Math.max(0, Math.floor((Date.now() - new Date(latest)) / (1000 * 60 * 60 * 24))) : null;

      return {
        ...user,
        reports,
        changes,
        totalActions,
        latest,
        daysSinceAction,
        lastStudent: userStats.lastStudent || 'Sin miembro'
      };
    }).sort((a, b) => b.totalActions - a.totalActions || b.reports - a.reports || b.changes - a.changes);
  }, [registeredUsers, observations, activityLog, students]);

  const filteredControlBoard = useMemo(() => {
    if (controlFilter === 'todos') return controlBoard;
    if (controlFilter === 'activos') return controlBoard.filter(user => user.totalActions > 0);
    return controlBoard.filter(user => user.totalActions === 0);
  }, [controlBoard, controlFilter]);

  const controlMetrics = useMemo(() => {
    const totalReports = filteredControlBoard.reduce((sum, user) => sum + user.reports, 0);
    const totalChanges = filteredControlBoard.reduce((sum, user) => sum + user.changes, 0);
    const recentActivity = filteredControlBoard.filter(user => user.daysSinceAction !== null && user.daysSinceAction <= 7).length;
    const mostActive = [...filteredControlBoard].sort((a, b) => b.totalActions - a.totalActions)[0] || null;

    return { totalReports, totalChanges, recentActivity, mostActive };
  }, [filteredControlBoard]);

  const moduleSummary = useMemo(() => {
    return ACADEMIC_MODULES.map(key => {
      const completed = students.filter(student => student[key] === 'realizado').length;
      const total = students.length || 1;
      return {
        key,
        label: MODULE_LABELS[key],
        completed,
        percentage: Math.round((completed / total) * 100)
      };
    });
  }, [students]);

  const priorityStudents = useMemo(() => {
    return [...studentProgressRanking]
      .sort((a, b) => a.progressPercent - b.progressPercent)
      .slice(0, 4);
  }, [studentProgressRanking]);

  const topProgressStudent = studentProgressRanking[0] || null;

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const openDatePicker = () => {
    if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
      dateInputRef.current.showPicker();
    }
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

  const persistInterviewRecord = async (interview, client = supabase) => {
    if (!client) return false;
    const { error } = await client.from('interviews').upsert({
      client_id: interview.id,
      name: interview.name,
      attendance: interview.attendance || 'pendiente',
      questions: interview.questions || []
    }, { onConflict: 'client_id' });

    if (error) {
      console.error('Error saving interview:', error);
      setInterviewSyncError(`No se pudo guardar en Supabase: ${error.message}`);
      return false;
    }

    setInterviewSyncError('');
    return true;
  };

  const fetchInterviewRecords = async (client) => {
    const { data: remoteRows, error } = await client
      .from('interviews')
      .select('id, client_id, name, attendance, questions')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interviews:', error);
      setInterviewSyncError(`No se pudieron cargar las entrevistas: ${error.message}`);
      return;
    }

    let localRows = [];
    try {
      localRows = JSON.parse(window.localStorage.getItem('rtd-interviews') || '[]');
    } catch {
      localRows = [];
    }

    const knownIds = new Set((remoteRows || []).map(row => row.client_id || row.id));
    const failedLocalRows = [];
    for (const interview of localRows) {
      if (!interview?.id || knownIds.has(interview.id)) continue;
      const saved = await persistInterviewRecord(interview, client);
      if (saved) knownIds.add(interview.id);
      else failedLocalRows.push(interview);
    }

    const { data: syncedRows, error: syncError } = await client
      .from('interviews')
      .select('id, client_id, name, attendance, questions')
      .order('created_at', { ascending: false });

    if (syncError) {
      console.error('Error refreshing interviews:', syncError);
      setInterviewSyncError(`No se pudieron actualizar las entrevistas: ${syncError.message}`);
      return;
    }

    const normalizedRows = (syncedRows || []).map(row => ({
      id: row.client_id || row.id,
      name: row.name,
      attendance: row.attendance || 'pendiente',
      questions: Array.isArray(row.questions) ? row.questions : []
    }));
    setInterviews([...normalizedRows, ...failedLocalRows.filter(local => !knownIds.has(local.id))]);
    if (failedLocalRows.length === 0) setInterviewSyncError('');
  };

  async function fetchAllData(client = supabase) {
    if (!client) return;
    await fetchInterviewRecords(client);
    try {
      const { data: stds, error: stdErr } = await client.from('students').select('*').order('name');
      const { data: ress, error: resErr } = await client.from('resources').select('*').order('created_at', { ascending: false });
      const { data: obs, error: obsErr } = await client.from('observations').select('*');
      
      if (stdErr) console.error('Error fetching students:', stdErr);
      if (resErr) console.error('Error fetching resources:', resErr);
      if (obsErr) console.error('Error fetching observations:', obsErr);

      const observationsByStudent = (obs || []).reduce((acc, item) => {
        if (!acc[item.student_id]) acc[item.student_id] = [];
        acc[item.student_id].push(item);
        return acc;
      }, {});
      
      setStudents(stds || []);
      setResources(ress || []);
      setStudentObservations(observationsByStudent);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    if (selectedStudent && supabase) {
      supabase.from('observations').select('*').eq('student_id', selectedStudent.id).order('created_at', { ascending: true })
        .then(({ data }) => setObservations(data || []));
      setTempHorario(selectedStudent.horario || 'Mañana / Tarde');
      setTempFechaIngreso(selectedStudent.fecha_ingreso || (selectedStudent.created_at ? new Date(selectedStudent.created_at).toISOString().split('T')[0] : ''));
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

    const { error } = await supabase.from('students').update(updatePayload).eq('id', selectedStudent.id);
    if (error) {
      console.error('Error updating student data:', error);
      alert('No se pudo guardar el cambio en la ficha.');
      return;
    }

    setSelectedStudent({ ...selectedStudent, ...updatePayload });
    if (session?.user?.email) {
      const activityEntry = {
        id: `change-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        email: session.user.email.toLowerCase(),
        type: 'change',
        created_at: new Date().toISOString(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        column,
        value: finalValue,
        actor: instructorInfo.fullTag
      };
      const nextLog = [activityEntry, ...activityLog].slice(0, 500);
      setActivityLog(nextLog);
      if (typeof window !== 'undefined') window.localStorage.setItem('rtd-control-log', JSON.stringify(nextLog));
    }
    fetchAllData();
  };

  const saveStudentCard = async () => {
    if (!supabase || !selectedStudent) return;

    setIsSavingStudent(true);

    try {
      const payload = {
        horario: tempHorario || 'Mañana / Tarde',
        fecha_ingreso: tempFechaIngreso || null,
        rango: selectedStudent.rango || 'Academy',
        tipo_ingreso: selectedStudent.tipo_ingreso || 'academia'
      };

      const { error } = await supabase.from('students').update(payload).eq('id', selectedStudent.id);
      if (error) throw error;

      setSelectedStudent({ ...selectedStudent, ...payload });
      if (session?.user?.email) {
        const saveEntry = {
          id: `save-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          email: session.user.email.toLowerCase(),
          type: 'save',
          created_at: new Date().toISOString(),
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          actor: instructorInfo.fullTag
        };
        const nextLog = [saveEntry, ...activityLog].slice(0, 500);
        setActivityLog(nextLog);
        if (typeof window !== 'undefined') window.localStorage.setItem('rtd-control-log', JSON.stringify(nextLog));
      }
      await fetchAllData();
      alert('Ficha guardada correctamente');
    } catch (error) {
      console.error('Error saving student card:', error);
      alert('No se pudo guardar la ficha del miembro.');
    } finally {
      setIsSavingStudent(false);
    }
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

    const fechaIngreso = new Date().toISOString().split('T')[0];
    const basePayload = {
      name: newStudentName,
      rango: 'Academy',
      horario: 'Mañana / Tarde'
    };
    const fullPayload = {
      ...basePayload,
      tipo_ingreso: newStudentOrigin,
      fecha_ingreso: fechaIngreso
    };

    try {
      const { data, error } = await supabase.from('students').insert([fullPayload]).select();

      if (error) {
        const message = String(error?.message || '').toLowerCase();
        const hasMissingColumns = message.includes('column') || message.includes('does not exist') || message.includes('unknown');

        if (hasMissingColumns) {
          const fallback = await supabase.from('students').insert([basePayload]).select();
          if (fallback.error) throw fallback.error;
          setStudents(prev => [...(fallback.data || []), ...prev]);
        } else {
          throw error;
        }
      } else {
        setStudents(prev => [...(data || []), ...prev]);
      }

      setNewStudentName('');
      setNewStudentOrigin('academia');
      setIsModalOpen(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating student:', error);
      alert('No se pudo guardar el aspirante. Revisa la conexión o las columnas de la base de datos.');
    }
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
    const nextObs = [...observations, data[0]];
    setObservations(nextObs); 
    setNewObs('');

    if (session?.user?.email) {
      const activityEntry = {
        id: `report-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        email: session.user.email.toLowerCase(),
        type: 'informe',
        created_at: new Date().toISOString(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        actor: instructorInfo.fullTag,
        detail: newObs.trim()
      };
      const nextLog = [activityEntry, ...activityLog].slice(0, 500);
      setActivityLog(nextLog);
      if (typeof window !== 'undefined') window.localStorage.setItem('rtd-control-log', JSON.stringify(nextLog));
    }
  };

  const handleAddInterviewee = async (e) => {
    e.preventDefault();
    const cleanedName = newInterviewName.trim();
    if (!cleanedName) return;

    const newInterview = {
      id: `interview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: cleanedName,
      attendance: 'pendiente',
      questions: []
    };

    if (!await persistInterviewRecord(newInterview)) return;
    setInterviews(prev => [newInterview, ...prev]);
    setSelectedInterviewId(newInterview.id);
    setNewInterviewName('');
  };

  const handleAddInterviewQuestion = async (e) => {
    e.preventDefault();
    if (!isAdmin || !selectedInterviewId || !newInterviewQuestion.trim()) return;

    const newQuestion = {
      id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: newInterviewQuestion.trim(),
      answer: newInterviewAnswer.trim()
    };

    const interview = interviews.find(item => item.id === selectedInterviewId);
    if (!interview) return;
    const updatedInterview = { ...interview, questions: [...interview.questions, newQuestion] };
    if (!await persistInterviewRecord(updatedInterview)) return;
    setInterviews(prev => prev.map(item => item.id === selectedInterviewId ? updatedInterview : item));

    setNewInterviewQuestion('');
    setNewInterviewAnswer('');
  };

  const handleAddBankInterviewQuestion = async (question) => {
    if (!selectedInterviewId) return;
    const interview = interviews.find(item => item.id === selectedInterviewId);
    if (!interview || interview.questions.some(item => item.bankId === question.id)) return;
    const newQuestion = {
      id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      bankId: question.id,
      text: question.text,
      answer: ''
    };
    const updatedInterview = { ...interview, questions: [...interview.questions, newQuestion] };
    if (!await persistInterviewRecord(updatedInterview)) return;
    setInterviews(prev => prev.map(item => item.id === selectedInterviewId ? updatedInterview : item));
    setIsInterviewBankOpen(false);
    setQuestionToFocusId(newQuestion.id);
  };

  const updateInterviewAttendance = async (attendance) => {
    const interview = interviews.find(item => item.id === selectedInterviewId);
    if (!interview) return;
    const updatedInterview = { ...interview, attendance };
    if (!await persistInterviewRecord(updatedInterview)) return;
    setInterviews(prev => prev.map(item => item.id === selectedInterviewId ? updatedInterview : item));
  };

  const updateInterviewQuestionAnswerDraft = (questionId, value) => {
    setInterviewAnswerDrafts(prev => ({ ...prev, [questionId]: value }));
  };

  const saveInterviewQuestionAnswer = async (questionId) => {
    if (!Object.hasOwn(interviewAnswerDrafts, questionId)) return;
    const interview = interviews.find(item => item.id === selectedInterviewId);
    if (!interview) return;
    const answer = interviewAnswerDrafts[questionId];
    const updatedInterview = {
      ...interview,
      questions: interview.questions.map(question =>
        question.id === questionId ? { ...question, answer } : question
      )
    };
    if (!await persistInterviewRecord(updatedInterview)) return;
    setInterviews(prev => prev.map(item => item.id === selectedInterviewId ? updatedInterview : item));
    setInterviewAnswerDrafts(prev => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const deleteInterviewQuestion = async (questionId) => {
    if (typeof window !== 'undefined' && !window.confirm('¿Eliminar esta pregunta y su respuesta de la ficha?')) return;
    const interview = interviews.find(item => item.id === selectedInterviewId);
    if (!interview) return;
    const updatedInterview = {
      ...interview,
      questions: interview.questions.filter(question => question.id !== questionId)
    };
    if (!await persistInterviewRecord(updatedInterview)) return;
    setInterviews(prev => prev.map(item => item.id === selectedInterviewId ? updatedInterview : item));
    setInterviewAnswerDrafts(prev => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const deleteInterview = async (interviewId) => {
    const { error } = await supabase.from('interviews').delete().eq('client_id', interviewId);
    if (error) {
      console.error('Error deleting interview:', error);
      setInterviewSyncError(`No se pudo eliminar en Supabase: ${error.message}`);
      return;
    }
    setInterviewSyncError('');
    setInterviews(prev => prev.filter(interview => interview.id !== interviewId));
    setSelectedInterviewId(prev => prev === interviewId ? null : prev);
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

      <aside className="w-full md:w-24 bg-black/40 border-b md:border-r border-white/10 flex flex-row md:flex-col items-center py-4 md:py-10 h-auto md:h-screen sticky top-0 z-50 backdrop-blur-xl gap-4 md:gap-0">
        <img src="https://r2.fivemanage.com/rlMpa4HCjCLM3vQVrxiNo/RTD.png" className="w-12 h-12 md:w-14 md:h-14 object-contain md:mb-16 drop-shadow-xl" alt="Logo" />
        <nav className="flex flex-row md:flex-col gap-3 md:gap-8">
          <button onClick={() => { setActiveTab('alumnos'); setSelectedStudent(null); }} className={`p-3 md:p-4 rounded-2xl transition-all ${activeTab === 'alumnos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><Users className="w-5 h-5 md:w-6 md:h-6" /></button>
          <button onClick={() => { setActiveTab('progreso'); setSelectedStudent(null); }} className={`p-3 md:p-4 rounded-2xl transition-all ${activeTab === 'progreso' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BarChart3 className="w-5 h-5 md:w-6 md:h-6" /></button>
          {isAdmin && (
            <button onClick={() => { setActiveTab('control'); setSelectedStudent(null); }} className={`p-3 md:p-4 rounded-2xl transition-all ${activeTab === 'control' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><ShieldCheck className="w-5 h-5 md:w-6 md:h-6" /></button>
          )}
          <button onClick={() => { setActiveTab('entrevistas'); setSelectedStudent(null); }} className={`p-3 md:p-4 rounded-2xl transition-all ${activeTab === 'entrevistas' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><MessageSquare className="w-5 h-5 md:w-6 md:h-6" /></button>
          <button onClick={() => { setActiveTab('recursos'); setSelectedStudent(null); }} className={`p-3 md:p-4 rounded-2xl transition-all ${activeTab === 'recursos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/10' : 'text-zinc-600 hover:text-white'}`}><BookOpen className="w-5 h-5 md:w-6 md:h-6" /></button>
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="ml-auto md:ml-0 md:mt-auto p-3 md:p-4 text-zinc-800 hover:text-red-600 transition-all"><LogOut className="w-5 h-5 md:w-6 md:h-6" /></button>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-16 overflow-y-auto relative z-10">
        <header className="mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20 mb-6 md:mb-8 italic backdrop-blur-md">{instructorInfo.fullTag}</div>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
            <h1 className="text-5xl sm:text-6xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] drop-shadow-2xl">
               {selectedStudent ? selectedStudent.name : activeTab === 'alumnos' ? 'EXPEDIENTES' : activeTab === 'progreso' ? 'RESUMEN' : activeTab === 'control' ? 'CONTROL' : activeTab === 'entrevistas' ? 'ENTREVISTAS' : 'BIBLIOTECA'}
            </h1>
            {isAdmin && !selectedStudent && activeTab === 'alumnos' && (
              <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl self-start sm:self-auto">+ ALTA ASPIRANTE</button>
            )}
            {isAdmin && !selectedStudent && activeTab === 'recursos' && (
              <button onClick={() => setIsResModalOpen(true)} className="bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl self-start sm:self-auto">+ NUEVO RECURSO</button>
            )}
          </div>
        </header>

        {selectedStudent ? (
          /* --- DISEÑO EXPEDIENTE TÁCTICO RECONSTRUIDO --- */
          <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={() => setSelectedStudent(null)} className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 bg-white/5 px-6 py-3 rounded-xl border border-white/5 backdrop-blur-md shadow-lg transition-all"><ChevronLeft className="w-4 h-4" /> VOLVER AL LISTADO</button>
              <button
                onClick={saveStudentCard}
                disabled={isSavingStudent}
                className="bg-red-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-xl disabled:opacity-70"
              >
                {isSavingStudent ? 'GUARDANDO...' : 'GUARDAR FICHA'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
               <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 backdrop-blur-md shadow-2xl">
                  <div className="flex justify-between items-center mb-6"><div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest italic">Horarios</div><button onClick={() => isEditingHorario ? (updateStudentData('horario', tempHorario), setIsEditingHorario(false)) : setIsEditingHorario(true)}><Edit2 className="w-4 h-4 text-zinc-600" /></button></div>
                  {isEditingHorario ? <input className="bg-black/60 border border-white/10 text-white p-2 rounded w-full font-black uppercase outline-none focus:border-red-600" value={tempHorario} onChange={e => setTempHorario(e.target.value)} /> : <div className="text-xl font-black italic border-b border-zinc-800 pb-4 uppercase tracking-tighter">{selectedStudent.horario}</div>}
               </div>
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl">
                  <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-6">Rango Academia</div>
                  <select className="bg-black/40 border border-white/10 text-white p-3 rounded-xl w-full font-black italic uppercase outline-none focus:border-red-600 cursor-pointer" value={selectedStudent.rango || "Academy"} onChange={(e) => updateStudentData('rango', e.target.value)}>{RANGOS_ACADEMIA.map(r => <option key={r} value={r} className="bg-zinc-900">{r.toUpperCase()}</option>)}</select>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl">
                  <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-6">Tipo de Ingreso</div>
                  <select className="bg-black/40 border border-white/10 text-white p-3 rounded-xl w-full font-black italic uppercase outline-none focus:border-red-600 cursor-pointer" value={selectedStudent.tipo_ingreso || 'academia'} onChange={(e) => updateStudentData('tipo_ingreso', e.target.value)}>{INGRESO_TIPOS.map(tipo => <option key={tipo.id} value={tipo.id} className="bg-zinc-900">{tipo.label.toUpperCase()}</option>)}</select>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl">
                  <div className="flex justify-between items-center mb-6"><span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest italic">Rendimiento</span><span className="text-red-600 font-black italic text-xl">43%</span></div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden"><div className="bg-red-600 h-full w-[43%] shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div></div>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 backdrop-blur-md shadow-2xl md:col-span-2 lg:col-span-3">
                  <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-6">Fecha de Ingreso</div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={openDatePicker}
                      className="bg-black/40 border border-white/10 rounded-xl p-3 text-zinc-300 hover:text-white hover:border-red-600 transition-all"
                      aria-label="Abrir calendario de fecha de ingreso"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                    <input
                      ref={dateInputRef}
                      type="date"
                      className="bg-black/40 border border-white/10 text-white p-3 rounded-xl w-full font-black italic uppercase outline-none focus:border-red-600 cursor-pointer"
                      value={tempFechaIngreso}
                      onChange={(e) => setTempFechaIngreso(e.target.value)}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </div>
                  <div className="mt-3 text-[8px] font-black uppercase tracking-widest text-zinc-500 italic">Se guarda al pulsar “Guardar ficha”.</div>
               </div>
            </div>

            {!isTrasladoStudent && (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 border-t-4 border-t-green-600 backdrop-blur-md shadow-2xl">
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
            )}

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
               <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 border-t-4 border-t-blue-600 backdrop-blur-md h-fit shadow-2xl">
                  <div className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mb-10 italic">Estado Final</div>
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => updateStudentData('voto_instructor', 'apto')} className={`p-8 bg-black/40 border rounded-3xl transition-all flex flex-col items-center gap-2 group ${selectedStudent.voto_instructor === 'apto' ? 'border-green-600 bg-green-600/10' : 'border-white/10 hover:border-green-600'}`}><ThumbsUp className={`w-6 h-6 ${selectedStudent.voto_instructor === 'apto' ? 'text-green-500' : 'text-zinc-700 group-hover:text-green-500'}`} /><span className="text-[9px] font-black uppercase">APTO</span></button>
                     <button onClick={() => updateStudentData('voto_instructor', 'no_apto')} className={`p-8 bg-black/40 border rounded-3xl transition-all flex flex-col items-center gap-2 group ${selectedStudent.voto_instructor === 'no_apto' ? 'border-red-600 bg-red-600/10' : 'border-white/10 hover:border-red-600'}`}><ThumbsDown className={`w-6 h-6 ${selectedStudent.voto_instructor === 'no_apto' ? 'text-red-500' : 'text-zinc-700 group-hover:text-red-500'}`} /><span className="text-[9px] font-black uppercase">NO APTO</span></button>
                  </div>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 border-t-4 border-t-red-600 backdrop-blur-md shadow-2xl">
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
              <div className="space-y-12">
                {INGRESO_TIPOS.map(tipo => {
                  const list = tipo.id === 'academia' ? academyStudents : trasladoStudents;
                  return (
                    <section key={tipo.id} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">{tipo.label}</h2>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{list.length}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {list.map(s => (
                          <div key={s.id} onClick={() => setSelectedStudent(s)} className="group bg-white/5 border border-white/10 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] hover:border-red-600 transition-all cursor-pointer relative shadow-2xl overflow-hidden backdrop-blur-sm">
                            {isAdmin && <button onClick={(e) => deleteStudent(s.id, e)} className="absolute top-8 right-8 text-zinc-700 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 z-20"><Plus className="w-5 h-5 rotate-45" /></button>}
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-red-600 transition-all mb-10 shadow-inner shadow-black/50"><User className="text-zinc-600 group-hover:text-white" /></div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">{s.name}</h3>
                            <div className="flex justify-between items-center"><p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest group-hover:text-red-500 transition-all">{s.rango || 'Academy'}</p><ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-600 transition-all" /></div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
            
            {activeTab === 'progreso' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-md shadow-xl"><TrendingUp className="text-zinc-600 mb-6 w-8 h-8" /><div className="text-6xl font-black italic mb-2 tracking-tighter">{summaryStats.totalStudents}</div><div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Aspirantes</div></div>
                  <div className="bg-white/5 border border-green-900/20 rounded-[2.5rem] p-10 backdrop-blur-md shadow-xl"><CheckCircle2 className="text-green-600 mb-6 w-8 h-8" /><div className="text-6xl font-black italic mb-2 tracking-tighter text-green-500">{summaryStats.aptos}</div><div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Graduados</div></div>
                  <div className="bg-white/5 border border-yellow-900/20 rounded-[2.5rem] p-10 backdrop-blur-md shadow-xl"><AlertCircle className="text-yellow-600 mb-6 w-8 h-8" /><div className="text-6xl font-black italic mb-2 tracking-tighter text-yellow-500">{summaryStats.evaluando}</div><div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Evaluando</div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-3">Progreso medio</div>
                    <div className="text-4xl font-black italic text-red-500 mb-2">{summaryStats.averageProgress}%</div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-red-600 rounded-full" style={{ width: `${summaryStats.averageProgress}%` }} /></div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-3">Días promedio</div>
                    <div className="text-4xl font-black italic text-amber-400 mb-1">{summaryStats.averageDays}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">En curso</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-3">Habilidades aprendidas</div>
                    <div className="text-4xl font-black italic text-emerald-400 mb-1">{summaryStats.masteredTotal}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Acumuladas</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-3">Seguimiento</div>
                    <div className="text-4xl font-black italic text-sky-400 mb-1">{summaryStats.totalObservations}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Comentarios activos</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-red-600/20 rounded-[3rem] p-8 backdrop-blur-md shadow-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-500 italic mb-4">LÍDER DE EVOLUCIÓN</div>
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{topProgressStudent ? topProgressStudent.name : 'Sin datos'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/30 rounded-[1.5rem] p-4 border border-white/5 text-center">
                        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">Días en curso</div>
                        <div className="text-3xl font-black italic text-red-500">{topProgressStudent ? topProgressStudent.daysInProgram : 0}</div>
                      </div>
                      <div className="bg-black/30 rounded-[1.5rem] p-4 border border-white/5 text-center">
                        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">Habilidades activas</div>
                        <div className="text-3xl font-black italic text-red-500">{topProgressStudent ? `${topProgressStudent.activeSkills}/${topProgressStudent.totalSkills}` : '0/0'}</div>
                      </div>
                    </div>
                    <div className="mt-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">Score de liderazgo: {topProgressStudent ? topProgressStudent.leadershipScore : 0}</div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-md shadow-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic mb-5">ATENCIÓN PRIORITARIA</div>
                    <div className="space-y-3">
                      {priorityStudents.map((student, index) => (
                        <div key={student.id} className="bg-black/30 rounded-[1.5rem] p-4 border border-white/5">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">#{index + 1} · {student.name}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-red-400 italic">{student.progressPercent}%</div>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${student.progressPercent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-md shadow-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic mb-5">DISTRIBUCIÓN DEL FICHAJE</div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 italic mb-2"><span>Academia</span><span>{summaryStats.academia}</span></div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${summaryStats.totalStudents ? (summaryStats.academia / summaryStats.totalStudents) * 100 : 0}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 italic mb-2"><span>Traslado</span><span>{summaryStats.traslado}</span></div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{ width: `${summaryStats.totalStudents ? (summaryStats.traslado / summaryStats.totalStudents) * 100 : 0}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 italic mb-2"><span>En evaluación</span><span>{summaryStats.evaluando}</span></div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${summaryStats.totalStudents ? (summaryStats.evaluando / summaryStats.totalStudents) * 100 : 0}%` }} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-md shadow-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic mb-5">AVANCE POR MÓDULO</div>
                    <div className="space-y-4">
                      {moduleSummary.map(item => (
                        <div key={item.key} className="bg-black/30 rounded-[1.5rem] p-4 border border-white/5">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{item.label}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">{item.completed}/{summaryStats.totalStudents}</div>
                          </div>
                          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-red-600/20 rounded-[3rem] p-8 backdrop-blur-md shadow-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-500 italic mb-5">TOP 3 EVOLUCIÓN</div>
                    <div className="grid grid-cols-1 gap-4">
                      {studentProgressRanking.slice(0, 3).map((student, index) => {
                        const medalColor = index === 0 ? 'text-red-500' : index === 1 ? 'text-amber-400' : 'text-sky-400';
                        return (
                          <div key={student.id} className={`rounded-[2rem] border p-5 backdrop-blur-md ${index === 0 ? 'bg-red-600/10 border-red-600/40' : index === 1 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-sky-500/10 border-sky-500/30'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className={`text-[11px] font-black uppercase tracking-widest ${medalColor} italic`}>#{index + 1}</div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">{student.rango || 'Academy'}</div>
                            </div>
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{student.name}</h4>
                            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic mb-3">Progreso: {student.progressPercent}%</div>
                            <div className="h-2 rounded-full bg-black/40 overflow-hidden mb-3">
                              <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-400" style={{ width: `${student.progressPercent}%` }} />
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-300">
                              <div className="bg-black/30 rounded-2xl p-3 text-center">Días: {student.daysInProgram}</div>
                              <div className="bg-black/30 rounded-2xl p-3 text-center">Apr.: {student.masteredSkills}</div>
                              <div className="bg-black/30 rounded-2xl p-3 text-center">Cur.: {student.currentSkills}</div>
                              <div className="bg-black/30 rounded-2xl p-3 text-center">Act.: {student.activeSkills}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-md shadow-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic mb-2">COMPARATIVA COMPLETA</div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">Estado real de cada expediente</h3>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">{summaryStats.totalStudents} fichas visibles</div>
                  </div>

                  <div className="overflow-x-auto rounded-[2rem] border border-white/10">
                    <table className="min-w-full text-left border-separate border-spacing-0">
                      <thead className="bg-black/40">
                        <tr className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">
                          <th className="px-4 py-4">#</th>
                          <th className="px-4 py-4">Nombre</th>
                          <th className="px-4 py-4">Ingreso</th>
                          <th className="px-4 py-4">Días</th>
                          <th className="px-4 py-4">Progreso</th>
                          <th className="px-4 py-4">Skills</th>
                          <th className="px-4 py-4">Comentarios</th>
                          <th className="px-4 py-4">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentProgressRanking.map((student, index) => (
                          <tr key={student.id} className="border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">{index + 1}</td>
                            <td className="px-4 py-4 text-[11px] font-black uppercase tracking-tighter text-white">{student.name}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{student.tipo_ingreso || 'academia'}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-amber-400 italic">{student.daysInProgram}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-red-400 italic">{student.progressPercent}%</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">{student.activeSkills}/{student.totalSkills}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-sky-400 italic">{student.observationCount}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest italic">
                              <span className={`rounded-full px-3 py-1 ${student.voto_instructor === 'apto' ? 'bg-green-600/20 text-green-400' : student.voto_instructor === 'no_apto' ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                                {student.voto_instructor === 'apto' ? 'APTO' : student.voto_instructor === 'no_apto' ? 'NO APTO' : 'EVALUANDO'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'control' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-3">Miembros RTD</div>
                    <div className="text-4xl font-black italic text-red-500 mb-1">{filteredControlBoard.length}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Visible en filtro</div>
                  </div>
                  <div className="bg-white/5 border border-emerald-900/20 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-3">Informes realizados</div>
                    <div className="text-4xl font-black italic text-emerald-400 mb-1">{controlMetrics.totalReports}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Registros activos</div>
                  </div>
                  <div className="bg-white/5 border border-sky-900/20 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-3">Cambios detectados</div>
                    <div className="text-4xl font-black italic text-sky-400 mb-1">{controlMetrics.totalChanges}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">En fichas</div>
                  </div>
                  <div className="bg-white/5 border border-amber-900/20 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-3">Actividad 7 días</div>
                    <div className="text-4xl font-black italic text-amber-400 mb-1">{controlMetrics.recentActivity}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Miembros con cambios</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-4">Filtro de control</div>
                    <div className="flex gap-3 flex-wrap">
                      {['todos', 'activos', 'inactivos'].map(option => (
                        <button
                          key={option}
                          onClick={() => setControlFilter(option)}
                          className={`px-5 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${controlFilter === option ? 'bg-red-600 text-white' : 'bg-black/20 border border-white/10 text-zinc-400 hover:text-white'}`}
                        >
                          {option === 'todos' ? 'TODOS' : option === 'activos' ? 'ACTIVOS' : 'SIN ACTIVIDAD'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-red-600/20 rounded-[2rem] p-6 backdrop-blur-md shadow-xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-red-500 italic mb-3">TOP ACTUALIZACIÓN RECIENTE</div>
                    <div className="text-2xl font-black italic uppercase tracking-tighter">{controlMetrics.mostActive ? controlMetrics.mostActive.name : 'Sin actividad'}</div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
                      {controlMetrics.mostActive ? `${controlMetrics.mostActive.totalActions} acciones totales` : 'Sin actividad reciente'}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-6 md:p-8 backdrop-blur-md shadow-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic mb-2">CONTROL ADMINISTRATIVO</div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">Seguimiento por miembro de RTD</h3>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Ranking por informes, cambios y actividad reciente</div>
                  </div>

                  <div className="overflow-x-auto rounded-[2rem] border border-white/10">
                    <table className="min-w-full text-left border-separate border-spacing-0">
                      <thead className="bg-black/40">
                        <tr className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">
                          <th className="px-4 py-4">Usuario</th>
                          <th className="px-4 py-4">Correo</th>
                          <th className="px-4 py-4">Rol</th>
                          <th className="px-4 py-4">Informes</th>
                          <th className="px-4 py-4">Cambios</th>
                          <th className="px-4 py-4">Acciones</th>
                          <th className="px-4 py-4">Último registro</th>
                          <th className="px-4 py-4">Miembro afectado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredControlBoard.map((user, index) => (
                          <tr key={user.email} className="border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                            <td className="px-4 py-4">
                              <div className="text-[11px] font-black uppercase tracking-tighter text-white">{index + 1}. {user.name}</div>
                            </td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{user.email}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{user.role}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">{user.reports}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-sky-400 italic">{user.changes}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-amber-400 italic">{user.totalActions}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-amber-400 italic">{user.latest ? formatDate(user.latest) : 'Sin actividad'}</td>
                            <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{user.lastStudent || 'Sin miembro'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'entrevistas' && (
              <div className="space-y-8">
                {interviewSyncError && (
                  <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {interviewSyncError}
                  </div>
                )}
                <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6">
                  <aside className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-black italic uppercase tracking-tighter">Opositores</h2>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">{interviews.length}</span>
                    </div>

                    <form onSubmit={handleAddInterviewee} className="flex flex-col gap-3 mb-6">
                      <input
                        type="text"
                        value={newInterviewName}
                        onChange={e => setNewInterviewName(e.target.value)}
                        placeholder="Nombre del futuro opositor"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold outline-none focus:border-red-600"
                      />
                      <button type="submit" className="bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3 px-4 text-[10px] font-black uppercase tracking-widest transition-all">
                        + Añadir
                      </button>
                    </form>

                    <div className="space-y-3">
                      {interviews.length === 0 ? (
                        <div className="bg-black/20 border border-dashed border-white/10 rounded-2xl p-6 text-center text-zinc-500 text-sm italic">
                          Aún no hay opositores añadidos.
                        </div>
                      ) : (
                        interviews.map(interview => {
                          const answeredCount = interview.questions.filter(question => question.answer?.trim()).length;
                          const isSelected = selectedInterviewId === interview.id;
                          const attendanceLabel = interview.attendance === 'presente' ? 'Presente' : interview.attendance === 'ausente' ? 'Ausente' : 'Pendiente';

                          return (
                            <button
                              key={interview.id}
                              type="button"
                              onClick={() => setSelectedInterviewId(interview.id)}
                              className={`w-full text-left rounded-2xl border p-4 transition-all ${isSelected ? 'border-red-600 bg-red-600/10' : 'border-white/10 bg-black/20 hover:border-white/20'}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-black italic uppercase tracking-tighter text-lg">{interview.name}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">{answeredCount}/{interview.questions.length}</span>
                              </div>
                              <div className="mt-2 flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">
                                <span>respuestas completadas</span>
                                <span className={`rounded-full px-2 py-1 ${interview.attendance === 'presente' ? 'bg-green-600/20 text-green-400' : interview.attendance === 'ausente' ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                                  {attendanceLabel}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </aside>

                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 backdrop-blur-md shadow-2xl">
                    {!selectedInterviewId || !interviews.find(interview => interview.id === selectedInterviewId) ? (
                      <div className="flex h-full min-h-[280px] items-center justify-center text-center text-zinc-500 italic">
                        Selecciona un opositor para registrar sus respuestas.
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const selectedInterview = interviews.find(interview => interview.id === selectedInterviewId);
                          const selectedQuestionGroup = INTERVIEW_QUESTION_BANK.find(group => group.category === interviewBankCategory) || INTERVIEW_QUESTION_BANK[0];
                          return (
                            <>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic mb-2">Ficha de entrevista</div>
                                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">{selectedInterview.name}</h3>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteInterview(selectedInterview.id)}
                                  className="bg-zinc-800 hover:bg-red-600 text-white rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                  Eliminar
                                </button>
                              </div>

                              <div className="mb-6 rounded-[2rem] border border-white/10 bg-black/20 p-5">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-2">Asistencia</label>
                                <select
                                  value={selectedInterview.attendance || 'pendiente'}
                                  onChange={(e) => updateInterviewAttendance(e.target.value)}
                                  className={`w-full rounded-2xl border py-4 px-5 font-bold outline-none focus:border-red-600 ${
                                    selectedInterview.attendance === 'presente'
                                      ? 'border-green-600/60 bg-green-600/10 text-green-300'
                                      : selectedInterview.attendance === 'ausente'
                                        ? 'border-red-600/60 bg-red-600/10 text-red-300'
                                        : 'border-yellow-600/60 bg-yellow-600/10 text-yellow-200 bg-black/40'
                                  }`}
                                >
                                  <option value="pendiente" className="bg-zinc-900">Pendiente</option>
                                  <option value="presente" className="bg-zinc-900">Presente</option>
                                  <option value="ausente" className="bg-zinc-900">Ausente</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() => setIsInterviewBankOpen(true)}
                                className="mb-8 flex w-full items-center justify-between gap-4 rounded-2xl border border-red-600/30 bg-red-600/[0.08] p-5 text-left transition-colors hover:border-red-500/70 hover:bg-red-600/[0.13]"
                              >
                                <span className="flex items-center gap-4">
                                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-600 text-white"><BookOpen className="h-5 w-5" /></span>
                                  <span>
                                    <span className="block text-sm font-black uppercase tracking-widest">Banco de preguntas</span>
                                    <span className="mt-1 block text-xs text-zinc-400">Explora las dos categorías y elige una pregunta</span>
                                  </span>
                                </span>
                                <span className="shrink-0 text-right">
                                  <span className="block text-lg font-black text-white">{selectedInterview.questions.length}</span>
                                  <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-500">elegidas</span>
                                </span>
                              </button>

                              {isInterviewBankOpen && (
                                <div
                                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
                                  onClick={() => setIsInterviewBankOpen(false)}
                                  onKeyDown={event => {
                                    if (event.key === 'Escape') setIsInterviewBankOpen(false);
                                  }}
                                >
                                  <section
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="interview-bank-title"
                                    onClick={event => event.stopPropagation()}
                                    className="flex max-h-[min(88vh,850px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60"
                                  >
                                    <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-red-950/70 to-zinc-950 px-5 py-5 sm:px-7">
                                      <div>
                                        <div className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-red-400">Ficha de {selectedInterview.name}</div>
                                        <h3 id="interview-bank-title" className="text-xl font-black uppercase tracking-wide text-white sm:text-2xl">Banco de preguntas</h3>
                                        <p className="mt-1 text-xs text-zinc-400">Selecciona una pregunta para añadirla a la ficha.</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setIsInterviewBankOpen(false)}
                                        aria-label="Cerrar banco de preguntas"
                                        className="rounded-lg border border-white/10 p-2 text-zinc-400 transition-colors hover:border-white/30 hover:text-white"
                                      >
                                        <X className="h-5 w-5" />
                                      </button>
                                    </header>

                                    <div className="border-b border-white/10 px-5 py-4 sm:px-7">
                                      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {INTERVIEW_QUESTION_BANK.map(group => {
                                          const availableCount = group.questions.filter(question => !selectedInterview.questions.some(item => item.bankId === question.id)).length;
                                          const isActive = interviewBankCategory === group.category;
                                          return (
                                            <button
                                              key={group.category}
                                              type="button"
                                              onClick={() => setInterviewBankCategory(group.category)}
                                              aria-pressed={isActive}
                                              className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${isActive ? 'border-red-500 bg-red-600/15 text-white' : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white'}`}
                                            >
                                              <span className="text-xs font-black uppercase tracking-wide">{group.category}</span>
                                              <span className={`rounded-md px-2 py-1 text-[10px] font-black ${isActive ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-400'}`}>{availableCount} disponibles</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                        <input
                                          type="search"
                                          value={interviewBankSearch}
                                          onChange={event => setInterviewBankSearch(event.target.value)}
                                          placeholder="Buscar en esta categoría..."
                                          className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
                                        />
                                      </div>
                                    </div>

                                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 sm:p-6">
                                      {selectedQuestionGroup.questions
                                        .filter(question => question.text.toLowerCase().includes(interviewBankSearch.trim().toLowerCase()))
                                        .map((question, index) => {
                                          const alreadyAdded = selectedInterview.questions.some(item => item.bankId === question.id);
                                          return (
                                            <button
                                              key={question.id}
                                              type="button"
                                              disabled={alreadyAdded}
                                              onClick={() => handleAddBankInterviewQuestion(question)}
                                              className="group flex w-full items-start gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-left transition-all hover:border-red-500/50 hover:bg-red-600/[0.07] disabled:cursor-default disabled:opacity-40 sm:p-5"
                                            >
                                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-500/30 bg-red-600/10 font-mono text-xs font-bold text-red-300 group-hover:bg-red-600 group-hover:text-white">{String(index + 1).padStart(2, '0')}</span>
                                              <span className="min-w-0 flex-1 pt-1 text-sm leading-relaxed text-zinc-200">{question.text}</span>
                                              <span className={`shrink-0 pt-1 text-[9px] font-black uppercase tracking-widest ${alreadyAdded ? 'text-zinc-500' : 'text-red-400'}`}>{alreadyAdded ? 'Añadida' : 'Elegir'}</span>
                                            </button>
                                          );
                                        })}
                                      {selectedQuestionGroup.questions.filter(question => question.text.toLowerCase().includes(interviewBankSearch.trim().toLowerCase())).length === 0 && (
                                        <div className="py-12 text-center text-sm text-zinc-500">No hay preguntas que coincidan.</div>
                                      )}
                                      {interviewSyncError && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{interviewSyncError}</div>}
                                    </div>

                                    <footer className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4 sm:px-7">
                                      <span className="text-xs text-zinc-500">{selectedInterview.questions.length} preguntas en esta ficha</span>
                                      <button type="button" onClick={() => setIsInterviewBankOpen(false)} className="rounded-lg bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-red-500 hover:text-white">Listo</button>
                                    </footer>
                                  </section>
                                </div>
                              )}

                              <div className="space-y-4">
                                {selectedInterview.questions.length === 0 ? (
                                  <div className="bg-black/20 border border-dashed border-white/10 rounded-2xl p-8 text-center text-zinc-500 italic">
                                    No hay preguntas registradas aún.
                                  </div>
                                ) : (
                                  selectedInterview.questions.map(question => (
                                    <div key={question.id} className="border border-white/10 bg-black/20 rounded-[2rem] p-5">
                                      <div className="mb-4 flex items-start justify-between gap-3">
                                        <div className="text-base font-black italic uppercase tracking-tighter">{question.text}</div>
                                        <button
                                          type="button"
                                          onClick={() => deleteInterviewQuestion(question.id)}
                                          aria-label="Eliminar pregunta de la ficha"
                                          title="Eliminar pregunta"
                                          className="shrink-0 rounded-lg border border-white/10 p-2 text-zinc-400 transition-colors hover:border-red-600/50 hover:bg-red-600/10 hover:text-red-400"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                      <textarea
                                        id={`interview-answer-${question.id}`}
                                        value={interviewAnswerDrafts[question.id] ?? question.answer ?? ''}
                                        onChange={e => updateInterviewQuestionAnswerDraft(question.id, e.target.value)}
                                        placeholder="Escribe la respuesta aquí..."
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold outline-none focus:border-red-600 min-h-[120px] resize-none"
                                      />
                                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                        <span aria-live="polite" className={`text-xs ${Object.hasOwn(interviewAnswerDrafts, question.id) && interviewAnswerDrafts[question.id] !== (question.answer ?? '') ? 'text-amber-400' : question.answer?.trim() ? 'text-green-400' : 'text-zinc-500'}`}>
                                          {Object.hasOwn(interviewAnswerDrafts, question.id) && interviewAnswerDrafts[question.id] !== (question.answer ?? '')
                                            ? 'Cambios sin guardar'
                                            : question.answer?.trim() ? 'Guardada en Supabase' : 'Respuesta pendiente'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => saveInterviewQuestionAnswer(question.id)}
                                          disabled={!Object.hasOwn(interviewAnswerDrafts, question.id) || interviewAnswerDrafts[question.id] === (question.answer ?? '')}
                                          className="rounded-xl bg-red-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                          Guardar respuesta
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              {isAdmin && (
                                <form onSubmit={handleAddInterviewQuestion} className="mt-8 space-y-4 border border-white/10 bg-black/20 rounded-[2rem] p-5">
                                  <div>
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-2">Pregunta personalizada</label>
                                    <input
                                      type="text"
                                      value={newInterviewQuestion}
                                      onChange={e => setNewInterviewQuestion(e.target.value)}
                                      placeholder="Ej. ¿Qué entiende por liderazgo?"
                                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold outline-none focus:border-red-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 italic mb-2">Respuesta</label>
                                    <textarea
                                      value={newInterviewAnswer}
                                      onChange={e => setNewInterviewAnswer(e.target.value)}
                                      placeholder="Escribe la respuesta del opositor..."
                                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white font-bold outline-none focus:border-red-600 min-h-[110px] resize-none"
                                    />
                                  </div>
                                  <button type="submit" className="bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3 px-5 text-[10px] font-black uppercase tracking-widest transition-all">
                                    Guardar pregunta personalizada
                                  </button>
                                </form>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
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
                <select className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-10 outline-none focus:border-red-600 font-black uppercase italic text-white text-xl" value={newStudentOrigin} onChange={e => setNewStudentOrigin(e.target.value)}>
                  {INGRESO_TIPOS.map(tipo => <option key={tipo.id} value={tipo.id} className="bg-zinc-900">{tipo.label.toUpperCase()}</option>)}
                </select>
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