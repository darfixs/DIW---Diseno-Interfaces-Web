/* Darfix Phantomsy Station - main.js
   - Sin async/await
   - LocalStorage como "panel personal"
*/

(function () {
    'use strict';

    var LS_KEY = 'dps_beats_v1';

    var grid = document.getElementById('gridBeats');
    var filtroEstilo = document.getElementById('filtroEstilo');
    var filtroBpmMin = document.getElementById('filtroBpmMin');
    var filtroBpmMax = document.getElementById('filtroBpmMax');
    var btnAplicar = document.getElementById('btnAplicarFiltros');
    var btnLimpiar = document.getElementById('btnLimpiarFiltros');
    var buscador = document.getElementById('buscador');
    var btnReset = document.getElementById('btnReset');

    var contadorBeats = document.getElementById('contadorBeats');
    var contadorEstilos = document.getElementById('contadorEstilos');
    var resultadoInfo = document.getElementById('resultadoInfo');

    // Offcanvas (móvil)
    var mFiltroEstilo = document.getElementById('mFiltroEstilo');
    var mBpmMin = document.getElementById('mBpmMin');
    var mBpmMax = document.getElementById('mBpmMax');
    var mAplicar = document.getElementById('mAplicar');
    var mLimpiar = document.getElementById('mLimpiar');

    // Studio Mode
    var btnStudioScroll = document.getElementById('btnStudioScroll');
    var form = document.getElementById('formBeat');
    var btnDemo = document.getElementById('btnDemo');
    var btnBorrarTodo = document.getElementById('btnBorrarTodo');
    var btnExportar = document.getElementById('btnExportar');

    // Toast
    var toastEl = document.getElementById('toastOk');
    var toastMsg = document.getElementById('toastMsg');
    var toast;

    // Estado
    var beats = [];
    var lastPlayingAudio = null;

    function showToast(message) {
        if (!toastEl) return;
        toastMsg.textContent = message;
        if (!toast) toast = new bootstrap.Toast(toastEl, { delay: 2200 });
        toast.show();
    }

    function safeParse(jsonText) {
        try {
            return JSON.parse(jsonText);
        } catch (e) {
            return null;
        }
    }

    function loadBeats() {
        var raw = localStorage.getItem(LS_KEY);
        var data = raw ? safeParse(raw) : null;

        if (Array.isArray(data) && data.length > 0) {
            beats = data;
            return;
        }

        // Seed inicial (sin audio real, queda listo para que subas)
        beats = [
            {
                id: genId(),
                titulo: 'Phantom Glow (2013)',
                estilo: 'Futuristic Glo',
                bpm: 140,
                key: 'F minor',
                enlace: '',
                portada_data: placeholderCover('Phantom Glow'),
                audio_data: '',
            },
            {
                id: genId(),
                titulo: 'Velvet Chaos (2015)',
                estilo: 'Chaos Beat',
                bpm: 156,
                key: 'C# minor',
                enlace: '',
                portada_data: placeholderCover('Velvet Chaos'),
                audio_data: '',
            },
            {
                id: genId(),
                titulo: 'Glory Ways (2012)',
                estilo: 'Glory Ways',
                bpm: 132,
                key: 'A minor',
                enlace: '',
                portada_data: placeholderCover('Glory Ways'),
                audio_data: '',
            }
        ];

        saveBeats();
    }

    function saveBeats() {
        localStorage.setItem(LS_KEY, JSON.stringify(beats));
    }

    function genId() {
        return 'b_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    }

    function placeholderCover(text) {
        // SVG data URL (portada rápida, mística)
        var svg =
            "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'>" +
            "<defs>" +
            "<radialGradient id='g1' cx='20%' cy='20%' r='75%'>" +
            "<stop offset='0%' stop-color='#b67cff' stop-opacity='0.55'/>" +
            "<stop offset='55%' stop-color='#0b0a16' stop-opacity='1'/>" +
            "</radialGradient>" +
            "<radialGradient id='g2' cx='80%' cy='30%' r='70%'>" +
            "<stop offset='0%' stop-color='#6cf3ff' stop-opacity='0.20'/>" +
            "<stop offset='60%' stop-color='#07070b' stop-opacity='1'/>" +
            "</radialGradient>" +
            "</defs>" +
            "<rect width='100%' height='100%' fill='url(#g1)'/>" +
            "<rect width='100%' height='100%' fill='url(#g2)' opacity='0.95'/>" +
            "<text x='60' y='110' fill='rgba(255,255,255,0.88)' font-family='Arial' font-size='44' font-weight='700'>Darfix Phantomsy Station</text>" +
            "<text x='60' y='190' fill='rgba(255,255,255,0.72)' font-family='Arial' font-size='32'>✦ " + escapeXml(text) + " ✦</text>" +
            "<text x='60' y='650' fill='rgba(255,255,255,0.55)' font-family='Arial' font-size='22'>nostalgia · ambient · glo</text>" +
            "</svg>";

        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function escapeXml(str) {
        return String(str).replace(/[<>&'"]/g, function (c) {
            return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c];
        });
    }

    function uniqueStyles(list) {
        var map = {};
        list.forEach(function (b) { map[b.estilo] = true; });
        return Object.keys(map).sort();
    }

    function fillStyleSelect(selectEl, styles) {
        if (!selectEl) return;
        // Limpia dejando el primer option si es "Todos"
        var keepFirst = selectEl.options.length > 0 && selectEl.options[0].value === 'all';
        selectEl.innerHTML = '';
        if (keepFirst) {
            var optAll = document.createElement('option');
            optAll.value = 'all';
            optAll.textContent = 'Todos';
            selectEl.appendChild(optAll);
        } else {
            var opt = document.createElement('option');
            opt.value = 'all';
            opt.textContent = 'Todos';
            selectEl.appendChild(opt);
        }

        styles.forEach(function (s) {
            var option = document.createElement('option');
            option.value = s;
            option.textContent = s;
            selectEl.appendChild(option);
        });
    }

    function normalizeText(s) {
        return String(s).toLowerCase().trim();
    }

    function currentFilters() {
        var estilo = filtroEstilo ? filtroEstilo.value : 'all';
        var bpmMin = filtroBpmMin && filtroBpmMin.value ? parseInt(filtroBpmMin.value, 10) : null;
        var bpmMax = filtroBpmMax && filtroBpmMax.value ? parseInt(filtroBpmMax.value, 10) : null;
        var q = buscador ? normalizeText(buscador.value) : '';
        return { estilo: estilo, bpmMin: bpmMin, bpmMax: bpmMax, q: q };
    }

    function applyFilters(list, filters) {
        return list.filter(function (b) {
            if (filters.estilo !== 'all' && b.estilo !== filters.estilo) return false;

            if (filters.bpmMin !== null && b.bpm < filters.bpmMin) return false;
            if (filters.bpmMax !== null && b.bpm > filters.bpmMax) return false;

            if (filters.q) {
                var hay = normalizeText(b.titulo + ' ' + b.estilo + ' ' + b.bpm + ' ' + b.key);
                if (hay.indexOf(filters.q) === -1) return false;
            }
            return true;
        });
    }

    function stopOtherAudios(current) {
        var audios = document.querySelectorAll('audio[data-dps-audio="1"]');
        audios.forEach(function (a) {
            if (a !== current) {
                a.pause();
                a.currentTime = 0;
            }
        });
    }

    function cardTemplate(beat) {
        var enlaceHtml = '';
        if (beat.enlace) {
            enlaceHtml =
                '<a class="btn btn-sm dps-btn-outline" href="' + beat.enlace + '" target="_blank" rel="noopener">' +
                'Abrir enlace</a>';
        }

        var audioHtml = '';
        if (beat.audio_data) {
            audioHtml =
                '<audio class="dps-audio" controls preload="none" data-dps-audio="1" aria-label="Preview del beat ' + escapeHtml(beat.titulo) + '">' +
                '<source src="' + beat.audio_data + '" type="audio/mpeg">' +
                'Tu navegador no soporta audio.' +
                '</audio>';
        } else {
            audioHtml =
                '<div class="small dps-muted mt-2">' +
                'Sin preview aún. Sube un MP3 en Studio Mode para escucharlo aquí.' +
                '</div>';
        }

        return (
            '<div class="col-12 col-md-6 col-xl-4">' +
            '<article class="dps-card" data-id="' + beat.id + '">' +
            '<img class="dps-cover" src="' + beat.portada_data + '" alt="Portada del beat ' + escapeHtml(beat.titulo) + '">' +
            '<div class="dps-card-body">' +
            '<h3 class="h6 dps-card-title">' + escapeHtml(beat.titulo) + '</h3>' +
            '<div class="dps-meta mb-2">' + escapeHtml(beat.estilo) + '</div>' +
            '<div class="d-flex flex-wrap gap-2 mb-2">' +
            '<span class="badge rounded-pill text-bg-dark dps-badge" title="BPM">BPM: ' + beat.bpm + '</span>' +
            '<span class="badge rounded-pill text-bg-dark dps-badge" title="Tonalidad">Key: ' + escapeHtml(beat.key) + '</span>' +
            '</div>' +
            audioHtml +
            '<div class="d-flex flex-wrap gap-2 mt-3">' +
            '<a class="btn btn-sm dps-btn" href="beat.html">Ver beat</a>' +
            enlaceHtml +
            '<button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" aria-label="Eliminar beat ' + escapeHtml(beat.titulo) + '">' +
            'Eliminar' +
            '</button>' +
            '</div>' +
            '</div>' +
            '</article>' +
            '</div>'
        );
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c];
        });
    }

    function render() {
        if (!grid) return;

        var filters = currentFilters();
        var filtered = applyFilters(beats, filters);

        var styles = uniqueStyles(beats);
        fillStyleSelect(filtroEstilo, styles);
        fillStyleSelect(mFiltroEstilo, styles);

        contadorBeats.textContent = beats.length + ' beats';
        contadorEstilos.textContent = styles.length + ' estilos';
        resultadoInfo.textContent = 'Mostrando ' + filtered.length + ' resultados';

        grid.innerHTML = filtered.map(cardTemplate).join('');

        // Eventos audio: solo uno sonando
        var audios = document.querySelectorAll('audio[data-dps-audio="1"]');
        audios.forEach(function (a) {
            a.addEventListener('play', function () {
                stopOtherAudios(a);
                lastPlayingAudio = a;
            });
        });

        // Botones eliminar
        grid.querySelectorAll('button[data-action="delete"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var card = btn.closest('[data-id]');
                if (!card) return;
                var id = card.getAttribute('data-id');
                deleteBeat(id);
            });
        });
    }

    function deleteBeat(id) {
        beats = beats.filter(function (b) { return b.id !== id; });
        saveBeats();
        render();
        showToast('Beat eliminado del catálogo local.');
    }

    function scrollToStudio() {
        var studio = document.getElementById('studioMode');
        if (!studio) return;
        studio.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function readFileAsDataURL(file, cb) {
        var reader = new FileReader();
        reader.onload = function () { cb(reader.result); };
        reader.onerror = function () { cb(null); };
        reader.readAsDataURL(file);
    }

    function validateForm() {
        if (!form) return false;
        if (form.checkValidity()) {
            form.classList.remove('was-validated');
            return true;
        }
        form.classList.add('was-validated');
        return false;
    }

    function addBeatFromForm() {
        var titulo = document.getElementById('titulo').value.trim();
        var estilo = document.getElementById('estilo').value;
        var bpm = parseInt(document.getElementById('bpm').value, 10);
        var key = document.getElementById('key').value.trim();
        var enlace = document.getElementById('enlace').value.trim();
        var portadaFile = document.getElementById('portada').files[0];
        var audioFile = document.getElementById('audio').files[0];

        // leer portada + audio (2 lecturas encadenadas sin async/await)
        readFileAsDataURL(portadaFile, function (imgData) {
            if (!imgData) {
                showToast('No se pudo leer la portada.');
                return;
            }
            readFileAsDataURL(audioFile, function (audioData) {
                if (!audioData) {
                    showToast('No se pudo leer el audio.');
                    return;
                }

                var newBeat = {
                    id: genId(),
                    titulo: titulo,
                    estilo: estilo,
                    bpm: bpm,
                    key: key,
                    enlace: enlace,
                    portada_data: imgData,
                    audio_data: audioData
                };

                beats.unshift(newBeat);
                saveBeats();
                render();
                form.reset();
                showToast('Beat guardado. Glory ways ✦');
            });
        });
    }

    function addDemoBeat() {
        var demo = {
            id: genId(),
            titulo: 'Nostalgic Orbit (2016)',
            estilo: 'PluggnB',
            bpm: 148,
            key: 'E minor',
            enlace: '',
            portada_data: placeholderCover('Nostalgic Orbit'),
            audio_data: '' // sin audio demo
        };
        beats.unshift(demo);
        saveBeats();
        render();
        showToast('Demo añadida.');
    }

    function resetUI() {
        if (buscador) buscador.value = '';
        if (filtroBpmMin) filtroBpmMin.value = '';
        if (filtroBpmMax) filtroBpmMax.value = '';
        if (filtroEstilo) filtroEstilo.value = 'all';

        if (mBpmMin) mBpmMin.value = '';
        if (mBpmMax) mBpmMax.value = '';
        if (mFiltroEstilo) mFiltroEstilo.value = 'all';

        render();
        showToast('Filtros reiniciados.');
    }

    function exportJSON() {
        var data = JSON.stringify(beats, null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = url;
        a.download = 'darfix_phantomsy_beats.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        showToast('Exportado JSON.');
    }

    function bindEvents() {
        if (btnStudioScroll) btnStudioScroll.addEventListener('click', scrollToStudio);

        if (btnAplicar) btnAplicar.addEventListener('click', function () { render(); });
        if (btnLimpiar) btnLimpiar.addEventListener('click', resetUI);

        if (mAplicar) mAplicar.addEventListener('click', function () {
            // Copia filtros móvil a desktop
            if (mFiltroEstilo && filtroEstilo) filtroEstilo.value = mFiltroEstilo.value;
            if (mBpmMin && filtroBpmMin) filtroBpmMin.value = mBpmMin.value;
            if (mBpmMax && filtroBpmMax) filtroBpmMax.value = mBpmMax.value;
            render();
            showToast('Filtros aplicados.');
        });

        if (mLimpiar) mLimpiar.addEventListener('click', resetUI);

        if (buscador) buscador.addEventListener('input', function () { render(); });
        if (btnReset) btnReset.addEventListener('click', resetUI);

        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!validateForm()) return;
                addBeatFromForm();
            });
        }

        if (btnDemo) btnDemo.addEventListener('click', addDemoBeat);

        if (btnBorrarTodo) {
            btnBorrarTodo.addEventListener('click', function () {
                localStorage.removeItem(LS_KEY);
                loadBeats();
                render();
                showToast('Catálogo local reiniciado.');
            });
        }

        if (btnExportar) btnExportar.addEventListener('click', exportJSON);
    }

    // INIT
    loadBeats();
    bindEvents();
    render();
})();
