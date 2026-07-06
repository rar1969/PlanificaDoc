// ============================================================
// PlanificaDoc - Motor de generación de contenido con IA
// Soporta: Groq (LLaMA), Google Gemini y OpenAI (ChatGPT)
// ============================================================

// --- Keys embebidas (dejar vacío al distribuir/vender la app) ---
const EMBEDDED_API_KEY = '';

// Si la IA corta la respuesta por límite de tokens, se le pide que continúe
// exactamente donde quedó, hasta terminar el documento (máx. 3 continuaciones).
const MAX_CONTINUACIONES = 3;
const INSTRUCCION_CONTINUAR = 'Tu respuesta anterior se cortó por límite de longitud, a mitad de una idea. Continuá EXACTAMENTE desde la última palabra o etiqueta que escribiste, sin repetir nada de lo ya generado, sin reiniciar con encabezados ni introducciones nuevas, y sin agregar comentarios sobre el corte. Seguí el mismo fragmento HTML en curso hasta completarlo.';

class ContentGenerator {
    constructor() {
        this.apiKey = EMBEDDED_API_KEY || localStorage.getItem('planificadoc_apikey');
        this.provider = EMBEDDED_API_KEY ? 'openai' : (localStorage.getItem('planificadoc_provider') || 'gemini');
    }

    setApiKey(key, provider = 'openai') {
        this.apiKey = key;
        this.provider = provider;
        localStorage.setItem('planificadoc_apikey', key);
        localStorage.setItem('planificadoc_provider', provider);
    }

    clearApiKey() {
        this.apiKey = null;
        localStorage.removeItem('planificadoc_apikey');
        localStorage.removeItem('planificadoc_provider');
    }

    getApiKey() { return this.apiKey; }
    getProvider() { return this.provider; }

    hasApiKey() {
        return this.apiKey && this.apiKey.trim().length > 0;
    }

    // --- Test de conexión ---
    async testConnection() {
        if (!this.hasApiKey()) throw new Error('No hay API Key configurada');
        try {
            if (this.provider === 'openai') {
                return await this.testOpenAI();
            } else if (this.provider === 'groq') {
                return await this.testGroq();
            } else if (this.provider === 'claude') {
                return await this.testClaude();
            } else {
                return await this.testGemini();
            }
        } catch (e) {
            if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
                throw new Error('Sin conexión a internet. Verificá tu conexión.');
            }
            throw e;
        }
    }

    async testGroq() {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: 'Responde solo: OK' }],
                max_tokens: 5
            })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const msg = err.error?.message || '';
            if (response.status === 401) throw new Error('API Key inválida. Verificá que la copiaste completa.');
            if (response.status === 429) throw new Error('Límite de consultas alcanzado. Esperá un momento.');
            throw new Error(`Error de conexión con Groq (${response.status}): ${msg}`);
        }
        return true;
    }

    async testClaude() {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 5,
                messages: [{ role: 'user', content: 'Responde solo: OK' }]
            })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const msg = err.error?.message || '';
            if (response.status === 401) throw new Error('API Key inválida. Verificá que la copiaste completa.');
            if (response.status === 429) throw new Error('Límite de consultas alcanzado. Esperá un momento.');
            throw new Error(`Error de conexión con Claude (${response.status}): ${msg}`);
        }
        return true;
    }

    async testOpenAI() {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'Responde solo: OK' }],
                max_tokens: 5
            })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const msg = err.error?.message || '';
            const code = err.error?.code || '';
            if (response.status === 401) throw new Error('API Key inválida. Verificá que la copiaste completa.');
            if (response.status === 429) {
                if (code === 'insufficient_quota') {
                    throw new Error('Sin crédito en tu cuenta de OpenAI. Agregá saldo en platform.openai.com/account/billing');
                }
                throw new Error('Límite de consultas alcanzado. Esperá un momento.');
            }
            if (response.status === 402) throw new Error('Sin crédito en tu cuenta de OpenAI. Agregá saldo en platform.openai.com/account/billing');
            throw new Error(msg || `Error ${response.status}`);
        }
        return true;
    }

    async testGemini() {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Responde solo: OK' }] }],
                generationConfig: { maxOutputTokens: 10 }
            })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const msg = err.error?.message || '';
            if (response.status === 400) throw new Error('API Key inválida. ' + msg);
            if (response.status === 403) throw new Error('Sin permisos. ' + msg);
            if (response.status === 429) throw new Error('Límite alcanzado. ' + msg);
            throw new Error(msg || `Error ${response.status}`);
        }
        return true;
    }

    // --- Llamar a la IA ---
    async callAI(prompt) {
        if (this.provider === 'openai') {
            return await this.callOpenAI(prompt);
        } else if (this.provider === 'groq') {
            return await this.callGroq(prompt);
        } else if (this.provider === 'claude') {
            return await this.callClaude(prompt);
        } else {
            return await this.callGemini(prompt);
        }
    }

    async callGroq(prompt) {
        const systemMsg = { role: 'system', content: 'Sos un experto en educación argentina. Respondé siempre en formato HTML limpio usando etiquetas <h3>, <p>, <ul>, <ol>, <li>, <table>, <tr>, <th>, <td>, <strong>, <em>. NO uses markdown. Solo HTML directo.' };
        const messages = [systemMsg, { role: 'user', content: prompt }];
        let textoCompleto = '';

        for (let intento = 0; intento <= MAX_CONTINUACIONES; intento++) {
            let response;
            try {
                response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages,
                        temperature: 0.7,
                        max_tokens: 8000
                    })
                });
            } catch (e) {
                throw new Error('Error de red: ' + e.message);
            }
            if (!response.ok) {
                if (response.status === 401) throw new Error('API Key inválida.');
                if (response.status === 429) throw new Error('Demasiadas consultas a Groq. Esperá un momento e intentá de nuevo.');
                throw new Error(`Error de Groq (${response.status})`);
            }
            const data = await response.json();
            const choice = data.choices?.[0];
            const text = choice?.message?.content;
            if (!text) throw new Error('La IA no generó respuesta. Intentá de nuevo.');
            textoCompleto += text;

            if (choice?.finish_reason === 'length' && intento < MAX_CONTINUACIONES) {
                messages.push({ role: 'assistant', content: text });
                messages.push({ role: 'user', content: INSTRUCCION_CONTINUAR });
                continue;
            }
            break;
        }
        return textoCompleto;
    }

    async callClaude(prompt) {
        const messages = [{ role: 'user', content: prompt }];
        let textoCompleto = '';

        for (let intento = 0; intento <= MAX_CONTINUACIONES; intento++) {
            let response;
            try {
                response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: 'claude-haiku-4-5-20251001',
                        max_tokens: 8000,
                        system: 'Sos un experto en educación argentina. Respondé siempre en formato HTML limpio usando etiquetas <h3>, <p>, <ul>, <ol>, <li>, <table>, <tr>, <th>, <td>, <strong>, <em>. NO uses markdown. Solo HTML directo.',
                        messages
                    })
                });
            } catch (e) {
                throw new Error('Error de red: ' + e.message);
            }
            if (!response.ok) {
                let errMsg = `Error ${response.status}`;
                try { const err = await response.json(); errMsg = err.error?.message || errMsg; } catch(e) {}
                if (response.status === 401) throw new Error('API Key inválida.');
                if (response.status === 429) throw new Error('Demasiadas consultas a Claude. Esperá un momento e intentá de nuevo.');
                throw new Error(errMsg);
            }
            const data = await response.json();
            const text = data.content?.[0]?.text;
            if (!text) throw new Error('La IA no generó respuesta. Intentá de nuevo.');
            textoCompleto += text;

            if (data.stop_reason === 'max_tokens' && intento < MAX_CONTINUACIONES) {
                messages.push({ role: 'assistant', content: text });
                messages.push({ role: 'user', content: INSTRUCCION_CONTINUAR });
                continue;
            }
            break;
        }
        return textoCompleto;
    }

    async callOpenAI(prompt) {
        const systemMsg = { role: 'system', content: 'Sos un experto en educación argentina. Respondé siempre en formato HTML limpio usando etiquetas <h3>, <p>, <ul>, <ol>, <li>, <table>, <tr>, <th>, <td>, <strong>, <em>. NO uses markdown. Solo HTML directo.' };
        const messages = [systemMsg, { role: 'user', content: prompt }];
        let textoCompleto = '';

        for (let intento = 0; intento <= MAX_CONTINUACIONES; intento++) {
            let response;
            try {
                response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages,
                        temperature: 0.7,
                        max_tokens: 8000
                    })
                });
            } catch (e) {
                throw new Error('Error de red: ' + e.message);
            }
            if (!response.ok) {
                let errMsg = `Error ${response.status}`;
                let errCode = '';
                try {
                    const err = await response.json();
                    errMsg = err.error?.message || errMsg;
                    errCode = err.error?.code || '';
                } catch(e) {}
                if (response.status === 401) throw new Error('API Key inválida.');
                if (response.status === 402) throw new Error('Sin crédito en OpenAI. Agregá saldo en platform.openai.com/account/billing');
                if (response.status === 429) {
                    if (errCode === 'insufficient_quota') {
                        throw new Error('Sin crédito en OpenAI. Agregá saldo en platform.openai.com/account/billing');
                    }
                    throw new Error('Demasiadas consultas. Esperá un momento.');
                }
                throw new Error(errMsg);
            }
            const data = await response.json();
            const choice = data.choices?.[0];
            const text = choice?.message?.content;
            if (!text) throw new Error('La IA no generó respuesta. Intentá de nuevo.');
            textoCompleto += text;

            if (choice?.finish_reason === 'length' && intento < MAX_CONTINUACIONES) {
                messages.push({ role: 'assistant', content: text });
                messages.push({ role: 'user', content: INSTRUCCION_CONTINUAR });
                continue;
            }
            break;
        }
        return textoCompleto;
    }

    async callGemini(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${this.apiKey}`;
        const contents = [{ role: 'user', parts: [{ text: prompt }] }];
        let textoCompleto = '';

        for (let intento = 0; intento <= MAX_CONTINUACIONES; intento++) {
            let response;
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
                    })
                });
            } catch (e) {
                throw new Error('Error de red: ' + e.message);
            }
            if (!response.ok) {
                let errMsg = `Error ${response.status}`;
                try { const err = await response.json(); errMsg = err.error?.message || errMsg; } catch(e) {}
                if (response.status === 429) throw new Error('Límite alcanzado. ' + errMsg);
                throw new Error(errMsg);
            }
            const data = await response.json();
            const candidate = data.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;
            if (!text) throw new Error('La IA no generó respuesta.');
            textoCompleto += text;

            if (candidate?.finishReason === 'MAX_TOKENS' && intento < MAX_CONTINUACIONES) {
                contents.push({ role: 'model', parts: [{ text }] });
                contents.push({ role: 'user', parts: [{ text: INSTRUCCION_CONTINUAR }] });
                continue;
            }
            break;
        }
        return textoCompleto;
    }

    // --- Construir prompts ---
    buildPrompt(tipo, config) {
        const { nivel, materia, tema, duracion, institucion, docente, curso, tipoDEA, fecha } = config;

        const guiaNivel = {
            'Primario': 'Nivel primario: usá lenguaje simple y concreto, con ejemplos cotidianos y cercanos a la edad de los chicos. Evitá fórmulas abstractas, simbología compleja o formalismo innecesario.',
            'Secundario': 'Nivel secundario: podés usar fórmulas y cierto formalismo, siempre anclado en ejemplos concretos y aplicaciones reales. NO uses el tratamiento abstracto propio de un curso universitario o de una materia de Matemática avanzada (por ejemplo, evitá álgebra lineal formal, notación de pares ordenados para vectores, o demostraciones rigurosas) salvo que el tema lo pida explícitamente.',
            'Secundario Técnico': 'Nivel secundario técnico: priorizá un enfoque aplicado, conectado con instrumentos, mediciones, procesos productivos o situaciones técnicas reales, por sobre la abstracción matemática pura.'
        };
        const nivelInstruccion = guiaNivel[nivel] || 'Adaptá el lenguaje, la profundidad y el nivel de abstracción al nivel educativo indicado, evitando un tratamiento más propio de otro nivel (ni más infantil ni más universitario de lo que corresponde).';

        const enfoqueMateria = `Esta clase pertenece específicamente a la materia "${materia}": desarrollá el tema desde la perspectiva y las prioridades propias de esa disciplina, incluso si el tema también existe en otras materias (por ejemplo, "vectores" en Física debe priorizar magnitud, dirección, fenómenos reales y métodos gráficos —como la suma punta-cola—, NO el tratamiento analítico/algebraico con pares ordenados y producto escalar formal que correspondería a Matemática).`;

        const fuentesSugeridas = getFuentesSugeridas(nivel);
        const fuentesTexto = fuentesSugeridas.length > 0
            ? `\n- FUENTES CURRICULARES DE REFERENCIA: alineá la profundidad y el enfoque del contenido, en la medida de lo posible, con estas fuentes oficiales argentinas:\n${fuentesSugeridas.map(f => `  · ${f.nombre} (${f.url})`).join('\n')}`
            : '';

        const base = `Generá contenido educativo para:\n- Nivel: ${nivel}\n- Materia: ${materia}\n- Tema: ${tema}${curso ? `\n- Curso/Año: ${curso} (calibrá la profundidad para ESE año en particular, no para el nivel en general)` : ''}\n- Duración de clase: ${duracion || '80 minutos'}\n\nCALIBRACIÓN OBLIGATORIA:\n- ${nivelInstruccion}\n- ${enfoqueMateria}\n- ALCANCE DEL TEMA: si el campo "Tema" incluye aclaraciones (entre paréntesis, después de dos puntos o con palabras como "solo", "sin", "introducción a"), tratalas como un límite ESTRICTO de alcance: no agregues contenidos, fórmulas ni métodos que lo excedan, aunque sean "el paso siguiente" natural del tema.\n- REGLA DE ORO: ante la duda entre dos niveles de profundidad o formalismo, elegí SIEMPRE el más simple. Es preferible quedarse un poco corto y proponer una extensión opcional al final, que excederse del nivel del curso.${fuentesTexto}\n`;
        const formatoHTML = `

IMPORTANTE: Respondé en formato HTML limpio usando etiquetas <h3>, <p>, <ul>, <ol>, <li>, <table>, <tr>, <th>, <td>, <strong>, <em>. NO uses markdown. NO uses \`\`\`html ni \`\`\`. Solo el HTML directo. NUNCA generes un documento completo: NO incluyas <!DOCTYPE>, <html>, <head>, <body>, ni ningún <style> con CSS. NO inventes clases (nada de class="..."). Devolvé ÚNICAMENTE el fragmento de contenido con las etiquetas permitidas arriba, sin ningún envoltorio. Para expresiones matemáticas NO uses notación LaTeX (nada de \\frac, \\vec, símbolos "$"): escribí las fórmulas en texto plano y claro, usando <sup> y <sub> si necesitás exponentes o subíndices (ej: x<sup>2</sup>).

**PROHIBICIÓN CRÍTICA DE FILTRACIONES:** NUNCA escribas en el contenido palabras técnicas como "SVG", "diagrama-vector", "etiqueta", "código", "JSON", "elemento", "atributo", o referencias metalingüísticas tipo "como se ve en el diagrama", "el SVG muestra", "(falta el diagrama aquí)", "incluí un diagrama" o similares. Solo contenido educativo PURO: conceptos, pasos, ejemplos, ejercicios, preguntas.

DIAGRAMAS: si el tema se beneficia de una representación gráfica, además de explicarla en palabras, incluí el diagrama siguiendo estas reglas:

CASO 1 — VECTOR o FUERZA (el más común en Física): NO dibujes vos el SVG. En cambio, describí el vector con esta etiqueta de datos, que un programa aparte convierte en un dibujo exacto automáticamente:
<diagrama-vector>{"ejeX":"x","ejeY":"y","vectores":[{"label":"F","magnitud":100,"angulo":30,"color":"#c0392b","mostrarComponentes":true}]}</diagrama-vector>
Esta regla es OBLIGATORIA para TODO diagrama que contenga vectores o fuerzas representados con flechas (fuerzas, velocidades, desplazamientos, tensiones), incluidos los COLINEALES, PARALELOS y CONCURRENTES. Está PROHIBIDO dibujar ese tipo de diagrama con SVG libre. Cómo representar cada clasificación con la etiqueta:
· COLINEALES de sentidos opuestos (misma recta): mismo origen, ángulos 0 y 180. Ej: {"vectores":[{"label":"F1","magnitud":200,"angulo":180,"unidad":"N","color":"#c0392b"},{"label":"F2","magnitud":180,"angulo":0,"unidad":"N","color":"#2471a3"}]}
· COLINEALES del mismo sentido: encadenalos sobre la misma recta. Ej: {"vectores":[{"label":"F1","magnitud":150,"angulo":0,"unidad":"N","color":"#c0392b"},{"label":"F2","magnitud":200,"angulo":0,"unidad":"N","color":"#2471a3","encadenado":true}]}
· PARALELOS (rectas distintas): usá "origenX"/"origenY" (en las mismas unidades que la magnitud) para separar los puntos de aplicación. Ej: {"vectores":[{"label":"F1","magnitud":80,"angulo":90,"unidad":"N","color":"#c0392b","origenX":0,"origenY":0},{"label":"F2","magnitud":80,"angulo":90,"unidad":"N","color":"#2471a3","origenX":60,"origenY":0}],"resultante":false}
· CONCURRENTES: todos desde el mismo origen con ángulos distintos, o encadenados para la suma punta-cola.
Donde: "magnitud" es un número; "angulo" son grados medidos desde el eje x positivo en sentido antihorario; "color" es un código hexadecimal; "mostrarComponentes" (opcional, true/false) agrega las líneas punteadas de proyección sobre los ejes; "unidad" (opcional) se suma a la etiqueta (ej: "N", "m/s"). Para sumar vectores (método punta-cola), agregá varios objetos en el array "vectores" y marcá con "encadenado": true a los que deben arrancar donde terminó el vector anterior (el primero nunca lleva "encadenado"). VECTOR RESULTANTE: NUNCA lo incluyas como un vector más del array — el programa lo calcula y lo dibuja automáticamente, exacto y cerrando el polígono, cada vez que hay una suma (encadenados o concurrentes); si en algún caso NO querés que se dibuje, agregá "resultante": false al JSON. El contenido de la etiqueta debe ser SOLO el JSON, sin texto adicional, sin comentarios, sin backticks.

CASO 2 — cualquier otro diagrama SIN vectores ni flechas de fuerzas (figuras geométricas, gráficos de funciones, esquemas de aparatos): ahí sí podés usar SVG embebido: <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">...</svg>, usando solo <line>, <path>, <circle>, <rect>, <polygon>, <polyline>, <text>, <g>, <defs> y <marker>, con colores planos (sin gradientes, sin imágenes externas, sin <script>, sin <foreignObject>). Si dudás entre Caso 1 y Caso 2, elegí SIEMPRE el Caso 1.

PUNTAS DE FLECHA en SVG libre (Caso 2, muy importante): está PROHIBIDO dibujar puntas a mano con <polygon> o <path> — quedan gruesas y desalineadas. Definí dentro de <defs> este marcador EXACTO (copialo literal, cambiando solamente el id y el color de fill; NO cambies refX, markerWidth ni markerUnits):
<marker id="flecha1" viewBox="0 0 12 10" refX="12" refY="5" markerWidth="13" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,0 L12,5 L0,10 z" fill="#c0392b"/></marker>
y aplicalo con marker-end="url(#flecha1)" sobre la <line> o el <path>. La línea debe terminar EXACTAMENTE en el punto donde va la punta: el marcador dibuja allí la punta, orientada y alineada solo. Usá un marcador por cada color de flecha.

GROSORES DE TRAZO en SVG libre (Caso 2): stroke-width="1.5" para ejes y líneas auxiliares, stroke-width="2" para flechas, vectores y curvas principales, NUNCA más de 2.5. Las líneas de proyección o construcción van con stroke="#999" stroke-width="1" stroke-dasharray="4,3".

TEXTO en SVG libre (Caso 2): font-size entre 11 y 14, y ubicá cada etiqueta despegada de las líneas (usá text-anchor y un pequeño desplazamiento para que ninguna flecha la pise).

CONSISTENCIA GEOMÉTRICA en SVG libre (Caso 2, muy importante): si el diagrama tiene ejes cartesianos, calculá primero las coordenadas EXACTAS donde se cruzan, y usalas sin desplazamientos para cualquier elemento que "nazca" en el origen. Los ejes SIEMPRE llevan punta de flecha en su extremo positivo (derecha para x, arriba para y), aplicando marker-end con un marcador del mismo color del eje.

Un solo diagrama claro por sección. Si el tema no se presta a una representación gráfica, no incluyas nada de esto.`;

        const prompts = {
            planificacion: base + `\nGenerá una PLANIFICACIÓN DE CLASE completa con las siguientes secciones:

1. DATOS DE LA CLASE: Institución: ${institucion || '[Institución]'}, Docente: ${docente || '[Docente]'}, Curso: ${curso || '[Curso]'}, Fecha: ${fecha}

2. OBJETIVOS DE APRENDIZAJE: 2-3 objetivos generales y 3-4 específicos, claros y medibles.

3. CONTENIDOS:
   - Conceptuales (qué van a aprender)
   - Procedimentales (qué van a saber hacer)
   - Actitudinales (qué actitudes se buscan)

4. SECUENCIA DIDÁCTICA:
   - INICIO (15 min): Motivación, indagación de saberes previos
   - DESARROLLO (${duracion === '40 minutos' ? '15' : '45'} min): Explicación, actividades, trabajo grupal/individual
   - CIERRE (10 min): Síntesis, reflexión, evaluación formativa

**RESTRICCIÓN OBLIGATORIA:** NO ESCRIBAS en ningún parte de la respuesta:
   - Referencias a "SVG", "diagrama-vector", "etiqueta", "código", "JSON" ni ningún término técnico/metalingüístico
   - Frases como "como se muestra en el diagrama anterior", "en el SVG", "en la imagen" — el lector YA VE los diagramas
   - Instrucciones técnicas o administrativas que no sean contenido educativo real
   - Aclaraciones tipo "(esto va en un diagrama)", "(falta el SVG aquí)", etc.
   - Solo CONTENIDO PURO de clase: conceptos, pasos, ejemplos, preguntas.

5. RECURSOS NECESARIOS: Lista de materiales, tecnología y 2-3 sugerencias bibliográficas o de recursos digitales confiables

6. EVALUACIÓN: Criterios e instrumentos de evaluación` + formatoHTML,

            desarrollo_teorico: base + `\nGenerá un DESARROLLO TEÓRICO MÍNIMO sobre el tema, pensado como material de estudio tanto para el docente como para compartir con los alumnos:

1. INTRODUCCIÓN: Por qué es importante este tema y dónde aparece en la vida cotidiana o en la disciplina
2. DESARROLLO CONCEPTUAL: Explicación clara y progresiva de los conceptos centrales, con al menos un ejemplo concreto por concepto
3. TIPOS O CLASIFICACIONES (si corresponde): Si el tema admite distintos tipos, categorías o variantes (por ejemplo, en Física: vector posición, desplazamiento, velocidad, fuerza, unitario; o en otras materias, tipos de reacciones, de oraciones, de gobiernos, etc.), enumeralos y explicá en qué se diferencia cada uno con un ejemplo concreto propio de la materia "${materia}". Si el tema no admite clasificación, omití esta sección.
4. DEFINICIONES O FÓRMULAS CLAVE (si corresponde): Destacadas y bien explicadas paso a paso
5. REPRESENTACIÓN GRÁFICA (si corresponde): Si el concepto se puede representar visualmente (por ejemplo, un vector, un diagrama de fuerzas, una figura geométrica, un gráfico de funciones): (a) describí en palabras clara y ordenadamente cómo dibujarlo paso a paso en el pizarrón (ejes, puntos, flechas, ángulos, etiquetas), y (b) incluí también el diagrama real como SVG embebido siguiendo las instrucciones de formato indicadas más abajo.
6. RELACIÓN CON OTROS TEMAS: Cómo se conecta con contenidos anteriores o posteriores de la materia
7. SÍNTESIS FINAL: Un resumen de 4-5 líneas con las ideas más importantes para repasar

Escribí en un lenguaje claro, adecuado al nivel educativo indicado, evitando tecnicismos innecesarios.` + formatoHTML,

            ejercicios: base + `\nGenerá una hoja de EJERCICIOS PRÁCTICOS con:

1. EJEMPLO RESUELTO: Un ejercicio modelo resuelto paso a paso para orientar a los alumnos
2. EJERCICIOS NIVEL BÁSICO (3 ejercicios): Para alumnos que están empezando con el tema
3. EJERCICIOS NIVEL INTERMEDIO (3 ejercicios): Para alumnos que ya manejan lo básico
4. EJERCICIOS NIVEL AVANZADO (2 ejercicios): Para alumnos que necesitan un desafío mayor

Cada ejercicio debe tener:
- Número y título
- Consigna clara y detallada
- Espacio conceptual para resolver (indicá "[Espacio para resolver]")

Al final incluí una sección de RESPUESTAS con las soluciones de todos los ejercicios.` + formatoHTML,

            adaptacion_dea: base + `\nTipo de DEA: ${tipoDEA || 'General (todas las dificultades)'}\n\nGenerá una ADAPTACIÓN CURRICULAR para alumnos con Dificultades Específicas del Aprendizaje:

1. DESCRIPCIÓN DE LA ADAPTACIÓN: A qué tipo de dificultad apunta y por qué

2. OBJETIVOS AJUSTADOS: Los mismos objetivos de la clase pero reformulados con expectativas realistas

3. MODIFICACIONES EN LA PRESENTACIÓN DEL MATERIAL:
   - Cambios en el formato visual
   - Simplificación del lenguaje
   - Apoyos gráficos o concretos

4. ACTIVIDADES MODIFICADAS: Las mismas actividades de la planificación pero adaptadas:
   - Reducción de complejidad
   - Mayor andamiaje
   - Tiempos extendidos
   - Consignas simplificadas

5. RECURSOS DE APOYO ADICIONALES: Material extra, tecnología asistiva, etc.

6. ESTRATEGIAS DE EVALUACIÓN DIFERENCIADA: Cómo evaluar de manera justa y accesible

7. RECOMENDACIONES PARA EL DOCENTE: Tips prácticos para la implementación en el aula` + formatoHTML,

            cuestionario: base + `\nGenerá un CUESTIONARIO DE EVALUACIÓN completo:

1. OPCIÓN MÚLTIPLE (5 preguntas): 4 opciones cada una (a, b, c, d), marcar la correcta con ✓

2. VERDADERO O FALSO (5 afirmaciones): Incluir justificación de las falsas

3. PREGUNTAS DE DESARROLLO (3 preguntas): Que requieran reflexión y argumentación

4. COMPLETAR (4 ejercicios): Oraciones o párrafos con espacios en blanco para completar

5. RELACIONAR CONCEPTOS (1 ejercicio): Dos columnas para unir con flechas

Al final incluí una sección CLAVE DE RESPUESTAS con todas las respuestas correctas.` + formatoHTML,

            rubrica: base + `\nGenerá una RÚBRICA DE EVALUACIÓN profesional en formato tabla:

- 5 CRITERIOS de evaluación alineados al tema
- 4 NIVELES DE DESEMPEÑO para cada criterio:
  * Excelente (10-9 puntos)
  * Muy Bueno (8-7 puntos)
  * Bueno (6-5 puntos)
  * En Proceso (4-1 puntos)

Para cada celda de la tabla, escribí un descriptor claro y específico de qué se espera en ese nivel.

Al final incluí:
- Puntaje total posible
- Escala de calificación
- Espacio para observaciones del docente

Usá una tabla HTML con <table>, <tr>, <th>, <td>.` + formatoHTML,

            glosario: base + `\nGenerá un GLOSARIO DE TÉRMINOS del tema:

- Entre 10 y 15 términos clave relacionados con el tema
- Cada término con una definición breve (1-2 oraciones), clara y adecuada al nivel educativo
- Ordenados alfabéticamente (usá <ul><li><strong>Término:</strong> definición</li></ul>)
- Cuando sea pertinente, incluí un breve ejemplo de uso del término en contexto` + formatoHTML,

            mapa_conceptual: base + `\nGenerá la ESTRUCTURA DE UN MAPA CONCEPTUAL sobre el tema, en formato de esquema jerárquico de texto (no imagen), listo para que el docente lo pase a una herramienta de diagramación:

1. CONCEPTO CENTRAL
2. CONCEPTOS PRINCIPALES (3-5) que se desprenden del concepto central
3. Para cada concepto principal, 2-3 SUBCONCEPTOS o ejemplos relacionados
4. PALABRAS DE ENLACE sugeridas entre conceptos (ej: "se compone de", "provoca", "se clasifica en")

Presentalo como una lista anidada (usando <ul> y <li> anidados) que refleje claramente la jerarquía de conceptos.` + formatoHTML,

            actividad_tic: base + `\nGenerá una ACTIVIDAD CON TECNOLOGÍA O DINÁMICA GAMIFICADA para trabajar el tema:

1. NOMBRE DE LA ACTIVIDAD (creativo y motivador)
2. OBJETIVO: Qué se busca lograr con esta actividad
3. HERRAMIENTA SUGERIDA: Una app, sitio o recurso gratuito y accesible (ej: Kahoot, Wordwall, Genially, Padlet, Canva, etc.) adecuado a la actividad
4. DESARROLLO PASO A PASO: Instrucciones claras para implementarla en el aula
5. VARIANTE SIN TECNOLOGÍA: Una alternativa para aulas sin conectividad o dispositivos
6. CIERRE Y REFLEXIÓN: Cómo cerrar la actividad y qué reflexión proponer al grupo` + formatoHTML,

            comunicado_familias: base + `\nGenerá un COMUNICADO BREVE PARA LAS FAMILIAS informando sobre esta actividad de clase:

- Tono cordial, claro y profesional, de un párrafo (5-8 líneas)
- Explicá qué van a trabajar sus hijos/as y con qué objetivo, en lenguaje simple y no técnico
- Si corresponde, mencioná si necesitan algún material o si hay una tarea asociada
- Incluí al pie: Institución: ${institucion || '[Institución]'} — Docente: ${docente || '[Docente]'} — Curso: ${curso || '[Curso]'}
- Cerrá con un saludo cordial` + formatoHTML
        };

        return prompts[tipo] || '';
    }

    async generate(tipo, config) {
        const prompt = this.buildPrompt(tipo, config);
        if (!prompt) throw new Error('Tipo de contenido no válido');
        const result = await this.callAI(prompt);
        const limpio = this._limpiarHTML(result);
        return this._expandirDiagramas(limpio);
    }

    // Convierte las etiquetas <diagrama-vector>{...json...}</diagrama-vector> que
    // pide la IA en un SVG real, dibujado por nuestro propio código (no por la IA),
    // así la geometría siempre es exacta.
    _expandirDiagramas(html) {
        if (!html.includes('<diagrama-vector') && !html.includes('<svg')) return html;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
            const root = doc.body.firstChild;
            root.querySelectorAll('diagrama-vector').forEach(el => {
                try {
                    const spec = JSON.parse(el.textContent);
                    const svgString = renderVectorDiagramSVG(spec);
                    const temp = doc.createElement('div');
                    temp.innerHTML = svgString;
                    el.replaceWith(temp.firstChild);
                } catch (e) {
                    console.warn('No se pudo interpretar un diagrama de vectores:', e);
                    el.remove();
                }
            });
            // Los SVG "libres" dibujados por la IA se corrigen en código:
            // puntas de flecha estándar, grosores acotados y triángulos manuales
            // convertidos en marcadores bien alineados.
            root.querySelectorAll('svg').forEach(svgEl => {
                try {
                    const fixed = normalizarSvgIA(svgEl.outerHTML);
                    const temp = doc.createElement('div');
                    temp.innerHTML = fixed;
                    if (temp.firstChild) svgEl.replaceWith(temp.firstChild);
                } catch (e) {
                    console.warn('No se pudo normalizar un diagrama SVG:', e);
                }
            });
            return root.innerHTML;
        } catch (e) {
            console.warn('No se pudieron expandir los diagramas:', e);
            return html;
        }
    }

    // Limpieza defensiva: aunque el prompt pida "solo estas etiquetas", los modelos
    // a veces devuelven una página completa con <style>, <head>, etc. Los quitamos
    // acá para que nunca terminen filtrándose como texto visible en las exportaciones.
    _limpiarHTML(html) {
        return html
            .replace(/```html\n?/gi, '').replace(/```\n?/g, '')
            .replace(/<!DOCTYPE[^>]*>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<\/?html[^>]*>/gi, '')
            .replace(/<head[\s\S]*?<\/head>/gi, '')
            .replace(/<\/?body[^>]*>/gi, '')
            .trim();
    }

    // Pequeña espera entre reintentos (para no chocar con rate limits de la API gratuita)
    _wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    async generateAll(modulos, config, onProgress) {
        const results = {};
        let completed = 0;
        for (const modulo of modulos) {
            if (onProgress) onProgress(modulo, completed, modulos.length, 'generando');
            try {
                results[modulo] = await this.generate(modulo, config);
            } catch (firstError) {
                // Reintento automático una vez (útil ante límites de consultas momentáneos)
                if (onProgress) onProgress(modulo, completed, modulos.length, 'reintentando');
                await this._wait(1500);
                try {
                    results[modulo] = await this.generate(modulo, config);
                } catch (secondError) {
                    results[modulo] = `<p style="color:#a8483c;">Error al generar ${getModuloNombre(modulo)}: ${secondError.message}</p>`;
                }
            }
            completed++;
            if (onProgress) onProgress(modulo, completed, modulos.length, 'listo');
        }
        return results;
    }
}

const generator = new ContentGenerator();
