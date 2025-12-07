// admin/admin.js
import { agregarBloqueTexto, obtenerHTMLFinal, clearAllBlocks } from "./blocks.js";

/*
  NOTA:
  - Este admin usa rutas relativas: list.json -> ../list.json
  - Carga el .tex desde ../tex/...
  - Genera descarga con nombre .edits/tex/...
  - No usa tokens ni API
*/

// Si querés que el "Abrir subida GitHub" abra una URL ya con la ruta:
// pon aquí tu usuario/repo/rama, o déjalo vacío y el botón abrirá GitHub upload base.
const REPO_UPLOAD_BASE = "https://github.com/pibsas/nombre"; // ej: "https://github.com/MIUSUARIO/MIREPO/upload/main/"

const fileListEl = document.getElementById("fileList");
const currentPathEl = document.getElementById("currentPath");
const statusEl = document.getElementById("status");
const blocksContainer = document.getElementById("blocksContainer");
const previewEl = document.getElementById("preview");

const btnNew = document.getElementById("btnNew");
const btnGuardar = document.getElementById("btnGuardar");
const btnOpenUpload = document.getElementById("btnOpenUpload");
const btnCopiar = document.getElementById("btnCopiar");
const addTextBtn = document.getElementById("addText");
const addTitleBtn = document.getElementById("addTitle");
const clearAllBtn = document.getElementById("clearAll");

let currentTexPath = null;   // ej: tex/cap1/intro.tex
let currentPretty = null;

// Exponer global (por si quedaste con botón inline)
window.agregarBloqueTexto = agregarBloqueTexto;

// Cargar list.json (espera ../list.json)
export async function loadFileList(){
  try {
    const res = await fetch('../list.json', {cache: 'no-store'});
    if(!res.ok) throw new Error('list.json no encontrado');
    const list = await res.json();
    fileListEl.innerHTML = '';
    list.forEach(item => {
      const el = document.createElement('div');
      el.className = 'file-item';
      el.textContent = item.pretty || item.file.replace(/^html\//,'').replace(/\.html$/,'');
      el.title = item.file;
      el.addEventListener('click', ()=> openForEdit(item.file));
      fileListEl.appendChild(el);
    });
  } catch(e){
    console.error(e);
    fileListEl.innerHTML = '<div class="err">No se pudo cargar list.json</div>';
  }
}
loadFileList();

// Convertir html path -> tex path
function htmlToTex(htmlPath){
  return htmlPath.replace(/^html\//,'tex/').replace(/\.html$/,'') + '.tex';
}

function setStatus(s=''){ statusEl.textContent = s; }

// Cargar .tex y llenar bloques (heurística simple)
export async function openForEdit(htmlPath){
  clearAllBlocks();
  const texPath = htmlToTex(htmlPath);
  currentTexPath = texPath;
  currentPretty = htmlPath.replace(/^html\//,'').replace(/\.html$/,'');
  currentPathEl.textContent = texPath;
  setStatus('Cargando...');
  try {
    const res = await fetch('../' + texPath, {cache: 'no-store'});
    if(!res.ok){
      // no existe -> crear base
      agregarBloqueTexto(`% Nuevo capítulo: ${currentPretty}\n\n\\section{${currentPretty}}\n\n`);
      setStatus('TEX no encontrado: se creó borrador en editor');
      return;
    }
    const txt = await res.text();
    populateBlocksFromTex(txt);
    setStatus('Cargado');
  } catch(err){
    console.error(err);
    setStatus('Error al cargar');
  }
}

// Heurística simple: separar por párrafos (doble salto) y por secciones
function populateBlocksFromTex(tex){
  clearAllBlocks();
  // quitar comentarios de linea que comienzan con % (sin backslash)
  const cleaned = tex.replace(/(^|[^\\])%.*/g, '\n');
  // dividir por secciones (mantener todo si no)
  const parts = cleaned.split(/\n{2,}/).map(s=>s.trim()).filter(Boolean);
  if(parts.length === 0){
    agregarBloqueTexto(tex);
    return;
  }
  parts.forEach(p => agregarBloqueTexto(p));
}

// Generar nombre de descarga .edits/tex/...
function editsDownloadName(){
  if(!currentTexPath) return `.edits/tex/untitled.tex`;
  const p = currentTexPath.replace(/^tex\//,'');
  return `.edits/tex/${p}`;
}

// Descargar el archivo .edits
function downloadEdits(){
  if(!currentTexPath){
    alert('Seleccioná o creá un capítulo primero.');
    return;
  }
  const content = obtenerHTMLFinal();
  const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
  const name = editsDownloadName();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setStatus(`Archivo preparado: ${name}`);
}

// Abrir GitHub Upload (si definiste REPO_UPLOAD_BASE sustituye; si no abre base upload)
function openUploadPage(){
  const name = editsDownloadName().replace(/^\./,''); // quitar dot inicial
  if(REPO_UPLOAD_BASE){
    // espera que REPO_UPLOAD_BASE termine con /upload/BRANCH/
    window.open(REPO_UPLOAD_BASE + encodeURIComponent(name), '_blank');
  } else {
    // abrir la página general (usuario deberá navegar a .edits/tex/ y subir)
    window.open('https://github.com/', '_blank');
  }
}

// Copiar al portapapeles
function copyToClipboard(){
  const content = obtenerHTMLFinal();
  navigator.clipboard.writeText(content).then(()=> setStatus('Copiado al portapapeles'));
}

// Eventos UI
btnGuardar.addEventListener('click', downloadEdits);
btnOpenUpload.addEventListener('click', openUploadPage);
btnCopiar.addEventListener('click', copyToClipboard);
addTextBtn.addEventListener('click', ()=> agregarBloqueTexto('\n\n'));
addTitleBtn.addEventListener('click', ()=> agregarBloqueTexto('\\section{Título}\n\n'));
clearAllBtn.addEventListener('click', ()=> { if(confirm('Borrar todos los bloques?')) clearAllBlocks(); });

// helper que permite limpiar container (blocks.js usa mismo container id)
export function clearAllBlocks(){
  // blocks.js crea bloques dentro del elemento #blocksContainer
  const cont = document.getElementById('blocksContainer');
  cont.innerHTML = '';
  // no tocar más: agregarBloqueTexto repuebla y mantiene listeners
}

// Exponer utilidades
window.openUploadPage = openUploadPage;
window.downloadEdits = downloadEdits;
window.copyToClipboard = copyToClipboard;
