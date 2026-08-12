const NAV = [
  ["inicio","⌂","Inicio"],["asistencia","✓","Asistencia"],["calificaciones","▣","Calificaciones"],
  ["estudiantes","♙","Estudiantes"],["reportes","▤","Reportes"],["riesgo","◉","Riesgo Académico"],["configuracion","⚙","Configuración"]
];

const STORAGE_KEY = "edunexis_docente_v3";
let alumnos = [];
let attendanceToday = {};
let dirtyGrades = new Set();
let mlData = null;
let mlReady = false;
let mlStale = false;
let state = {
  page:"inicio", selected:null, search:"", group:"5° F", subject:"Matemáticas", period:"1er Trimestre",
  settingsTab:"Perfil", riskFilter:"Todos", studentPage:1, pageSize:10, lastAnalysis:null, reportType:"Resumen académico", teacherName:"Juan Pérez Gómez", teacherEmail:"juan.perez@telesecundaria.edu.mx", theme:"dark", accent:"#a24cff", notifications:[true,true,true,false], twoStep:true
};

const fallback = [
 {"matricula":"2431128023","nombre":"Chavez Francisco Yareth Neftali","grupo":"5° F","asesor":"Máxima Sánchez Cuatletta","asistencia":77,"tareas":76,"p1":82,"p2":82,"p3":67,"promedio":76.7,"riesgo":"Medio"},
 {"matricula":"2431128048","nombre":"Flores Cuamatzi Jose Antonio","grupo":"5° F","asesor":"Paola Xochicale Beciez","asistencia":85,"tareas":75,"p1":69,"p2":82,"p3":68,"promedio":74.6,"riesgo":"Medio"},
 {"matricula":"2431128067","nombre":"Galicia Netzahual Gerardo Asaf","grupo":"5° F","asesor":"Paola Xochicale Beciez","asistencia":77,"tareas":71,"p1":51,"p2":91,"p3":62,"promedio":69.4,"riesgo":"Alto"},
 {"matricula":"2431128004","nombre":"Garcia Jarquin Jesus Adrian","grupo":"5° F","asesor":"Paola Xochicale Beciez","asistencia":91,"tareas":68,"p1":56,"p2":67,"p3":88,"promedio":72.1,"riesgo":"Medio"},
 {"matricula":"2431128020","nombre":"Garcia Meneses Gabriela Lizzeth","grupo":"5° F","asesor":"Paola Xochicale Beciez","asistencia":85,"tareas":93,"p1":77,"p2":60,"p3":57,"promedio":72.3,"riesgo":"Medio"},
 {"matricula":"2431128068","nombre":"Garduño Luna Liliana","grupo":"5° F","asesor":"Paola Xochicale Beciez","asistencia":73,"tareas":88,"p1":85,"p2":92,"p3":84,"promedio":85.8,"riesgo":"Bajo"},
 {"matricula":"2431128049","nombre":"Gomez Cuatepotzo Alondra","grupo":"5° F","asesor":"Paola Xochicale Beciez","asistencia":92,"tareas":91,"p1":92,"p2":67,"p3":66,"promedio":79.8,"riesgo":"Medio"},
 {"matricula":"2431128051","nombre":"Hernas Cuatepitzl Air","grupo":"5° F","asesor":"Paola Xochicale Beciez","asistencia":92,"tareas":61,"p1":80,"p2":59,"p3":59,"promedio":67.5,"riesgo":"Alto"},
 {"matricula":"2431128071","nombre":"Lima Perez Bruno Santiago","grupo":"5° F","asesor":"Patricia Hernandez Cruz","asistencia":95,"tareas":87,"p1":72,"p2":97,"p3":51,"promedio":78,"riesgo":"Medio"},
 {"matricula":"2431128031","nombre":"Macias Gonzalez Jimena","grupo":"5° F","asesor":"Patricia Hernandez Cruz","asistencia":77,"tareas":84,"p1":67,"p2":100,"p3":79,"promedio":81.9,"riesgo":"Medio"},
 {"matricula":"2431128056","nombre":"Osorio Galicia Luis Angel","grupo":"5° F","asesor":"Patricia Hernandez Cruz","asistencia":92,"tareas":60,"p1":59,"p2":53,"p3":68,"promedio":63.3,"riesgo":"Alto"},
 {"matricula":"2431128081","nombre":"Paredes Vazquez Marco Antonio","grupo":"5° F","asesor":"Patricia Hernandez Cruz","asistencia":100,"tareas":79,"p1":88,"p2":51,"p3":84,"promedio":77.9,"riesgo":"Medio"},
 {"matricula":"2431128016","nombre":"Rodriguez Cuchillo Carlos","grupo":"5° F","asesor":"Patricia Hernandez Cruz","asistencia":70,"tareas":85,"p1":56,"p2":92,"p3":62,"promedio":72.9,"riesgo":"Medio"},
 {"matricula":"2431128036","nombre":"Saldaña Vazquez Kenneth","grupo":"5° F","asesor":"Patricia Hernandez Cruz","asistencia":75,"tareas":72,"p1":58,"p2":84,"p3":88,"promedio":75.7,"riesgo":"Medio"},
 {"matricula":"2431128038","nombre":"Temoltzi Galicia Grissel Guadalupe","grupo":"5° F","asesor":"Saul Olaf Loaiza Melendez","asistencia":76,"tareas":96,"p1":82,"p2":74,"p3":78,"promedio":81.4,"riesgo":"Medio"},
 {"matricula":"2431128040","nombre":"Uribe Garcia Carol","grupo":"5° F","asesor":"Saul Olaf Loaiza Melendez","asistencia":80,"tareas":72,"p1":69,"p2":70,"p3":91,"promedio":76.2,"riesgo":"Medio"},
 {"matricula":"2431128064","nombre":"Zepeda Cuahutencos Brayan","grupo":"5° F","asesor":"Saul Olaf Loaiza Melendez","asistencia":94,"tareas":82,"p1":57,"p2":52,"p3":67,"promedio":67,"riesgo":"Alto"},
 {"matricula":"2431128063","nombre":"Zepeda Estrada Yael","grupo":"5° F","asesor":"Saul Olaf Loaiza Melendez","asistencia":92,"tareas":71,"p1":54,"p2":79,"p3":78,"promedio":72.7,"riesgo":"Medio"}
];

function loadSaved(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
    if(saved?.alumnos?.length) alumnos=saved.alumnos;
    if(saved?.attendanceToday) attendanceToday=saved.attendanceToday;
    if(saved?.state) state={...state,...saved.state};
    if(saved?.settings) state={...state,...saved.settings};
    return !!saved;
  }catch(e){ return false; }
}
function persist(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify({
    alumnos,attendanceToday,
    state,
    settings:{
      teacherName:state.teacherName,teacherEmail:state.teacherEmail,
      theme:state.theme,accent:state.accent,
      notifications:state.notifications,twoStep:state.twoStep
    }
  }));
  applyAppearance();
}
function applyAppearance(){
  document.body.dataset.theme=state.theme==="light"?"light":"";
  document.documentElement.style.setProperty("--purple",state.accent||"#a24cff");
}
async function loadData(){
  loadSaved();
  if(!alumnos.length){
    try{
      const r=await fetch("alumnos.json");
      if(!r.ok) throw new Error("No se pudo cargar alumnos.json");
      alumnos=await r.json();
    }catch(e){
      alumnos=JSON.parse(JSON.stringify(fallback));
    }
  }

  try{
    const r=await fetch("../../data/predicciones_ml.json");
    if(!r.ok) throw new Error("No se pudo cargar predicciones_ml.json");
    mlData=await r.json();
    applyMLPredictions();
    mlReady=true;
  }catch(e){
    mlData=null;
    mlReady=false;
  }

  render();
  applyAppearance();
}

function applyMLPredictions(){
  if(!mlData?.predicciones) return;
  const byId=new Map(mlData.predicciones.map(p=>[String(p.matricula),p]));
  alumnos.forEach(a=>{
    const p=byId.get(String(a.matricula));
    if(!p) return;
    a.riesgo=p.riesgo_predicho;
    a.mlConfidence=Number(p.confianza)||0;
    a.mlProbabilities=p.probabilidades||{};
  });
  mlStale=false;
}

async function refreshMLPredictions(){
  try{
    const r=await fetch("../../data/predicciones_ml.json?ts="+Date.now(),{cache:"no-store"});
    if(!r.ok) throw new Error("No se encontró la salida del modelo");
    mlData=await r.json();
    applyMLPredictions();
    mlReady=true;
    persist();
    return true;
  }catch(e){
    mlReady=false;
    return false;
  }
}

function initials(n){return n.split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function avg(list=visibleStudents()){return list.length?list.reduce((a,b)=>a+b.promedio,0)/list.length:0}
function attendanceAvg(list=visibleStudents()){return list.length?list.reduce((a,b)=>a+b.asistencia,0)/list.length:0}
function filteredStudents(){
  let list=visibleStudents();
  if(state.search){
    const q=state.search.toLowerCase().trim();
    list=list.filter(a=>a.nombre.toLowerCase().includes(q)||String(a.matricula).includes(q));
  }
  if(state.riskFilter && state.riskFilter!=="Todos") list=list.filter(a=>a.riesgo===state.riskFilter);
  return list;
}
function visibleStudents(){
  // El prototipo actualmente dispone de datos del grupo 5° F.
  // El filtro de grupo queda preparado para futuros grupos sin ocultar datos
  // cuando se selecciona una materia/periodo que todavía no existe en el JSON.
  return alumnos.filter(a=>!state.group || a.grupo===state.group);
}
function counts(list=visibleStudents()){return {Alto:list.filter(a=>a.riesgo==="Alto").length,Medio:list.filter(a=>a.riesgo==="Medio").length,Bajo:list.filter(a=>a.riesgo==="Bajo").length}}
function scoreClass(v){return v<70?"danger":v<85?"warn":"good"}
function classifyRisk(a){
  // Regla visual del prototipo: los rangos coinciden con la clasificación del dataset.
  // El promedio se recalcula cuando el docente modifica las calificaciones.
  if(a.promedio<70 || a.asistencia<65) return "Alto";
  if(a.promedio<85 || a.asistencia<80) return "Medio";
  return "Bajo";
}
function recalc(a){
  a.promedio=Number(((a.p1+a.p2+a.p3+a.tareas)/4).toFixed(2));
  a.riesgo=classifyRisk(a);
}
function confidence(a){
  if(Number.isFinite(Number(a.mlConfidence)) && Number(a.mlConfidence)>0) return Math.round(Number(a.mlConfidence));
  const spread=Math.abs(a.asistencia-a.promedio);
  return Math.min(96,Math.max(72,Math.round(84+(Math.min(10,spread)/2))));
}
function title(icon,t,sub){return `<div class="page-title"><div class="icon-box">${icon}</div><div><h1>${t}</h1><p>${sub}</p></div></div>`}
function selectHtml(label,id,options,value){return `<div class="field"><label>${label}</label><select id="${id}" data-filter="${id}">${options.map(o=>`<option ${o===value?'selected':''}>${o}</option>`).join("")}</select></div>`}
function filters(extra=""){
  return `<div class="filters">${selectHtml("Grupo","groupFilter",["5° F"],state.group)}${selectHtml("Materia","subjectFilter",["Matemáticas","Español","Ciencias"],state.subject)}${extra}<button class="btn primary" data-action="applyFilters">↻ &nbsp;Actualizar</button></div>`;
}
function renderNav(){document.getElementById("sidebarNav").innerHTML=NAV.map(n=>`<button class="nav-btn ${state.page===n[0]?"active":""}" data-page="${n[0]}"><span class="nav-icon">${n[1]}</span><span>${n[2]}</span></button>`).join("")}
function render(){renderNav();document.getElementById("page").innerHTML=(pages[state.page]||pages.inicio)();bindDynamicValues()}
function bindDynamicValues(){
  document.querySelectorAll("[data-filter]").forEach(el=>el.addEventListener("change",()=>{
    if(el.id==="groupFilter")state.group=el.value;
    if(el.id==="subjectFilter")state.subject=el.value;
    if(el.id==="periodFilter")state.period=el.value;
    if(el.id==="reportType")state.reportType=el.value;
  }));
}

const pages={
inicio(){
 const visible=visibleStudents(), c=counts(visible), risk=c.Alto+c.Medio;
 return `${title("⌂",`¡Bienvenido, <span class="good">Juan Pérez!</span>`,"Aquí tienes un resumen general de tu actividad académica.")}
 <div class="cards">${stat("♙","Mis grupos","1","grupo asignado","purple","Ver detalles","estudiantes")}${stat("♙","Total de estudiantes",visible.length,"estudiantes","good","Ver estudiantes","estudiantes")}${stat("☆","Promedio general",avg().toFixed(2),"del grupo","warn","Ver calificaciones","calificaciones")}${stat("!","Alumnos en riesgo",risk,"estudiantes","danger","Ver más","riesgo")}</div>
 <div class="two-col section-gap"><div class="panel"><h3>ASISTENCIA PROMEDIO POR PERIODO <select class="mini-select"><option>1er Trimestre</option><option>2do Trimestre</option></select></h3>${lineChart()}</div>
 <div class="panel"><h3>DISTRIBUCIÓN DE RIESGO ACADÉMICO</h3><div style="display:flex;align-items:center;gap:18px"><div class="donut"><div class="donut-center">${alumnos.length}<small>Estudiantes</small></div></div>${riskLegend()}</div></div></div>
 <div class="two-col section-gap"><div class="panel"><h3>ALUMNOS EN RIESGO <button class="link-btn" data-page="riesgo">Ver todos →</button></h3>${riskList()}</div><div class="panel"><h3>ACTIVIDAD RECIENTE <button class="link-btn" data-action="activity">Ver todo</button></h3>${activity()}</div></div>
 <div class="two-col section-gap"><div class="panel"><h3>ACCIONES RÁPIDAS</h3><div class="quick-grid">${quick("✓","Pase de lista","asistencia")}${quick("▣","Calificaciones","calificaciones")}${quick("♙","Estudiantes","estudiantes")}${quick("▤","Reportes","reportes")}${quick("!","Riesgo académico","riesgo")}${quick("▦","Ver agenda",null,"agenda")}</div></div>
 <div class="panel"><h3>PRÓXIMAS EVALUACIONES <button class="link-btn" data-action="calendar">Ver calendario</button></h3>${["Examen 2do Parcial - Matemáticas","Proyecto trimestral - Matemáticas","Examen 2do Parcial - Álgebra"].map(x=>`<div class="side-list item"><b>${x}</b><small>5° F · 07:00 a. m.</small></div>`).join("")}</div></div>
 <div class="tip">💡 <b>Tip del día</b><br>La constancia y el seguimiento oportuno hacen la diferencia en el aprendizaje.</div>`;
},

asistencia(){
 return `${title("✓","ASISTENCIA","Registra y consulta la asistencia de tu grupo")}${filters(`<div class="field"><label>Periodo</label><select id="periodFilter" data-filter="periodFilter"><option>1er Trimestre</option><option>2do Trimestre</option><option>3er Trimestre</option></select></div>`)}
 <div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h3>REGISTRO DE ASISTENCIA — 5° F</h3><button class="btn primary" data-action="saveAttendance">Guardar asistencia</button></div>
 <div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Estudiante</th><th>Asistencia actual</th><th>Hoy</th><th>Estado</th></tr></thead><tbody>${visibleStudents().map((a,i)=>{const status=attendanceToday[a.matricula]||"Presente";return `<tr><td>${i+1}</td><td><span class="avatar" style="display:inline-grid;width:34px;height:34px;font-size:11px;vertical-align:middle">${initials(a.nombre)}</span> ${a.nombre}</td><td><b>${a.asistencia}%</b></td><td><select class="field-small attendance-status" data-attendance-id="${a.matricula}"><option ${status==='Presente'?'selected':''}>Presente</option><option ${status==='Falta'?'selected':''}>Falta</option><option ${status==='Justificada'?'selected':''}>Justificada</option></select></td><td><span class="risk ${a.asistencia<75?'Alto':a.asistencia<85?'Medio':'Bajo'}">${a.asistencia<75?'Baja':a.asistencia<85?'Regular':'Buena'}</span></td></tr>`}).join("")}</tbody></table></div></div>`;
},

calificaciones(){
 return `${title("▣","CALIFICACIONES","Gestiona y registra las calificaciones de tu grupo")}${filters(`<div class="field"><label>Periodo</label><select id="periodFilter" data-filter="periodFilter"><option>1er Trimestre</option><option>2do Trimestre</option><option>3er Trimestre</option></select></div>`)}
 <div class="two-col"><div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h3>CALIFICACIONES DEL GRUPO</h3><button class="btn" data-action="addGrade">＋ Agregar calificación</button></div>
 <div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Estudiante</th><th>P1<br><small>30%</small></th><th>P2<br><small>30%</small></th><th>P3<br><small>30%</small></th><th>Tareas<br><small>10%</small></th><th>Promedio</th><th>Riesgo</th><th></th></tr></thead><tbody>
 ${visibleStudents().map((a,i)=>`<tr><td>${i+1}</td><td><b>${initials(a.nombre)}</b> ${a.nombre}</td><td><input class="grade" type="number" min="0" max="100" data-grade="p1" data-id="${a.matricula}" value="${a.p1}"></td><td><input class="grade" type="number" min="0" max="100" data-grade="p2" data-id="${a.matricula}" value="${a.p2}"></td><td><input class="grade" type="number" min="0" max="100" data-grade="p3" data-id="${a.matricula}" value="${a.p3}"></td><td><input class="grade" type="number" min="0" max="100" data-grade="tareas" data-id="${a.matricula}" value="${a.tareas}"></td><td class="${scoreClass(a.promedio)}"><b>${a.promedio.toFixed(2)}</b></td><td><span class="risk ${a.riesgo}">${a.riesgo}</span></td><td><button class="icon-btn" data-action="riskDetail" data-id="${a.matricula}">⋮</button></td></tr>`).join("")}</tbody></table></div>
 <div style="display:flex;justify-content:flex-end;margin-top:15px"><button class="btn primary" data-action="saveGrades">▣ Guardar cambios</button></div></div>
 <div><div class="panel"><h3>RESUMEN DEL GRUPO</h3><div class="donut" style="margin:auto"><div class="donut-center">${avg().toFixed(2)}<small>Promedio general</small></div></div><p class="danger">Alto (&lt; 70): ${counts().Alto}</p><p class="warn">Medio (70 - 84.9): ${counts().Medio}</p><p class="good">Bajo (≥ 85): ${counts().Bajo}</p></div><div class="panel section-gap"><h3>MEJOR PROMEDIO</h3>${bestStudent()}</div></div></div>`;
},

estudiantes(){
 const list=visibleStudents().filter(a=>a.nombre.toLowerCase().includes(state.search.toLowerCase())||a.matricula.includes(state.search));
 const totalPages=Math.max(1,Math.ceil(list.length/state.pageSize));state.studentPage=Math.min(state.studentPage,totalPages);
 const start=(state.studentPage-1)*state.pageSize;const pageRows=list.slice(start,start+state.pageSize);const selected=state.selected&&list.find(a=>a.matricula===state.selected)?state.selected:(list[0]?.matricula||null);if(selected&&!state.selected)state.selected=selected;
 return `${title("♙","ESTUDIANTES","Consulta la información de tus estudiantes")}
 <div class="filters"><div class="field"><label>Grupo</label><select><option>5° F</option></select></div><div class="field"><label>Materia</label><select><option>Matemáticas</option></select></div><div class="field"><label>Buscar estudiante</label><input id="studentSearch" value="${escapeHtml(state.search)}" placeholder="Buscar por nombre o ID..."></div><button class="btn" data-action="export">⇩ Exportar</button></div>
 <div class="two-col" style="grid-template-columns:1fr .28fr"><div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Estudiante</th><th>ID</th><th>Promedio</th><th>Riesgo</th><th>Acciones</th></tr></thead><tbody>${pageRows.map((a,i)=>`<tr><td>${start+i+1}</td><td><span class="avatar" style="display:inline-grid;width:34px;height:34px;font-size:11px;vertical-align:middle">${initials(a.nombre)}</span> ${a.nombre}</td><td>${a.matricula}</td><td class="${scoreClass(a.promedio)}"><b>${a.promedio.toFixed(2)}</b></td><td><span class="risk ${a.riesgo}">${a.riesgo}</span></td><td><button class="icon-btn" data-action="profile" data-id="${a.matricula}">◉</button> <button class="icon-btn" data-action="riskDetail" data-id="${a.matricula}">⋮</button></td></tr>`).join("")||`<tr><td colspan="6" class="empty">No se encontraron estudiantes.</td></tr>`}</tbody></table></div><div class="pagination">Mostrando ${pageRows.length} de ${list.length}<span class="pager"><button data-action="studentPrev" ${state.studentPage<=1?'disabled':''}>‹</button><button class="current">${state.studentPage}</button><button data-action="studentNext" ${state.studentPage>=totalPages?'disabled':''}>›</button></span></div></div><div class="panel student-profile">${profile()}</div></div>`;
},

reportes(){
 return `${title("▤","REPORTES","Análisis y estadísticas de tu grupo")}${filters(`<div class="field"><label>Periodo</label><select id="periodFilter" data-filter="periodFilter"><option>1er Trimestre</option><option>2do Trimestre</option><option>3er Trimestre</option></select></div><div class="field"><label>Tipo de reporte</label><select id="reportType" data-filter="reportType"><option>Resumen general</option><option>Riesgo académico</option><option>Asistencia</option></select></div>`)}
 <div class="cards">${stat("♙","Total de estudiantes",alumnos.length,"100% del grupo","purple")}${stat("✓","Asistencia promedio",Math.round(attendanceAvg())+"%","del grupo","good")}${stat("☆","Promedio general",avg().toFixed(2),"del grupo","warn")}${stat("!","En riesgo alto",counts().Alto,(counts().Alto/alumnos.length*100).toFixed(1)+"% del grupo","danger")}${stat("▤","Actividades entregadas",Math.round(alumnos.reduce((x,a)=>x+a.tareas,0)/alumnos.length)+"%","Promedio del grupo","good")}</div>
 <div class="two-col section-gap"><div class="panel"><h3>PROMEDIO GENERAL POR PERIODO</h3>${lineChart(true)}</div><div class="panel"><h3>DISTRIBUCIÓN DE RIESGO ACADÉMICO</h3><div style="display:flex;align-items:center;gap:20px"><div class="donut"><div class="donut-center">${alumnos.length}<small>Estudiantes</small></div></div>${riskLegend()}</div></div></div>
 <div class="panel section-gap"><h3>RESUMEN GENERAL DEL GRUPO</h3><div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Estudiante</th><th>Asistencia</th><th>Promedio</th><th>Tareas</th><th>Riesgo</th></tr></thead><tbody>${alumnos.slice(0,10).map((a,i)=>`<tr><td>${i+1}</td><td>${a.nombre}</td><td>${a.asistencia}%</td><td class="${scoreClass(a.promedio)}">${a.promedio.toFixed(2)}</td><td>${a.tareas}%</td><td><span class="risk ${a.riesgo}">${a.riesgo}</span></td></tr>`).join("")}</tbody></table></div></div>
 <div class="panel section-gap"><h3>ACCIONES RÁPIDAS</h3><button class="btn" data-action="export">▤ Exportar a CSV</button> <button class="btn" data-action="print">▣ Imprimir reporte</button> <button class="btn primary" data-action="generateReport">⌁ Generar reporte</button></div>`;
},

riesgo(){
 const visible=visibleStudents();
 const c=counts(visible),total=visible.length,riskFilter=state.riskFilter||"Todos";
 const list=(riskFilter==="Todos"?visible:visible.filter(a=>a.riesgo===riskFilter)).slice().sort((a,b)=>({Alto:0,Medio:1,Bajo:2}[a.riesgo]-({Alto:0,Medio:1,Bajo:2}[b.riesgo]))||a.promedio-b.promedio);
 const pct=n=>total?((n/total)*100).toFixed(1):"0.0";
 const meta=mlData?.modelo;
 const importancias=meta?.importancia_variables||[];
 const metric=meta?.evaluacion;
 return `${title("◉","RIESGO ACADÉMICO","Predicción, clasificación y seguimiento del riesgo escolar")}
 <div class="risk-toolbar"><div class="risk-context"><div><span>Grupo</span><b>${escapeHtml(state.group)}</b></div><div><span>Materia</span><b>${escapeHtml(state.subject)}</b></div><div><span>Periodo</span><b>${escapeHtml(state.period)}</b></div></div><div class="model-status"><span class="status-dot"></span><div><b>${mlReady?"Modelo ML cargado":"Modelo no disponible"}</b><small>${meta?.nombre||"Ejecuta modelo_ml.py"}</small></div></div><button class="btn primary analyze-btn" data-action="analyzeGroup">✦ Analizar grupo</button></div>
 <div class="analysis-status" id="analysisStatus"><span>Último análisis: ${state.lastAnalysis||"No registrado"}</span><span class="status-ok">✓ ${total} estudiantes ${mlReady?"con predicción ML":"listos para analizar"}</span></div>
 <div class="cards risk-summary-cards">${stat("!","Estudiantes analizados",total,total?"100% del grupo":"Sin datos","purple")}${stat("!","Riesgo alto",c.Alto,pct(c.Alto)+"% del grupo","danger")}${stat("!","Riesgo medio",c.Medio,pct(c.Medio)+"% del grupo","warn")}${stat("✓","Riesgo bajo",c.Bajo,pct(c.Bajo)+"% del grupo","good")}${stat("◉","Índice general",c.Alto>=4?"Moderado":c.Alto>0?"Bajo":"Estable","clasificación del grupo",c.Alto>=4?"warn":"good")}</div>
 <div class="risk-main-grid section-gap"><div class="panel risk-distribution-panel"><div class="panel-heading"><div><h3>DISTRIBUCIÓN DE RIESGO ACADÉMICO</h3><small>Clasificación generada por el modelo</small></div></div><div class="risk-distribution"><div class="donut risk-donut" style="--high:${pct(c.Alto)}%;--mid:${pct(c.Alto+c.Medio)}%"><div class="donut-center">${total}<small>Estudiantes</small></div></div><div class="legend risk-legend"><div><i class="dot" style="background:#ff2c70"></i><span>Riesgo alto <b class="danger">${c.Alto}</b><small>${pct(c.Alto)}% del grupo</small></span></div><div><i class="dot" style="background:#ffc400"></i><span>Riesgo medio <b class="warn">${c.Medio}</b><small>${pct(c.Medio)}% del grupo</small></span></div><div><i class="dot" style="background:#15c39b"></i><span>Riesgo bajo <b class="good">${c.Bajo}</b><small>${pct(c.Bajo)}% del grupo</small></span></div></div></div><div class="risk-index"><span>Índice de riesgo general</span><b class="${c.Alto>=4?'warn':'good'}">${c.Alto>=4?'Moderado':c.Alto>0?'Bajo':'Estable'}</b></div></div>
 <div class="panel indicators-panel"><div class="panel-heading"><div><h3>INDICADORES DEL GRUPO</h3><small>Variables utilizadas por el modelo</small></div></div>${indicator("Asistencia promedio",Math.round(attendanceAvg(visible)),"good")}${indicator("Tareas entregadas",Math.round(visible.reduce((x,a)=>x+a.tareas,0)/Math.max(1,total)),"good")}${indicator("Parciales",Math.round(visible.reduce((x,a)=>x+(a.p1+a.p2+a.p3)/3,0)/Math.max(1,total)),"warn")}${indicator("Promedio académico",Math.round(avg(visible)),avg(visible)>=85?"good":"warn")}</div></div>
 <div class="panel section-gap prediction-panel"><div class="panel-heading prediction-heading"><div><h3>PREDICCIONES DEL GRUPO</h3><small>Resultado real cargado desde <code>predicciones_ml.json</code></small></div><div class="risk-filters">${["Todos","Alto","Medio","Bajo"].map(x=>`<button class="risk-filter ${riskFilter===x?'active':''}" data-risk-filter="${x}">${x} <span>${x==='Todos'?total:c[x]}</span></button>`).join("")}</div></div><div class="table-wrap"><table class="table risk-table"><thead><tr><th>#</th><th>Estudiante</th><th>Asistencia</th><th>Tareas</th><th>Promedio</th><th>Riesgo predicho</th><th>Confianza</th><th>Acción</th></tr></thead><tbody>${list.map((a,i)=>`<tr><td>${i+1}</td><td><div class="student-cell"><span class="avatar">${initials(a.nombre)}</span><div><b>${escapeHtml(a.nombre)}</b><small>ID ${a.matricula}</small></div></div></td><td>${a.asistencia}%</td><td>${a.tareas}%</td><td class="${scoreClass(a.promedio)}"><b>${a.promedio.toFixed(2)}</b></td><td><span class="risk ${a.riesgo}">${a.riesgo}</span></td><td><div class="confidence"><span style="width:${confidence(a)}%"></span></div><b>${confidence(a)}%</b></td><td><button class="btn mini-btn" data-action="riskDetail" data-id="${a.matricula}">Ver análisis</button></td></tr>`).join("")||`<tr><td colspan="8" class="empty">No hay estudiantes en esta categoría.</td></tr>`}</tbody></table></div><div class="prototype-note">Las probabilidades y la confianza provienen del modelo entrenado con datos simulados. La validación es orientativa por el tamaño reducido del dataset.</div></div>
 <div class="risk-bottom-grid section-gap"><div class="panel"><div class="panel-heading"><div><h3>IMPORTANCIA DE VARIABLES</h3><small>Qué variables tuvieron mayor peso en el modelo</small></div></div>${importancias.map(x=>indicator(x.variable,Math.round(x.porcentaje),"purple")).join("")||`<div class="empty">Ejecuta el modelo para cargar importancias.</div>`}</div><div class="panel"><div class="panel-heading"><div><h3>RECOMENDACIONES DEL SISTEMA</h3><small>Acciones sugeridas para el docente</small></div></div><div class="recommendation"><span>01</span><div><b>Atender primero los casos de riesgo alto</b><small>Revisar desempeño, asistencia y actividades pendientes.</small></div></div><div class="recommendation"><span>02</span><div><b>Dar seguimiento a riesgo medio</b><small>Observar evolución antes de que aumente el nivel de riesgo.</small></div></div><div class="recommendation"><span>03</span><div><b>Reforzar contenidos con menor desempeño</b><small>Priorizar las variables con valores más bajos.</small></div></div>${metric?`<div class="prototype-note">Validación LOO · Accuracy: ${(metric.accuracy*100).toFixed(1)}% · F1 macro: ${(metric.f1_macro*100).toFixed(1)}%</div>`:""}</div></div>
 <div class="tip">🤖 <b>Machine Learning</b><br>Random Forest clasifica el nivel de riesgo usando asistencia, tareas y los tres parciales. Los datos son simulados y el modelo se utiliza con fines académicos de prototipo.</div>`;
},

configuracion(){return `${title("⚙","CONFIGURACIÓN","Personaliza el sistema y administra tus preferencias")}<div class="panel"><div class="settings-tabs">${["Perfil","Notificaciones","Preferencias","Seguridad","Sistema","Respaldo"].map(x=>`<button class="tab ${state.settingsTab===x?'active':''}" data-tab="${x}">${x}</button>`).join("")}</div>${settingsBody()}</div>`}
};

function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
function indicator(label,value,cls){return `<div class="indicator"><div class="indicator-label"><span>${label}</span><b class="${cls}">${value}%</b></div><div class="bar"><span class="${cls}" style="width:${Math.min(100,value)}%"></span></div></div>`}
function stat(icon,label,value,sub,cls,action,page){return `<div class="stat"><div class="stat-top"><div class="stat-icon">${icon}</div><span>${label}</span></div><b class="${cls}">${value}</b><small>${sub}</small>${action?`<div style="margin-top:12px"><button class="link-btn" ${page?`data-page="${page}"`:''}>${action} ${page?'→':''}</button></div>`:""}</div>`}
function quick(icon,text,page,action){return `<button class="quick" ${page?`data-page="${page}"`:`data-action="${action}"`}><div class="qicon">${icon}</div>${text}</button>`}
function lineChart(report=false){return `<div class="line-chart"><div class="axis"></div><div class="line"></div><div class="points"><i class="point"></i><i class="point"></i><i class="point"></i></div><div class="chart-labels"><span>1er Parcial<br><small>${report?'74':'63'}%</small></span><span>2do Parcial<br><small>${report?'77':'71'}%</small></span><span>3er Parcial<br><small>${report?'79':'71'}%</small></span></div></div>`}
function riskLegend(){const c=counts();return `<div class="legend"><div><i class="dot" style="background:#ff2c70"></i>Alto <b class="danger">${c.Alto}</b> (${(c.Alto/alumnos.length*100).toFixed(1)}%)</div><div><i class="dot" style="background:#ffc400"></i>Medio <b class="warn">${c.Medio}</b> (${(c.Medio/alumnos.length*100).toFixed(1)}%)</div><div><i class="dot" style="background:#15c39b"></i>Bajo <b class="good">${c.Bajo}</b> (${(c.Bajo/alumnos.length*100).toFixed(1)}%)</div></div>`}
function riskList(){return visibleStudents().filter(a=>a.riesgo!=="Bajo").sort((a,b)=>a.promedio-b.promedio).slice(0,5).map(a=>`<div class="activity-item"><span class="avatar">${initials(a.nombre)}</span><div style="flex:1"><b>${a.nombre}</b><div class="${a.riesgo==='Alto'?'danger':'warn'}">Riesgo ${a.riesgo.toLowerCase()}</div></div><small>Asistencia: ${a.asistencia}%<br>Promedio: ${a.promedio.toFixed(2)}</small></div>`).join("")}
function activity(){return [["✓","Pase de lista registrado","Grupo 5° F - 1ra Hora","Hoy"],["☆","Calificaciones actualizadas","Matemáticas - 2do Parcial","Ayer"],["▤","Reporte generado","Resumen general - 5° F","19 May"],["!","Alerta de riesgo académico",`${counts().Alto} estudiantes identificados`,"18 May"],["♙","Estudiante agregado","Nuevo estudiante en 5° F","18 May"]].map(x=>`<div class="activity-item"><span class="activity-icon">${x[0]}</span><div style="flex:1"><b>${x[1]}</b><small style="display:block;color:#91a0b9">${x[2]}</small></div><small>${x[3]}</small></div>`).join("")}
function bestStudent(){const b=[...alumnos].sort((x,y)=>y.promedio-x.promedio)[0];return `<div style="display:flex;align-items:center;gap:12px"><span class="avatar">${initials(b.nombre)}</span><div style="flex:1">${b.nombre}</div><b class="good">${b.promedio.toFixed(2)}</b></div>`}
function profile(){const a=state.selected?alumnos.find(x=>x.matricula===state.selected):alumnos[0];if(!a)return `<div class="empty">Selecciona un estudiante.</div>`;return `<div class="profile"><div class="profile-avatar">${initials(a.nombre)}</div><h3>${a.nombre}</h3><button class="btn" data-action="riskDetail" data-id="${a.matricula}">Ver historial académico →</button></div><div class="profile-data"><div>▣ ID: ${a.matricula}</div><div>▣ Grupo: ${a.grupo}</div><div>▣ Materia: Matemáticas</div><div>◉ Promedio general: <span class="${scoreClass(a.promedio)}">${a.promedio.toFixed(2)}</span></div><div>◉ Riesgo académico: <span class="${a.riesgo==='Alto'?'danger':a.riesgo==='Medio'?'warn':'good'}">${a.riesgo}</span></div></div>`}
function settingsBody(){
 if(state.settingsTab==="Perfil")return `<div class="setting-grid"><div class="panel"><h3>INFORMACIÓN DEL DOCENTE</h3><div class="profile-avatar">${initials(state.teacherName)}</div><div class="field"><label>Nombre completo</label><input id="teacherName" value="${escapeHtml(state.teacherName)}"></div><div class="field section-gap"><label>Correo electrónico</label><input id="teacherEmail" type="email" value="${escapeHtml(state.teacherEmail)}"></div><button class="btn primary section-gap" data-action="saveSettings">▣ Guardar cambios</button></div><div class="panel"><h3>PREFERENCIAS DE VISUALIZACIÓN</h3><div class="setting-row"><span>Tema de la interfaz</span><span><button class="btn ${state.theme==="dark"?"primary":""}" data-action="themeDark">Oscuro</button> <button class="btn ${state.theme==="light"?"primary":""}" data-action="themeLight">Claro</button></span></div><div class="setting-row"><span>Color de acento</span><span class="color-row"><button class="color" aria-label="Morado" style="background:#a24cff;outline:${state.accent==="#a24cff"?"2px solid white":"none"}" data-action="accentPurple"></button><button class="color" aria-label="Cian" style="background:#00d8c4;outline:${state.accent==="#00d8c4"?"2px solid white":"none"}" data-action="accentCyan"></button><button class="color" aria-label="Amarillo" style="background:#ffc400;outline:${state.accent==="#ffc400"?"2px solid white":"none"}" data-action="accentYellow"></button></span></div><div class="setting-row"><span>Idioma</span><select><option>Español</option></select></div></div></div>`;
 if(state.settingsTab==="Notificaciones")return `<div class="setting-grid"><div class="panel"><h3>NOTIFICACIONES</h3>${["Alertas de riesgo académico","Recordatorios de evaluaciones","Cambios en calificaciones","Actividad del sistema"].map((x,i)=>`<div class="setting-row"><span>${x}<small style="display:block;color:#8f9db6;margin-top:3px">Recibir avisos relacionados con ${x.toLowerCase()}.</small></span><button class="switch ${state.notifications[i]?"on":""}" data-action="toggleSwitch" data-switch-index="${i}"><span></span></button></div>`).join("")}</div><div class="panel"><h3>RESUMEN</h3><p style="color:#9eacc6;line-height:1.6">Las notificaciones son preferencias simuladas del prototipo y se conservan en este navegador.</p></div></div>`;
 if(state.settingsTab==="Seguridad")return `<div class="setting-grid"><div class="panel"><h3>SEGURIDAD DE LA CUENTA</h3><div class="setting-row"><span>Cambiar contraseña</span><button class="icon-btn" data-action="changePassword">→</button></div><div class="setting-row"><span>Verificación en dos pasos</span><button class="switch ${state.twoStep?"on":""}" data-action="toggleTwoStep"><span></span></button></div></div><div class="panel"><h3>ESTADO</h3><div class="setting-row"><span>Sesión</span><span class="good">Activa</span></div><div class="setting-row"><span>Última revisión</span><span>21/05/2026</span></div></div></div>`;
 if(state.settingsTab==="Sistema")return `<div class="setting-grid"><div class="panel"><h3>INFORMACIÓN DEL SISTEMA</h3><div class="setting-row"><span>Versión del sistema</span><span>v1.0.0</span></div><div class="setting-row"><span>Estado del sistema</span><span class="good">Activo</span></div><div class="setting-row"><span>Fuente de datos</span><span class="good">Datos simulados</span></div><div class="setting-row"><span>Persistencia</span><span>LocalStorage</span></div></div><div class="panel"><h3>ALMACENAMIENTO</h3><div class="setting-row"><span>Uso estimado</span><span>68%</span></div><div class="bar"><span style="width:68%"></span></div></div></div>`;
 if(state.settingsTab==="Respaldo")return `<div class="setting-grid"><div class="panel"><h3>RESPALDO DE DATOS</h3><p style="color:#9eacc6;line-height:1.6">Genera un archivo JSON con la información actual del prototipo para conservar los cambios realizados.</p><button class="btn primary" data-action="backup">⇩ Crear respaldo</button></div><div class="panel"><h3>RESTAURAR</h3><p style="color:#9eacc6;line-height:1.6">Los datos pueden restaurarse manualmente en una siguiente versión.</p><button class="btn" data-action="toast">Restauración disponible</button></div></div>`;
 return `<div class="empty">Preferencias generales listas para el prototipo.</div>`;
}

// =========================================================
// EVENTOS Y FUNCIONES INTERACTIVAS — FASE 2.5 REPARADA
// =========================================================

function actions(action,id){
  if(action==="applyFilters"){
    state.studentPage=1;
    persist(); render(); toast("Filtros actualizados.");
    return;
  }

  if(action==="saveGrades"){
    dirtyGrades.forEach(studentId=>{
      const student=alumnos.find(x=>x.matricula===studentId);
      if(student) recalc(student);
    });
    dirtyGrades.clear();
    mlStale=true;
    persist(); render(); toast("Calificaciones guardadas. Ejecuta el modelo ML para actualizar las predicciones.");
    return;
  }

  if(action==="saveAttendance"){
    persist(); toast("Asistencia guardada correctamente.");
    return;
  }

  if(action==="analyzeGroup"){
    const status=document.getElementById("analysisStatus");
    if(status) status.innerHTML='<span class="analyzing"><span class="status-dot"></span>Cargando predicciones del modelo...</span><span>Consultando predicciones_ml.json</span>';
    setTimeout(async()=>{
      const ok=await refreshMLPredictions();
      if(ok){
        state.lastAnalysis=new Date().toLocaleString("es-MX");
        persist(); render(); toast("Predicciones del modelo ML cargadas.");
      }else{
        if(status) status.innerHTML='<span class="danger">⚠ No se pudo cargar predicciones_ml.json</span><span>Ejecuta modelo_ml.py y vuelve a intentar.</span>';
        toast("No se encontró la salida del modelo ML.");
      }
    },300);
    return;
  }

  if(action==="riskDetail"){ riskDetail(id); return; }

  if(action==="profile"){
    state.selected=id;
    state.page="estudiantes";
    state.studentPage=1;
    persist(); render();
    return;
  }

  if(action==="studentPrev"){
    state.studentPage=Math.max(1,state.studentPage-1);
    render(); return;
  }

  if(action==="studentNext"){
    const total=Math.max(1,Math.ceil(filteredStudents().length/state.pageSize));
    state.studentPage=Math.min(total,state.studentPage+1);
    render(); return;
  }

  if(action==="export"){ downloadCSV(); return; }
  if(action==="print"){ window.print(); return; }
  if(action==="generateReport"){ generateReport(); return; }
  if(action==="backup"){ downloadBackup(); return; }

  if(action==="calendar" || action==="agenda"){ showCalendar(); return; }
  if(action==="activity"){ showActivity(); return; }

  if(action==="addGrade"){
    showModal(`
      <div class="modal-header">
        <div><span class="eyebrow">CALIFICACIONES</span><h2>Agregar evaluación</h2></div>
        <button class="icon-btn" data-close-modal aria-label="Cerrar">×</button>
      </div>
      <p>En esta versión del prototipo las evaluaciones disponibles son P1, P2, P3 y Tareas. Puedes editar directamente los valores de la tabla.</p>
      <div class="modal-actions"><button class="btn primary" data-close-modal>Entendido</button></div>
    `);
    return;
  }

  if(action==="saveSettings"){
    const name=document.getElementById("teacherName");
    const email=document.getElementById("teacherEmail");
    if(name) state.teacherName=name.value.trim() || "Docente";
    if(email) state.teacherEmail=email.value.trim();
    persist(); render(); toast("Cambios guardados correctamente.");
    return;
  }

  if(action==="changePassword"){
    showModal(`
      <div class="modal-header"><div><span class="eyebrow">SEGURIDAD</span><h2>Cambiar contraseña</h2></div><button class="icon-btn" data-close-modal>×</button></div>
      <div class="field"><label>Contraseña actual</label><input type="password" placeholder="••••••••"></div>
      <div class="field"><label>Nueva contraseña</label><input type="password" placeholder="••••••••"></div>
      <div class="field"><label>Confirmar contraseña</label><input type="password" placeholder="••••••••"></div>
      <div class="modal-actions"><button class="btn primary" data-action="confirmPassword">Guardar</button><button class="btn" data-close-modal>Cancelar</button></div>
    `);
    return;
  }

  if(action==="confirmPassword"){
    closeModal(); toast("Contraseña actualizada en el prototipo.");
    return;
  }

  if(action==="toggleSwitch"){
    const index=Number(id);
    if(Number.isInteger(index) && index>=0 && index<state.notifications.length){
      state.notifications[index]=!state.notifications[index];
      persist(); render();
      toast("Preferencia actualizada.");
    }
    return;
  }

  if(action==="toggleTwoStep"){
    state.twoStep=!state.twoStep;
    persist(); render();
    toast(state.twoStep ? "Verificación en dos pasos activada." : "Verificación en dos pasos desactivada.");
    return;
  }

  if(action==="themeLight"){
    state.theme="light"; persist(); render(); toast("Tema claro aplicado."); return;
  }

  if(action==="themeDark"){
    state.theme="dark"; persist(); render(); toast("Tema oscuro aplicado."); return;
  }

  if(action==="accentPurple"){
    state.accent="#a24cff"; persist(); render(); toast("Color de acento actualizado."); return;
  }

  if(action==="accentCyan"){
    state.accent="#00d8c4"; persist(); render(); toast("Color de acento actualizado."); return;
  }

  if(action==="accentYellow"){
    state.accent="#ffc400"; persist(); render(); toast("Color de acento actualizado."); return;
  }

  if(action==="toast"){ toast("Función disponible en el prototipo."); return; }

  if(action==="logout"){
    showModal(`
      <div class="modal-header"><div><span class="eyebrow">SESIÓN</span><h2>Cerrar sesión</h2></div><button class="icon-btn" data-close-modal>×</button></div>
      <p>La sesión se cerraría aquí. En este prototipo la acción es simulada.</p>
      <div class="modal-actions"><button class="btn primary" data-close-modal>Entendido</button><button class="btn" data-close-modal>Cancelar</button></div>
    `);
    return;
  }

  toast("Acción disponible en el prototipo.");
}

function riskDetail(id){
  const a=alumnos.find(x=>x.matricula===id);
  if(!a) return;
  const riskColor=a.riesgo==="Alto"?"danger":a.riesgo==="Medio"?"warn":"good";
  const recommendation=a.riesgo==="Alto"
    ?"Dar seguimiento prioritario y reforzar los contenidos de menor desempeño."
    :a.riesgo==="Medio"
      ?"Monitorear su evolución y reforzar actividades antes del siguiente periodo."
      :"Mantener el acompañamiento y reconocer la constancia del estudiante.";

  showModal(`
    <div class="modal-header">
      <div><span class="eyebrow">ANÁLISIS INDIVIDUAL</span><h2>${escapeHtml(a.nombre)}</h2><small>ID ${a.matricula} · Grupo ${a.grupo}</small></div>
      <button class="icon-btn" data-close-modal aria-label="Cerrar">×</button>
    </div>
    <div class="risk-result">
      <div><span>RIESGO PREDICHO</span><b class="${riskColor}">${a.riesgo}</b></div>
      <div><span>CONFIANZA ESTIMADA</span><b>${confidence(a)}%</b></div>
    </div>
    <div class="modal-metrics">
      ${[["Asistencia",a.asistencia+"%"],["Tareas",a.tareas+"%"],["Parcial 1",a.p1],["Parcial 2",a.p2],["Parcial 3",a.p3],["Promedio",a.promedio.toFixed(2)]].map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}
    </div>
    <div class="modal-section"><h3>Lectura del sistema</h3><p>El estudiante fue clasificado como <b class="${riskColor}">riesgo ${a.riesgo.toLowerCase()}</b> a partir de sus indicadores académicos y de asistencia.</p></div>
    <div class="modal-section recommendation-modal"><h3>Recomendación</h3><p>${recommendation}</p></div>
    ${a.mlProbabilities?`<div class="modal-section"><h3>Probabilidades por clase</h3>${Object.entries(a.mlProbabilities).map(([k,v])=>`<div class="indicator"><div class="indicator-label"><span>Riesgo ${k}</span><b>${v}%</b></div><div class="bar"><span style="width:${v}%"></span></div></div>`).join("")}</div>`:""}
    <div class="prototype-note">La confianza y las probabilidades mostradas provienen de la salida del modelo ML cargada desde <code>predicciones_ml.json</code>.</div>
    <div class="modal-actions"><button class="btn" data-close-modal>Cerrar</button></div>
  `);
}

function showModal(content){
  const root=document.getElementById("modalRoot");
  root.innerHTML=`<div class="modal-bg" data-modal-backdrop><div class="modal risk-modal">${content}</div></div>`;
  document.body.classList.add("modal-open");
}

function closeModal(){
  const root=document.getElementById("modalRoot");
  if(root) root.innerHTML="";
  document.body.classList.remove("modal-open");
}

function showCalendar(){
  showModal(`
    <div class="modal-header"><div><span class="eyebrow">AGENDA</span><h2>Agenda del docente</h2></div><button class="icon-btn" data-close-modal>×</button></div>
    <div class="side-list item"><b>26 MAY</b><small>Examen 2do Parcial - Matemáticas · 5° F · 07:00 a. m.</small></div>
    <div class="side-list item"><b>30 MAY</b><small>Proyecto trimestral - Matemáticas · 5° F · 07:00 a. m.</small></div>
    <div class="side-list item"><b>02 JUN</b><small>Examen 2do Parcial - Álgebra · 5° F · 07:00 a. m.</small></div>
    <div class="modal-actions"><button class="btn" data-close-modal>Cerrar</button></div>
  `);
}

function showActivity(){
  showModal(`<div class="modal-header"><div><span class="eyebrow">ACTIVIDAD</span><h2>Actividad reciente</h2></div><button class="icon-btn" data-close-modal>×</button></div>${activity()}<div class="modal-actions"><button class="btn" data-close-modal>Cerrar</button></div>`);
}

function generateReport(){
  const list=visibleStudents();
  const c=counts(list);
  const text=`EduNexis — Reporte del grupo ${state.group}\n\nEstudiantes: ${list.length}\nAsistencia promedio: ${attendanceAvg(list).toFixed(1)}%\nPromedio general: ${avg(list).toFixed(2)}\nRiesgo alto: ${c.Alto}\nRiesgo medio: ${c.Medio}\nRiesgo bajo: ${c.Bajo}\n\nEste reporte pertenece al prototipo y utiliza datos simulados.`;
  downloadBlob(text,"reporte_edunexis.txt","text/plain;charset=utf-8");
  toast("Reporte generado correctamente.");
}

function downloadCSV(){
  const list=visibleStudents();
  const rows=[["Matricula","Nombre","Grupo","Asistencia","Tareas","Parcial 1","Parcial 2","Parcial 3","Promedio","Riesgo"],...list.map(a=>[a.matricula,a.nombre,a.grupo,a.asistencia,a.tareas,a.p1,a.p2,a.p3,a.promedio,a.riesgo])];
  const csv="\ufeff"+rows.map(r=>r.map(csvCell).join(",")).join("\n");
  downloadBlob(csv,"reporte_edunexis.csv","text/csv;charset=utf-8");
  toast("CSV exportado correctamente.");
}

function csvCell(v){
  const s=String(v??"");
  return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;
}

function downloadBackup(){
  downloadBlob(JSON.stringify({
    fecha:"21/05/2026",grupo:state.group,alumnos,attendanceToday,state
  },null,2),"respaldo_edunexis.json","application/json;charset=utf-8");
  toast("Respaldo creado correctamente.");
}

function downloadBlob(data,name,type){
  const blob=new Blob([data],{type});
  const u=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=u;a.download=name;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),500);
}

function toast(text){
  const r=document.getElementById("toastRoot");
  if(!r)return;
  r.innerHTML=`<div class="toast">${escapeHtml(text)}</div>`;
  setTimeout(()=>{r.innerHTML="";},2500);
}

document.addEventListener("click",e=>{
  if(e.target.closest("[data-close-modal]")){
    closeModal();
    return;
  }

  if(e.target.closest("[data-modal-backdrop]") && !e.target.closest(".modal")){
    closeModal();
    return;
  }

  const page=e.target.closest("[data-page]");
  if(page){
    state.page=page.dataset.page;
    state.studentPage=1;
    closeModal();
    persist(); render();
    return;
  }

  const tab=e.target.closest("[data-tab]");
  if(tab){
    state.settingsTab=tab.dataset.tab;
    render();
    return;
  }

  const rf=e.target.closest("[data-risk-filter]");
  if(rf){
    state.riskFilter=rf.dataset.riskFilter;
    state.studentPage=1;
    render();
    return;
  }

  const act=e.target.closest("[data-action]");
  if(act){
    actions(act.dataset.action,act.dataset.id ?? act.dataset.switchIndex);
    return;
  }

  if(e.target.closest("#userMenuBtn")){
    showModal(`
      <div class="modal-header"><div><span class="eyebrow">PERFIL</span><h2>${escapeHtml(state.teacherName)}</h2></div><button class="icon-btn" data-close-modal>×</button></div>
      <p>Docente · Grupo ${state.group} · ${state.subject}</p>
      <div class="modal-actions"><button class="btn primary" data-page="configuracion">Mi perfil</button><button class="btn" data-close-modal>Cerrar</button></div>
    `);
  }
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && document.getElementById("modalRoot")?.innerHTML.trim()) closeModal();
});

document.addEventListener("input",e=>{
  if(e.target.id==="studentSearch"){
    state.search=e.target.value;
    state.studentPage=1;
    const cursor=e.target.selectionStart;
    render();
    const n=document.getElementById("studentSearch");
    if(n){n.focus();n.setSelectionRange(cursor,cursor);}
    return;
  }

  const grade=e.target.closest("[data-grade]");
  if(grade){
    const student=alumnos.find(x=>x.matricula===grade.dataset.id);
    if(!student)return;
    const v=Math.max(0,Math.min(100,Number(grade.value)||0));
    student[grade.dataset.grade]=v;
    recalc(student);
    dirtyGrades.add(student.matricula);
    return;
  }

  if(e.target.id==="teacherName") state.teacherName=e.target.value;
  if(e.target.id==="teacherEmail") state.teacherEmail=e.target.value;
});

document.addEventListener("change",e=>{
  const at=e.target.closest("[data-attendance-id]");
  if(at){
    attendanceToday[at.dataset.attendanceId]=at.value;
    return;
  }

  const f=e.target.closest("[data-filter]");
  if(f){
    if(f.id==="groupFilter")state.group=f.value;
    if(f.id==="subjectFilter")state.subject=f.value;
    if(f.id==="periodFilter")state.period=f.value;
    if(f.id==="reportType")state.reportType=f.value;
  }
});

loadData();
