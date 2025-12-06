const container = document.querySelector('.html-container');

// ===== FUNCIÓN CON DETECCIÓN AUTOMÁTICA DE PATRONES =====
function formatearTextoInteligente(texto) {
    // Paso 1: Normalización básica
    let resultado = texto
        .replace(/[-_.]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-zA-Z])(\d)/g, '$1 $2')
        .replace(/(\d)([a-zA-Z])/g, '$1 $2');
    
    // Paso 2: Analizar palabras individualmente
    const palabras = resultado.split(' ').filter(p => p);
    
    const formateadas = palabras.map((palabra, idx) => {
        const lower = palabra.toLowerCase();
        
        // REGLA 1: Siglas y códigos (U1, C1, PDF, HTML, etc.)
        if (/^[A-Z0-9]{2,4}$/.test(palabra) || 
            /^[A-Z]?\d+[A-Z]?\d*$/.test(palabra)) {
            return palabra.toUpperCase();
        }
        
        // REGLA 2: Números romanos (I, II, III, IV, etc.)
        if (/^[IVXLCDM]+$/i.test(palabra)) {
            return palabra.toUpperCase();
        }
        
        // REGLA 3: Detectar prefijos comunes
        const prefijos = {
            'unidad': 'Unidad',
            'guia': 'Guía', 
            'cap': 'Capítulo',
            'tarea': 'Tarea',
            'prueba': 'Prueba',
            'ejercicio': 'Ejercicio',
            'leccion': 'Lección',
            'modulo': 'Módulo',
            'seccion': 'Sección',
            'parte': 'Parte',
            'apendice': 'Apéndice',
            'anexo': 'Anexo'
        };
        
        // Buscar prefijos en la palabra
        for (const [prefijo, reemplazo] of Object.entries(prefijos)) {
            if (lower.startsWith(prefijo)) {
                const numero = palabra.slice(prefijo.length);
                if (numero) {
                    return `${reemplazo} ${numero}`;
                }
                return reemplazo;
            }
        }
        
        // REGLA 4: Capitalización inteligente
        // Conectores en minúscula (excepto al inicio)
        const conectores = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'a', 'en', 'para', 'por', 'con', 'sin'];
        if (idx > 0 && conectores.includes(lower)) {
            return lower;
        }
        
        // REGLA 5: Capitalizar normalmente
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    });
    
    resultado = formateadas.join(' ');
    
    // Paso 3: Correcciones post-procesamiento
    // Juntar letras con números: "U 1" → "U1"
    resultado = resultado.replace(/([A-Z])\s+(\d+)/g, '$1$2');
    
    // "Capítulo 1" ya está bien
    // "Guía 1" ya está bien
    
    return resultado.replace(/\s+/g, ' ').trim();
}

fetch('list.json')
.then(res => res.json())
.then(files => {
    let currentLevels = [];
    
     // ===== ORDENAR LOS ARCHIVOS =====
     // Opción 1: Orden alfabético simple para activar descomentar la linea //
     // files.sort((a, b) => a.file.localeCompare(b.file));
     // ==== FIN OPCION 1 ===//
       
     // ==== OPCION 2 ===//
     // Orden natural (numérico y alfabético)
     files.sort((a, b) => {
         return a.file.localeCompare(b.file, undefined, {
             numeric: true,
             sensitivity: 'base'
     });
});

 // ==== FIN OPCION 2 ===//

 // ==== OPCION 3 ===/
 // Orden personalizado para tu estructura
 // Esta es la que necesitas basado en tu descripción
 // Para activar, eliminar /* */
   /*
   const customOrder = (file) => {
     const order = [
         'guia1', 'guia2', 'unidad5', 
         'jaimito', 'pruebaparaandroid'
     ];
     const lowerFile = file.toLowerCase();
     
     for (let i = 0; i < order.length; i++) {
         if (lowerFile.includes(order[i])) {
             return i;
         }
     }
     return order.length; // los demás al final
 };
 
 // Aplicar orden personalizado
 files.sort((a, b) => {
     const orderA = customOrder(a.file);
     const orderB = customOrder(b.file);
     
     if (orderA !== orderB) {
         return orderA - orderB;
     }
     
     // Si mismo grupo, orden alfabético natural
     return a.file.localeCompare(b.file, undefined, {
         numeric: true,
         sensitivity: 'base'
     });
 });
*/
// ==== FIN OPCION 3 ===//
   
    files.forEach(f => {
      // separar jerarquía de carpetas y archivo
      const parts = f.file.replace('html/', '').replace('.html', '').split('/');
      const capitulo = parts.pop();  // último elemento siempre es el botón
      
      // Si parts está vacío, es un archivo raíz
      if (parts.length === 0) {
          // Crear un h2 especial para archivos raíz
          const h = document.createElement('h2');
          h.textContent = formatearTextoInteligente(capitulo) + ":";
          container.appendChild(h);
      } else {
          // agregar títulos según la jerarquía de carpetas
          parts.forEach((level, idx) => {
            if (currentLevels[idx] !== level) {
              const hTag = idx === 0 ? 'h2' : 'h3';
              const h = document.createElement(hTag);
              h.textContent = formatearTextoInteligente(level) + ":";
              container.appendChild(h);
              currentLevels[idx] = level;
              // limpiar niveles más profundos si cambiaron
              currentLevels = currentLevels.slice(0, idx + 1);
            }
          });
      }
    
      // crear el botón
      const btn = document.createElement('a');
      btn.href = f.file;
      btn.textContent = formatearTextoInteligente(capitulo);
      btn.className = 'nav-btn';
      container.appendChild(btn);
    });
});
