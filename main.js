let allData = [];
let charts = {};

// --- INICIO: LÓGICA DE MODO OSCURO ---

const themeToggle = document.getElementById('theme-toggle');

function updateAllChartsTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const fontColor = isDark ? '#CBD5E1' : '#334155';
    const gridColor = isDark ? '#334155' : '#E2E8F0';

    for (const chartId in charts) {
        const chart = charts[chartId];
        if (!chart) continue;

        // Gráfico de ApexCharts
        if (typeof chart.updateOptions === 'function') {
            chart.updateOptions({
                theme: {
                    mode: isDark ? 'dark' : 'light'
                },
                tooltip: {
                    theme: isDark ? 'dark' : 'light'
                },
                xaxis: {
                    labels: {
                        style: {
                            colors: fontColor
                        }
                    },
                    title: {
                        style: {
                            color: fontColor
                        }
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            colors: fontColor
                        }
                    },
                    title: {
                        style: {
                            color: fontColor
                        }
                    }
                },
                legend: {
                    labels: {
                        colors: [fontColor]
                    }
                },
                grid: {
                    borderColor: gridColor
                }
            });
        }
        // Gráfico de Chart.js
        else if (typeof chart.update === 'function') {
            if (chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = fontColor;
            }
            if (chart.options.plugins.datalabels) {
                chart.options.plugins.datalabels.color = fontColor;
            }
            if (chart.options.scales) {
                Object.keys(chart.options.scales).forEach(axis => {
                    const scale = chart.options.scales[axis];
                    if (scale.ticks) scale.ticks.color = fontColor;
                    if (scale.grid) scale.grid.color = gridColor;
                    if (scale.title) scale.title.color = fontColor;
                });
            }
            chart.update();
        }
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        themeToggle.checked = true;
    } else {
        document.documentElement.classList.remove('dark');
        themeToggle.checked = false;
    }
    localStorage.setItem('theme', theme);

    if (Object.keys(charts).length > 0) {
        updateAllChartsTheme();
    }
}

function handleThemeToggle() {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    applyTheme(newTheme);
}

function loadInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

themeToggle.addEventListener('change', handleThemeToggle);
document.addEventListener('DOMContentLoaded', loadInitialTheme);

// --- FIN: LÓGICA DE MODO OSCURO ---

// --- CONFIGURACIÓN GLOBAL ---
const FONT_COLOR = '#475569';
const GRID_COLOR = '#E2E8F0';
const PALETTE = {
    indigo: '#4F46E5', blue: '#2563EB', cyan: '#0891B2', teal: '#0D9488',
    emerald: '#059669', green: '#16A34A', lime: '#65A30D', yellow: '#CA8A04',
    amber: '#D97706', orange: '#EA580C', red: '#DC2626', purple: '#7C3AED',
    rose: '#E11D48', fuchsia: '#C026D3', slate: '#64748B', gray: '#6B7280'
};

const CLIENT_TYPE_FIELD = 'clientType';
const CLIENT_TYPE_CONFIG = {
    preferencial: 'Preferencial',
    normal: 'Normal',
    unassigned: 'Sin Asignar'
};
const SATISFACTION_FIELD_NAME = 'Satisfaction rating';

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const SLA_MATRIX = {
    'highest': { timeToFirstResponse: 1, timeToResolution: 4 },
    'high': { timeToFirstResponse: 3, timeToResolution: 12 },
    'medium': { timeToFirstResponse: 6, timeToResolution: 18 },
    'low': { timeToFirstResponse: 8, timeToResolution: 72 },
    'lowest': { timeToFirstResponse: 16, timeToResolution: 108 }
};
const SLA_COMPLIANCE_THRESHOLD = 90; // 90%

const COMMON_TABLE_HEADERS = [
    { key: 'issue', displayName: 'Issue Key' }, { key: 'summary', displayName: 'Título' },
    { key: 'priority', displayName: 'Prioridad' }, { key: 'status', displayName: 'Estado' },
    { key: 'assignee', displayName: 'Asignado' }, { key: 'client', displayName: 'Cliente' },
    { key: 'requestType', displayName: 'Tipo Solicitud' }, { key: 'created', displayName: 'Fecha Creación' }
];

const SLA_TABLE_HEADERS = [
    { key: 'issue', displayName: 'Issue Key' }, { key: 'summary', displayName: 'Título' },
    { key: 'priority', displayName: 'Prioridad' }, { key: 'actualTime', displayName: 'Tiempo Real (Hrs)' },
    { key: 'slaLimit', displayName: 'Límite SLA (Hrs)' }, { key: 'slaStatus', displayName: 'Estado SLA' }
];

// --- PLUGIN DE GRÁFICOS: TEXTO CENTRAL PARA DONAS ---
const centerTextPlugin = {
    id: 'centerTextPlugin',
    afterDraw: (chart) => {
        const centerTextOptions = chart.options.plugins.centerText;
        if (!centerTextOptions || !centerTextOptions.display) return;

        const { ctx } = chart;
        const activeElements = chart.getActiveElements();
        let title, text;

        if (activeElements.length > 0) {
            const activeIndex = activeElements[0].index;
            title = chart.data.labels[activeIndex];
            text = chart.data.datasets[0].data[activeIndex];
        } else {
            title = "Total";
            text = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        }

        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

        ctx.save();
        ctx.font = '600 0.9rem Inter';
        ctx.fillStyle = '#64748B';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, centerX, centerY - 20);

        ctx.font = '700 2.25rem Montserrat';
        ctx.fillStyle = '#334155';
        ctx.fillText(text, centerX, centerY + 15);
        ctx.restore();
    }
};

Chart.register(ChartDataLabels, ChartZoom, centerTextPlugin);

// --- EVENT LISTENERS PRINCIPALES ---
document.getElementById('csv-file-input').addEventListener('change', handleFileSelect, false);
document.getElementById('clear-filters-btn').addEventListener('click', clearAllFilters);

// --- INICIALIZACIÓN Y CARGA DE DATOS ---

function parseSatisfactionRating(value) {
    if (value === null || value === undefined) return 0;
    const s_value = String(value);
    if (!isNaN(s_value) && s_value.trim() !== '') return parseInt(s_value, 10);
    if (typeof s_value === 'string') {
        const digitMatch = s_value.match(/\d/);
        if (digitMatch) return parseInt(digitMatch[0], 10);
        const starMatch = s_value.match(/★/g);
        if (starMatch) return starMatch.length;
    }
    return 0;
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => await initializeDashboard(e.target.result);
    reader.onerror = (e) => {
        console.error("Error al leer el archivo:", e);
        alert("Error al leer el archivo. Asegúrate de que sea un archivo CSV válido.");
    };
    reader.readAsText(file, 'UTF-8');
}

async function initializeDashboard(csvData) {
    const loadingMessage = document.getElementById('loading-message');
    const loadingText = document.getElementById('loading-text');
    const progressBar = document.getElementById('progress-bar');

    document.getElementById('initial-message').classList.remove('hidden');
    loadingMessage.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressBar.className = 'h-2.5 rounded-full bg-blue-500';

    await new Promise(resolve => setTimeout(resolve, 50));

    // Paso 1: Parsear CSV
    loadingText.textContent = 'Paso 1/5: Analizando archivo CSV...';
    progressBar.style.width = '20%';
    await new Promise(resolve => setTimeout(resolve, 50));
    const rawData = parseCSV(csvData);

    if (rawData.length === 0 || Object.keys(rawData[0]).length === 0) {
        loadingText.textContent = 'Error: El archivo está vacío o tiene un formato incorrecto.';
        progressBar.classList.replace('bg-blue-500', 'bg-red-500');
        return;
    }

    // Paso 2: Mapear y limpiar datos
    loadingText.textContent = 'Paso 2/5: Mapeando y limpiando datos...';
    progressBar.style.width = '40%';
    await new Promise(resolve => setTimeout(resolve, 50));
    allData = rawData.map(d => {
        const parseCustomDate = (dateStr) => {
            if (!dateStr || typeof dateStr !== 'string') return null;
            let match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{1,2})/);
            if (match) return new Date(match[3], match[2] - 1, match[1], match[4], match[5]);
            match = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/);
            if (match) return new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
            try { const parsedDate = new Date(dateStr); if (!isNaN(parsedDate.getTime())) return parsedDate; } catch (e) {}
            return null;
        };
        const createdDate = parseCustomDate(d['Created']);
        if (!createdDate || isNaN(createdDate.getTime())) return null;

        return {
            issue: d['Issue key'] || 'N/A',
            priority: d['Priority'] || 'N/A',
            status: d['Status'] || 'N/A',
            assignee: d['Assignee'] || 'Unassigned',
            client: d['Custom field (OU Grupo (MDA))'] || 'No Asignado',
            diagnosis: d['Custom field (Diagnosis (MDA))'] || 'No especificado',
            requestType: d['Custom field (Request Type)'] || 'No especificado',
            problemType: d['Custom field (Problem Type (MDA))'] || 'N/A',
            clientType: d['Custom field (Tipo Cliente (MDA))'] || 'N/A',
            satisfaction: parseSatisfactionRating(d[SATISFACTION_FIELD_NAME]),
            summary: d['Summary'] || '',
            created: createdDate,
            resolutionTime: hmsToHours(d['Custom field (Time to resolution)']),
            firstResponseTime: hmsToHours(d['Custom field (Time to first response)'])
        };
    }).filter(d => d !== null);

    // Paso 3: Analizar sentimientos
    loadingText.textContent = 'Paso 3/5: Analizando sentimientos...';
    progressBar.className = 'h-2.5 rounded-full bg-indigo-500';
    progressBar.style.width = '60%';
    await new Promise(resolve => setTimeout(resolve, 50));
    await simulateSentimentAnalysis(allData);

    // Paso 4: Crear filtros y gráficos
    loadingText.textContent = 'Paso 4/5: Creando filtros y gráficos...';
    progressBar.style.width = '80%';
    await new Promise(resolve => setTimeout(resolve, 50));
    document.getElementById('initial-message').classList.add('hidden');
    document.getElementById('dashboard-content').classList.remove('hidden');
    populateFilters();
    updateDashboard(getFilteredData());

    // Paso 5: Generar análisis final
    loadingText.textContent = 'Paso 5/5: Generando análisis final...';
    progressBar.className = 'h-2.5 rounded-full bg-purple-500';
    progressBar.style.width = '100%';
    await new Promise(resolve => setTimeout(resolve, 50));
    setupKpiCardClickHandlers();
    makeModalDraggable();
    setupChartZoom();
    await triggerAIAnalysis();

    setTimeout(() => loadingMessage.classList.add('hidden'), 500);
}

async function simulateSentimentAnalysis(data) {
    const positives = ["modificación", "asignación", "creación", "descarga", "firma exitosa", "instrucciones", "actualización", "configuración", "cambio exitoso", "habilitación", "presentación", "visualización correcta"];
    const negatives = ["error", "urgente", "inconveniente", "no se visualiza", "no carga", "no puedo", "problema", "incidente", "no aparece", "vencido", "duplicado", "incompleto", "no se firma", "no llega", "expirada", "cancelar", "fallo", "traba", "demora", "subio mal", "no avanza", "token", "invalido", "falla", "no se ven", "no se pueden"];
    const neutrals = ["cambio", "solicitud", "documentación", "formulario", "liquidación", "notificación", "candidato", "empleado", "certificado", "proceso", "revisión", "ingreso", "actualización", "configurar"];

    for (let i = 0; i < data.length; i++) {
        const text = (data[i].summary || "").toLowerCase();
        const match = (arr) => arr.some(palabra => text.includes(palabra));
        if (match(negatives)) data[i].sentiment = "Negativo";
        else if (match(positives)) data[i].sentiment = "Positivo";
        else if (match(neutrals)) data[i].sentiment = "Neutral";
        else data[i].sentiment = "Neutral";
    }
}

function updateDashboard(data) {
    renderKPIs(data);
    renderSLAIndicators(data);
    renderCharts(data);
}

function parseCSV(data) {
    const lines = data.trim().split('\n');
    if (lines.length === 0) return [];
    const delimiter = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
    const parseLine = (line) => {
        const values = [];
        let inQuote = false;
        let currentVal = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuote = !inQuote;
            else if (char === delimiter && !inQuote) {
                values.push(currentVal.trim());
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        values.push(currentVal.trim());
        return values.map(val => val.replace(/^"|"$/g, ''));
    };
    const header = parseLine(lines[0]);
    return lines.slice(1).map(line => {
        const values = parseLine(line);
        let rowData = {};
        header.forEach((key, i) => {
            rowData[key] = values[i] !== undefined ? values[i] : '';
        });
        return rowData;
    });
}

function hmsToHours(hms) {
    if (!hms || typeof hms !== 'string') return 0;
    hms = hms.trim().toLowerCase();
    const dayMatch = hms.match(/(\d+)d/);
    const hourMatch = hms.match(/(\d+)h/);
    const minuteMatch = hms.match(/(\d+)m/);
    let totalHours = 0;
    if (dayMatch) totalHours += parseInt(dayMatch[1]) * 24;
    if (hourMatch) totalHours += parseInt(hourMatch[1]);
    if (minuteMatch) totalHours += parseInt(minuteMatch[1]) / 60;
    if (totalHours > 0) return parseFloat(totalHours.toFixed(2));
    const timeParts = hms.split(':');
    if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10) || 0;
        const minutes = parseInt(timeParts[1], 10) || 0;
        return parseFloat((hours + minutes / 60).toFixed(2));
    }
    return 0;
}

// --- LÓGICA DE FILTROS ---

function populateFilters() {
    const filterValues = {
        assignee: new Set(), client: new Set(), priority: new Set(), status: new Set(),
        requestType: new Set(), diagnosis: new Set(), problemType: new Set(), clientType: new Set()
    };

    for (const d of allData) {
        if (d.assignee && d.assignee !== 'Unassigned') filterValues.assignee.add(d.assignee);
        if (d.client && d.client !== 'No Asignado') filterValues.client.add(d.client);
        if (d.priority && d.priority !== 'N/A') filterValues.priority.add(d.priority);
        if (d.status) filterValues.status.add(d.status);
        if (d.requestType && d.requestType !== 'No especificado') filterValues.requestType.add(d.requestType);
        if (d.diagnosis && d.diagnosis !== 'No especificado') filterValues.diagnosis.add(d.diagnosis);
        if (d.problemType && d.problemType !== 'N/A') filterValues.problemType.add(d.problemType);
        if (d.clientType && d.clientType !== 'N/A') filterValues.clientType.add(d.clientType);
    }

    const populateSelect = (selectId, values) => {
        const selectElement = document.getElementById(selectId);
        selectElement.innerHTML = '';
        Array.from(values).sort().forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
        });
    };

    populateMonthFilter();
    populateSelect('assignee-filter', filterValues.assignee);
    populateSelect('client-filter', filterValues.client);
    populateSelect('priority-filter', filterValues.priority);
    populateSelect('status-filter', filterValues.status);
    populateSelect('request-type-filter', filterValues.requestType);
    populateSelect('diagnosis-filter', filterValues.diagnosis);
    populateSelect('problem-type-filter', filterValues.problemType);
    populateSelect('client-type-filter', filterValues.clientType);

    document.querySelectorAll('.filter-select').forEach(selectElement => {
        selectElement.addEventListener('change', () => {
            const data = getFilteredData();
            updateDashboard(data);
            if (['month-filter', 'assignee-filter', 'client-filter'].includes(selectElement.id)) {
                triggerAIAnalysis();
            }
        });
    });
}

async function clearAllFilters() {
    if (allData.length === 0) return;

    const btn = document.getElementById('clear-filters-btn');
    btn.textContent = 'Limpiando...';
    btn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    document.querySelectorAll('.filter-select').forEach(select => {
        if (select.multiple) {
            Array.from(select.options).forEach(opt => opt.selected = false);
        }
    });

    updateDashboard(getFilteredData());
    await triggerAIAnalysis();

    btn.textContent = 'Limpiar Filtros';
    btn.disabled = false;
}

function populateMonthFilter() {
    const monthFilter = document.getElementById('month-filter');
    monthFilter.innerHTML = '';
    if (!allData || allData.length === 0) return;

    const months = new Set(allData.map(d => `${d.created.getFullYear()}-${d.created.getMonth()}`));
    Array.from(months).sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return yearB - yearA || monthB - monthA;
    }).forEach(monthKey => {
        const [year, monthIndex] = monthKey.split('-');
        const option = document.createElement('option');
        option.value = monthKey;
        option.textContent = `${MONTH_NAMES[parseInt(monthIndex)]} ${year}`;
        monthFilter.appendChild(option);
    });
}

function getFilteredData() {
    let filtered = [...allData];
    const getSelectedValues = (selectId) => Array.from(document.getElementById(selectId).selectedOptions).map(option => option.value);

    const activeFilters = {
        month: getSelectedValues('month-filter'),
        assignee: getSelectedValues('assignee-filter'),
        client: getSelectedValues('client-filter'),
        priority: getSelectedValues('priority-filter'),
        status: getSelectedValues('status-filter'),
        requestType: getSelectedValues('request-type-filter'),
        diagnosis: getSelectedValues('diagnosis-filter'),
        problemType: getSelectedValues('problem-type-filter'),
        clientType: getSelectedValues('client-type-filter')
    };

    if (activeFilters.month.length > 0) {
        filtered = filtered.filter(d => activeFilters.month.includes(`${d.created.getFullYear()}-${d.created.getMonth()}`));
    }
    if (activeFilters.assignee.length > 0) filtered = filtered.filter(d => activeFilters.assignee.includes(d.assignee));
    if (activeFilters.client.length > 0) filtered = filtered.filter(d => activeFilters.client.includes(d.client));
    if (activeFilters.priority.length > 0) filtered = filtered.filter(d => activeFilters.priority.includes(d.priority));
    if (activeFilters.status.length > 0) filtered = filtered.filter(d => activeFilters.status.includes(d.status));
    if (activeFilters.requestType.length > 0) filtered = filtered.filter(d => activeFilters.requestType.includes(d.requestType));
    if (activeFilters.diagnosis.length > 0) filtered = filtered.filter(d => activeFilters.diagnosis.includes(d.diagnosis));
    if (activeFilters.problemType.length > 0) filtered = filtered.filter(d => activeFilters.problemType.includes(d.problemType));
    if (activeFilters.clientType.length > 0) filtered = filtered.filter(d => activeFilters.clientType.includes(d.clientType));

    return filtered;
}

// --- ANÁLISIS CON IA ---

async function triggerAIAnalysis() {
    const analysisSection = document.getElementById('ai-analysis-section');
    const loadingDiv = document.getElementById('ai-analysis-loading');
    const contentP = document.getElementById('ai-analysis-content');
    const monthFilter = document.getElementById('month-filter');

    analysisSection.classList.remove('hidden');
    loadingDiv.style.display = 'block';
    contentP.innerHTML = '';

    const selectedOptions = Array.from(monthFilter.selectedOptions).map(opt => opt.text);
    const selectedPeriodText = selectedOptions.length > 0 ? selectedOptions.join(', ') : 'Todos los Periodos';
    const dataForAnalysis = getFilteredData();
    const analysisText = await generateAIAnalysis(dataForAnalysis, selectedPeriodText, Array.from(monthFilter.selectedOptions).map(o => o.value));

    contentP.innerHTML = analysisText;
    loadingDiv.style.display = 'none';
}

async function generateAIAnalysis(data, periodText, selectedMonths) {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (!data || data.length === 0) {
        return "<p>No se encontraron datos para los filtros seleccionados. No es posible generar un análisis.</p>";
    }
    // ... (El resto de la lógica de esta función se mantiene sin cambios, solo se asegura la indentación)
    const totalTickets = data.length;
    const resolvedTickets = data.filter(d => ['Closed', 'Resolved', 'Done', 'Cerrado', 'Resuelto'].includes(d.status)).length;
    const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets * 100).toFixed(0) : 0;
    const validResolutionTimes = data.filter(d => d.resolutionTime > 0);
    const avgResolution = validResolutionTimes.length > 0 ? (validResolutionTimes.reduce((sum, d) => sum + d.resolutionTime, 0) / validResolutionTimes.length).toFixed(1) : 0;
    const sentimentCounts = data.reduce((acc, curr) => { acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1; return acc; }, {});
    const positiveSentiment = sentimentCounts['Positivo'] || 0;
    const negativeSentiment = sentimentCounts['Negativo'] || 0;
    const neutralSentiment = sentimentCounts['Neutral'] || 0;
    const totalSentiment = positiveSentiment + negativeSentiment + neutralSentiment;
    const getTopN = (key, n) => {
        const counts = data.reduce((acc, curr) => {
            const item = curr[key] || 'N/A';
            if (item !== 'N/A' && item !== 'No Asignado' && item !== 'No especificado') {
                acc[item] = (acc[item] || 0) + 1;
            }
            return acc;
        }, {});
        return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, n);
    };
    const topRequestTypes = getTopN('requestType', 1);
    const heatmapData = {};
    DAY_NAMES.forEach(day => { heatmapData[day] = Array(24).fill(0); });
    data.forEach(d => {
        const dayIndex = d.created.getDay();
        const hour = d.created.getHours();
        heatmapData[DAY_NAMES[dayIndex]][hour]++;
    });
    let peakDay = '', peakHour = -1, maxTicketsInPeak = -1;
    Object.entries(heatmapData).forEach(([day, hourCounts]) => {
        hourCounts.forEach((count, hour) => {
            if (count > maxTicketsInPeak) {
                maxTicketsInPeak = count;
                peakDay = day;
                peakHour = hour;
            }
        });
    });
    const wordCloudData = data.map(d => d.summary.split(/\s+/)).flat()
        .map(word => word.toLowerCase().replace(/[^a-záéíóúñü]/g, ''))
        .filter(word => word.length > 4 && !['para', 'como', 'desde', 'sobre', 'este', 'esta', 'con', 'del', 'que', 'los', 'las', 'por', 'una', 'un', 'el', 'la', 'se', 'es', 'en', 'y', 'o', 'a', 'de', 'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'mas', 'más', 'pero', 'ni', 'sin', 'al', 'lo', 'le', 'les', 'me', 'te', 'nos', 'os', 'si', 'no', 'para que', 'de la', 'en el', 'un de', 'y el', 'ticket', 'error', 'cliente', 'sistema', 'problema'].includes(word));
    const wordFrequencies = wordCloudData.reduce((acc, word) => { acc[word] = (acc[word] || 0) + 1; return acc; }, {});
    const topKeywords = Object.entries(wordFrequencies).sort(([, a], [, b]) => b - a).slice(0, 5).map(item => '<strong>' + item[0] + '</strong>');
    let narrative = `<h4>Análisis para: ${periodText}</h4>`;
    narrative += `<p>Durante este período, se gestionaron un total de <strong>${totalTickets} tickets</strong>. A continuación, un resumen de los hallazgos clave: </p> <br> <ul>`;
    narrative += `<li><strong>Rendimiento General</strong><br> Se alcanzó una tasa de resolución del <strong>${resolutionRate}%</strong>, con un tiempo promedio para resolver cada ticket de <strong>${avgResolution} horas</strong>.</li>`;
    if (topRequestTypes.length > 0) {
        const topType = topRequestTypes[0];
        const topTypePercentage = (topType[1] / totalTickets * 100).toFixed(0);
        narrative += `<li><strong>Categoría Principal</strong><br> La solicitud más frecuente fue "<strong>${topType[0]}</strong>", constituyendo aproximadamente el <strong>${topTypePercentage}%</strong> del total de incidentes.</li>`;
    }
    if (maxTicketsInPeak > 0) {
        narrative += `<li><strong>Pico de Actividad</strong><br> La mayor concentración de tickets se registró los días <strong>${peakDay}</strong>, específicamente en la franja horaria de las <strong>${peakHour}:00 hs</strong>.</li>`;
    }
    if (selectedMonths.length > 0) {
        let frtMetCount = 0, frtApplicableCount = 0, trtMetCount = 0, trtApplicableCount = 0;
        data.forEach(ticket => {
            const priority = (ticket.priority || '').toLowerCase();
            if (SLA_MATRIX[priority]) {
                if (ticket.firstResponseTime > 0) {
                    frtApplicableCount++;
                    if (ticket.firstResponseTime <= SLA_MATRIX[priority].timeToFirstResponse) frtMetCount++;
                }
                if (ticket.resolutionTime > 0) {
                    trtApplicableCount++;
                    if (ticket.resolutionTime <= SLA_MATRIX[priority].timeToResolution) trtMetCount++;
                }
            }
        });
        const frtComplianceRate = frtApplicableCount > 0 ? (frtMetCount / frtApplicableCount) * 100 : NaN;
        const trtComplianceRate = trtApplicableCount > 0 ? (trtMetCount / trtApplicableCount) * 100 : NaN;
        if (!isNaN(frtComplianceRate) && !isNaN(trtComplianceRate)) {
            const frtStatus = frtComplianceRate >= SLA_COMPLIANCE_THRESHOLD ? "Cumplido" : "Vencido";
            const trtStatus = trtComplianceRate >= SLA_COMPLIANCE_THRESHOLD ? "Cumplido" : "Vencido";
            let slaNarrative = `<li><strong>Acuerdos de Nivel de Servicio (SLAs):</strong> Durante este período, el cumplimiento para la `;
            slaNarrative += `<strong>Primera Respuesta</strong> alcanzó un <strong>${frtComplianceRate.toFixed(1)}%</strong> (resultado: <strong>${frtStatus}</strong>), `;
            slaNarrative += `mientras que para la <strong>Resolución</strong> final se logró un <strong>${trtComplianceRate.toFixed(1)}%</strong> (resultado: <strong>${trtStatus}</strong>).</li>`;
            narrative += slaNarrative;
        }
    }
    if (totalSentiment > 0) {
        let predominantSentiment = 'Neutral', maxCount = neutralSentiment;
        if (positiveSentiment > maxCount) { predominantSentiment = 'Positivo'; maxCount = positiveSentiment; }
        if (negativeSentiment > maxCount) { predominantSentiment = 'Negativo'; maxCount = negativeSentiment; }
        const percent = ((maxCount / totalSentiment) * 100).toFixed(0);
        narrative += `<li><strong>Análisis de Sentimiento(*)</strong><br> El análisis de las interacciones indica que el sentimiento predominante fue <strong>${predominantSentiment}</strong> (${percent}%).</li>`;
    }
    if (topKeywords.length > 0) {
        narrative += `<li><strong>Voz del Cliente</strong><br> Las palabras que más resonaron en los resúmenes de los tickets fueron: ${topKeywords.join(', ')}.</li>`;
    }
    narrative += '</ul><p class="mt-4 text-xs text-gray-500 italic"><strong>(*):</strong> El sentimiento se determina mediante un analisis de palabras utilizadas por el cliente en el campo "Resumen" de cada ticket.</p>';
    return narrative;
}

// --- PROCESAMIENTO Y RENDERIZADO DE GRÁFICOS ---

function processData(data) {
    if (data.length === 0) return {};
    // ... (El resto de la lógica de esta función se mantiene sin cambios, solo se asegura la indentación)
    const statusCounts = data.reduce((acc, curr) => { acc[curr.status] = (acc[curr.status] || 0) + 1; return acc; }, {});
    const priorityCounts = data.reduce((acc, curr) => { acc[curr.priority] = (acc[curr.priority] || 0) + 1; return acc; }, {});
    const clientCounts = data.reduce((acc, curr) => { acc[curr.client] = (acc[curr.client] || 0) + 1; return acc; }, {});
    const assigneeCounts = data.reduce((acc, curr) => { acc[curr.assignee] = (acc[curr.assignee] || 0) + 1; return acc; }, {});
    const requestTypeCounts = data.reduce((acc, curr) => { acc[curr.requestType] = (acc[curr.requestType] || 0) + 1; return acc; }, {});
    const diagnosisCounts = data.reduce((acc, curr) => { acc[curr.diagnosis] = (acc[curr.diagnosis] || 0) + 1; return acc; }, {});
    const problemTypeCounts = data.reduce((acc, curr) => { acc[curr.problemType] = (acc[curr.problemType] || 0) + 1; return acc; }, {});
    const sentimentCounts = data.reduce((acc, curr) => { acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1; return acc; }, {});
    const topClients = Object.entries(clientCounts).sort(([,a],[,b]) => b-a).slice(0, 10);
    const topAssignees = Object.entries(assigneeCounts).sort(([,a],[,b]) => b-a).slice(0, 10);
    const trendData = data.reduce((acc, curr) => {
        const date = curr.created.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    const sortedTrend = Object.entries(trendData).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
    const wordCloudData = data.map(d => d.summary.split(/\s+/)).flat()
        .map(word => word.toLowerCase().replace(/[^a-záéíóúñü]/g, ''))
        .filter(word => word.length > 3 && !['para', 'como', 'desde', 'sobre', 'este', 'esta', 'con', 'del', 'que', 'los', 'las', 'por', 'una', 'un', 'el', 'la', 'se', 'es', 'en', 'y', 'o', 'a', 'de', 'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'mas', 'más', 'pero', 'ni', 'sin', 'al', 'lo', 'le', 'les', 'me', 'te', 'nos', 'os', 'si', 'no', 'para que', 'de la', 'en el', 'un de', 'y el'].includes(word));
    const wordFrequencies = wordCloudData.reduce((acc, word) => { acc[word] = (acc[word] || 0) + 1; return acc; }, {});
    const heatmapData = {};
    DAY_NAMES.forEach(day => { heatmapData[day] = Array(24).fill(0); });
    data.forEach(d => {
        const dayIndex = d.created.getDay();
        const hour = d.created.getHours();
        heatmapData[DAY_NAMES[dayIndex]][hour]++;
    });
    const top10ClientNames = Object.entries(clientCounts).sort(([,a],[,b]) => b-a).slice(0, 10).map(item => item[0]);
    const allRequestTypesInDataset = Array.from(new Set(data.map(d => d.requestType))).sort();
    const nestedClientRequestData = {};
    top10ClientNames.forEach(client => {
        nestedClientRequestData[client] = {};
        const clientTickets = data.filter(ticket => ticket.client === client);
        clientTickets.forEach(ticket => {
            nestedClientRequestData[client][ticket.requestType] = (nestedClientRequestData[client][ticket.requestType] || 0) + 1;
        });
    });
    const clientRequestTypeFinalData = { clients: top10ClientNames, requestTypes: allRequestTypesInDataset, data: nestedClientRequestData };
    const monthlyComparisonData = {};
    const allReqTypesForMonthlyChart = new Set();
    data.forEach(d => {
        const monthKey = `${d.created.getFullYear()}-${d.created.getMonth()}`;
        if (!monthlyComparisonData[monthKey]) monthlyComparisonData[monthKey] = {};
        monthlyComparisonData[monthKey][d.requestType] = (monthlyComparisonData[monthKey][d.requestType] || 0) + 1;
        allReqTypesForMonthlyChart.add(d.requestType);
    });
    const sortedMonths = Object.keys(monthlyComparisonData).sort((a,b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return yearA - yearB || monthA - monthB;
    });
    const sortedReqTypes = Array.from(allReqTypesForMonthlyChart).sort();
    return {
        status: { labels: Object.keys(statusCounts), values: Object.values(statusCounts) },
        priority: { labels: Object.keys(priorityCounts), values: Object.values(priorityCounts) },
        topClients: { labels: topClients.map(item => item[0]), values: topClients.map(item => item[1]) },
        topAssignees: { labels: topAssignees.map(item => item[0]), values: topAssignees.map(item => item[1]) },
        requestType: { labels: Object.keys(requestTypeCounts), values: Object.values(requestTypeCounts) },
        diagnosis: { labels: Object.keys(diagnosisCounts), values: Object.values(diagnosisCounts) },
        problemType: { labels: Object.keys(problemTypeCounts), values: Object.values(problemTypeCounts) },
        sentiment: { labels: Object.keys(sentimentCounts), values: Object.values(sentimentCounts) },
        trend: { labels: sortedTrend.map(item => item[0]), values: sortedTrend.map(item => item[1]) },
        wordCloud: Object.entries(wordFrequencies).map(([text, weight]) => [text, weight * 5]),
        heatmap: heatmapData,
        clientRequestType: clientRequestTypeFinalData,
        monthlyComparison: { months: sortedMonths, requestTypes: sortedReqTypes, data: monthlyComparisonData }
    };
}

function renderKPIs(data) {
    const totalTickets = data.length;
    const resolvedTickets = data.filter(d => ['Closed', 'Resolved', 'Done', 'Cerrado', 'Resuelto'].includes(d.status)).length;
    const openTickets = data.filter(d => !['Closed', 'Resolved', 'Done', 'Cerrado', 'Resuelto', 'Canceled', 'Cancelled', 'Cancelado'].includes(d.status)).length;
    const validResolutionTimes = data.filter(d => d.resolutionTime > 0);
    const avgResolution = validResolutionTimes.length > 0 ? (validResolutionTimes.reduce((sum, d) => sum + d.resolutionTime, 0) / validResolutionTimes.length).toFixed(1) : '0.0';
    const validFirstResponseTimes = data.filter(d => d.firstResponseTime > 0);
    const avgFirstResponse = validFirstResponseTimes.length > 0 ? (validFirstResponseTimes.reduce((sum, d) => sum + d.firstResponseTime, 0) / validFirstResponseTimes.length).toFixed(1) : '0.0';
    const unassignedTickets = data.filter(d => !d.assignee || d.assignee.toLowerCase() === 'unassigned' || d.assignee.toLowerCase() === 'sin asignar').length;
    const uniqueDays = new Set(data.map(d => d.created.toISOString().split('T')[0]));
    const avgPerDay = uniqueDays.size > 0 ? (totalTickets / uniqueDays.size).toFixed(1) : '0.0';
    const uniqueMonths = new Set(data.map(d => `${d.created.getFullYear()}-${d.created.getMonth()}`));
    const avgPerMonth = uniqueMonths.size > 0 ? (totalTickets / uniqueMonths.size).toFixed(1) : '0.0';

    document.getElementById('kpi-total-tickets').textContent = totalTickets;
    document.getElementById('kpi-resolved-tickets').textContent = totalTickets > 0 ? `${((resolvedTickets / totalTickets) * 100).toFixed(0)}%` : '0%';
    document.getElementById('kpi-open-tickets').textContent = openTickets;
    document.getElementById('kpi-avg-resolution').textContent = `${avgResolution} hrs`;
    document.getElementById('kpi-avg-first-response').textContent = `${avgFirstResponse} hrs`;
    document.getElementById('kpi-unassigned-tickets').textContent = unassignedTickets;
    document.getElementById('kpi-avg-day').textContent = avgPerDay;
    document.getElementById('kpi-avg-month').textContent = avgPerMonth;
}

function renderSLAIndicators(data) {
    const frtSlaContainer = document.getElementById('kpi-sla-first-response-container');
    const trtSlaContainer = document.getElementById('kpi-sla-resolution-container');
    const frtCard = frtSlaContainer ? frtSlaContainer.closest('.kpi-card') : null;
    const trtCard = trtSlaContainer ? trtSlaContainer.closest('.kpi-card') : null;

    const updateSLAView = (container, card, complianceRate, type) => {
        if (!container || !card) return;
        let statusText, statusColor, complianceText, titleText;
        const typeText = type === 'frt' ? 'de Primera Respuesta' : 'de Resolución';
        if (isNaN(complianceRate)) {
            complianceText = '-';
            statusText = 'N/A';
            statusColor = 'text-gray-500';
            titleText = `No hay tickets con SLA ${typeText} aplicable en el período seleccionado.`;
        } else {
            const isSlaMet = complianceRate >= SLA_COMPLIANCE_THRESHOLD;
            complianceText = `${complianceRate.toFixed(1)}%`;
            statusText = isSlaMet ? 'Cumplido' : 'Vencido';
            statusColor = isSlaMet ? 'text-green-600' : 'text-red-600';
            titleText = `Cómo se calcula el SLA ${typeText}:\n\n1. Cumplimiento (%):\nEs el porcentaje de tickets atendidos/resueltos dentro del tiempo de su prioridad.\nFórmula: (Tickets Dentro de SLA / Tickets Totales con SLA) * 100.\n\n2. Estado (Cumplido/Vencido):\nSe considera 'Cumplido' si el Cumplimiento es >= ${SLA_COMPLIANCE_THRESHOLD}%.`;
        }
        container.innerHTML = `<p class="kpi-value ${statusColor}">${complianceText}</p><p class="text-sm font-bold ${statusColor}">${statusText}</p>`;
        card.title = titleText;
    };

    let frtMetCount = 0, frtApplicableCount = 0, trtMetCount = 0, trtApplicableCount = 0;
    data.forEach(ticket => {
        const priority = (ticket.priority || '').toLowerCase();
        if (SLA_MATRIX[priority]) {
            if (ticket.firstResponseTime > 0) {
                frtApplicableCount++;
                if (ticket.firstResponseTime <= SLA_MATRIX[priority].timeToFirstResponse) frtMetCount++;
            }
            if (ticket.resolutionTime > 0) {
                trtApplicableCount++;
                if (ticket.resolutionTime <= SLA_MATRIX[priority].timeToResolution) trtMetCount++;
            }
        }
    });

    const frtComplianceRate = frtApplicableCount > 0 ? (frtMetCount / frtApplicableCount) * 100 : NaN;
    const trtComplianceRate = trtApplicableCount > 0 ? (trtMetCount / trtApplicableCount) * 100 : NaN;

    updateSLAView(frtSlaContainer, frtCard, frtComplianceRate, 'frt');
    updateSLAView(trtSlaContainer, trtCard, trtComplianceRate, 'trt');
}

const createChart = (ctx, type, data, options) => {
    if (!ctx) {
        console.error(`El contexto para el gráfico es nulo. Verifique el ID: '${(options.canvasId || '[unknown]')}'`);
        return;
    }
    if (charts[ctx.id]) charts[ctx.id].destroy();
    charts[ctx.id] = new Chart(ctx, { type, data, options });
}

function renderCharts(data) {
    if (data.length === 0) {
        Object.values(charts).forEach(chart => { if (chart && typeof chart.destroy === 'function') chart.destroy(); });
        charts = {};
        ['statusChart', 'priorityChart', 'requestTypeChart', 'sentimentChart', 'clientTypeChart', 'monthlySlaChart', 'satisfactionChart'].forEach(id => document.getElementById(id).innerHTML = '');
        document.getElementById('heatmap-grid').innerHTML = '';
        document.getElementById('heatmap-day-labels').innerHTML = '';
        document.getElementById('word-cloud-container').innerHTML = '<p class="text-gray-500">No hay datos suficientes para generar la Nube de Palabras.</p>';
        return;
    }

    const chartData = processData(data);

    if (charts.statusChart) charts.statusChart.destroy();
    charts.statusChart = new ApexCharts(document.querySelector("#statusChart"), {
        series: [{ data: chartData.status.values, name: 'Tickets' }],
        chart: { type: 'bar', height: 320, toolbar: { show: false }, events: { dataPointSelection: (e, c, conf) => handleChartClick('statusChart', 'status', conf.w.globals.labels[conf.dataPointIndex]) } },
        plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '60%' } },
        dataLabels: { enabled: true, offsetX: -15, style: { colors: ['#fff'] }, formatter: (val) => val },
        xaxis: { categories: chartData.status.labels, labels: { style: { colors: FONT_COLOR } } },
        yaxis: { labels: { style: { colors: FONT_COLOR } } },
        colors: [PALETTE.indigo], grid: { borderColor: GRID_COLOR }, tooltip: { y: { formatter: (val) => val + ' tickets' } },
        fill: { type: "gradient", gradient: { shade: 'dark', type: "horizontal", shadeIntensity: 0.5, gradientToColors: [PALETTE.blue], inverseColors: true, opacityFrom: 1, opacityTo: 1, stops: [0, 100] } }
    });
    charts.statusChart.render();

    if (charts.priorityChart) charts.priorityChart.destroy();
    charts.priorityChart = new ApexCharts(document.querySelector("#priorityChart"), {
        series: chartData.priority.values, labels: chartData.priority.labels,
        chart: { type: 'donut', height: 320, events: { dataPointSelection: (e, c, conf) => handleChartClick('priorityChart', 'priority', conf.w.globals.labels[conf.dataPointIndex]) } },
        plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Total' } } } } },
        dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' },
        legend: { position: 'bottom', labels: { colors: FONT_COLOR } },
        colors: Object.values(PALETTE), fill: { colors: Object.values(PALETTE) },
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
        dropShadow: { enabled: true, top: 5, left: 2, blur: 4, color: '#000000', opacity: 0.2 }
    });
    charts.priorityChart.render();

    if (charts.requestTypeChart) charts.requestTypeChart.destroy();
    charts.requestTypeChart = new ApexCharts(document.querySelector("#requestTypeChart"), {
        series: [{ data: chartData.requestType.values, name: 'Tickets' }],
        chart: { type: 'bar', height: 320, toolbar: { show: false }, events: { dataPointSelection: (e, c, conf) => handleChartClick('requestTypeChart', 'requestType', conf.w.globals.labels[conf.dataPointIndex]) } },
        plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '50%' } },
        dataLabels: { enabled: false },
        xaxis: { categories: chartData.requestType.labels, labels: { rotate: -45, style: { colors: FONT_COLOR } } },
        yaxis: { labels: { style: { colors: FONT_COLOR } } },
        colors: [PALETTE.green], grid: { borderColor: GRID_COLOR }, tooltip: { y: { formatter: (val) => val + ' tickets' } }
    });
    charts.requestTypeChart.render();

    if (charts.sentimentChart) charts.sentimentChart.destroy();
    const sentimentColors = chartData.sentiment.labels.map(label => (label === 'Positivo') ? PALETTE.green : (label === 'Negativo') ? PALETTE.red : PALETTE.slate);
    charts.sentimentChart = new ApexCharts(document.querySelector("#sentimentChart"), {
        series: chartData.sentiment.values, labels: chartData.sentiment.labels, colors: sentimentColors,
        chart: { type: 'pie', height: 320, events: { dataPointSelection: (e, c, conf) => handleChartClick('sentimentChart', 'sentiment', conf.w.globals.labels[conf.dataPointIndex]) } },
        legend: { position: 'bottom', labels: { colors: FONT_COLOR } },
        dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' },
        dropShadow: { enabled: true, top: 5, left: 2, blur: 4, color: '#000000', opacity: 0.3 }
    });
    charts.sentimentChart.render();

    const donutChartOptions = {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
            legend: { display: false },
            datalabels: {
                display: true, color: 'white', font: { weight: 'bold' },
                formatter: (value, ctx) => {
                    const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    return sum > 0 ? `${(value * 100 / sum).toFixed(1)}%` : '0%';
                },
            },
            centerText: { display: true }
        }
    };
    createChart(document.getElementById('diagnosisChart'), 'doughnut', {
        labels: chartData.diagnosis.labels,
        datasets: [{ data: chartData.diagnosis.values, backgroundColor: Object.values(PALETTE).reverse() }]
    }, { ...donutChartOptions, canvasId: 'diagnosisChart', onClick: (e, el) => el.length > 0 && handleChartClick('diagnosisChart', 'diagnosis', charts.diagnosisChart.data.labels[el[0].index]) });

    createChart(document.getElementById('problemTypeChart'), 'doughnut', {
        labels: chartData.problemType.labels,
        datasets: [{ data: chartData.problemType.values, backgroundColor: Object.values(PALETTE) }]
    }, { ...donutChartOptions, canvasId: 'problemTypeChart', onClick: (e, el) => el.length > 0 && handleChartClick('problemTypeChart', 'problemType', charts.problemTypeChart.data.labels[el[0].index]) });

    createChart(document.getElementById('topClientsChart'), 'bar', {
        labels: chartData.topClients.labels,
        datasets: [{ label: 'Tickets', data: chartData.topClients.values, backgroundColor: PALETTE.blue }]
    }, { canvasId: 'topClientsChart', responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end' } }, onClick: (e, el) => el.length > 0 && handleChartClick('topClientsChart', 'client', charts.topClientsChart.data.labels[el[0].index]) });

    createChart(document.getElementById('assigneeChart'), 'bar', {
        labels: chartData.topAssignees.labels,
        datasets: [{ label: 'Tickets', data: chartData.topAssignees.values, backgroundColor: PALETTE.sky }]
    }, { canvasId: 'assigneeChart', responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end' } }, onClick: (e, el) => el.length > 0 && handleChartClick('assigneeChart', 'assignee', charts.assigneeChart.data.labels[el[0].index]) });

    createChart(document.getElementById('trendChart'), 'line', {
        labels: chartData.trend.labels,
        datasets: [{ label: 'Tickets Creados', data: chartData.trend.values, borderColor: PALETTE.red, backgroundColor: 'rgba(234, 88, 12, 0.3)', fill: 'origin', tension: 0.3, borderWidth: 2 }]
    }, {
        canvasId: 'trendChart', responsive: true, maintainAspectRatio: false,
        scales: { x: { type: 'time', time: { unit: 'day' } } },
        plugins: { legend: { display: false }, datalabels: { display: true, align: 'top', anchor: 'end', offset: 8, backgroundColor: 'rgba(220, 38, 38, 0.75)', borderRadius: 4, color: 'white', font: { weight: 'bold' }, formatter: (v, ctx) => ctx.dataset.data.length > 30 ? '' : v } },
        onClick: (e, el) => { if (el.length > 0) handleChartClick('trendChart', 'dateSpecific', charts.trendChart.data.labels[el[0].index]) }
    });

    renderHeatmap(chartData.heatmap);
    renderClientRequestTypeChart(chartData.clientRequestType);
    renderMonthlyComparisonChart(chartData.monthlyComparison);
    renderMonthlySlaChart(data);
    renderClientTypeChart(data);
    renderSatisfactionChart(data);
    renderTopSlowTicketsChart(data);

    const wcContainer = document.getElementById('word-cloud-container');
    wcContainer.innerHTML = '';
    if (chartData.wordCloud && chartData.wordCloud.length > 0) {
        WordCloud(wcContainer, { list: chartData.wordCloud, gridSize: 10, weightFactor: 2, shrinkToFit: true, minSize: 10, color: () => PALETTE[Object.keys(PALETTE)[Math.floor(Math.random() * Object.keys(PALETTE).length)]], fontFamily: 'Inter', rotateRatio: 0.5, ellipticity: 1 });
    } else {
        wcContainer.innerHTML = '<p class="text-gray-500">No hay datos para esta Nube de Palabras.</p>';
    }
}

// ... (El resto de funciones de renderizado como renderHeatmap, renderClientRequestTypeChart, etc. se mantienen igual pero se benefician de la indentación consistente)
// A continuación se incluyen las funciones restantes con la indentación corregida.

function renderHeatmap(heatmapData) {
    const heatmapGrid = document.getElementById('heatmap-grid');
    const dayLabelsContainer = document.getElementById('heatmap-day-labels');
    heatmapGrid.innerHTML = '';
    dayLabelsContainer.innerHTML = '';
    let maxCount = 0;
    Object.values(heatmapData).forEach(h => h.forEach(c => { if (c > maxCount) maxCount = c; }));
    heatmapGrid.style.gridTemplateRows = `repeat(${DAY_NAMES.length}, 1fr)`;
    dayLabelsContainer.style.gridTemplateRows = `repeat(${DAY_NAMES.length}, 1fr)`;
    const getColorForValue = (v, max) => v === 0 ? '#F8FAFC' : `hsl(220, 80%, ${90 - (v / max) * 60}%)`;
    DAY_NAMES.forEach((day, dayIndex) => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'heatmap-day-label';
        dayLabel.textContent = day;
        dayLabelsContainer.appendChild(dayLabel);
        const hoursData = heatmapData[day] || Array(24).fill(0);
        for (let hour = 0; hour < 24; hour++) {
            const count = hoursData[hour];
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.style.backgroundColor = getColorForValue(count, maxCount);
            cell.textContent = count > 0 ? count : '';
            cell.title = `${day}, ${hour}:00 - ${hour + 1}:00: ${count} tickets`;
            cell.dataset.dayIndex = dayIndex;
            cell.dataset.hour = hour;
            cell.addEventListener('click', handleHeatmapClick);
            heatmapGrid.appendChild(cell);
        }
    });
}

function handleHeatmapClick(event) {
    const { dayIndex, hour } = event.currentTarget.dataset;
    const dayName = DAY_NAMES[parseInt(dayIndex)];
    const drilldownData = getFilteredData().filter(d => d.created.getDay() === parseInt(dayIndex) && d.created.getHours() === parseInt(hour));
    if (drilldownData.length === 0) return alert(`No hay tickets para el ${dayName} a las ${hour}:00.`);
    showModalWithData(`Tickets del ${dayName} entre ${hour}:00 y ${parseInt(hour)+1}:00`, drilldownData, COMMON_TABLE_HEADERS);
}

function renderClientRequestTypeChart(chartData) {
    const ctx = document.getElementById('clientRequestTypeChart');
    if (!ctx) return;
    const { clients, requestTypes, data: nestedData } = chartData;
    if (!clients || clients.length === 0) {
        if (charts[ctx.id]) charts[ctx.id].destroy();
        return;
    }
    const datasets = requestTypes.map((type, index) => {
        const colorKeys = Object.keys(PALETTE);
        const color = PALETTE[colorKeys[index % colorKeys.length]] || PALETTE.gray;
        const seriesData = clients.map(client => (nestedData[client] && nestedData[client][type]) || 0);
        return { label: type, data: seriesData, backgroundColor: color, stack: 'clientStack' };
    });
    createChart(ctx, 'bar', { labels: clients, datasets: datasets }, {
        canvasId: 'clientRequestTypeChart', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'right', labels: { color: FONT_COLOR } }, datalabels: { display: false } },
        scales: { x: { stacked: true, ticks: { color: FONT_COLOR, autoSkip: false, maxRotation: 45, minRotation: 45 }, grid: { display: false } }, y: { stacked: true, ticks: { color: FONT_COLOR }, grid: { color: GRID_COLOR } } },
        onClick: (e, el, chart) => { if (el.length > 0) { handleChartClick('clientRequestTypeChart', 'clientAndRequestType', { client: chart.data.labels[el[0].index], requestType: chart.data.datasets[el[0].datasetIndex].label }); } }
    });
}

function renderMonthlyComparisonChart(monthlyData) {
    const ctx = document.getElementById('monthlyComparisonChart');
    if (!ctx) return;
    const { months, requestTypes, data } = monthlyData;
    const labels = months.map(monthKey => { const [year, monthIndex] = monthKey.split('-').map(Number); return `${MONTH_NAMES[monthIndex]} ${year}`; });
    const datasets = requestTypes.map((type, index) => {
        const colorKeys = Object.keys(PALETTE);
        return { label: type, data: months.map(monthKey => data[monthKey][type] || 0), backgroundColor: PALETTE[colorKeys[index % colorKeys.length]] || PALETTE.gray, };
    });
    createChart(ctx, 'bar', { labels: labels, datasets: datasets }, {
        canvasId: 'monthlyComparisonChart', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'right', labels: { color: FONT_COLOR } }, datalabels: { display: false } },
        scales: { x: { stacked: true, ticks: { color: FONT_COLOR }, grid: { display: false } }, y: { stacked: true, ticks: { color: FONT_COLOR }, grid: { color: GRID_COLOR } } },
        onClick: (e, el, chart) => { if (el.length > 0) { handleChartClick('monthlyComparisonChart', 'monthAndRequestType', { month: chart.data.labels[el[0].index], requestType: chart.data.datasets[el[0].datasetIndex].label }); } }
    });
}

function renderMonthlySlaChart(data) {
    if (charts.monthlySlaChart) charts.monthlySlaChart.destroy();
    const monthlySlaData = data.reduce((acc, ticket) => {
        const monthKey = `${ticket.created.getFullYear()}-${ticket.created.getMonth()}`;
        if (!acc[monthKey]) acc[monthKey] = { frtMet: 0, frtApplicable: 0, trtMet: 0, trtApplicable: 0 };
        const priority = (ticket.priority || '').toLowerCase();
        if (SLA_MATRIX[priority]) {
            if (ticket.firstResponseTime > 0) { acc[monthKey].frtApplicable++; if (ticket.firstResponseTime <= SLA_MATRIX[priority].timeToFirstResponse) acc[monthKey].frtMet++; }
            if (ticket.resolutionTime > 0) { acc[monthKey].trtApplicable++; if (ticket.resolutionTime <= SLA_MATRIX[priority].timeToResolution) acc[monthKey].trtMet++; }
        }
        return acc;
    }, {});
    const sortedMonths = Object.keys(monthlySlaData).sort((a, b) => { const [yA, mA] = a.split('-').map(Number); const [yB, mB] = b.split('-').map(Number); return yA - yB || mA - mB; });
    const categories = sortedMonths.map(monthKey => { const [year, monthIndex] = monthKey.split('-').map(Number); return `${MONTH_NAMES[monthIndex]} ${year}`; });
    const frtSeries = sortedMonths.map(month => parseFloat((monthlySlaData[month].frtApplicable > 0 ? (monthlySlaData[month].frtMet / monthlySlaData[month].frtApplicable) * 100 : 0).toFixed(1)));
    const trtSeries = sortedMonths.map(month => parseFloat((monthlySlaData[month].trtApplicable > 0 ? (monthlySlaData[month].trtMet / monthlySlaData[month].trtApplicable) * 100 : 0).toFixed(1)));
    const options = {
        series: [{ name: 'SLA 1ra Respuesta (%)', type: 'column', data: frtSeries }, { name: 'SLA Resolución (%)', type: 'line', data: trtSeries }],
        chart: { height: 350, type: 'line', }, stroke: { width: [0, 4] },
        dataLabels: { enabled: true, enabledOnSeries: [0], formatter: (val) => val + "%" }, labels: categories,
        xaxis: { type: 'category', labels: { style: { colors: FONT_COLOR } } },
        yaxis: [{ title: { text: 'Cumplimiento (%)', style: { color: FONT_COLOR } }, min: 0, max: 100, labels: { style: { colors: FONT_COLOR } } }],
        colors: [PALETTE.blue, PALETTE.green], tooltip: { y: { formatter: (val) => val + '%' } }, grid: { borderColor: GRID_COLOR }, legend: { labels: { colors: FONT_COLOR } }
    };
    charts.monthlySlaChart = new ApexCharts(document.querySelector("#monthlySlaChart"), options);
    charts.monthlySlaChart.render();
}

function renderClientTypeChart(data) {
    if (charts.clientTypeChart) charts.clientTypeChart.destroy();
    const preferencialValue = CLIENT_TYPE_CONFIG.preferencial.toLowerCase();
    const normalValue = CLIENT_TYPE_CONFIG.normal.toLowerCase();
    let preferencialCount = 0, normalCount = 0;
    data.forEach(d => {
        const type = (d[CLIENT_TYPE_FIELD] || '').toLowerCase();
        if (type === preferencialValue) preferencialCount++;
        else if (type === normalValue) normalCount++;
    });
    const unassignedCount = data.length - preferencialCount - normalCount;
    const options = {
        series: [preferencialCount, normalCount, unassignedCount], labels: [CLIENT_TYPE_CONFIG.preferencial, CLIENT_TYPE_CONFIG.normal, CLIENT_TYPE_CONFIG.unassigned],
        colors: [PALETTE.purple, PALETTE.slate, PALETTE.gray],
        chart: { type: 'donut', height: 320, events: { dataPointSelection: (e, c, conf) => handleChartClick('clientTypeChart', 'clientType', conf.w.globals.labels[conf.dataPointIndex]) } },
        plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Total Tickets' } } } } },
        dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' },
        legend: { position: 'bottom', labels: { colors: FONT_COLOR } },
        dropShadow: { enabled: true, top: 5, left: 2, blur: 4, color: '#000000', opacity: 0.2 }
    };
    charts.clientTypeChart = new ApexCharts(document.querySelector("#clientTypeChart"), options);
    charts.clientTypeChart.render();
}

function renderSatisfactionChart(data) {
    if (charts.satisfactionChart) charts.satisfactionChart.destroy();
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatedTickets = 0, sumOfRatings = 0;
    data.forEach(ticket => {
        const rating = ticket.satisfaction;
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
            totalRatedTickets++;
            sumOfRatings += rating;
        }
    });
    const averageRating = totalRatedTickets > 0 ? (sumOfRatings / totalRatedTickets) : 0;
    const options = {
        series: [{ name: 'Nº de Tickets', data: Object.values(ratingCounts) }],
        chart: { type: 'bar', height: 350, toolbar: { show: false }, events: { dataPointSelection: (e, c, conf) => handleChartClick('satisfactionChart', 'satisfaction', parseInt(conf.w.globals.labels[conf.dataPointIndex])) } },
        plotOptions: { bar: { distributed: true, borderRadius: 4, horizontal: false, } },
        colors: [PALETTE.red, PALETTE.orange, PALETTE.yellow, PALETTE.lime, PALETTE.green],
        dataLabels: { enabled: true }, legend: { show: false },
        title: { text: 'Distribución de Calificaciones', align: 'center', },
        subtitle: { text: 'Promedio: ' + averageRating.toFixed(2) + ' Estrellas', align: 'center', style: { fontSize: '16px', color: FONT_COLOR } },
        xaxis: { categories: ['1 Estrella', '2 Estrellas', '3 Estrellas', '4 Estrellas', '5 Estrellas'], labels: { style: { colors: FONT_COLOR, } } },
        yaxis: { title: { text: 'Cantidad de Votos' } }
    };
    charts.satisfactionChart = new ApexCharts(document.querySelector("#satisfactionChart"), options);
    charts.satisfactionChart.render();
}

function renderTopSlowTicketsChart(data) {
    const chartContainerId = 'topSlowTicketsChart';
    const chartContainer = document.getElementById(chartContainerId);
    if (!chartContainer) return;

    if (charts[chartContainerId]) {
        charts[chartContainerId].destroy();
    }
    chartContainer.innerHTML = '';

    const closedTickets = data.filter(t =>
        t.resolutionTime > 0 && ['Closed', 'Resolved', 'Done', 'Cerrado', 'Resuelto'].includes(t.status)
    );
    const sorted = closedTickets.sort((a, b) => b.resolutionTime - a.resolutionTime).slice(0, 10);

    if (sorted.length === 0) {
        chartContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">No hay tickets cerrados para mostrar.</p>';
        return;
    }

    const labels = sorted.map(t => t.issue);
    const totalTimeData = sorted.map(t => parseFloat(t.resolutionTime.toFixed(1)));
    const slaLimitData = sorted.map(t => (SLA_MATRIX[t.priority.toLowerCase()] || { timeToResolution: 0 }).timeToResolution);
    const exceededTimeData = sorted.map((t, index) => {
        const exceeded = t.resolutionTime - slaLimitData[index];
        return parseFloat(exceeded > 0 ? exceeded.toFixed(1) : 0);
    });

    const options = {
        series: [{ name: 'Tiempo Total (Hrs)', data: totalTimeData }, { name: 'Límite SLA (Hrs)', data: slaLimitData }, { name: 'Tiempo Excedido (Hrs)', data: exceededTimeData }],
        chart: {
            type: 'bar', height: 350, toolbar: { show: false },
            events: {
                dataPointSelection: (event, chartContext, config) => {
                    const ticket = sorted[config.dataPointIndex];
                    if (ticket) openModalWithTicket(ticket);
                },
                xAxisLabelClick: (event, chartContext, config) => {
                    const ticketKey = config.xaxis.categories[config.labelIndex];
                    if (ticketKey) window.open(`https://cardinalecm.atlassian.net/browse/${ticketKey}`, '_blank');
                }
            }
        },
        plotOptions: { bar: { horizontal: false, columnWidth: '60%', dataLabels: { position: 'top' } } },
        dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '10px', colors: ["#304758"] }, formatter: (val) => val > 0 ? val + "h" : "" },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: { categories: labels, title: { text: 'Tickets' } },
        yaxis: { title: { text: 'Horas' } },
        fill: { opacity: 1 },
        tooltip: { y: { formatter: (val) => val + " hrs" } },
        colors: [PALETTE.blue, PALETTE.green, PALETTE.orange]
    };

    charts[chartContainerId] = new ApexCharts(chartContainer, options);
    charts[chartContainerId].render();
    updateAllChartsTheme();
}

// --- LÓGICA DEL MODAL Y DRILLDOWN ---

const modal = document.getElementById('data-modal');
const closeModalBtn = document.getElementById('close-modal-button');

function handleSortClick(event) {
    const header = event.target.closest('.sortable-header');
    if (!header) return;

    const table = header.closest('table');
    const tbody = table.querySelector('tbody');
    const columnType = header.dataset.columnType;
    const currentSortDir = header.dataset.sortDir;
    const newSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';

    table.querySelectorAll('.sortable-header').forEach(th => th.removeAttribute('data-sort-dir'));
    header.dataset.sortDir = newSortDir;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnIndex = Array.from(header.parentNode.children).indexOf(header);

    rows.sort((rowA, rowB) => {
        const cellA = rowA.querySelectorAll('td')[columnIndex].innerText.toLowerCase();
        const cellB = rowB.querySelectorAll('td')[columnIndex].innerText.toLowerCase();
        let valA, valB;

        if (columnType === 'number') {
            valA = parseFloat(cellA) || 0;
            valB = parseFloat(cellB) || 0;
        } else if (columnType === 'date') {
            valA = new Date(cellA).getTime() || 0;
            valB = new Date(cellB).getTime() || 0;
        } else {
            valA = cellA;
            valB = cellB;
        }

        if (valA < valB) return newSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return newSortDir === 'asc' ? 1 : -1;
        return 0;
    });

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

function showModalWithData(title, content, headers) {
    document.getElementById('modal-title').innerText = title;
    const modalBody = document.getElementById('modal-body-container');

    if (typeof content === 'string') {
        modalBody.innerHTML = content;
    } else {
        const data = content;
        let tableHTML = '<div class="overflow-x-auto"><table id="modal-table" class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50" id="modal-table-head"><tr>';
        headers.forEach(h => {
            let dataType = 'string';
            if (h.key.toLowerCase().includes('time') || h.key.toLowerCase().includes('limit')) dataType = 'number';
            else if (h.key.toLowerCase().includes('date') || h.key.toLowerCase().includes('created')) dataType = 'date';

            tableHTML += `
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sortable-header" data-column-key="${h.key}" data-column-type="${dataType}">
                    <div class="flex items-center">
                        <span>${h.displayName}</span>
                        <span class="sort-icons ml-2"><span class="sort-asc">▲</span><span class="sort-desc">▼</span></span>
                    </div>
                </th>`;
        });
        tableHTML += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';
        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${headers.length}" class="px-6 py-4 text-center text-gray-500">No hay datos.</td></tr>`;
        } else {
            data.forEach(rowObject => {
                tableHTML += '<tr>';
                headers.forEach(header => {
                    let cellValue = rowObject[header.key] || '';
                    if (header.key === 'issue' && cellValue !== 'N/A') {
                        cellValue = `<a href="https://cardinalecm.atlassian.net/browse/${cellValue}" target="_blank" class="text-indigo-600 hover:text-indigo-800 hover:underline">${cellValue}</a>`;
                    } else {
                        if (header.key.toLowerCase().includes('time') && typeof cellValue === 'number') cellValue = cellValue.toFixed(2);
                        else if (cellValue instanceof Date) cellValue = cellValue.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
                    }
                    tableHTML += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${cellValue}</td>`;
                });
                tableHTML += '</tr>';
            });
        }
        tableHTML += '</tbody></table></div>';
        modalBody.innerHTML = tableHTML;
        document.getElementById('modal-table-head').addEventListener('click', handleSortClick);
    }
    modal.style.display = 'block';
}

closeModalBtn.onclick = () => {
    modal.style.display = "none";
};

function makeModalDraggable() {
    const modalContent = document.querySelector('.modal-content');
    const modalHeader = document.getElementById('modal-header');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragMouseDown = (e) => {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    };
    const elementDrag = (e) => {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        modalContent.style.top = `${modalContent.offsetTop - pos2}px`;
        modalContent.style.left = `${modalContent.offsetLeft - pos1}px`;
    };
    const closeDragElement = () => {
        document.onmouseup = null;
        document.onmousemove = null;
    };
    if (modalHeader) modalHeader.onmousedown = dragMouseDown;
}

function setupKpiCardClickHandlers() {
    const kpiGrid = document.getElementById('kpi-grid');
    if (!kpiGrid) return;

    const kpiHandlers = {
        'total-tickets': (data) => ({ title: 'Detalle: Tickets Totales', data }),
        'resolved-tickets': (data) => ({ title: 'Detalle: Tickets Resueltos', data: data.filter(d => ['Closed', 'Resolved', 'Done', 'Cerrado', 'Resuelto'].includes(d.status)) }),
        'open-tickets': (data) => ({ title: 'Detalle: Tickets Abiertos', data: data.filter(d => !['Closed', 'Resolved', 'Done', 'Cerrado', 'Resuelto', 'Canceled', 'Cancelled', 'Cancelado'].includes(d.status)) }),
        'unassigned-tickets': (data) => ({ title: 'Detalle: Tickets sin Asignar', data: data.filter(d => !d.assignee || d.assignee.toLowerCase() === 'unassigned' || d.assignee.toLowerCase() === 'sin asignar') }),
        'sla-first-response': (data) => {
            const modalData = data.filter(d => SLA_MATRIX[d.priority.toLowerCase()] && d.firstResponseTime > 0)
                .map(d => ({
                    issue: d.issue, summary: d.summary, priority: d.priority,
                    actualTime: d.firstResponseTime,
                    slaLimit: SLA_MATRIX[d.priority.toLowerCase()].timeToFirstResponse,
                    slaStatus: d.firstResponseTime <= SLA_MATRIX[d.priority.toLowerCase()].timeToFirstResponse ? 'Cumplido' : 'Vencido'
                })).sort((a, b) => b.actualTime - a.actualTime);
            return { title: 'Detalle de Tickets: SLA de Primera Respuesta', data: modalData, headers: SLA_TABLE_HEADERS };
        },
        'sla-resolution': (data) => {
            const modalData = data.filter(d => SLA_MATRIX[d.priority.toLowerCase()] && d.resolutionTime > 0)
                .map(d => ({
                    issue: d.issue, summary: d.summary, priority: d.priority,
                    actualTime: d.resolutionTime,
                    slaLimit: SLA_MATRIX[d.priority.toLowerCase()].timeToResolution,
                    slaStatus: d.resolutionTime <= SLA_MATRIX[d.priority.toLowerCase()].timeToResolution ? 'Cumplido' : 'Vencido'
                })).sort((a, b) => b.actualTime - a.actualTime);
            return { title: 'Detalle de Tickets: SLA de Resolución', data: modalData, headers: SLA_TABLE_HEADERS };
        },
    };

    kpiGrid.addEventListener('click', (event) => {
        const kpiCard = event.target.closest('.kpi-card');
        const kpiId = kpiCard?.dataset.kpi;
        if (kpiId && kpiHandlers[kpiId]) {
            const result = kpiHandlers[kpiId](getFilteredData());
            showModalWithData(result.title, result.data.slice(0, 500), result.headers || COMMON_TABLE_HEADERS);
        }
    });
}

function handleChartClick(chartId, filterType, filterValue) {
    const handlers = {
        status: (val, data) => ({ title: `Tickets con Estado: "${val}"`, data: data.filter(d => d.status === val) }),
        priority: (val, data) => ({ title: `Tickets con Prioridad: "${val}"`, data: data.filter(d => d.priority === val) }),
        requestType: (val, data) => ({ title: `Tickets con Tipo de Solicitud: "${val}"`, data: data.filter(d => d.requestType === val) }),
        sentiment: (val, data) => ({ title: `Tickets con Sentimiento: "${val}"`, data: data.filter(d => d.sentiment === val) }),
        diagnosis: (val, data) => ({ title: `Tickets con Diagnóstico: "${val}"`, data: data.filter(d => d.diagnosis === val) }),
        problemType: (val, data) => ({ title: `Tickets con Tipo de Problema: "${val}"`, data: data.filter(d => d.problemType === val) }),
        client: (val, data) => ({ title: `Tickets del Cliente: "${val}"`, data: data.filter(d => d.client === val) }),
        assignee: (val, data) => ({ title: `Tickets Asignados a: "${val}"`, data: data.filter(d => d.assignee === val) }),
        dateSpecific: (val, data) => {
            const d = new Date(val);
            return {
                title: `Tickets Creados el ${d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
                data: data.filter(t => t.created.toISOString().startsWith(d.toISOString().substring(0, 10)))
            };
        },
        clientAndRequestType: (val, data) => ({ title: `Tickets de "${val.client}" con Tipo: "${val.requestType}"`, data: data.filter(d => d.client === val.client && d.requestType === val.requestType) }),
        monthAndRequestType: (val, data) => {
            const [m, y] = val.month.split(' ');
            const i = MONTH_NAMES.indexOf(m);
            return { title: `Tickets de ${val.month} con Tipo: "${val.requestType}"`, data: data.filter(d => d.created.getFullYear() == y && d.created.getMonth() == i && d.requestType === val.requestType) };
        },
        clientType: (val, data) => {
            const p = CLIENT_TYPE_CONFIG.preferencial.toLowerCase(), n = CLIENT_TYPE_CONFIG.normal.toLowerCase();
            let d;
            if (val === CLIENT_TYPE_CONFIG.preferencial) d = data.filter(t => (t[CLIENT_TYPE_FIELD] || '').toLowerCase() === p);
            else if (val === CLIENT_TYPE_CONFIG.normal) d = data.filter(t => (t[CLIENT_TYPE_FIELD] || '').toLowerCase() === n);
            else d = data.filter(t => ![p, n].includes((t[CLIENT_TYPE_FIELD] || '').toLowerCase()));
            return { title: `Detalle: Tickets para ${val}`, data: d };
        },
        satisfaction: (val, data) => ({ title: `Detalle: Tickets con ${val} Estrella(s)`, data: data.filter(d => d.satisfaction === val) })
    };
    if (handlers[filterType]) {
        const { title, data } = handlers[filterType](filterValue, getFilteredData());
        showModalWithData(title, data.slice(0, 500), COMMON_TABLE_HEADERS);
    }
}

function openModalWithTicket(ticket) {
    const modal = document.getElementById('data-modal');
    const modalTitleEl = document.getElementById('modal-title');
    const body = document.querySelector('.modal-body-container');

    const slaLimit = (SLA_MATRIX[ticket.priority.toLowerCase()] || { timeToResolution: 0 }).timeToResolution;
    const timeExceeded = ticket.resolutionTime - slaLimit > 0 ? (ticket.resolutionTime - slaLimit).toFixed(1) : '0';

    modalTitleEl.innerHTML = `Detalle del Ticket: <a href="https://cardinalecm.atlassian.net/browse/${ticket.issue}" target="_blank" class="text-indigo-600 hover:text-indigo-800 underline">${ticket.issue}</a>`;
    body.innerHTML = `
        <div class="space-y-4">
            <div>
                <h3 class="text-lg font-bold text-gray-800">Resumen</h3>
                <p class="text-md text-gray-600">${ticket.summary}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm p-4 border rounded-lg bg-gray-50">
                <p><strong>Cliente:</strong> ${ticket.client}</p>
                <p><strong>Asignado:</strong> ${ticket.assignee}</p>
                <p><strong>Prioridad:</strong> <span class="font-bold">${ticket.priority}</span></p>
                <p><strong>Límite SLA:</strong> ${slaLimit} hrs</p>
                <p><strong>Tiempo Total Resolución:</strong> ${ticket.resolutionTime.toFixed(1)} hrs</p>
                <p><strong>Tiempo Excedido:</strong> <span class="font-bold text-orange-600">${timeExceeded} hrs</span></p>
                <p><strong>Estado:</strong> ${ticket.status}</p>
                <p><strong>Creado:</strong> ${ticket.created.toLocaleString('es-AR')}</p>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

// --- FUNCIONES DE INTERACTIVIDAD ADICIONALES ---

new Sortable(document.getElementById('dashboard-grid'), {
    animation: 150,
    ghostClass: 'sortable-ghost'
});

function setupChartZoom() {
    const grid = document.getElementById('dashboard-grid');
    const overlay = document.getElementById('zoom-overlay');
    if (!grid || !overlay) return;

    const closeZoom = () => {
        const zoomedCard = document.querySelector('.chart-card.is-zoomed');
        if (zoomedCard) {
            zoomedCard.classList.remove('is-zoomed');
        }
        overlay.classList.add('hidden');
    };

    grid.addEventListener('click', function(e) {
        const zoomIcon = e.target.closest('.zoom-icon-container');
        if (!zoomIcon) return;

        const card = zoomIcon.closest('.chart-card');
        if (card && !card.classList.contains('sortable-ghost')) {
            card.classList.add('is-zoomed');
            overlay.classList.remove('hidden');

            const chartId = card.dataset.chart;
            const chartInstance = charts[chartId];

            if (chartInstance) {
                setTimeout(() => {
                    if (typeof chartInstance.updateOptions === 'function') { // ApexChart
                        chartInstance.updateOptions({ chart: { width: '100%', height: '100%' } });
                    } else if (typeof chartInstance.resize === 'function') { // Chart.js
                        chartInstance.resize();
                    }
                }, 450);
            }
        }
    });

    overlay.addEventListener('click', closeZoom);
}