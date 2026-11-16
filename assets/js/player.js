/**
 * ==============================================================================
 * STREAM MUSIK RYNET - LOGIKA PLAYER (player.js)
 * Versi Update: Card Kontrol Terpisah, Seeker Range Interaktif, Replay Otomatis,
 * Accordion Info & Proteksi Mode Desktop Android
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mengambil Database Metadata & Timeline Lirik dari music_core.js
    const meta = MUSIC_CORE.metadata;
    const timeline = MUSIC_CORE.lyrics;
    const cgTimeline = MUSIC_CORE.cgTimeline;

    // 2. Inisialisasi Elemen Audio
    const audio = document.getElementById('audioElement');
    const voiceLogoAudio = document.getElementById('voiceLogoAudio');
    audio.src = meta.audioFile;
    voiceLogoAudio.src = meta.voiceIntroFile;

    // 3. Render Metadata Otomatis ke Komponen Info
    const infoTitle = document.getElementById('infoTitle');
    if (infoTitle) {
        infoTitle.textContent = `🌸 「${meta.titleJp}」 (${meta.titleRomaji})`;
    }

    const infoRole = document.getElementById('infoRole');
    if (infoRole) {
        infoRole.textContent = meta.role;
    }

    const infoGrid = document.getElementById('infoGrid');
    if (infoGrid) {
        infoGrid.innerHTML = `
            <div class="info-item">
                <span class="info-label">Penyanyi / Vokal</span>
                <span class="info-value highlight">${meta.vocal}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Penulis Lirik</span>
                <span class="info-value">${meta.lyricsBy}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Komposer / Aransemen</span>
                <span class="info-value">${meta.musicBy}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Pengembang Game</span>
                <span class="info-value highlight">${meta.developer}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Penerjemah Bahasa Indonesia</span>
                <span class="info-value highlight">${meta.translator}</span>
            </div>
        `;
    }

    // 4. Referensi Elemen DOM Kontrol
    const btnPlay = document.getElementById('btnPlay');
    const playIcon = document.getElementById('playIcon');
    const btnReplay = document.getElementById('btnReplay');
    const btnSkipBack = document.getElementById('btnSkipBack');
    const btnSkipFwd = document.getElementById('btnSkipFwd');
    
    const currentTimeLabel = document.getElementById('currentTime');
    const durationTimeLabel = document.getElementById('durationTime');
    const seekerSlider = document.getElementById('seekerSlider');
    const seekerFill = document.getElementById('seekerFill');
    
    const lyricsBox = document.getElementById('lyricsBox');
    const textJp = document.getElementById('textJp');
    const textRomaji = document.getElementById('textRomaji');
    const textId = document.getElementById('textId');
    
    const cgs = document.querySelectorAll('.cg-image');
    const cgIntro = document.getElementById('cg-intro');
    const cgOutro = document.getElementById('cg-outro');

    // Accordion Info
    const infoAccordion = document.getElementById('infoAccordion');
    const toggleStateText = document.getElementById('toggleStateText');

    let currentCg = -1; // -1: Layar Hitam
    let isSequenceRunning = false;
    let sequenceTimers = [];
    let isSeeking = false;
    let isEnded = false;

    // ==========================================================================
    // SISTEM PENDETEKSI PERANGKAT (DESKTOP / ANDROID / ANDROID DESKTOP MODE)
    // ==========================================================================
    function checkDeviceOrientation() {
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isPortrait = window.innerHeight > window.innerWidth;
        const isNarrow = window.innerWidth <= 768;

        if (isTouch) {
            document.body.classList.add('is-touch-device');
        }

        // Jika HP (baik terdeteksi via Touch/UA) dalam posisi tegak (portrait),
        // paksa tata letak mobile 2-baris meskipun fitur "Situs Desktop" di Chrome Android aktif
        if ((isMobileUA || isTouch) && isPortrait) {
            document.body.classList.add('force-mobile-layout');
        } else if (isNarrow) {
            document.body.classList.add('force-mobile-layout');
        } else {
            document.body.classList.remove('force-mobile-layout');
        }
    }

    checkDeviceOrientation();
    window.addEventListener('resize', checkDeviceOrientation);
    window.addEventListener('orientationchange', checkDeviceOrientation);

    // ==========================================================================
    // TIMER & ANIMASI CG
    // ==========================================================================
    function clearTimers() {
        sequenceTimers.forEach(t => clearTimeout(t));
        sequenceTimers = [];
    }

    function addTimer(fn, delay) {
        const t = setTimeout(fn, delay);
        sequenceTimers.push(t);
        return t;
    }

    function setPlayIcon(isPlaying) {
        if (isPlaying) {
            btnPlay.classList.add('playing');
            playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        } else {
            btnPlay.classList.remove('playing');
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        }
    }

    function setEndedMode(ended) {
        isEnded = ended;
        if (ended) {
            if (btnPlay) btnPlay.classList.add('hidden');
            if (btnSkipBack) btnSkipBack.classList.add('hidden');
            if (btnSkipFwd) btnSkipFwd.classList.add('hidden');
            if (btnReplay) btnReplay.classList.remove('hidden');
        } else {
            if (btnReplay) btnReplay.classList.add('hidden');
            if (btnPlay) btnPlay.classList.remove('hidden');
            if (btnSkipBack) btnSkipBack.classList.remove('hidden');
            if (btnSkipFwd) btnSkipFwd.classList.remove('hidden');
        }
    }

    function clearAllCg() {
        cgs.forEach(img => img.classList.remove('active'));
        currentCg = -1;
    }

    function showCgElement(el) {
        cgs.forEach(img => {
            if (img === el) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });
    }

    function switchCg(index) {
        const musicCg = document.getElementById('cg-' + index);
        if (musicCg) {
            showCgElement(musicCg);
            currentCg = index;
        }
    }

    function formatTime(sec) {
        if (isNaN(sec) || sec < 0) return "00:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }

    function updateLyricsAndCg(cur) {
        // Update CG Berdasarkan Timestamp Musik
        const activeCg = cgTimeline.slice().reverse().find(cg => cur >= cg.start);
        if (activeCg && currentCg !== activeCg.index) {
            switchCg(activeCg.index);
        }

        // Update Lirik Mengambang
        const activeLine = timeline.find(item => cur >= item.start && cur < item.end);
        if (activeLine) {
            if (textJp.textContent !== activeLine.jp) {
                textJp.textContent = activeLine.jp;
                textRomaji.textContent = activeLine.romaji;
                textId.textContent = activeLine.id;
            }
            lyricsBox.classList.add('visible');
        } else {
            lyricsBox.classList.remove('visible');
        }
    }

    // ==========================================================================
    // FUNGSI PUBLIK WINDOW (KONTROL INTERAKSI)
    // ==========================================================================

    // 1. Play / Pause
    window.toggleAudio = function() {
        if (isEnded) {
            window.restartVideo();
            return;
        }

        if (audio.paused) {
            if (audio.currentTime === 0 || !isSequenceRunning) {
                playFullSequence();
            } else {
                audio.play();
                setPlayIcon(true);
            }
        } else {
            audio.pause();
            setPlayIcon(false);
        }
    };

    // 2. Skip Mundur / Maju (Default 5 Detik)
    window.skipAudio = function(sec) {
        if (!audio.duration) return;
        voiceLogoAudio.pause();
        voiceLogoAudio.currentTime = 0;

        let target = audio.currentTime + sec;
        if (target < 0) target = 0;
        if (target > audio.duration) target = audio.duration;

        audio.currentTime = target;
        updateLyricsAndCg(target);

        // Update Slider Seeker
        const pct = (target / audio.duration) * 100;
        if (seekerSlider) seekerSlider.value = pct;
        if (seekerFill) seekerFill.style.width = pct + '%';
        if (currentTimeLabel) currentTimeLabel.textContent = formatTime(target);

        // Jika dalam mode ended/replay, hidupkan kembali pemutar
        if (isEnded) {
            setEndedMode(false);
            audio.play();
            setPlayIcon(true);
        }
    };

    // 3. Putar Ulang (Restart / Replay)
    window.restartVideo = function() {
        clearTimers();
        audio.pause();
        audio.currentTime = 0;
        voiceLogoAudio.pause();
        voiceLogoAudio.currentTime = 0;
        lyricsBox.classList.remove('visible');
        clearAllCg();
        isSequenceRunning = false;
        setEndedMode(false);

        if (currentTimeLabel) currentTimeLabel.textContent = "00:00";
        if (seekerSlider) seekerSlider.value = 0;
        if (seekerFill) seekerFill.style.width = '0%';

        playFullSequence();
    };

    // 4. Accordion Toggle Informasi Lagu
    window.toggleInfoPanel = function() {
        if (!infoAccordion) return;
        const isOpen = infoAccordion.classList.toggle('open');
        const infoToggle = document.getElementById('infoToggle');
        if (infoToggle) {
            infoToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
        if (toggleStateText) {
            toggleStateText.textContent = isOpen ? 'Tutup Rincian' : 'Rincian Informasi';
        }
    };

    // 5. Layar Penuh + Mode Landscape
    window.toggleFullscreenLandscape = async function() {
        const theater = document.getElementById('playerTheater') || document.getElementById('playerWrapper');
        try {
            if (!document.fullscreenElement) {
                if (theater.requestFullscreen) {
                    await theater.requestFullscreen();
                } else if (theater.webkitRequestFullscreen) {
                    await theater.webkitRequestFullscreen();
                }

                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {});
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                }
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
            }
        } catch (err) {
            console.log("Fullscreen Error:", err);
        }
    };

    window.toggleFullscreen = window.toggleFullscreenLandscape;

    // ==========================================================================
    // INTERAKSI SLIDER SEEKER (TARIK / GESER DENGAN MOUSE & JARI)
    // ==========================================================================
    if (seekerSlider) {
        // Saat ditarik (real-time preview)
        seekerSlider.addEventListener('input', (e) => {
            isSeeking = true;
            const val = parseFloat(e.target.value);
            if (seekerFill) seekerFill.style.width = val + '%';
            if (audio.duration) {
                const targetTime = (val / 100) * audio.duration;
                if (currentTimeLabel) currentTimeLabel.textContent = formatTime(targetTime);
            }
        });

        // Saat dilepas (jump to time)
        seekerSlider.addEventListener('change', (e) => {
            isSeeking = false;
            const val = parseFloat(e.target.value);
            if (audio.duration) {
                const targetTime = (val / 100) * audio.duration;
                voiceLogoAudio.pause();
                voiceLogoAudio.currentTime = 0;
                audio.currentTime = targetTime;
                updateLyricsAndCg(targetTime);

                if (isEnded) {
                    setEndedMode(false);
                }

                if (audio.paused) {
                    audio.play();
                    setPlayIcon(true);
                }
            }
        });
    }

    // ==========================================================================
    // PINTASAN KEYBOARD (DESKTOP)
    // ==========================================================================
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        const key = e.key.toLowerCase();

        if (key === 'f') {
            e.preventDefault();
            window.toggleFullscreen();
        } else if (e.code === 'Space') {
            e.preventDefault();
            window.toggleAudio();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            window.skipAudio(-5);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            window.skipAudio(5);
        } else if (key === 'r') {
            e.preventDefault();
            window.restartVideo();
        }
    });

    // ==========================================================================
    // ALUR SEKUENS PENUH (LOGO DEV -> SUARA -> REDUP -> CG 1 & MUSIK)
    // ==========================================================================
    function playFullSequence() {
        clearTimers();
        isSequenceRunning = true;
        setEndedMode(false);
        audio.pause();
        audio.currentTime = 0;
        lyricsBox.classList.remove('visible');
        setPlayIcon(true);

        clearAllCg();

        addTimer(() => {
            showCgElement(cgIntro);
            voiceLogoAudio.currentTime = 0;
            voiceLogoAudio.play().catch(e => console.log(e));

            voiceLogoAudio.onended = () => {
                addTimer(() => {
                    clearAllCg();
                    addTimer(() => {
                        switchCg(0);
                        audio.currentTime = 0;
                        audio.play();
                        setPlayIcon(true);
                    }, 1200);
                }, 500);
            };
        }, 100);
    }

    // ==========================================================================
    // EVENT LISTENER AUDIO
    // ==========================================================================
    audio.addEventListener('loadedmetadata', () => {
        if (durationTimeLabel) {
            durationTimeLabel.textContent = formatTime(audio.duration);
        }
    });

    audio.addEventListener('timeupdate', () => {
        const cur = audio.currentTime;
        
        // Update Waktu & Slider hanya saat tidak sedang ditarik user
        if (!isSeeking) {
            if (currentTimeLabel) currentTimeLabel.textContent = formatTime(cur);
            if (audio.duration) {
                const pct = (cur / audio.duration) * 100;
                if (seekerSlider) seekerSlider.value = pct;
                if (seekerFill) seekerFill.style.width = pct + '%';
            }
        }

        updateLyricsAndCg(cur);
    });

    // KETIKA LAGU TAMAT / BLANK SELESAI
    audio.addEventListener('ended', () => {
        setPlayIcon(false);
        lyricsBox.classList.remove('visible');
        showCgElement(cgOutro);

        addTimer(() => {
            clearAllCg();
            isSequenceRunning = false;
            // Aktifkan mode Replay otomatis
            setEndedMode(true);
        }, 4500);
    });
});
