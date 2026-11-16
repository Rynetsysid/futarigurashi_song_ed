/**
 * ==============================================================================
 * STREAM MUSIK RYNET - LOGIKA PLAYER (player.js)
 * Fitur:
 * 1. Card Kontrol Terpisah di Desktop & Portrait HP
 * 2. Floating HUD Mengambang di Landscape / Layar Penuh HP (Tanpa Card View)
 * 3. Video CG 100% Utuh Asli (object-fit: contain, No Crop)
 * 4. Logika Sentuhan: Ketuk 1x (Tampil/Sembunyi), Ketuk 2x Kanan (+5s), Ketuk 2x Kiri (-5s)
 * 5. Auto-Hide 5 Detik saat Layar Didiamkan
 * 6. Tombol Replay Otomatis Saat Video Tamat
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

    // 4. Referensi Elemen DOM
    const playerTheater = document.getElementById('playerTheater');
    const playerWrapper = document.getElementById('playerWrapper');
    const controlCard = document.getElementById('controlCard');

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

    const rippleLeft = document.getElementById('rippleLeft');
    const rippleRight = document.getElementById('rippleRight');

    const infoAccordion = document.getElementById('infoAccordion');
    const toggleStateText = document.getElementById('toggleStateText');

    let currentCg = -1; // -1: Layar Hitam
    let isSequenceRunning = false;
    let sequenceTimers = [];
    let isSeeking = false;
    let isEnded = false;

    // Timer Auto-Hide 5 Detik di Landscape
    let hudTimer = null;

    function isLandscapeMode() {
        const isFS = !!document.fullscreenElement || !!document.webkitFullscreenElement;
        const isLandscape = window.matchMedia("(orientation: landscape)").matches && window.innerHeight <= 600;
        return isFS || isLandscape;
    }

    function resetHudTimer() {
        if (hudTimer) {
            clearTimeout(hudTimer);
            hudTimer = null;
        }

        if (playerTheater) {
            playerTheater.classList.remove('hud-hidden');
        }

        // Hanya aktifkan timer 5 detik jika dalam mode landscape/fullscreen
        if (isLandscapeMode() && !audio.paused && !isEnded) {
            hudTimer = setTimeout(() => {
                if (isLandscapeMode() && !isSeeking && !audio.paused && !isEnded) {
                    playerTheater.classList.add('hud-hidden');
                }
            }, 5000);
        }
    }

    function toggleHudVisibility() {
        if (!playerTheater) return;
        const isHidden = playerTheater.classList.contains('hud-hidden');
        if (isHidden) {
            resetHudTimer();
        } else {
            if (isLandscapeMode()) {
                playerTheater.classList.add('hud-hidden');
                if (hudTimer) clearTimeout(hudTimer);
            }
        }
    }

    // ==========================================================================
    // LOGIKA SENTUHAN & GESTUR HP (KETUK 1X & KETUK 2X)
    // ==========================================================================
    let lastTapTime = 0;
    let singleTapTimeout = null;

    function triggerRipple(isRight) {
        const target = isRight ? rippleRight : rippleLeft;
        if (!target) return;
        target.classList.remove('active');
        void target.offsetWidth; // Force reflow
        target.classList.add('active');
        setTimeout(() => {
            target.classList.remove('active');
        }, 650);
    }

    if (playerWrapper) {
        playerWrapper.addEventListener('click', (e) => {
            // Abaikan jika klik terjadi di dalam elemen tombol kontrol langsung
            if (e.target.closest('.control-card')) return;

            const now = Date.now();
            const timeDiff = now - lastTapTime;
            const rect = playerWrapper.getBoundingClientRect();
            const tapX = e.clientX - rect.left;
            const widthRatio = tapX / rect.width;

            if (timeDiff < 320 && timeDiff > 0) {
                // DETEKSI KETUK 2X (DOUBLE TAP)
                if (singleTapTimeout) {
                    clearTimeout(singleTapTimeout);
                    singleTapTimeout = null;
                }

                if (widthRatio > 0.6) {
                    // Ketuk 2x Sisi Kanan: Maju 5s
                    window.skipAudio(5);
                    triggerRipple(true);
                } else if (widthRatio < 0.4) {
                    // Ketuk 2x Sisi Kiri: Mundur 5s
                    window.skipAudio(-5);
                    triggerRipple(false);
                } else {
                    // Ketuk 2x Sisi Tengah: Play / Pause
                    window.toggleAudio();
                }
                resetHudTimer();
            } else {
                // DETEKSI KETUK 1X (SINGLE TAP)
                singleTapTimeout = setTimeout(() => {
                    toggleHudVisibility();
                }, 280);
            }

            lastTapTime = now;
        });
    }

    // Reset timer 5 detik setiap kali ada sentuhan/interaksi pada kontrol
    if (controlCard) {
        ['pointerdown', 'touchstart', 'input', 'click'].forEach(evt => {
            controlCard.addEventListener(evt, () => {
                resetHudTimer();
            }, { passive: true });
        });
    }

    window.addEventListener('resize', resetHudTimer);
    window.addEventListener('orientationchange', resetHudTimer);
    document.addEventListener('fullscreenchange', resetHudTimer);
    document.addEventListener('webkitfullscreenchange', resetHudTimer);

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
            // Pastikan kontrol muncul saat tamat agar tombol replay terlihat
            if (playerTheater) playerTheater.classList.remove('hud-hidden');
            if (hudTimer) clearTimeout(hudTimer);
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
        const activeCg = cgTimeline.slice().reverse().find(cg => cur >= cg.start);
        if (activeCg && currentCg !== activeCg.index) {
            switchCg(activeCg.index);
        }

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
    // FUNGSI KONTROL INTERAKSI PUBLIK
    // ==========================================================================

    // 1. Play / Pause
    window.toggleAudio = function() {
        resetHudTimer();
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
            // Saat pause di landscape, biarkan HUD tetap tampil
            if (hudTimer) clearTimeout(hudTimer);
            if (playerTheater) playerTheater.classList.remove('hud-hidden');
        }
    };

    // 2. Skip Mundur / Maju 5 Detik
    window.skipAudio = function(sec) {
        if (!audio.duration) return;
        voiceLogoAudio.pause();
        voiceLogoAudio.currentTime = 0;

        let target = audio.currentTime + sec;
        if (target < 0) target = 0;
        if (target > audio.duration) target = audio.duration;

        audio.currentTime = target;
        updateLyricsAndCg(target);

        const pct = (target / audio.duration) * 100;
        if (seekerSlider) seekerSlider.value = pct;
        if (seekerFill) seekerFill.style.width = pct + '%';
        if (currentTimeLabel) currentTimeLabel.textContent = formatTime(target);

        resetHudTimer();

        if (isEnded) {
            setEndedMode(false);
            audio.play();
            setPlayIcon(true);
        }
    };

    // 3. Putar Ulang (Replay)
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

        resetHudTimer();
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

    // 5. Layar Penuh (Landscape Mode)
    window.toggleFullscreenLandscape = async function() {
        const theater = document.getElementById('playerTheater');
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
        resetHudTimer();
    };

    window.toggleFullscreen = window.toggleFullscreenLandscape;

    // ==========================================================================
    // INTERAKSI SLIDER SEEKER (TARIK / GESER DENGAN MOUSE & JARI)
    // ==========================================================================
    if (seekerSlider) {
        seekerSlider.addEventListener('input', (e) => {
            isSeeking = true;
            resetHudTimer();
            const val = parseFloat(e.target.value);
            if (seekerFill) seekerFill.style.width = val + '%';
            if (audio.duration) {
                const targetTime = (val / 100) * audio.duration;
                if (currentTimeLabel) currentTimeLabel.textContent = formatTime(targetTime);
            }
        });

        seekerSlider.addEventListener('change', (e) => {
            isSeeking = false;
            resetHudTimer();
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
                        resetHudTimer();
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
            setEndedMode(true);
        }, 4500);
    });
});
