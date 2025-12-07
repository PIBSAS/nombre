// admin/blocks.js
const container = document.getElementById("blocksContainer");
const preview = document.getElementById("preview");

let blocks = [];

// Exportadas
export function agregarBloqueTexto(contenido = "") {
  const block = document.createElement("div");
  block.className = "block";
  block.draggable = true;

  const ta = document.createElement("textarea");
  ta.value = contenido;
  ta.addEventListener('input', actualizarPreview);

  // acciones por bloque
  const ctrl = document.createElement('div');
  ctrl.className = 'block-ctrl';
  const btnDel = document.createElement('button');
  btnDel.textContent = 'Eliminar';
  btnDel.addEventListener('click', () => {
    block.remove();
    actualizarPreview();
  });
  const btnUp = document.createElement('button');
  btnUp.textContent = '↑';
  btnUp.addEventListener('click', () => {
    if(block.previousSibling) container.insertBefore(block, block.previousSibling);
    actualizarPreview();
  });
  const btnDown = document.createElement('button');
  btnDown.textContent = '↓';
  btnDown.addEventListener('click', () => {
    if(block.nextSibling) container.insertBefore(block.nextSibling, block);
    actualizarPreview();
  });
  ctrl.appendChild(btnUp);
  ctrl.appendChild(btnDown);
  ctrl.appendChild(btnDel);

  block.appendChild(ctrl);
  block.appendChild(ta);
  container.appendChild(block);
  blocks.push(block);

  activarDragAndDrop();
  actualizarPreview();
}

// Drag & drop
function activarDragAndDrop(){
  let dragging = null;
  container.querySelectorAll('.block').forEach(b=>{
    b.addEventListener('dragstart', ()=> { dragging = b; b.style.opacity='0.4'; });
    b.addEventListener('dragend', ()=> { if(dragging) dragging.style.opacity='1'; dragging = null; actualizarPreview(); });
    b.addEventListener('dragover', e=> {
      e.preventDefault();
      if(!dragging) return;
      const rect = b.getBoundingClientRect();
      const mitad = rect.top + rect.height/2;
      if(e.clientY < mitad) container.insertBefore(dragging, b);
      else container.insertBefore(dragging, b.nextSibling);
    });
  });
}

export function obtenerHTMLFinal(){
  let html = '';
  container.querySelectorAll('.block textarea').forEach(t => {
    html += t.value + "\n\n";
  });
  return html;
}

export function clearAllBlocks(){
  container.innerHTML = '';
  actualizarPreview();
}

function actualizarPreview(){
  const p = document.getElementById('preview');
  p.innerHTML = obtenerHTMLFinal();
  if(window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([p]).catch(()=>{});
}

// al cargar no agregamos bloques automáticos; lo hace admin.js según necesidad
