// Inisialisasi Elemen Player & Logika Video
document.addEventListener("DOMContentLoaded", () => {
    // 1. Mengambil Data dari music_core.js
    const meta = MUSIC_CORE.metadata;
    const timeline = MUSIC_CORE.lyrics;
    const cgTimeline = MUSIC_CORE.cgTimeline;

    // 2. Inisialisasi Sumber Audio
    const audio = document.getElementById('audioElement');
    const voiceLogoAudio = document.getElementById('voiceLogoAudio');
    audio.src = meta.audioFile;
    voiceLogoAudio.src = meta.voiceIntroFile;

    // 3. Render Metadata Otomatis ke Info Panel
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

    // 4. Elemen Kontrol DOM
    const btnPlay = document.getElementById('btnPlay');
    const playIcon = document.getElementById('playIcon');
    const currentTimeLabel = document.getElementById('currentTime');
    const durationTimeLabel = document.getElementById('durationTime');
    const progressBar = document.getElementById('progressBar');
    const lyricsBox = document.getElementById('lyricsBox');
    const textJp = document.getElementById('textJp');
    const textRomaji = document.getElementById('textRomaji');
    const textId = document.getElementById('textId');
    const cgs = document.querySelectorAll('.cg-image');
    const cgIntro = document.getElementById('cg-intro');
    const cgOutro = document.getElementById('cg-outro');

    let currentCg = -1; // -1: Layar Hitam
    let isSequenceRunning = false;
    let sequenceTimers = [];

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

    // Window-exposed functions untuk tombol HTML
    window.restartVideo = function() {
        clearTimers();
        audio.pause();
        audio.currentTime = 0;
        voiceLogoAudio.pause();
        voiceLogoAudio.currentTime = 0;
        lyricsBox.classList.remove('visible');
        clearAllCg();
        isSequenceRunning = false;
        currentTimeLabel.textContent = "00:00";
        progressBar.style.width = '0%';

        playFullSequence();
    };

    window.toggleAudio = function() {
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

    window.seekAudio = function(e) {
        voiceLogoAudio.pause();
        voiceLogoAudio.currentTime = 0;
        
        const rect = document.getElementById('progressContainer').getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
        if (audio.paused) {
            audio.play();
            setPlayIcon(true);
        }
    };

    // Mode Layar Penuh + Otomatis Kunci Orientasi Landscape (Khusus Android/Mobile)
    window.toggleFullscreenLandscape = async function() {
        const wrapper = document.getElementById('playerWrapper');
        try {
            if (!document.fullscreenElement) {
                // 1. Masuk ke mode fullscreen
                if (wrapper.requestFullscreen) {
                    await wrapper.requestFullscreen();
                } else if (wrapper.webkitRequestFullscreen) {
                    await wrapper.webkitRequestFullscreen();
                }

                // 2. Kunci orientasi ke landscape jika didukung browser HP (Chrome Android, dll)
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {
                        // Jika orientasi diabaikan/tidak didukung perangkat, tetap aman
                    });
                }
            } else {
                // Keluar dari fullscreen
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
            console.log("Fullscreen/Orientation error:", err);
        }
    };

    window.toggleFullscreen = window.toggleFullscreenLandscape;

    // Keyboard Shortcuts (F = Fullscreen, Spasi = Play/Pause, R = Restart)
    document.addEventListener('keydown', (e) => {
        // Abaikan jika user sedang mengetik di input text/textarea
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        const key = e.key.toLowerCase();

        // 1. Tombol 'F' -> Toggle Layar Penuh (Fullscreen)
        if (key === 'f') {
            e.preventDefault();
            window.toggleFullscreen();
        }
        // 2. Tombol 'Spasi' (Space) -> Play / Pause
        else if (e.code === 'Space') {
            e.preventDefault();
            window.toggleAudio();
        }
        // 3. Tombol 'R' -> Restart dari awal (Intro Dev)
        else if (key === 'r') {
            e.preventDefault();
            window.restartVideo();
        }
    });

    // Runtutan Video Lengkap:
    // Layar Hitam -> Logo Dev muncul -> Suara dimainkan -> Redupkan -> CG Lagu & Musik mulai
    function playFullSequence() {
        clearTimers();
        isSequenceRunning = true;
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

    // Akhir Lagu -> CapTL 5 Detik -> Layar Gelap
    audio.addEventListener('ended', () => {
        setPlayIcon(false);
        lyricsBox.classList.remove('visible');
        showCgElement(cgOutro);

        addTimer(() => {
            clearAllCg();
            isSequenceRunning = false;
        }, 5000);
    });

    function formatTime(sec) {
        if (isNaN(sec)) return "00:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }

    audio.addEventListener('loadedmetadata', () => {
        durationTimeLabel.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        const cur = audio.currentTime;
        currentTimeLabel.textContent = formatTime(cur);
        
        if (audio.duration) {
            const pct = (cur / audio.duration) * 100;
            progressBar.style.width = pct + '%';
        }

        // Update CG Berdasarkan Waktu Lagu
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
    });

    function switchCg(index) {
        const musicCg = document.getElementById('cg-' + index);
        if (musicCg) {
            showCgElement(musicCg);
            currentCg = index;
        }
    }
});
