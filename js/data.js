// ============================================================
// PlanificaDoc - Base de datos de niveles, materias y temas
// ============================================================

const NIVELES = {
    primario: {
        nombre: 'Primario',
        icon: '🟢',
        descripcion: 'Nivel primario (1° a 6° grado)',
        materias: {
            matematicas: {
                nombre: 'Matemáticas', icon: '🔢',
                temas: [
                    { id: 'numeros_naturales', nombre: 'Números naturales' },
                    { id: 'operaciones_basicas', nombre: 'Operaciones básicas (suma, resta, multiplicación, división)' },
                    { id: 'fracciones', nombre: 'Fracciones' },
                    { id: 'geometria', nombre: 'Geometría (figuras, perímetro, área)' },
                    { id: 'medidas', nombre: 'Medidas (longitud, peso, capacidad, tiempo)' },
                    { id: 'estadistica_basica', nombre: 'Estadística básica (tablas y gráficos)' }
                ]
            },
            lengua: {
                nombre: 'Lengua', icon: '📖',
                temas: [
                    { id: 'lectoescritura', nombre: 'Lectoescritura' },
                    { id: 'comprension_lectora', nombre: 'Comprensión lectora' },
                    { id: 'produccion_textos', nombre: 'Producción de textos' },
                    { id: 'gramatica', nombre: 'Gramática (sustantivos, adjetivos, verbos)' },
                    { id: 'ortografia', nombre: 'Ortografía' }
                ]
            },
            ciencias_naturales: {
                nombre: 'Ciencias Naturales', icon: '🌿',
                temas: [
                    { id: 'seres_vivos', nombre: 'Seres vivos' },
                    { id: 'cuerpo_humano', nombre: 'Cuerpo humano' },
                    { id: 'materiales', nombre: 'Materiales y sus propiedades' },
                    { id: 'energia', nombre: 'Energía (luz, calor, sonido)' },
                    { id: 'ambiente', nombre: 'Ambiente y ecosistemas' }
                ]
            },
            ciencias_sociales: {
                nombre: 'Ciencias Sociales', icon: '🌍',
                temas: [
                    { id: 'comunidad', nombre: 'La comunidad' },
                    { id: 'historia_argentina', nombre: 'Historia argentina' },
                    { id: 'geografia_argentina', nombre: 'Geografía argentina' },
                    { id: 'instituciones', nombre: 'Instituciones y democracia' },
                    { id: 'efemerides', nombre: 'Efemérides' }
                ]
            },
            educacion_artistica: {
                nombre: 'Educación Artística', icon: '🎨',
                temas: [
                    { id: 'expresion_plastica', nombre: 'Expresión plástica' },
                    { id: 'musica', nombre: 'Música' },
                    { id: 'teatro', nombre: 'Teatro' }
                ]
            }
        }
    },
    secundario: {
        nombre: 'Secundario',
        icon: '🔵',
        descripcion: 'Nivel secundario (1° a 5°/6° año)',
        materias: {
            matematicas: {
                nombre: 'Matemáticas', icon: '📐',
                temas: [
                    { id: 'algebra', nombre: 'Álgebra' },
                    { id: 'funciones', nombre: 'Funciones' },
                    { id: 'geometria_analitica', nombre: 'Geometría analítica' },
                    { id: 'estadistica', nombre: 'Estadística' },
                    { id: 'probabilidad', nombre: 'Probabilidad' },
                    { id: 'trigonometria', nombre: 'Trigonometría' }
                ]
            },
            lengua_literatura: {
                nombre: 'Lengua y Literatura', icon: '📚',
                temas: [
                    { id: 'analisis_literario', nombre: 'Análisis literario' },
                    { id: 'produccion_escrita', nombre: 'Producción escrita' },
                    { id: 'gramatica_avanzada', nombre: 'Gramática avanzada' },
                    { id: 'oratoria', nombre: 'Oratoria y debate' },
                    { id: 'generos_discursivos', nombre: 'Géneros discursivos' }
                ]
            },
            historia: {
                nombre: 'Historia', icon: '🏛️',
                temas: [
                    { id: 'historia_argentina_sec', nombre: 'Historia argentina (siglos XIX-XX)' },
                    { id: 'historia_mundial', nombre: 'Historia mundial' },
                    { id: 'procesos_contemporaneos', nombre: 'Procesos contemporáneos' }
                ]
            },
            geografia: {
                nombre: 'Geografía', icon: '🗺️',
                temas: [
                    { id: 'geografia_fisica', nombre: 'Geografía física' },
                    { id: 'geografia_humana', nombre: 'Geografía humana' },
                    { id: 'cartografia', nombre: 'Cartografía' },
                    { id: 'problematicas_ambientales', nombre: 'Problemáticas ambientales' }
                ]
            },
            biologia: {
                nombre: 'Biología', icon: '🧬',
                temas: [
                    { id: 'celula', nombre: 'Célula' },
                    { id: 'genetica', nombre: 'Genética' },
                    { id: 'evolucion', nombre: 'Evolución' },
                    { id: 'ecologia', nombre: 'Ecología' },
                    { id: 'cuerpo_humano_sec', nombre: 'Cuerpo humano (sistemas)' }
                ]
            },
            fisica: {
                nombre: 'Física', icon: '⚛️',
                temas: [
                    { id: 'mecanica', nombre: 'Mecánica' },
                    { id: 'energia_fisica', nombre: 'Energía y termodinámica' },
                    { id: 'ondas', nombre: 'Ondas y sonido' },
                    { id: 'electricidad', nombre: 'Electricidad y magnetismo' },
                    { id: 'optica', nombre: 'Óptica' }
                ]
            },
            quimica: {
                nombre: 'Química', icon: '🧪',
                temas: [
                    { id: 'estructura_atomica', nombre: 'Estructura atómica' },
                    { id: 'tabla_periodica', nombre: 'Tabla periódica y enlaces' },
                    { id: 'reacciones_quimicas', nombre: 'Reacciones químicas' },
                    { id: 'soluciones', nombre: 'Soluciones' }
                ]
            },
            ingles: {
                nombre: 'Inglés', icon: '🇬🇧',
                temas: [
                    { id: 'grammar', nombre: 'Grammar (tenses, conditionals)' },
                    { id: 'reading', nombre: 'Reading comprehension' },
                    { id: 'writing', nombre: 'Writing' },
                    { id: 'speaking', nombre: 'Speaking' },
                    { id: 'vocabulary', nombre: 'Vocabulary' }
                ]
            }
        }
    },
    secundario_tecnico: {
        nombre: 'Secundario Técnico',
        icon: '🟠',
        descripcion: 'Nivel secundario técnico (1° a 6°/7° año)',
        materias: {
            tecnologia: {
                nombre: 'Tecnología', icon: '⚙️',
                temas: [
                    { id: 'sistemas_tecnologicos', nombre: 'Sistemas tecnológicos' },
                    { id: 'procesos_productivos', nombre: 'Procesos productivos' },
                    { id: 'innovacion', nombre: 'Innovación tecnológica' }
                ]
            },
            taller: {
                nombre: 'Taller', icon: '🔧',
                temas: [
                    { id: 'mecanizado', nombre: 'Mecanizado' },
                    { id: 'soldadura', nombre: 'Soldadura' },
                    { id: 'instalaciones', nombre: 'Instalaciones eléctricas' },
                    { id: 'mantenimiento', nombre: 'Mantenimiento' }
                ]
            },
            dibujo_tecnico: {
                nombre: 'Dibujo Técnico', icon: '📏',
                temas: [
                    { id: 'proyecciones', nombre: 'Proyecciones ortogonales' },
                    { id: 'acotado', nombre: 'Acotado' },
                    { id: 'planos', nombre: 'Planos técnicos' },
                    { id: 'cad', nombre: 'Introducción a CAD' }
                ]
            },
            electronica: {
                nombre: 'Electrónica', icon: '🔌',
                temas: [
                    { id: 'circuitos', nombre: 'Circuitos eléctricos' },
                    { id: 'componentes', nombre: 'Componentes electrónicos' },
                    { id: 'sistemas_digitales', nombre: 'Sistemas digitales' }
                ]
            },
            informatica: {
                nombre: 'Informática', icon: '💻',
                temas: [
                    { id: 'programacion', nombre: 'Programación básica' },
                    { id: 'redes', nombre: 'Redes' },
                    { id: 'bases_datos', nombre: 'Bases de datos' },
                    { id: 'seguridad', nombre: 'Seguridad informática' }
                ]
            }
        }
    }
};

const TIPOS_DEA = [
    { id: 'dislexia', nombre: 'Dislexia', icon: '📖', descripcion: 'Dificultad en la lectura y decodificación de textos', color: '#c9a24d' },
    { id: 'discalculia', nombre: 'Discalculia', icon: '🔢', descripcion: 'Dificultad en el aprendizaje de las matemáticas', color: '#a8483c' },
    { id: 'disgrafia', nombre: 'Disgrafía', icon: '✏️', descripcion: 'Dificultad en la escritura y expresión escrita', color: '#6f9070' },
    { id: 'tdah', nombre: 'TDAH', icon: '⚡', descripcion: 'Trastorno por déficit de atención e hiperactividad', color: '#e3bd6c' },
    { id: 'tea', nombre: 'TEA', icon: '🧩', descripcion: 'Trastorno del espectro autista', color: '#8a6a2e' }
];

// Cada módulo pertenece a una categoría:
//  - 'principal'      → documentos centrales de la clase
//  - 'complementario'  → recursos adicionales opcionales
const MODULOS = [
    { id: 'planificacion', nombre: 'Planificación de Clase', icon: '📄', descripcion: 'Objetivos, secuencia didáctica, recursos y evaluación', color: '#c9a24d', categoria: 'principal' },
    { id: 'desarrollo_teorico', nombre: 'Desarrollo Teórico Mínimo', icon: '🧠', descripcion: 'Explicación conceptual del tema, lista para dar en clase', color: '#8a6a2e', categoria: 'principal' },
    { id: 'ejercicios', nombre: 'Ejercicios Prácticos', icon: '✏️', descripcion: 'Actividades graduadas por dificultad, con respuestas', color: '#6f9070', categoria: 'principal' },
    { id: 'cuestionario', nombre: 'Cuestionario de Evaluación', icon: '📝', descripcion: 'Preguntas de opción múltiple, V/F, desarrollo', color: '#e3bd6c', categoria: 'principal' },
    { id: 'rubrica', nombre: 'Rúbrica de Evaluación', icon: '📊', descripcion: 'Criterios, niveles de desempeño y descriptores', color: '#a8483c', categoria: 'principal' },
    { id: 'adaptacion_dea', nombre: 'Adaptación DEA', icon: '♿', descripcion: 'Adaptaciones para Dificultades Específicas del Aprendizaje', color: '#c9a24d', categoria: 'principal' },
    { id: 'glosario', nombre: 'Glosario de Términos', icon: '📔', descripcion: 'Definiciones clave del tema en lenguaje accesible', color: '#6f9070', categoria: 'complementario' },
    { id: 'mapa_conceptual', nombre: 'Mapa Conceptual', icon: '🗺️', descripcion: 'Esquema jerárquico de conceptos, listo para diagramar', color: '#8a6a2e', categoria: 'complementario' },
    { id: 'actividad_tic', nombre: 'Actividad TIC / Gamificada', icon: '🎮', descripcion: 'Propuesta de actividad con tecnología o dinámica lúdica', color: '#a8483c', categoria: 'complementario' },
    { id: 'comunicado_familias', nombre: 'Comunicado para Familias', icon: '👨‍👩‍👧', descripcion: 'Nota breve para informar a las familias sobre la actividad', color: '#e3bd6c', categoria: 'complementario' }
];

// --- Helpers compartidos por app.js / generator.js / export.js ---
function getModuloInfo(id) {
    return MODULOS.find(m => m.id === id) || { id, nombre: id, icon: '📄' };
}

function getModuloNombre(id) {
    return getModuloInfo(id).nombre;
}

// --- Fuentes curriculares oficiales de referencia (Argentina) ---
// Se inyectan como contexto en los prompts para ayudar a calibrar el
// contenido según lo que realmente corresponde a cada nivel/materia.
const FUENTES_CURRICULARES = {
    general: [
        { nombre: 'Núcleos de Aprendizajes Prioritarios (NAP) - Ministerio de Educación de la Nación', url: 'https://www.argentina.gob.ar/nucleos-de-aprendizaje-prioritarios' },
        { nombre: 'Colección NAP - educ.ar', url: 'https://www.educ.ar/recursos/150199/coleccion-ncleos-de-aprendizajes-prioritarios-nap' }
    ],
    tecnico: [
        { nombre: 'INET - Instituto Nacional de Educación Tecnológica', url: 'https://www.inet.edu.ar/' }
    ]
};

function getFuentesSugeridas(nivel) {
    const fuentes = [...FUENTES_CURRICULARES.general];
    if (nivel === 'Secundario Técnico') fuentes.push(...FUENTES_CURRICULARES.tecnico);
    return fuentes;
}

// Motores de IA disponibles: cada docente carga su propia clave, la que ya
// tenga o prefiera pagar.
const IA_PROVEEDORES = [
    {
        id: 'groq', nombre: 'Groq (Llama)', icon: '⚡', badge: 'Gratis',
        desc: 'Gratis, con límites de uso bajos. Ideal para empezar o para uso ocasional.',
        keyUrl: 'https://console.groq.com/keys', keyPlaceholder: 'gsk_...'
    },
    {
        id: 'openai', nombre: 'OpenAI (ChatGPT)', icon: '🤖', badge: 'Pago por uso',
        desc: '¿Ya tenés ChatGPT Plus o crédito cargado en OpenAI? Usá tu propia clave.',
        keyUrl: 'https://platform.openai.com/api-keys', keyPlaceholder: 'sk-...'
    },
    {
        id: 'gemini', nombre: 'Google Gemini', icon: '✨', badge: 'Pago por uso',
        desc: '¿Ya tenés Gemini Advanced o una clave de Google AI Studio? Usá tu propia clave.',
        keyUrl: 'https://aistudio.google.com/apikey', keyPlaceholder: 'AIza...'
    },
    {
        id: 'claude', nombre: 'Claude (Anthropic)', icon: '🧭', badge: 'Pago por uso',
        desc: '¿Ya tenés crédito cargado en la API de Anthropic? Usá tu propia clave.',
        keyUrl: 'https://console.anthropic.com/settings/keys', keyPlaceholder: 'sk-ant-...'
    }
];

function getProveedorInfo(id) {
    return IA_PROVEEDORES.find(p => p.id === id) || IA_PROVEEDORES[0];
}

// ============================================================
// Renderizador propio de diagramas de vectores/fuerzas.
// La IA solo describe el vector con números (magnitud, ángulo,
// color); este código hace el dibujo real con trigonometría
// exacta, para no depender de que la IA "dibuje" bien un SVG.
// ============================================================

function _escapeXML(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- Punta de flecha estándar (nítida, tamaño fijo, punta EXACTA en el extremo) ---
// markerUnits="userSpaceOnUse" evita que la punta engorde con el stroke-width, y
// refX=12 hace que el vértice de la punta caiga exactamente en (x2, y2) de la línea.
const PD_ARROW_GEOM = 'viewBox="0 0 12 10" refX="12" refY="5" markerWidth="13" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse"';
const PD_ARROW_PATH = 'M0,0 L12,5 L0,10 z';

function _pdMarker(id, color) {
    return `<marker id="${id}" ${PD_ARROW_GEOM}><path d="${PD_ARROW_PATH}" fill="${color}"/></marker>`;
}

function renderVectorDiagramSVG(spec) {
    const W = 460, H = 320;
    const mL = 55, mR = 50, mT = 42, mB = 48; // márgenes (lugar para etiquetas)
    let vectores = Array.isArray(spec.vectores) ? spec.vectores : [];

    // Si la IA incluyó el vector resultante como un vector más (label "R" o
    // "Resultante"), lo sacamos: por errores de redondeo nunca cierra bien el
    // polígono. Lo reemplaza el resultante EXACTO calculado más abajo.
    const esResultanteIA = v => /^(R|resultante)\s*$/i.test(String(v.label || '').split('=')[0].trim());
    const resultanteIA = vectores.find(v => !v.encadenado && esResultanteIA(v));
    if (resultanteIA && vectores.length > 2) vectores = vectores.filter(v => v !== resultanteIA);

    // --- 1) Recorrido previo en coordenadas "matemáticas" (y hacia arriba) para
    //        calcular la caja que ocupan TODOS los vectores (cualquier cuadrante). ---
    const pts = [{ x: 0, y: 0 }];
    let cx = 0, cy = 0;
    const datos = vectores.map(v => {
        const mag = Math.abs(Number(v.magnitud) || 0);
        const ang = (Number(v.angulo) || 0) * Math.PI / 180;
        const chained = v.encadenado === true;
        const sx = chained ? cx : (Number(v.origenX) || 0);
        const sy = chained ? cy : (Number(v.origenY) || 0);
        const ex = sx + mag * Math.cos(ang);
        const ey = sy + mag * Math.sin(ang);
        pts.push({ x: sx, y: sy }, { x: ex, y: ey });
        cx = ex; cy = ey;
        return { v, mag, ang, sx, sy, ex, ey };
    });

    // --- Vector RESULTANTE exacto (calculado acá, no por la IA) ---
    // · Suma punta-cola (hay encadenados): va del inicio de la cadena a la punta final.
    // · Vectores concurrentes (todos desde el mismo origen): suma de componentes.
    // Se dibuja siempre que corresponda, salvo que la IA mande "resultante": false.
    let resultante = null;
    if (spec.resultante !== false && datos.length >= 2) {
        const hayCadena = datos.some(d => d.v.encadenado === true);
        const mismoOrigen = datos.every(d => Math.abs(d.sx - datos[0].sx) < 1e-9 && Math.abs(d.sy - datos[0].sy) < 1e-9);
        if (hayCadena) {
            resultante = { sx: datos[0].sx, sy: datos[0].sy, ex: cx, ey: cy };
        } else if (mismoOrigen) {
            const dx = datos.reduce((s, d) => s + (d.ex - d.sx), 0);
            const dy = datos.reduce((s, d) => s + (d.ey - d.sy), 0);
            resultante = { sx: datos[0].sx, sy: datos[0].sy, ex: datos[0].sx + dx, ey: datos[0].sy + dy };
        }
        if (resultante) {
            const rMag = Math.hypot(resultante.ex - resultante.sx, resultante.ey - resultante.sy);
            const magMax = Math.max(1e-9, ...datos.map(d => d.mag));
            if (rMag < magMax * 0.02) resultante = null; // suma ≈ 0: no hay nada que dibujar
            else pts.push({ x: resultante.sx, y: resultante.sy }, { x: resultante.ex, y: resultante.ey });
        }
    }

    const minX = Math.min(...pts.map(p => p.x)), maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y)), maxY = Math.max(...pts.map(p => p.y));
    const spanX = Math.max(maxX - minX, 1e-6), spanY = Math.max(maxY - minY, 1e-6);
    const scale = Math.min((W - mL - mR) / spanX, (H - mT - mB) / spanY);

    // Origen (0,0) matemático ubicado para que todo entre en el lienzo
    const originX = mL + (-minX) * scale;
    const originY = H - mB - (-minY) * scale;
    const X = x => originX + x * scale;
    const Y = y => originY - y * scale;

    const ejeX = spec.ejeX || 'x';
    const ejeY = spec.ejeY || 'y';
    const coloresUnicos = [...new Set(datos.map(d => d.v.color || '#8a6a2e'))];

    let defs = '<defs>';
    defs += _pdMarker('pd-eje', '#333');
    defs += _pdMarker('pd-res', '#6c3483');
    coloresUnicos.forEach((color, i) => { defs += _pdMarker(`pd-arrow-${i}`, color); });
    defs += '</defs>';

    let cuerpo = '';
    // --- 2) Ejes con punta de flecha (pasan por el origen matemático) ---
    const axY = Math.min(Math.max(originY, mT + 10), H - 14);
    const axX = Math.min(Math.max(originX, mL), W - mR);
    cuerpo += `<line x1="${(mL - 22).toFixed(1)}" y1="${axY.toFixed(1)}" x2="${(W - 16).toFixed(1)}" y2="${axY.toFixed(1)}" stroke="#333" stroke-width="1.4" marker-end="url(#pd-eje)"/>`;
    cuerpo += `<line x1="${axX.toFixed(1)}" y1="${(H - 20).toFixed(1)}" x2="${axX.toFixed(1)}" y2="16" stroke="#333" stroke-width="1.4" marker-end="url(#pd-eje)"/>`;
    cuerpo += `<text x="${(W - 16).toFixed(1)}" y="${(axY - 10).toFixed(1)}" font-size="14" font-style="italic" text-anchor="end">${_escapeXML(ejeX)}</text>`;
    cuerpo += `<text x="${(axX + 10).toFixed(1)}" y="22" font-size="14" font-style="italic">${_escapeXML(ejeY)}</text>`;
    cuerpo += `<circle cx="${axX.toFixed(1)}" cy="${axY.toFixed(1)}" r="2.5" fill="#333"/>`;
    cuerpo += `<text x="${(axX - 8).toFixed(1)}" y="${(axY + 16).toFixed(1)}" font-size="11" text-anchor="end">O</text>`;

    // --- 3) Vectores ---
    datos.forEach((d) => {
        const { v, mag, ang } = d;
        const color = v.color || '#8a6a2e';
        const idxColor = coloresUnicos.indexOf(color);
        const x1 = X(d.sx), y1 = Y(d.sy), x2 = X(d.ex), y2 = Y(d.ey);

        // Proyecciones (componentes) primero, para que queden debajo del vector
        if (v.mostrarComponentes) {
            cuerpo += `<line x1="${x2.toFixed(1)}" y1="${y2.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="#999" stroke-width="1" stroke-dasharray="4,3"/>`;
            cuerpo += `<line x1="${x2.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="#999" stroke-width="1" stroke-dasharray="4,3"/>`;
        }

        // Arco del ángulo (desde el eje x positivo hasta el vector)
        const angDeg = Number(v.angulo) || 0;
        if (v.angulo !== undefined && v.mostrarAngulo !== false && Math.abs(angDeg) > 4 && mag > 0) {
            const r = Math.min(30, mag * scale * 0.45);
            const a0x = x1 + r, a0y = y1;
            const a1x = x1 + r * Math.cos(ang), a1y = y1 - r * Math.sin(ang);
            const large = Math.abs(angDeg) > 180 ? 1 : 0;
            const sweep = angDeg >= 0 ? 0 : 1; // antihorario matemático = sweep 0 en SVG
            cuerpo += `<path d="M ${a0x.toFixed(1)} ${a0y.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} ${sweep} ${a1x.toFixed(1)} ${a1y.toFixed(1)}" fill="none" stroke="#888" stroke-width="1.1"/>`;
            const bis = (angDeg / 2) * Math.PI / 180;
            const tx = x1 + (r + 14) * Math.cos(bis), ty = y1 - (r + 14) * Math.sin(bis);
            cuerpo += `<text x="${tx.toFixed(1)}" y="${(ty + 4).toFixed(1)}" font-size="12" fill="#555" text-anchor="middle">${angDeg}°</text>`;
        }

        // El vector propiamente dicho (la punta cae EXACTA en x2,y2 gracias a refX=12)
        cuerpo += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="2" stroke-linecap="round" marker-end="url(#pd-arrow-${idxColor})"/>`;

        // Etiqueta desplazada PERPENDICULAR al vector (no la pisa la flecha)
        const unidad = v.unidad ? ` ${v.unidad}` : '';
        const labelBase = v.label ? String(v.label).split('=')[0].trim() : '';
        const etiqueta = labelBase ? `${labelBase}${mag ? ' = ' + (Number(v.magnitud) || 0) + unidad : ''}` : '';
        if (etiqueta) {
            const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
            // normal unitaria que apunta "hacia arriba" en pantalla
            let nx = Math.sin(ang), ny = Math.cos(ang);
            if (ny > 0) { nx = -nx; ny = -ny; }
            const lx = midX + nx * 16, ly = midY + ny * 16;
            cuerpo += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" font-size="13" font-weight="bold" fill="${color}" text-anchor="middle">${_escapeXML(etiqueta)}</text>`;
        }

        // Etiquetas de componentes (sutiles)
        if (v.mostrarComponentes && labelBase) {
            const cxm = (x1 + x2) / 2;
            cuerpo += `<text x="${cxm.toFixed(1)}" y="${(y1 + (y2 < y1 ? 14 : -6)).toFixed(1)}" font-size="11" fill="#888" text-anchor="middle">${_escapeXML(labelBase)}<tspan baseline-shift="sub" font-size="8">x</tspan></text>`;
            cuerpo += `<text x="${(x2 + (x2 >= x1 ? 8 : -8)).toFixed(1)}" y="${((y1 + y2) / 2 + 4).toFixed(1)}" font-size="11" fill="#888" text-anchor="${x2 >= x1 ? 'start' : 'end'}">${_escapeXML(labelBase)}<tspan baseline-shift="sub" font-size="8">y</tspan></text>`;
        }
    });

    // --- 4) Vector resultante exacto: nace en el inicio de la cadena y su punta
    //        cae EXACTAMENTE sobre la punta del último vector (cierra el polígono). ---
    if (resultante) {
        let x1 = X(resultante.sx), y1 = Y(resultante.sy);
        let x2 = X(resultante.ex), y2 = Y(resultante.ey);
        const dxu = resultante.ex - resultante.sx, dyu = resultante.ey - resultante.sy;
        const rMag = Math.hypot(dxu, dyu);
        const rAng = Math.atan2(dyu, dxu);

        // CASO COLINEAL: si todos los vectores y la resultante están sobre la misma
        // recta horizontal o vertical, R quedaría dibujada ENCIMA de ellos. Como en
        // los libros de texto, la desplazamos apenas en paralelo y la unimos con
        // guías punteadas a la recta de acción original.
        const todosHoriz = datos.every(d => Math.abs(Math.sin(d.ang)) < 0.02) && Math.abs(dyu) < 1e-6 && datos.every(d => Math.abs(d.sy - resultante.sy) < 1e-9);
        const todosVert = datos.every(d => Math.abs(Math.cos(d.ang)) < 0.02) && Math.abs(dxu) < 1e-6 && datos.every(d => Math.abs(d.sx - resultante.sx) < 1e-9);
        if (todosHoriz) {
            const off = 36;
            cuerpo += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${(y1 + off).toFixed(1)}" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
            cuerpo += `<line x1="${x2.toFixed(1)}" y1="${y2.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${(y2 + off).toFixed(1)}" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
            y1 += off; y2 += off;
        } else if (todosVert) {
            const off = 36;
            cuerpo += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${(x1 + off).toFixed(1)}" y2="${y1.toFixed(1)}" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
            cuerpo += `<line x1="${x2.toFixed(1)}" y1="${y2.toFixed(1)}" x2="${(x2 + off).toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3"/>`;
            x1 += off; x2 += off;
        }

        cuerpo += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#6c3483" stroke-width="2.2" stroke-linecap="round" marker-end="url(#pd-res)"/>`;

        // Etiqueta: usamos la unidad del primer vector que tenga una, y la magnitud
        // calculada (1 decimal, coma decimal). Desplazada perpendicular, del lado
        // opuesto al que usan las etiquetas de los vectores sumandos.
        const unidadR = (vectores.find(v => v.unidad) || {}).unidad || '';
        const magTxt = (Math.round(rMag * 10) / 10).toString().replace('.', ',');
        const labelR = spec.labelResultante ? String(spec.labelResultante).split('=')[0].trim() : 'R';
        const textoR = `${_escapeXML(labelR)} = ${magTxt}${unidadR ? ' ' + _escapeXML(unidadR) : ''}`;
        if (todosHoriz) {
            // R desplazada hacia abajo: la etiqueta va en el hueco, justo encima de R
            cuerpo += `<text x="${((x1 + x2) / 2).toFixed(1)}" y="${(y1 - 8).toFixed(1)}" font-size="13" font-weight="bold" fill="#6c3483" text-anchor="middle">${textoR}</text>`;
        } else if (todosVert) {
            // R desplazada a la derecha: la etiqueta va a su derecha, centrada verticalmente
            cuerpo += `<text x="${(Math.max(x1, x2) + 10).toFixed(1)}" y="${(((y1 + y2) / 2) + 4).toFixed(1)}" font-size="13" font-weight="bold" fill="#6c3483">${textoR}</text>`;
        } else {
            let nx = Math.sin(rAng), ny = Math.cos(rAng);
            if (ny <= 0) { nx = -nx; ny = -ny; } // lado contrario al de las etiquetas comunes
            const lx = (x1 + x2) / 2 + nx * 18, ly = (y1 + y2) / 2 + ny * 18;
            cuerpo += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" font-size="13" font-weight="bold" fill="#6c3483" text-anchor="middle">${textoR}</text>`;
        }
    }

    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica, Arial, sans-serif" shape-rendering="geometricPrecision" text-rendering="optimizeLegibility">${defs}${cuerpo}</svg>`;
}

// ============================================================
// Normalizador de SVG "libre" generado por la IA (Caso 2).
// No confía en que la IA dibuje bien: corrige en código los
// tres defectos típicos:
//   1. Marcadores mal definidos (puntas gordas o corridas)
//   2. Trazos demasiado gruesos
//   3. Puntas dibujadas "a mano" con <polygon>/<path> triangulares,
//      que reemplaza por marcadores bien orientados y alineados.
// Es idempotente: se puede aplicar varias veces sin romper nada.
// ============================================================
function normalizarSvgIA(svgString) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${svgString}</div>`, 'text/html');
        const svg = doc.querySelector('svg');
        if (!svg) return svgString;

        // viewBox de referencia
        let vbW = 400, vbH = 250;
        const vb = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
        if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) { vbW = vb[2]; vbH = vb[3]; }
        else svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
        if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        const HEAD = Math.max(10, Math.min(16, vbW * 0.031)); // largo de punta en unidades del viewBox
        const MAX_SW = Math.max(2, vbW / 170);                 // grosor máximo de trazo

        const setGeom = (m) => {
            m.setAttribute('viewBox', '0 0 12 10');
            m.setAttribute('refX', '12');
            m.setAttribute('refY', '5');
            m.setAttribute('markerWidth', HEAD.toFixed(1));
            m.setAttribute('markerHeight', (HEAD * 10 / 12).toFixed(1));
            m.setAttribute('markerUnits', 'userSpaceOnUse');
            m.setAttribute('orient', 'auto-start-reverse');
        };

        // 1) Normalizar todos los <marker> existentes (geometría estándar, mismo color)
        svg.querySelectorAll('marker').forEach(m => {
            const fillEl = m.querySelector('[fill]');
            const color = (fillEl && fillEl.getAttribute('fill')) || '#333';
            setGeom(m);
            m.innerHTML = `<path d="${PD_ARROW_PATH}" fill="${color}"/>`;
        });

        // 2) Limitar grosores exagerados (atributo y estilo inline)
        svg.querySelectorAll('[stroke-width]').forEach(el => {
            const sw = parseFloat(el.getAttribute('stroke-width'));
            if (isFinite(sw) && sw > MAX_SW) el.setAttribute('stroke-width', MAX_SW.toFixed(2));
        });
        svg.querySelectorAll('[style]').forEach(el => {
            el.setAttribute('style', el.getAttribute('style').replace(/stroke-width\s*:\s*([\d.]+)/gi, (m0, n) => {
                return parseFloat(n) > MAX_SW ? `stroke-width:${MAX_SW.toFixed(2)}` : m0;
            }));
        });

        // Marcador estándar por color, creado bajo demanda
        let defs = svg.querySelector('defs');
        const ensureMarker = (color) => {
            if (!defs) { defs = doc.createElement('defs'); svg.insertBefore(defs, svg.firstChild); }
            const id = 'pdfix-' + String(color).replace(/[^a-z0-9]/gi, '');
            if (!svg.querySelector(`#${CSS.escape ? CSS.escape(id) : id}`)) {
                const m = doc.createElement('marker');
                m.setAttribute('id', id);
                setGeom(m);
                m.innerHTML = `<path d="${PD_ARROW_PATH}" fill="${color}"/>`;
                defs.appendChild(m);
            }
            return id;
        };

        // 3) Detectar triángulos chicos dibujados a mano y convertirlos en marcadores
        const lines = [...svg.querySelectorAll('line')];
        const triFromPolygon = (el) => {
            const nums = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
            return (nums.length === 6 && nums.every(isFinite)) ? nums : null;
        };
        const triFromPath = (el) => {
            const d = (el.getAttribute('d') || '').trim();
            if (!/^[MLZmlz\s,.\d\-]+$/.test(d) || !/z\s*$/i.test(d)) return null;
            const nums = (d.match(/-?[\d.]+/g) || []).map(Number);
            return (nums.length === 6 && nums.every(isFinite)) ? nums : null;
        };
        svg.querySelectorAll('polygon, path').forEach(el => {
            if (el.parentElement && el.parentElement.tagName.toLowerCase() === 'marker') return;
            const nums = el.tagName.toLowerCase() === 'polygon' ? triFromPolygon(el) : triFromPath(el);
            if (!nums) return;
            const xs = [nums[0], nums[2], nums[4]], ys = [nums[1], nums[3], nums[5]];
            const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
            if (size <= 0 || size > vbW * 0.08) return; // demasiado grande: es una figura, no una punta
            const cx0 = (xs[0] + xs[1] + xs[2]) / 3, cy0 = (ys[0] + ys[1] + ys[2]) / 3;
            let best = null;
            lines.forEach(ln => {
                const x1 = parseFloat(ln.getAttribute('x1')), y1 = parseFloat(ln.getAttribute('y1'));
                const x2 = parseFloat(ln.getAttribute('x2')), y2 = parseFloat(ln.getAttribute('y2'));
                if (![x1, y1, x2, y2].every(isFinite)) return;
                [[x2, y2, 'marker-end'], [x1, y1, 'marker-start']].forEach(([x, y, attr]) => {
                    const dist = Math.hypot(cx0 - x, cy0 - y);
                    if (dist < size * 1.6 + 5 && (!best || dist < best.dist)) best = { ln, attr, dist };
                });
            });
            if (!best) return;
            const color = el.getAttribute('fill') || best.ln.getAttribute('stroke') || '#333';
            best.ln.setAttribute(best.attr, `url(#${ensureMarker(color)})`);
            el.remove();
        });

        // 4) Ejes cartesianos sin punta: una línea oscura, horizontal o vertical,
        //    que cruza la mayor parte del lienzo, es casi seguro un eje. Le agregamos
        //    la punta de flecha en el extremo positivo (derecha / arriba).
        const esOscuro = c => /^(black|#0{3,6}|#1{3}|#2{3}|#3{3}|#111111|#222222|#333333|#444|#444444|#555|#555555)$/i.test(String(c || '').trim());
        lines.forEach(ln => {
            if (ln.getAttribute('marker-end') || ln.getAttribute('marker-start')) return;
            const x1 = parseFloat(ln.getAttribute('x1')), y1 = parseFloat(ln.getAttribute('y1'));
            const x2 = parseFloat(ln.getAttribute('x2')), y2 = parseFloat(ln.getAttribute('y2'));
            if (![x1, y1, x2, y2].every(isFinite)) return;
            const stroke = ln.getAttribute('stroke');
            if (!esOscuro(stroke)) return;
            const horizontal = Math.abs(y2 - y1) < 2 && Math.abs(x2 - x1) > vbW * 0.55;
            const vertical = Math.abs(x2 - x1) < 2 && Math.abs(y2 - y1) > vbH * 0.55;
            if (!horizontal && !vertical) return;
            const id = ensureMarker(stroke || '#333');
            // La punta va hacia la derecha (eje x) o hacia arriba (eje y, o sea y menor)
            const puntaEnP2 = horizontal ? (x2 > x1) : (y2 < y1);
            ln.setAttribute(puntaEnP2 ? 'marker-end' : 'marker-start', `url(#${id})`);
        });

        return svg.outerHTML;
    } catch (e) {
        console.warn('No se pudo normalizar un SVG de la IA:', e);
        return svgString;
    }
}
