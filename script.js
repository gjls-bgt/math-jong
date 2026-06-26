let currentMode = '';
let currentDifficulty = '';
let cardsData = [];
let selectedCards = [];
let matchedPairs = 0;

// Stopwatch Variabel
let timerInterval = null;
let secondsElapsed = 0;

const bgImages = {
    '+': 'https://i.pinimg.com/1200x/38/11/14/381114a7e0be098402477f95b7692907.jpg',
    '-': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'x': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    ':': 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80'
};

const modeNames = {'+': 'Penjumlahan', '-': 'Pengurangan', 'x': 'Perkalian', ':': 'Pembagian'};
const diffBadgeClasses = {
    'easy': 'bg-emerald-500 text-slate-950',
    'medium': 'bg-amber-500 text-slate-950',
    'hard': 'bg-rose-500 text-white'
};

// Auto Scale/Fit Layout di Tengah
function resizeGame() {
    const wrapper = document.getElementById('game-wrapper');
    const scale = Math.min(window.innerWidth / 800, window.innerHeight / 450);
    wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
}
window.addEventListener('resize', resizeGame);
window.addEventListener('DOMContentLoaded', resizeGame);

// Blokir klik kanan
document.addEventListener('contextmenu', event => event.preventDefault());

function showMenu() {
    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
}

function selectDifficulty(mode) {
    currentMode = mode;
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('diff-screen-title').innerText = `KESULITAN: ${modeNames[mode].toUpperCase()}`;
    document.getElementById('diff-screen').classList.remove('hidden');
}

// Shortcut pembantu bypass seleksi untuk perkalian & pembagian yang langsung jalan
function startGameMode(mode) {
    selectDifficulty(mode);
}

function backToMenu() {
    clearInterval(timerInterval);
    document.getElementById('menu-screen').classList.remove('hidden');
    document.getElementById('diff-screen').classList.add('hidden');
    document.getElementById('win-screen').classList.add('hidden');
    resetGameState();
}

function resetGameState() {
    cardsData = [];
    selectedCards = [];
    matchedPairs = 0;
    secondsElapsed = 0;
    clearInterval(timerInterval);
    document.getElementById('game-grid').innerHTML = '';
    document.getElementById('input-nama').value = '';
    document.getElementById('input-foto').value = '';
    document.getElementById('cert-name').innerText = "Hebat!";
    document.getElementById('cert-avatar').classList.add('hidden');
    document.getElementById('cert-avatar').src = '';
    document.getElementById('cert-avatar-placeholder').classList.remove('hidden');
}

function startGame(difficulty) {
    currentDifficulty = difficulty;
    resetGameState();
    
    updateTimerDisplay();

    // Atur Badge kesulitan
    const badge = document.getElementById('game-diff-badge');
    badge.className = `px-2 py-0.5 rounded text-[10px] font-black uppercase ${diffBadgeClasses[difficulty]}`;
    badge.innerText = difficulty;

    document.getElementById('game-mode-title').innerText = `Mode: ${modeNames[currentMode]}`;
    document.getElementById('pair-counter').innerText = `0/10`;
    document.getElementById('bg-game-image').src = bgImages[currentMode];
    
    document.getElementById('diff-screen').classList.add('hidden');

    generateMathPairs(currentMode, difficulty);
    renderGrid();

    // Jalankan Stopwatch ke atas (tidak membatasi)
    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function restartLevel() {
    document.getElementById('win-screen').classList.add('hidden');
    startGame(currentDifficulty);
}

function updateTimerDisplay() {
    const minutes = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const seconds = (secondsElapsed % 60).toString().padStart(2, '0');
    document.getElementById('game-timer').innerText = `${minutes}:${seconds}`;
}

// --- GENERATOR SOAL SESUAI ATURAN KESULITAN BARU ---
// --- GENERATOR SOAL DINAMIS - PASTI 10 PASANG (20 KARTU) ---
function generateMathPairs(mode, diff) {
    let rawPairs = [];
    
if (mode === '+') {
        // PENJUMLAHAN: HASIL UNIK TERLEBIH DAHULU & ANTI-TUKAR
        let maxResult = diff === 'easy' ? 20 : (diff === 'medium' ? 50 : 100);
        let minResult = diff === 'easy' ? 8 : (diff === 'medium' ? 25 : 55);
        
        let usedResults = []; // Mengunci agar hasil tidak kembar
        let usedCombos = new Set(); // Mengunci agar angka tidak ditukar (e.g., 3+5 dan 5+3)

        for (let index = 0; index < 10; index++) {
            let val;
            let attempts = 0;

            // 1. Tentukan angka hasil unik
            do {
                val = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
                attempts++;
            } while (usedResults.includes(val) && attempts < 50);

            if (usedResults.includes(val)) {
                val = minResult + index; // Fallback aman jika acakan bentrok terus
            }
            usedResults.push(val);

            // 2. Buat Soal Pasangan Kartu A
            let p1 = Math.floor(Math.random() * (val - 3)) + 2;
            let p2 = val - p1;
            
            // Catat kombinasi kartu A (urutkan dari kecil ke besar agar terdeteksi jika ditukar)
            let comboA = [p1, p2].sort((x, y) => x - y).join('+');
            usedCombos.add(comboA);

            // 3. Buat Soal Pasangan Kartu B (wajib berbeda angka dengan Kartu A & belum pernah ditukar)
            let p3, p4, comboB;
            let p3Attempts = 0;
            
            do {
                p3 = Math.floor(Math.random() * (val - 3)) + 2;
                p4 = val - p3;
                comboB = [p3, p4].sort((x, y) => x - y).join('+');
                p3Attempts++;
            } while ((p3 === p1 || p3 === p2 || usedCombos.has(comboB)) && p3Attempts < 50);

            // Fallback jika tidak menemukan kombinasi acak baru yang unik
            if (p3 === p1 || p3 === p2 || usedCombos.has(comboB)) {
                p3 = p1 + 1;
                p4 = val - p3;
                comboB = [p3, p4].sort((x, y) => x - y).join('+');
            }
            usedCombos.add(comboB);

            rawPairs.push({ id: `p${index}a`, text: `${p1} + ${p2}`, val: val });
            rawPairs.push({ id: `p${index}b`, text: `${p3} + ${p4}`, val: val });
        }

    } else if (mode === '-') {
        // PENGURANGAN: HASIL UNIK TERLEBIH DAHULU
        let minResult = diff === 'easy' ? 2 : (diff === 'medium' ? 6 : 12);
        let maxResult = diff === 'easy' ? 9 : (diff === 'medium' ? 18 : 30);
        
        let maxA = diff === 'easy' ? 20 : (diff === 'medium' ? 50 : 100);

        let usedResults = []; // Mengunci agar hasil tidak kembar

        for (let index = 0; index < 10; index++) {
            let val;
            let attempts = 0;

            // 1. Tentukan angka hasil unik terlebih dahulu
            do {
                val = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
                attempts++;
            } while (usedResults.includes(val) && attempts < 50);

            if (usedResults.includes(val)) {
                val = minResult + index; // Fallback aman
            }
            usedResults.push(val);

            // 2. Buat Soal Kartu A (A1 - B1 = Hasil)
            let b1 = Math.floor(Math.random() * (maxA - val - 2)) + 2;
            let a1 = val + b1;

            // 3. Buat Soal Kartu B (A2 - B2 = Hasil) dengan jaminan angka depan berbeda
            let a2;
            let a2Attempts = 0;
            do {
                let b2 = Math.floor(Math.random() * (maxA - val - 2)) + 2;
                a2 = val + b2;
                a2Attempts++;
            } while (a2 === a1 && a2Attempts < 50);

            if (a2 === a1) {
                a2 = a1 + 3; // Modifikasi instan agar pasti beda secara visual
            }
            let b2 = a2 - val;

            rawPairs.push({ id: `p${index}a`, text: `${a1} - ${b1}`, val: val });
            rawPairs.push({ id: `p${index}b`, text: `${a2} - ${b2}`, val: val });
        }
    
    } else if (mode === 'x') {
        // PERKALIAN: PASANGAN ANTARA SOAL DAN ANGKA HASIL LANGSUNG
            let minFactor = diff === 'easy' ? 2 : (diff === 'medium' ? 4 : 6);
            let maxFactor = diff === 'easy' ? 5 : (diff === 'medium' ? 10 : 12);
            
            // Catatan khusus untuk Hard agar bisa mencapai perkalian seperti 9 x 7 atau lebih tinggi
            if (diff === 'hard') {
                minFactor = 7;
                maxFactor = 15;
            }

            let usedProducts = []; // Memastikan 10 angka hasil unik (tidak ada angka kembar)

            for (let index = 0; index < 10; index++) {
                let f1, f2, val;
                let attempts = 0;

                // Loop untuk mencari pasangan angka unik yang belum dipakai di papan permainan
                do {
                    f1 = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
                    f2 = Math.floor(Math.random() * (diff === 'easy' ? 5 : 10)) + 2;
                    val = f1 * f2;
                    attempts++;
                } while (usedProducts.includes(val) && attempts < 50);

                usedProducts.push(val);

                // Kartu A: Berisi Soal (misal: "4 x 6")
                rawPairs.push({ id: `p${index}a`, text: `${f1} x ${f2}`, val: val });
                // Kartu B: Berisi Angka Hasil Langsung (misal: "24")
                rawPairs.push({ id: `p${index}b`, text: `${val}`, val: val });
            }

} else if (mode === ':') {
        // PEMBAGIAN: MENENTUKAN ANGKA HASIL UNIK TERLEBIH DAHULU (ANTI-KEMBAR)
        let minHasil = diff === 'easy' ? 2 : (diff === 'medium' ? 5 : 8);
        let maxHasil = diff === 'easy' ? 5 : (diff === 'medium' ? 10 : 15);
        let maxPembagi = diff === 'easy' ? 5 : (diff === 'medium' ? 10 : 12);

        let usedResults = []; // Array pengunci agar angka hasil tidak ada yang sama

        for (let index = 0; index < 10; index++) {
            let hasil;
            let attempts = 0;

            // 1. Cari angka hasil unik yang belum pernah digunakan dalam sesi ini
            do {
                hasil = Math.floor(Math.random() * (maxHasil - minHasil + 1)) + minHasil;
                attempts++;
            } while (usedResults.includes(hasil) && attempts < 50);

            // Jika batas acak habis (pada level easy rentang sedikit), paksa buat angka hasil baru secara dinamis
            if (usedResults.includes(hasil)) {
                hasil = minHasil + index; 
            }

            usedResults.push(hasil);

            // 2. Tentukan pembagi secara acak
            let pembagi = Math.floor(Math.random() * (maxPembagi - 2 + 1)) + 2;
            let total = hasil * pembagi; // Angka yang akan dibagi (Soal)

            // Kartu A: Berisi Soal Pembagian (misal: "25 : 5")
            rawPairs.push({ id: `p${index}a`, text: `${total} : ${pembagi}`, val: hasil });
            // Kartu B: Berisi Angka Hasil Langsung (misal: "5")
            rawPairs.push({ id: `p${index}b`, text: `${hasil}`, val: hasil });
        }
    }
        // Pengocokan Kartu (Shuffle)
    for (let i = rawPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rawPairs[i], rawPairs[j]] = [rawPairs[j], rawPairs[i]];
    }
    cardsData = rawPairs;
}

function renderGrid() {
    const gridContainer = document.getElementById('game-grid');
    gridContainer.innerHTML = '';
    cardsData.forEach(card => {
        const cardEl = document.createElement('button');
        cardEl.id = card.id;
        cardEl.dataset.value = card.val;
        
        cardEl.className = "border border-slate-600 hover:border-indigo-400 text-slate-100 font-extrabold text-xs sm:text-sm rounded-lg flex items-center justify-center transition-all duration-150 shadow shadow-black/40 transform hover:scale-[1.05] cursor-pointer select-none h-full w-full p-1";
        
        cardEl.style.backgroundImage = "url('img/card_bg.png')";
        cardEl.style.backgroundSize = "cover";
        cardEl.style.backgroundPosition = "center";
        
        cardEl.innerText = card.text;
        cardEl.addEventListener('click', () => handleCardClick(cardEl));
        gridContainer.appendChild(cardEl);
    });
}

function handleCardClick(cardEl) {
    if (selectedCards.includes(cardEl) || cardEl.classList.contains('card-fade-out')) return;
    
    // Hilangkan kelas default/hover bawaan sementara kartu dipilih
    cardEl.classList.remove('border-slate-600', 'hover:border-indigo-400', 'hover:scale-[1.02]');
    
    // TAMBAHKAN: Efek mencolok (Border tebal 4px emas, membesar 5%, z-index atas, dan bayangan)
    cardEl.classList.add('border-4', 'border-amber-400', 'scale-[1.05]', 'z-20', 'shadow-lg', 'shadow-amber-500/40');
    
    selectedCards.push(cardEl);

    if (selectedCards.length === 2) {
        document.getElementById('game-grid').classList.add('pointer-events-none');
        setTimeout(checkMatch, 300);
    }
}

function checkMatch() {
    const [card1, card2] = selectedCards;
    
    if (card1.dataset.value === card2.dataset.value) {
        // JIKA COCOK: Hapus efek pembesar agar animasi fade-out tidak merusak layout
        [card1, card2].forEach(card => {
            card.classList.remove('scale-[1.05]', 'z-20', 'shadow-lg', 'shadow-amber-500/40');
            card.classList.add('card-fade-out');
        });

        setTimeout(() => {
            card1.style.visibility = 'hidden';
            card2.style.visibility = 'hidden';
        }, 400);

        matchedPairs++;
        document.getElementById('pair-counter').innerText = `${matchedPairs}/10`;

        if (matchedPairs === 10) {
            clearInterval(timerInterval);
            setTimeout(triggerWinScreen, 600);
        }
        
        // Langsung reset array terpilih & aktifkan klik grid lagi untuk kartu berikutnya
        selectedCards = [];
        document.getElementById('game-grid').classList.remove('pointer-events-none');

    } else {
        // JIKA SALAH: Beri jeda 1 detik agar anak tahu kartu mana yang salah pilih
        setTimeout(() => {
            [card1, card2].forEach(card => {
                // Bersihkan efek aktif (border tebal emas, scale besar, shadow)
                card.classList.remove('border-4', 'border-amber-400', 'scale-[1.05]', 'z-20', 'shadow-lg', 'shadow-amber-500/40');
                
                // Kembalikan border bawaan game dan efek hover-nya
                card.classList.add('border-slate-600', 'hover:border-indigo-400', 'hover:scale-[1.02]');
            });

            // Reset setelah animasi selesai dihitung
            selectedCards = [];
            document.getElementById('game-grid').classList.remove('pointer-events-none');
        }, 1000); // Jeda waktu kartu membesar memperlihatkan kesalahan (1 detik)
    }
}

function triggerWinScreen() {
    document.getElementById('cert-mode').innerText = modeNames[currentMode];
    document.getElementById('cert-diff').innerText = currentDifficulty;
    
    const minutes = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const seconds = (secondsElapsed % 60).toString().padStart(2, '0');
    document.getElementById('cert-time-spent').innerText = `${minutes}:${seconds}`;

    document.getElementById('cert-date').innerText = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    document.getElementById('win-screen').classList.remove('hidden');
}

function updateCertName(val) {
    document.getElementById('cert-name').innerText = val.trim() ? val : "Hebat!";
}

function uploadFoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgEl = document.getElementById('cert-avatar');
            imgEl.src = e.target.result;
            imgEl.classList.remove('hidden');
            document.getElementById('cert-avatar-placeholder').classList.add('hidden');
        }
        reader.readAsDataURL(file);
    }
}

function downloadCertificate() {
    const targetArea = document.getElementById('certificate-area');
    html2canvas(targetArea, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: false
    }).then(canvas => {
        try {
            const link = document.createElement('a');
            const namaFile = document.getElementById('input-nama').value.replace(/\s+/g, '_') || 'jagoan';
            link.download = `Sertifikat_MathJong_${currentDifficulty}_${namaFile}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            alert("Gagal mengunduh gambar.");
        }
    });
}