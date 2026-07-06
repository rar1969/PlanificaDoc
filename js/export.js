// ============================================================
// PlanificaDoc - Exportación a PDF y Word (.docx nativo real,
// generado con la librería "docx" — sin trucos de HTML/MHT)
// ============================================================

class Exporter {

    // Convierte texto libre en un nombre de archivo seguro
    slugify(text) {
        return (text || 'documento')
            .toString()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca acentos
            .replace(/[^a-zA-Z0-9\s_-]/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .slice(0, 60) || 'documento';
    }

    // Construye la línea de metadatos (institución / docente / curso / duración) para portadas
    buildMetaLine(config) {
        const partes = [];
        if (config.institucion) partes.push(config.institucion);
        if (config.docente) partes.push(`Docente: ${config.docente}`);
        if (config.curso) partes.push(`Curso: ${config.curso}`);
        if (config.duracion) partes.push(config.duracion);
        return partes.join(' · ');
    }

    // --- Diagramas SVG generados por la IA: sanitizar y rasterizar a PNG ---
    // (función experimental: la calidad del diagrama depende de lo que genere la IA)

    _sanitizeSvg(svgString) {
        const safe = svgString
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
            .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
            .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
            .replace(/javascript:/gi, '');
        // Normalización gráfica (puntas de flecha, grosores). Es idempotente, así
        // que también corrige contenido generado/guardado antes de esta mejora.
        return (typeof normalizarSvgIA === 'function') ? normalizarSvgIA(safe) : safe;
    }

    // Convierte un <svg> (como string) en un PNG, manteniendo su proporción (viewBox)
    _svgToPngDataUrl(svgString, targetWidth = 900) {
        return new Promise((resolve, reject) => {
            let vbW = targetWidth, vbH = targetWidth * 0.6;
            const vbMatch = svgString.match(/viewBox=["']\s*[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)/i);
            if (vbMatch) {
                vbW = parseFloat(vbMatch[1]);
                vbH = parseFloat(vbMatch[2]);
            }
            // Rasterizamos al DOBLE de resolución (supersampling): el PNG queda con
            // bordes y puntas de flecha nítidas al imprimirse en PDF/Word, y como
            // los tamaños de inserción se calculan por proporción, nada cambia de escala.
            const width = targetWidth * 2;
            const height = Math.max(1, Math.round(width * (vbH / vbW)));

            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = window.document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = () => reject(new Error('No se pudo rasterizar el diagrama SVG'));
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
        });
    }

    _dataUrlToUint8Array(dataUrl) {
        const base64 = dataUrl.split(',')[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    // La fuente estándar que usa jsPDF (Helvetica) solo soporta el alfabeto latino
    // básico + acentos (Windows-1252). Letras griegas, símbolos matemáticos, emojis
    // y algunos sub/superíndices NO existen ahí y se ven como caracteres corruptos.
    // Los reemplazamos por una versión en texto plano seguro antes de escribir en el PDF.
    // (Nota: ² ³ ¹ ° × ÷ ± sí están soportados, no hace falta tocarlos.)
    _sanitizeForPDF(text) {
        if (!text) return text;
        const mapa = {
            'α': 'alfa', 'Α': 'Alfa', 'β': 'beta', 'Β': 'Beta', 'γ': 'gamma', 'Γ': 'Gamma',
            'δ': 'delta', 'Δ': 'Delta', 'ε': 'épsilon', 'Ε': 'Épsilon', 'ζ': 'zeta', 'Ζ': 'Zeta',
            'η': 'eta', 'Η': 'Eta', 'θ': 'theta', 'Θ': 'Theta', 'ι': 'iota', 'Ι': 'Iota',
            'κ': 'kappa', 'Κ': 'Kappa', 'λ': 'lambda', 'Λ': 'Lambda', 'μ': 'mu', 'Μ': 'Mu',
            'ν': 'nu', 'Ν': 'Nu', 'ξ': 'xi', 'Ξ': 'Xi', 'π': 'pi', 'Π': 'Pi',
            'ρ': 'rho', 'Ρ': 'Rho', 'σ': 'sigma', 'Σ': 'Sigma', 'ς': 'sigma',
            'τ': 'tau', 'Τ': 'Tau', 'φ': 'phi', 'Φ': 'Phi', 'χ': 'chi', 'Χ': 'Chi',
            'ψ': 'psi', 'Ψ': 'Psi', 'ω': 'omega', 'Ω': 'Omega',
            '√': 'raíz de ', '∛': 'raíz cúbica de ', '∞': 'infinito',
            '≈': '~=', '≤': '<=', '≥': '>=', '≠': '!=', '−': '-',
            '→': '->', '←': '<-', '↑': '^', '↓': 'v', '∑': 'Suma', '∫': 'integral de ',
            '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
            '⁰': '0', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
        };
        let out = text.replace(/[α-ωΑ-Ω√∛∞≈≤≥≠−→←↑↓∑∫₀-₉⁰⁴-⁹]/g, ch => mapa[ch] !== undefined ? mapa[ch] : '');
        // Red de seguridad: cualquier emoji o símbolo pictográfico que quede (fuera del
        // alfabeto latino/acentos) se elimina para no mostrar caracteres corruptos.
        out = out.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu, '');
        return out;
    }

    // --- Exportar a PDF usando jsPDF ---
    async exportToPDF(results, config) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 18;
        const contentWidth = pageWidth - margin * 2;
        let y = 20;

        const checkPage = (needed = 20) => {
            if (y + needed > 275) {
                doc.addPage();
                y = 20;
            }
        };

        const metaLine = this.buildMetaLine(config);
        const headerHeight = metaLine ? 42 : 35;
        doc.setFillColor(35, 30, 20);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        doc.setDrawColor(201, 162, 77);
        doc.setLineWidth(0.6);
        doc.line(0, headerHeight, pageWidth, headerHeight);

        doc.setTextColor(230, 195, 120);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('PlanificaDoc', margin, 16);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${config.nivel || ''} | ${config.materia || ''} | ${config.tema || ''}`, margin, 25);
        if (metaLine) {
            doc.setFontSize(9);
            doc.setTextColor(220, 220, 220);
            doc.text(this._sanitizeForPDF(metaLine), margin, 32);
        }
        doc.setFontSize(8.5);
        doc.setTextColor(190, 190, 190);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, margin, headerHeight - 5);
        y = headerHeight + 10;

        doc.setTextColor(30, 30, 30);

        for (const [key, html] of Object.entries(results)) {
            checkPage(30);
            const info = getModuloInfo(key);

            doc.setFillColor(247, 240, 224);
            doc.roundedRect(margin - 2, y - 5, contentWidth + 4, 12, 2, 2, 'F');
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(138, 106, 46);
            doc.text(info.nombre, margin, y + 3);
            y += 16;

            doc.setTextColor(30, 30, 30);
            const lines = this.htmlToTextLines(html);

            for (const line of lines) {
                checkPage(8);

                if (line.type === 'heading') {
                    y += 4;
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(138, 106, 46);
                    const wrapped = doc.splitTextToSize(this._sanitizeForPDF(line.text), contentWidth);
                    doc.text(wrapped, margin, y);
                    y += wrapped.length * 5.5 + 2;
                } else if (line.type === 'listitem') {
                    doc.setFontSize(9.5);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 50);
                    const bullet = `  •  ${this._sanitizeForPDF(line.text)}`;
                    const wrapped = doc.splitTextToSize(bullet, contentWidth - 5);
                    checkPage(wrapped.length * 4.5);
                    doc.text(wrapped, margin + 3, y);
                    y += wrapped.length * 4.5 + 1;
                } else if (line.type === 'table') {
                    this.addTableToPDF(doc, line.data, margin, y, contentWidth);
                    y = doc.lastAutoTable.finalY + 8;
                } else if (line.type === 'svg') {
                    try {
                        const safe = this._sanitizeSvg(line.raw);
                        const { dataUrl, width, height } = await this._svgToPngDataUrl(safe, 900);
                        const imgWidthMM = Math.min(contentWidth, 130);
                        const imgHeightMM = imgWidthMM * (height / width);
                        checkPage(imgHeightMM + 10);
                        doc.addImage(dataUrl, 'PNG', margin, y, imgWidthMM, imgHeightMM);
                        y += imgHeightMM + 10;
                    } catch (e) {
                        // Si la IA generó un SVG que no se pudo rasterizar, seguimos sin el
                        // diagrama en vez de interrumpir toda la exportación.
                        console.warn('No se pudo incluir un diagrama:', e);
                    }
                } else {
                    doc.setFontSize(9.5);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 50);
                    const wrapped = doc.splitTextToSize(this._sanitizeForPDF(line.text), contentWidth);
                    checkPage(wrapped.length * 4.5);
                    doc.text(wrapped, margin, y);
                    y += wrapped.length * 4.5 + 2;
                }
            }

            y += 10;
        }

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`PlanificaDoc — Página ${i} de ${totalPages}`, margin, 290);
        }

        const filename = `PlanificaDoc_${this.slugify(config.materia)}_${this.slugify(config.tema)}_${Date.now()}.pdf`;
        doc.save(filename);
        return filename;
    }

    // Helper: Convertir HTML a líneas de texto estructuradas (usado por el PDF)
    htmlToTextLines(html) {
        const lines = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
        const root = doc.body.firstChild;

        const walk = (node) => {
            if (!node) return;
            for (const child of node.childNodes) {
                if (child.nodeType === 3) {
                    const text = child.textContent.trim();
                    if (text) lines.push({ type: 'text', text });
                } else if (child.nodeType === 1) {
                    const tag = child.tagName.toLowerCase();
                    if (tag === 'h3' || tag === 'h2' || tag === 'h4') {
                        lines.push({ type: 'heading', text: child.textContent.trim() });
                    } else if (tag === 'li') {
                        lines.push({ type: 'listitem', text: child.textContent.trim() });
                    } else if (tag === 'table') {
                        lines.push({ type: 'table', data: this.parseTableForPDF(child) });
                    } else if (tag === 'svg') {
                        lines.push({ type: 'svg', raw: child.outerHTML });
                    } else if (tag === 'style' || tag === 'script' || tag === 'head') {
                        // Nunca tratar su contenido como texto visible
                        continue;
                    } else if (tag === 'p') {
                        const text = child.textContent.trim();
                        if (text) lines.push({ type: 'text', text });
                    } else if (tag === 'strong' || tag === 'b') {
                        const text = child.textContent.trim();
                        if (text) lines.push({ type: 'text', text });
                    } else {
                        walk(child);
                    }
                }
            }
        };

        walk(root);
        return lines;
    }

    parseTableForPDF(tableEl) {
        const headers = [];
        const rows = [];
        const headerRow = tableEl.querySelector('tr');
        if (headerRow) {
            for (const th of headerRow.querySelectorAll('th, td')) {
                headers.push(this._sanitizeForPDF(th.textContent.trim()));
            }
        }
        const bodyRows = tableEl.querySelectorAll('tr');
        for (let i = 1; i < bodyRows.length; i++) {
            const row = [];
            for (const td of bodyRows[i].querySelectorAll('td, th')) {
                row.push(this._sanitizeForPDF(td.textContent.trim()));
            }
            if (row.length > 0) rows.push(row);
        }
        return { headers, rows };
    }

    addTableToPDF(doc, data, x, y, width) {
        if (!data.headers.length && !data.rows.length) return;

        doc.autoTable({
            startY: y,
            margin: { left: x },
            tableWidth: width,
            head: data.headers.length > 0 ? [data.headers] : undefined,
            body: data.rows,
            styles: {
                fontSize: 8,
                cellPadding: 3,
                lineColor: [210, 200, 180],
                lineWidth: 0.3
            },
            headStyles: {
                fillColor: [138, 106, 46],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 8.5
            },
            alternateRowStyles: {
                fillColor: [247, 240, 224]
            },
            theme: 'grid'
        });
    }

    // ============================================================
    // --- Exportar a Word: .docx NATIVO real, con la librería docx
    //     (sin altChunk/MHT: elimina de raíz los artefactos de
    //     codificación tipo "=3D" y la incompatibilidad con
    //     LibreOffice / Google Docs / Word Online)
    // ============================================================

    // Convierte los hijos inline (texto, <strong>, <em>, <b>, <i>) de un nodo en TextRuns
    _inlineToRuns(node, baseOpts = {}) {
        const { TextRun } = window.docx;
        const runs = [];
        const walk = (n, opts) => {
            for (const child of n.childNodes) {
                if (child.nodeType === 3) {
                    const text = child.textContent;
                    if (text) runs.push(new TextRun({ text, ...opts }));
                } else if (child.nodeType === 1) {
                    const tag = child.tagName.toLowerCase();
                    const childOpts = { ...opts };
                    if (tag === 'strong' || tag === 'b') childOpts.bold = true;
                    if (tag === 'em' || tag === 'i') childOpts.italics = true;
                    if (tag === 'sup') childOpts.superScript = true;
                    if (tag === 'sub') childOpts.subScript = true;
                    walk(child, childOpts);
                }
            }
        };
        walk(node, baseOpts);
        if (runs.length === 0) runs.push(new TextRun({ text: node.textContent || '', ...baseOpts }));
        return runs;
    }

    _parseTableForDocx(tableEl) {
        const { Table, TableRow, TableCell, Paragraph, WidthType, ShadingType } = window.docx;
        const rowsEls = [...tableEl.querySelectorAll('tr')];
        const numCols = rowsEls[0] ? rowsEls[0].querySelectorAll('th,td').length : 1;
        const rows = rowsEls.map((tr, rowIndex) => {
            const cellEls = [...tr.querySelectorAll('th,td')];
            const cells = cellEls.map(cellEl => {
                const isHeader = cellEl.tagName.toLowerCase() === 'th' || rowIndex === 0;
                return new TableCell({
                    width: { size: Math.floor(100 / (cellEls.length || 1)), type: WidthType.PERCENTAGE },
                    shading: isHeader ? { type: ShadingType.CLEAR, fill: 'C9A24D' } : undefined,
                    children: [new Paragraph({
                        children: this._inlineToRuns(cellEl, { bold: isHeader, color: isHeader ? 'FFFFFF' : undefined }),
                    })],
                });
            });
            return new TableRow({ children: cells });
        });
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: Array(numCols).fill(Math.floor(9000 / numCols)),
            rows,
        });
    }

    // Convierte el HTML generado por la IA en elementos de docx (Paragraph / Table / Imagen)
    async _htmlToDocxElements(html) {
        const { Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType } = window.docx;
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
        const root = doc.body.firstChild;
        const elements = [];

        const walk = async (node) => {
            for (const child of node.childNodes) {
                if (child.nodeType !== 1) continue;
                const tag = child.tagName.toLowerCase();
                if (tag === 'style' || tag === 'script' || tag === 'head') {
                    continue;
                } else if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
                    elements.push(new Paragraph({
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 240, after: 120 },
                        children: [new TextRun({ text: child.textContent.trim(), bold: true, color: '8A6A2E', size: 26 })],
                    }));
                } else if (tag === 'p') {
                    const text = child.textContent.trim();
                    if (!text) continue;
                    elements.push(new Paragraph({
                        spacing: { after: 160 },
                        children: this._inlineToRuns(child),
                    }));
                } else if (tag === 'ul' || tag === 'ol') {
                    const items = [...child.children].filter(li => li.tagName.toLowerCase() === 'li');
                    items.forEach((li, i) => {
                        const prefix = tag === 'ol' ? `${i + 1}. ` : '•  ';
                        const runs = [new TextRun({ text: prefix }), ...this._inlineToRuns(li)];
                        elements.push(new Paragraph({ indent: { left: 400 }, spacing: { after: 80 }, children: runs }));
                    });
                } else if (tag === 'table') {
                    elements.push(this._parseTableForDocx(child));
                    elements.push(new Paragraph({ text: '', spacing: { after: 160 } }));
                } else if (tag === 'svg') {
                    try {
                        const safe = this._sanitizeSvg(child.outerHTML);
                        const { dataUrl, width, height } = await this._svgToPngDataUrl(safe, 900);
                        const pngBytes = this._dataUrlToUint8Array(dataUrl);
                        const displayWidth = 420; // px de ancho dentro del documento
                        const displayHeight = Math.round(displayWidth * (height / width));
                        elements.push(new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 120, after: 200 },
                            children: [new ImageRun({
                                data: pngBytes,
                                type: 'png',
                                transformation: { width: displayWidth, height: displayHeight },
                            })],
                        }));
                    } catch (e) {
                        // Si la IA generó un SVG que no se pudo rasterizar, seguimos sin el
                        // diagrama en vez de interrumpir toda la exportación.
                        console.warn('No se pudo incluir un diagrama:', e);
                    }
                } else {
                    await walk(child);
                }
            }
        };
        await walk(root);
        return elements;
    }

    async exportToWord(results, config) {
        if (!window.docx) {
            alert('No se pudo cargar el generador de Word (se necesita conexión a internet la primera vez). Probá exportar a PDF, o revisá tu conexión y volvé a intentar.');
            return null;
        }
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = window.docx;

        const metaLine = this.buildMetaLine(config);

        // --- Portada ---
        const coverChildren = [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [new TextRun({ text: 'PlanificaDoc', bold: true, color: '8A6A2E', size: 48 })],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [new TextRun({ text: `${config.nivel || ''} | ${config.materia || ''} | ${config.tema || ''}`, size: 24, color: '444444' })],
            }),
        ];
        if (metaLine) {
            coverChildren.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [new TextRun({ text: metaLine, size: 20, color: '666666' })],
            }));
        }
        coverChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: `Generado: ${new Date().toLocaleDateString('es-AR')}`, size: 18, color: '999999' })],
        }));

        // --- Un bloque por cada documento generado, con salto de página entre ellos ---
        const bodyChildren = [];
        let first = true;
        for (const [key, html] of Object.entries(results)) {
            const info = getModuloInfo(key);
            if (!first) {
                bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
            }
            first = false;
            bodyChildren.push(new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 200 },
                border: { bottom: { color: 'C9A24D', space: 4, style: 'single', size: 8 } },
                children: [new TextRun({ text: `${info.icon} ${info.nombre}`, bold: true, color: '8A6A2E', size: 32 })],
            }));
            bodyChildren.push(...(await this._htmlToDocxElements(html)));
        }

        const wordDoc = new Document({
            sections: [{
                properties: {},
                children: [...coverChildren, ...bodyChildren],
            }],
        });

        const filename = `PlanificaDoc_${this.slugify(config.materia)}_${this.slugify(config.tema)}_${Date.now()}.docx`;
        const blob = await Packer.toBlob(wordDoc);
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = filename;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return filename;
    }
}

const exporter = new Exporter();
