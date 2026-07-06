// ============================================================
// PlanificaDoc - Lógica principal de la aplicación
// ============================================================

class PlanificaDocApp {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 8;
        this.config = {
            nivelId: null, nivel: null,
            materiaId: null, materia: null,
            temaId: null, tema: null,
            subtema: '',
            modulos: [],
            tipoDEA: null, tipoDEANombre: null,
            duracion: '80 minutos',
            institucion: '', docente: '', curso: ''
        };
        this.results = {};
        this.loadedFromHistory = false;
        this.init();
    }

    init() {
        // Copiar materias del secundario al secundario técnico
        const secMaterias = NIVELES.secundario.materias;
        const tecMaterias = NIVELES.secundario_tecnico.materias;
        const merged = { ...secMaterias, ...tecMaterias };
        NIVELES.secundario_tecnico.materias = merged;

        this.render();
        this.setupSettingsBtn();
    }

    setupSettingsBtn() {
        const btn = document.getElementById('settings-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.currentStep = 0;
                this.config = { nivelId:null, nivel:null, materiaId:null, materia:null, temaId:null, tema:null, subtema:'', modulos:[], tipoDEA:null, tipoDEANombre:null, duracion:'80 minutos', institucion:'', docente:'', curso:'' };
                this.results = {};
                this.loadedFromHistory = false;
                this.render();
            });
        }
    }

    render() {
        const container = document.getElementById('step-container');
        this.updateStepIndicator();

        const renderers = [
            () => this.renderWelcome(),
            () => this.renderNivel(),
            () => this.renderMateria(),
            () => this.renderTema(),
            () => this.renderSubtema(),
            () => this.renderModulos(),
            () => this.renderConfig(),
            () => this.renderLoading(),
            () => this.renderResults()
        ];

        container.innerHTML = renderers[this.currentStep]();
        this.attachEvents();

        if (this.currentStep === 7) this.startGeneration();
    }

    updateStepIndicator() {
        const indicator = document.getElementById('step-indicator');
        let html = '';
        for (let i = 0; i < this.totalSteps + 1; i++) {
            const cls = i === this.currentStep ? 'active' : (i < this.currentStep ? 'completed' : '');
            html += `<div class="step-dot ${cls}"></div>`;
            if (i < this.totalSteps) {
                html += `<div class="step-line ${i < this.currentStep ? 'completed' : ''}"></div>`;
            }
        }
        indicator.innerHTML = html;
    }

    // --- Toast notification ---
    showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2600);
    }

    // --- Historial (localStorage) ---
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('planificadoc_historial') || '[]');
        } catch (e) {
            return [];
        }
    }

    saveToHistory() {
        try {
            const history = this.getHistory();
            history.unshift({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                config: { ...this.config },
                results: { ...this.results }
            });
            localStorage.setItem('planificadoc_historial', JSON.stringify(history.slice(0, 15)));
        } catch (e) {
            console.warn('No se pudo guardar en el historial:', e);
        }
    }

    deleteHistoryEntry(id) {
        const history = this.getHistory().filter(h => h.id !== id);
        localStorage.setItem('planificadoc_historial', JSON.stringify(history));
        this.showHistory();
    }

    loadHistoryEntry(id) {
        const entry = this.getHistory().find(h => h.id === id);
        if (!entry) return;
        this.config = { ...this.config, ...entry.config };
        this.results = { ...entry.results };
        this.loadedFromHistory = true;
        this.currentStep = 8;
        this.render();
    }

    showHistory() {
        const container = document.getElementById('step-container');
        const history = this.getHistory();

        if (history.length === 0) {
            container.innerHTML = `
                <div class="welcome-hero">
                    <h2 class="step-title">Historial</h2>
                    <p class="step-description">Todavía no generaste ninguna planificación.</p>
                    <div class="btn-row" style="justify-content:center;">
                        <button class="btn btn-secondary" id="btn-history-back">← Volver</button>
                    </div>
                </div>`;
            document.getElementById('btn-history-back').addEventListener('click', () => { this.currentStep = 0; this.render(); });
            return;
        }

        const items = history.map(entry => {
            const fecha = new Date(entry.timestamp).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const badges = Object.keys(entry.results || {}).map(key => {
                const info = getModuloInfo(key);
                return `<span class="summary-badge">${info.icon} ${info.nombre}</span>`;
            }).join('');
            return `
                <div class="history-item">
                    <div class="history-item-main">
                        <div class="history-item-title">${entry.config?.materia || 'Materia'} — ${entry.config?.tema || 'Tema'}</div>
                        <div class="history-item-date">${fecha} · ${entry.config?.nivel || ''}</div>
                        <div class="summary-badges">${badges}</div>
                    </div>
                    <div class="history-item-actions">
                        <button class="btn btn-secondary btn-sm" data-view="${entry.id}">👁️ Ver</button>
                        <button class="icon-btn" data-delete="${entry.id}" title="Eliminar">🗑️</button>
                    </div>
                </div>`;
        }).join('');

        container.innerHTML = `
            <h2 class="step-title">Historial de planificaciones</h2>
            <p class="step-description">Volvé a ver o exportar tus últimas ${history.length} planificaciones generadas</p>
            <div class="history-list">${items}</div>
            <div class="btn-row">
                <button class="btn btn-secondary" id="btn-history-back">← Volver</button>
                <button class="btn btn-secondary" id="btn-history-clear">🗑️ Vaciar historial</button>
            </div>`;

        document.getElementById('btn-history-back').addEventListener('click', () => { this.currentStep = 0; this.render(); });
        document.getElementById('btn-history-clear').addEventListener('click', () => {
            localStorage.removeItem('planificadoc_historial');
            this.showHistory();
        });
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', () => this.loadHistoryEntry(Number(btn.dataset.view)));
        });
        document.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', () => this.deleteHistoryEntry(Number(btn.dataset.delete)));
        });
    }

    // --- STEP 0: Welcome & AI Config ---
    renderWelcome() {
        const hasKey = generator.hasApiKey();
        const history = this.getHistory();

        if (hasKey) {
            const historyOption = history.length > 0 ? `
                <div class="ai-option" id="btn-history">
                    <span class="ai-option-icon">📚</span>
                    <div>
                        <div class="ai-option-title">Ver historial (${history.length})</div>
                        <div class="ai-option-desc">Revisá o volvé a exportar planificaciones anteriores</div>
                    </div>
                </div>` : '';
            return `
                <div class="welcome-hero">
                    <div class="seal"><span class="seal-icon">🎓</span></div>
                    <h1 class="welcome-title">PlanificaDoc</h1>
                    <p class="welcome-text">Tu asistente inteligente para planificaciones docentes. Generá planificaciones, desarrollos teóricos, ejercicios, adaptaciones DEA, cuestionarios, rúbricas y más, en segundos.</p>
                    <div class="ai-options">
                        <div class="ai-option" id="btn-start">
                            <span class="ai-option-icon">✅</span>
                            <div>
                                <div class="ai-option-title">IA conectada — Comenzar</div>
                                <div class="ai-option-desc">Todo listo para generar contenido con inteligencia artificial</div>
                            </div>
                        </div>
                        ${historyOption}
                        <div class="ai-option" id="btn-change-key">
                            <span class="ai-option-icon">🔑</span>
                            <div>
                                <div class="ai-option-title">Cambiar API Key</div>
                                <div class="ai-option-desc">Usar otra clave de API o proveedor</div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }

        return `
            <div class="welcome-hero">
                <div class="seal"><span class="seal-icon">🎓</span></div>
                <h1 class="welcome-title">¡Bienvenido a PlanificaDoc!</h1>
                <p class="welcome-text">Tu asistente inteligente para planificaciones docentes. Para comenzar, necesitamos conectar con una IA.</p>
                <div class="ai-options">
                    <div class="ai-option" id="btn-quick-connect" style="border-color: var(--brass);">
                        <span class="ai-option-icon">⚡</span>
                        <div>
                            <div class="ai-option-title">Conexión rápida (recomendado)</div>
                            <div class="ai-option-desc">Ingresá tu API Key y conectate en un click</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // --- STEP 1: Nivel ---
    renderNivel() {
        let cards = '';
        for (const [id, nivel] of Object.entries(NIVELES)) {
            const sel = this.config.nivelId === id ? 'selected' : '';
            cards += `
                <div class="card ${sel}" data-nivel="${id}">
                    <span class="card-icon">${nivel.icon}</span>
                    <div class="card-name">${nivel.nombre}</div>
                    <div class="card-desc">${nivel.descripcion}</div>
                </div>`;
        }
        return `
            <h2 class="step-title">Seleccioná el nivel escolar</h2>
            <p class="step-description">Elegí el nivel educativo para tu planificación</p>
            <div class="cards-grid">${cards}</div>
            <div class="btn-row">
                <button class="btn btn-secondary" id="btn-back">← Volver</button>
                <button class="btn btn-primary" id="btn-next" ${this.config.nivelId ? '' : 'disabled'}>Siguiente →</button>
            </div>`;
    }

    // --- STEP 2: Materia ---
    renderMateria() {
        const nivel = NIVELES[this.config.nivelId];
        let cards = '';
        for (const [id, mat] of Object.entries(nivel.materias)) {
            const sel = this.config.materiaId === id ? 'selected' : '';
            cards += `
                <div class="card ${sel}" data-materia="${id}">
                    <span class="card-icon">${mat.icon}</span>
                    <div class="card-name">${mat.nombre}</div>
                </div>`;
        }
        return `
            <h2 class="step-title">Seleccioná la materia</h2>
            <p class="step-description">${nivel.nombre} — Elegí la materia a planificar</p>
            <div class="cards-grid">${cards}</div>
            <div class="btn-row">
                <button class="btn btn-secondary" id="btn-back">← Volver</button>
                <button class="btn btn-primary" id="btn-next" ${this.config.materiaId ? '' : 'disabled'}>Siguiente →</button>
            </div>`;
    }

    // --- STEP 3: Tema ---
    renderTema() {
        const materia = NIVELES[this.config.nivelId].materias[this.config.materiaId];
        let cards = '';
        for (const tema of materia.temas) {
            const sel = this.config.temaId === tema.id ? 'selected' : '';
            cards += `
                <div class="card ${sel}" data-tema="${tema.id}" data-temanombre="${tema.nombre}">
                    <div class="card-name">${tema.nombre}</div>
                </div>`;
        }
        return `
            <h2 class="step-title">Seleccioná el tema</h2>
            <p class="step-description">${materia.nombre} — Elegí el tema de la clase</p>
            <div class="cards-grid">${cards}</div>
            <div class="btn-row">
                <button class="btn btn-secondary" id="btn-back">← Volver</button>
                <button class="btn btn-primary" id="btn-next" ${this.config.temaId ? '' : 'disabled'}>Siguiente →</button>
            </div>`;
    }

    // --- STEP 4: Subtema específico ---
    renderSubtema() {
        return `
            <h2 class="step-title">¿Querés especificar un subtema?</h2>
            <p class="step-description">Tema seleccionado: <strong style="color: var(--brass-bright);">${this.config.tema}</strong> — Podés escribir un subtema más específico o dejarlo vacío para una planificación general del tema.</p>
            <div class="config-form" style="max-width: 100%;">
                <div class="input-group full-width">
                    <label>Subtema específico (opcional)</label>
                    <input type="text" id="input-subtema" value="${this.config.subtema}" placeholder="Ej: Suma de fracciones con distinto denominador">
                </div>
            </div>
            <div class="help-text" style="margin-bottom: 20px;">
                💡 <strong>Tip:</strong> Cuanto más específico seas, mejor será el resultado. Ejemplos:<br>
                • En vez de "Fracciones" → "Suma y resta de fracciones con distinto denominador"<br>
                • En vez de "Célula" → "Diferencias entre célula animal y vegetal"<br>
                • En vez de "Álgebra" → "Resolución de ecuaciones de segundo grado"
            </div>
            <div class="btn-row">
                <button class="btn btn-secondary" id="btn-back">← Volver</button>
                <button class="btn btn-primary" id="btn-next">Siguiente →</button>
            </div>`;
    }

    // --- STEP 5: Módulos ---
    renderModulos() {
        const renderCard = (mod) => {
            const sel = this.config.modulos.includes(mod.id) ? 'selected' : '';
            return `
                <div class="card ${sel}" data-modulo="${mod.id}">
                    <div class="card-checkbox">${sel ? '✓' : ''}</div>
                    <span class="card-icon">${mod.icon}</span>
                    <div class="card-name">${mod.nombre}</div>
                    <div class="card-desc">${mod.descripcion}</div>
                </div>`;
        };

        const principales = MODULOS.filter(m => m.categoria === 'principal').map(renderCard).join('');
        const complementarios = MODULOS.filter(m => m.categoria === 'complementario').map(renderCard).join('');

        // DEA type selector
        let deaSection = '';
        if (this.config.modulos.includes('adaptacion_dea')) {
            let deaCards = '';
            for (const dea of TIPOS_DEA) {
                const sel = this.config.tipoDEA === dea.id ? 'selected' : '';
                deaCards += `
                    <div class="card ${sel}" data-dea="${dea.id}" style="border-left: 3px solid ${dea.color};">
                        <span class="card-icon">${dea.icon}</span>
                        <div class="card-name">${dea.nombre}</div>
                        <div class="card-desc">${dea.descripcion}</div>
                    </div>`;
            }
            deaSection = `
                <h3 class="category-eyebrow" style="margin-top: 28px;">Tipo de DEA a adaptar</h3>
                <div class="cards-grid">${deaCards}</div>`;
        }

        return `
            <h2 class="step-title">¿Qué querés generar?</h2>
            <p class="step-description">Seleccioná uno o más documentos (podés elegir todos)</p>
            <h3 class="category-eyebrow">Documentos centrales</h3>
            <div class="cards-grid">${principales}</div>
            <h3 class="category-eyebrow">Recursos complementarios (opcionales)</h3>
            <div class="cards-grid">${complementarios}</div>
            ${deaSection}
            <div class="btn-row">
                <button class="btn btn-secondary" id="btn-back">← Volver</button>
                <button class="btn btn-primary" id="btn-next" ${this.config.modulos.length > 0 ? '' : 'disabled'}>Siguiente →</button>
            </div>`;
    }

    // --- STEP 6: Config / Datos institucionales ---
    renderConfig() {
        const badges = this.config.modulos.map(m => {
            const mod = getModuloInfo(m);
            return `<span class="summary-badge">${mod.icon} ${mod.nombre}</span>`;
        }).join('');

        const subtemaInfo = this.config.subtema
            ? `<span class="summary-badge">🎯 Subtema: ${this.config.subtema}</span>`
            : '';

        return `
            <h2 class="step-title">Datos de la clase</h2>
            <p class="step-description">Completá los datos (opcional) y configurá la duración</p>
            <div class="summary-badges">${badges}${subtemaInfo}</div>
            <div class="config-form">
                <div class="input-group">
                    <label>Institución</label>
                    <input type="text" id="input-institucion" value="${this.config.institucion}" placeholder="Nombre de la escuela">
                </div>
                <div class="input-group">
                    <label>Docente</label>
                    <input type="text" id="input-docente" value="${this.config.docente}" placeholder="Tu nombre">
                </div>
                <div class="input-group">
                    <label>Curso / Año</label>
                    <input type="text" id="input-curso" value="${this.config.curso}" placeholder="Ej: 3° A">
                </div>
                <div class="input-group">
                    <label>Duración de la clase</label>
                    <select id="input-duracion">
                        <option value="40 minutos" ${this.config.duracion === '40 minutos' ? 'selected' : ''}>40 minutos</option>
                        <option value="80 minutos" ${this.config.duracion === '80 minutos' ? 'selected' : ''}>80 minutos (módulo)</option>
                        <option value="120 minutos" ${this.config.duracion === '120 minutos' ? 'selected' : ''}>120 minutos</option>
                    </select>
                </div>
            </div>
            <div class="btn-row">
                <button class="btn btn-secondary" id="btn-back">← Volver</button>
                <button class="btn btn-primary" id="btn-generate">🚀 Generar con IA</button>
            </div>`;
    }

    // --- STEP 7: Loading ---
    renderLoading() {
        return `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text" id="loading-text">Generando contenido...</div>
                <div class="loading-subtext" id="loading-subtext">Conectando con la IA</div>
                <div class="loading-progress">
                    <div class="loading-progress-bar" id="loading-bar"></div>
                </div>
            </div>`;
    }

    // --- STEP 8: Results ---
    renderResults() {
        let blocks = '';
        for (const [key, html] of Object.entries(this.results)) {
            const info = getModuloInfo(key);
            blocks += `
                <div class="result-block" id="result-${key}">
                    <div class="result-header" data-toggle="${key}">
                        <div class="result-header-left">
                            <span class="seal-badge" title="Documento generado">${info.icon}</span>
                            <span class="result-header-title">${info.nombre}</span>
                        </div>
                        <div class="result-header-actions">
                            <button class="icon-btn" data-copy="${key}" title="Copiar contenido">📋</button>
                            <button class="icon-btn" data-edit="${key}" title="Editar contenido">✏️</button>
                            <span class="result-toggle">▼</span>
                        </div>
                    </div>
                    <div class="result-body" id="result-body-${key}" data-key="${key}">${html}</div>
                </div>`;
        }

        return `
            <h2 class="step-title">¡Listo! Tu contenido está generado</h2>
            <p class="step-description">Revisá el contenido, editalo si hace falta, y exportá en el formato que prefieras</p>
            <div class="export-row">
                <button class="btn btn-export" id="btn-pdf">📥 Descargar PDF</button>
                <button class="btn btn-export" id="btn-word">📥 Descargar Word</button>
                <button class="btn btn-secondary" id="btn-new">🔄 Nueva planificación</button>
            </div>
            <div class="results-section">${blocks}</div>
            <div class="export-row">
                <button class="btn btn-export" id="btn-pdf2">📥 Descargar PDF</button>
                <button class="btn btn-export" id="btn-word2">📥 Descargar Word</button>
            </div>`;
    }

    // --- Attach Events ---
    attachEvents() {
        const step = this.currentStep;

        // Welcome events
        if (step === 0) {
            this.on('btn-start', 'click', () => { this.currentStep = 1; this.render(); });
            this.on('btn-quick-connect', 'click', () => this.showKeyInput());
            this.on('btn-change-key', 'click', () => this.showKeyInput());
            this.on('btn-history', 'click', () => this.showHistory());
        }

        // Nivel selection
        if (step === 1) {
            document.querySelectorAll('[data-nivel]').forEach(card => {
                card.addEventListener('click', () => {
                    this.config.nivelId = card.dataset.nivel;
                    this.config.nivel = NIVELES[card.dataset.nivel].nombre;
                    this.config.materiaId = null;
                    this.config.materia = null;
                    this.config.temaId = null;
                    this.config.tema = null;
                    this.render();
                });
            });
        }

        // Materia selection
        if (step === 2) {
            document.querySelectorAll('[data-materia]').forEach(card => {
                card.addEventListener('click', () => {
                    this.config.materiaId = card.dataset.materia;
                    this.config.materia = NIVELES[this.config.nivelId].materias[card.dataset.materia].nombre;
                    this.config.temaId = null;
                    this.config.tema = null;
                    this.render();
                });
            });
        }

        // Tema selection
        if (step === 3) {
            document.querySelectorAll('[data-tema]').forEach(card => {
                card.addEventListener('click', () => {
                    this.config.temaId = card.dataset.tema;
                    this.config.tema = card.dataset.temanombre;
                    this.render();
                });
            });
        }

        // Subtema - save on navigation
        if (step === 4) {
            const subtemaInput = document.getElementById('input-subtema');
            if (subtemaInput) {
                subtemaInput.addEventListener('input', () => {
                    this.config.subtema = subtemaInput.value;
                });
            }
        }

        // Modulos selection (multi-select)
        if (step === 5) {
            document.querySelectorAll('[data-modulo]').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.dataset.modulo;
                    if (this.config.modulos.includes(id)) {
                        this.config.modulos = this.config.modulos.filter(m => m !== id);
                        if (id === 'adaptacion_dea') this.config.tipoDEA = null;
                    } else {
                        this.config.modulos.push(id);
                    }
                    this.render();
                });
            });
            document.querySelectorAll('[data-dea]').forEach(card => {
                card.addEventListener('click', () => {
                    this.config.tipoDEA = card.dataset.dea;
                    this.config.tipoDEANombre = TIPOS_DEA.find(d => d.id === card.dataset.dea)?.nombre;
                    this.render();
                });
            });
        }

        // Config step
        if (step === 6) {
            this.on('btn-generate', 'click', () => {
                this.config.institucion = document.getElementById('input-institucion')?.value || '';
                this.config.docente = document.getElementById('input-docente')?.value || '';
                this.config.curso = document.getElementById('input-curso')?.value || '';
                this.config.duracion = document.getElementById('input-duracion')?.value || '80 minutos';
                this.currentStep = 7;
                this.render();
            });
        }

        // Results step
        if (step === 8) {
            document.querySelectorAll('[data-toggle]').forEach(header => {
                header.addEventListener('click', () => {
                    const block = header.closest('.result-block');
                    block.classList.toggle('collapsed');
                });
            });

            document.querySelectorAll('[data-copy]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const key = btn.dataset.copy;
                    const body = document.getElementById(`result-body-${key}`);
                    const text = body ? body.innerText : '';
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text)
                            .then(() => this.showToast('📋 Contenido copiado'))
                            .catch(() => this.showToast('No se pudo copiar automáticamente'));
                    } else {
                        this.showToast('No se pudo copiar automáticamente');
                    }
                });
            });

            document.querySelectorAll('[data-edit]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const key = btn.dataset.edit;
                    const body = document.getElementById(`result-body-${key}`);
                    if (!body) return;
                    const isEditing = body.classList.contains('editing');
                    if (isEditing) {
                        this.results[key] = body.innerHTML;
                        body.classList.remove('editing');
                        body.contentEditable = 'false';
                        btn.textContent = '✏️';
                        btn.title = 'Editar contenido';
                        this.showToast('💾 Cambios guardados');
                    } else {
                        body.classList.add('editing');
                        body.contentEditable = 'true';
                        body.focus();
                        btn.textContent = '💾';
                        btn.title = 'Guardar cambios';
                    }
                });
            });

            const exportConfig = {
                nivel: this.config.nivel, materia: this.config.materia, tema: this.config.tema,
                institucion: this.config.institucion, docente: this.config.docente,
                curso: this.config.curso, duracion: this.config.duracion
            };
            this.on('btn-pdf', 'click', () => exporter.exportToPDF(this.results, exportConfig));
            this.on('btn-pdf2', 'click', () => exporter.exportToPDF(this.results, exportConfig));
            this.on('btn-word', 'click', () => exporter.exportToWord(this.results, exportConfig));
            this.on('btn-word2', 'click', () => exporter.exportToWord(this.results, exportConfig));
            this.on('btn-new', 'click', () => {
                this.currentStep = 1;
                this.config.modulos = [];
                this.config.subtema = '';
                this.config.tipoDEA = null;
                this.results = {};
                this.loadedFromHistory = false;
                this.render();
            });
        }

        // Navigation
        this.on('btn-back', 'click', () => { this.currentStep--; this.render(); });
        this.on('btn-next', 'click', () => { this.currentStep++; this.render(); });
    }

    on(id, event, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
    }

    // --- Paso 1: elegir qué motor de IA usar ---
    showKeyInput() {
        const container = document.getElementById('step-container');
        const cards = IA_PROVEEDORES.map(p => `
            <div class="card" data-proveedor="${p.id}">
                <span class="card-icon">${p.icon}</span>
                <div class="card-name">${p.nombre} <span class="summary-badge" style="margin-left:4px;">${p.badge}</span></div>
                <div class="card-desc">${p.desc}</div>
            </div>`).join('');

        container.innerHTML = `
            <h2 class="step-title" style="text-align:center;">Vincular Inteligencia Artificial</h2>
            <p class="step-description" style="text-align:center;">Cada docente conecta la IA que prefiera o ya tenga contratada. Elegí una para continuar:</p>
            <div class="cards-grid">${cards}</div>
            <div style="text-align: center; margin-top: 12px;">
                <button id="btn-clear-key" style="background: none; border: none; color: var(--text-faint); cursor: pointer; text-decoration: underline; font-size: 0.8rem;">Borrar mi clave guardada de este navegador</button>
            </div>`;

        document.querySelectorAll('[data-proveedor]').forEach(card => {
            card.addEventListener('click', () => this.showKeyInputForProvider(card.dataset.proveedor));
        });
        document.getElementById('btn-clear-key').addEventListener('click', () => {
            generator.clearApiKey();
            this.currentStep = 0;
            this.render();
        });
    }

    // --- Paso 2: pegar la clave del proveedor elegido ---
    showKeyInputForProvider(providerId) {
        const container = document.getElementById('step-container');
        const p = getProveedorInfo(providerId);

        container.innerHTML = `
            <div class="api-key-section">
                <h2 class="step-title" style="text-align: center;">${p.icon} ${p.nombre}</h2>
                <p class="step-description" style="text-align: center;">${p.desc}</p>

                <div class="tutorial-card">
                    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
                        <div class="tutorial-step-num">1</div>
                        <div>
                            <h3 style="margin: 0 0 8px; font-size: 1.1rem;">Conseguir tu clave (API Key)</h3>
                            <p style="margin: 0; color: var(--text-muted); font-size: 0.95rem;">Si todavía no tenés una, entrá a la página del proveedor y generá una nueva clave.</p>
                            <a href="${p.keyUrl}" target="_blank" class="btn btn-secondary" style="display: inline-block; margin-top: 12px; padding: 8px 16px; text-decoration: none;">Abrir página de ${p.nombre} ↗</a>
                        </div>
                    </div>

                    <div style="display: flex; gap: 16px;">
                        <div class="tutorial-step-num">2</div>
                        <div style="width: 100%;">
                            <h3 style="margin: 0 0 8px; font-size: 1.1rem;">Pegar la clave aquí</h3>
                            <p style="margin: 0 0 12px; color: var(--text-muted); font-size: 0.95rem;">Copiá la clave generada y péguela en este recuadro:</p>
                            <input type="password" id="ai-key" placeholder="${p.keyPlaceholder}" value="" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.25); border: 1px solid var(--brass); color: var(--text); font-size: 1rem; margin-bottom: 8px;">
                        </div>
                    </div>
                </div>

                <div id="status-msg" class="status-msg" style="text-align: center;"></div>

                <div class="btn-row" style="justify-content: center; margin-bottom: 12px;">
                    <button class="btn btn-secondary" id="btn-back-provider">← Elegir otro motor</button>
                    <button class="btn btn-primary" id="btn-test-key" style="font-size: 1.1rem; padding: 14px 32px;">🔌 Conectar y Comenzar</button>
                </div>
            </div>`;

        document.getElementById('btn-back-provider').addEventListener('click', () => this.showKeyInput());

        document.getElementById('btn-test-key').addEventListener('click', async () => {
            const key = document.getElementById('ai-key').value.trim();
            const statusEl = document.getElementById('status-msg');
            if (!key) {
                statusEl.className = 'status-msg error';
                statusEl.textContent = '⚠️ Ingresá una API Key';
                return;
            }
            statusEl.className = 'status-msg';
            statusEl.style.display = 'block';
            statusEl.style.background = 'rgba(201,162,77,0.1)';
            statusEl.style.borderColor = 'rgba(201,162,77,0.3)';
            statusEl.style.color = 'var(--brass-bright)';
            statusEl.textContent = '⏳ Probando conexión...';

            generator.setApiKey(key, providerId);
            try {
                await generator.testConnection();
                statusEl.className = 'status-msg success';
                statusEl.textContent = '✅ ¡Conexión exitosa! Redirigiendo...';
                setTimeout(() => { this.currentStep = 0; this.render(); }, 1200);
            } catch (e) {
                statusEl.className = 'status-msg error';
                statusEl.textContent = `❌ Error: ${e.message}`;
            }
        });
    }

    // --- Start Generation ---
    async startGeneration() {
        const textEl = document.getElementById('loading-text');
        const subEl = document.getElementById('loading-subtext');
        const barEl = document.getElementById('loading-bar');

        const temaCompleto = this.config.subtema
            ? `${this.config.tema} — Subtema: ${this.config.subtema}`
            : this.config.tema;

        const aiConfig = {
            nivel: this.config.nivel,
            materia: this.config.materia,
            tema: temaCompleto,
            duracion: this.config.duracion,
            institucion: this.config.institucion,
            docente: this.config.docente,
            curso: this.config.curso,
            tipoDEA: this.config.tipoDEANombre || 'General',
            fecha: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
        };

        this.results = await generator.generateAll(
            this.config.modulos,
            aiConfig,
            (modulo, completed, total, status) => {
                const pct = Math.round((completed / total) * 100);
                barEl.style.width = pct + '%';
                const nombre = getModuloNombre(modulo);
                if (status === 'reintentando') {
                    textEl.textContent = `Reintentando: ${nombre}`;
                    subEl.textContent = 'Tuvimos un problema momentáneo, probamos de nuevo…';
                } else if (completed < total) {
                    textEl.textContent = `Generando: ${nombre}`;
                    subEl.textContent = `${completed + 1} de ${total} documentos`;
                } else {
                    textEl.textContent = '¡Todo listo!';
                    subEl.textContent = 'Preparando vista previa...';
                }
            }
        );

        // Check if all results have errors
        const allErrors = Object.values(this.results).every(r => r.includes('Error al generar'));
        if (allErrors) {
            const container = document.getElementById('step-container');
            container.innerHTML = `
                <div class="loading-container">
                    <span style="font-size: 3rem; display: block; margin-bottom: 16px;">⚠️</span>
                    <div class="loading-text" style="color: var(--oxblood);">Error al conectar con la IA</div>
                    <div class="loading-subtext" style="max-width: 400px; margin: 12px auto;">
                        ${Object.values(this.results)[0].replace(/<[^>]*>/g, '')}
                    </div>
                    <div class="btn-row" style="justify-content: center; margin-top: 24px;">
                        <button class="btn btn-secondary" id="btn-back-error">← Volver a configurar</button>
                        <button class="btn btn-primary" id="btn-retry">🔄 Reintentar</button>
                        <button class="btn btn-secondary" id="btn-rekey">🔑 Cambiar API Key</button>
                    </div>
                </div>`;
            document.getElementById('btn-back-error').addEventListener('click', () => { this.currentStep = 6; this.render(); });
            document.getElementById('btn-retry').addEventListener('click', () => { this.currentStep = 7; this.render(); });
            document.getElementById('btn-rekey').addEventListener('click', () => { this.currentStep = 0; this.showKeyInput(); });
            return;
        }

        if (!this.loadedFromHistory) this.saveToHistory();
        this.loadedFromHistory = false;

        setTimeout(() => { this.currentStep = 8; this.render(); }, 600);
    }
}

// --- Iniciar app cuando carga la página ---
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlanificaDocApp();
});
