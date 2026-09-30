/* ==========================================================================
   AI-TPACK DIGITAL SUITE - SHARED JAVASCRIPT LOGIC (UI/UX PRO MAX v2.0)
   Handles Fixed Top-Right Theme Toggle (Light default / Dark), Bilingual (ID / EN), Simulator & Auto-Save
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initAccordions();
  initAutoSave();
  initRealTimeDates();
  initSimulator();
  initFilters();
  initCardClassifier();
  initEvalTabs();
});

/* --------------------------------------------------------------------------
   1. THEME TOGGLE (LIGHT MODE DEFAULT)
   -------------------------------------------------------------------------- */
function initTheme() {
  const savedTheme = localStorage.getItem('aitpack_theme') || 'light';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  localStorage.setItem('aitpack_theme', theme);
  
  const themeBtns = document.querySelectorAll('.btn-toggle-theme');
  const lang = getCurrentLang();
  
  const sunIcon = `<svg class="sun-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  const moonIcon = `<svg class="moon-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  themeBtns.forEach(btn => {
    if (theme === 'dark') {
      const text = lang === 'en' ? 'Light Mode' : 'Mode Terang';
      btn.innerHTML = `${sunIcon} <span>${text}</span>`;
    } else {
      const text = lang === 'en' ? 'Dark Mode' : 'Mode Gelap';
      btn.innerHTML = `${moonIcon} <span>${text}</span>`;
    }
  });
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

/* --------------------------------------------------------------------------
   2. BILINGUAL TRANSLATION SYSTEM (DEFAULT: BAHASA INDONESIA)
   -------------------------------------------------------------------------- */
function getCurrentLang() {
  return localStorage.getItem('aitpack_lang') || 'id';
}

function initLanguage() {
  const currentLang = getCurrentLang();
  applyLanguage(currentLang);
}

function toggleLanguage() {
  const currentLang = getCurrentLang();
  const newLang = currentLang === 'id' ? 'en' : 'id';
  applyLanguage(newLang);
}

function applyLanguage(lang) {
  localStorage.setItem('aitpack_lang', lang);
  document.documentElement.lang = lang === 'en' ? 'en-US' : 'id';

  const globeIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;

  // Toggle button label
  const langBtns = document.querySelectorAll('.btn-toggle-lang');
  langBtns.forEach(btn => {
    const label = lang === 'en' ? 'Bahasa Indonesia' : 'English (US)';
    btn.innerHTML = `${globeIcon} <span>${label}</span>`;
  });

  // Re-apply theme button text for current lang
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  applyTheme(currentTheme);

  // Update elements with data-id and data-en
  const translatableElements = document.querySelectorAll('[data-id][data-en]');
  translatableElements.forEach(el => {
    const text = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-id');
    if (text) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.innerHTML = text;
      }
    }
  });

  updateSimulatorLang(lang);
  renderTaskCards();
  updateRealTimeDateDisplays(lang);
}

/* --------------------------------------------------------------------------
   3. ACCORDIONS & TOGGLES
   -------------------------------------------------------------------------- */
function initAccordions() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });
}

/* --------------------------------------------------------------------------
   4. FORM AUTO-SAVE (LOCALSTORAGE)
   -------------------------------------------------------------------------- */
function initAutoSave() {
  const forms = document.querySelectorAll('.autosave-form');
  forms.forEach(form => {
    const formId = form.getAttribute('id') || window.location.pathname;
    
    const savedData = localStorage.getItem(`aitpack_save_${formId}`);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
          const field = form.querySelector(`[name="${key}"]`);
          if (field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
              field.checked = data[key];
            } else {
              field.value = data[key];
            }
          }
        });
      } catch (e) {
        console.error('Error loading saved form data:', e);
      }
    }
    
    form.addEventListener('input', () => {
      const formData = new FormData(form);
      const dataObj = {};
      formData.forEach((value, key) => {
        dataObj[key] = value;
      });
      localStorage.setItem(`aitpack_save_${formId}`, JSON.stringify(dataObj));
    });
  });
}

function resetSavedForm(formId) {
  const lang = getCurrentLang();
  const confirmMsg = lang === 'en' 
    ? 'Are you sure you want to clear your saved responses?' 
    : 'Apakah Anda yakin ingin mengosongkan isian yang tersimpan?';
  
  if (confirm(confirmMsg)) {
    localStorage.removeItem(`aitpack_save_${formId}`);
    window.location.reload();
  }
}


/* --------------------------------------------------------------------------
   REAL-TIME AUTOMATIC DATE SYSTEM
   Auto-populates date input fields and display labels with current local date
   -------------------------------------------------------------------------- */
function getRealtimeDateInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const iso = `${year}-${month}-${day}`;
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const idStr = now.toLocaleDateString('id-ID', options);
  const enStr = now.toLocaleDateString('en-US', options);
  
  return { iso, idStr, enStr, now };
}

function initRealTimeDates() {
  const dateInfo = getRealtimeDateInfo();

  // 1. Auto-fill all <input type="date"> with current realtime date & make strictly non-editable
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    input.value = dateInfo.iso;
    input.setAttribute('readonly', 'true');
    input.setAttribute('tabindex', '-1');
    input.style.pointerEvents = 'none';
    input.style.cursor = 'not-allowed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // 2. Update all realtime display elements across page
  updateRealTimeDateDisplays(getCurrentLang());
}

function updateRealTimeDateDisplays(lang) {
  const dateInfo = getRealtimeDateInfo();
  const text = lang === 'en' ? dateInfo.enStr : dateInfo.idStr;

  const elements = document.querySelectorAll('.realtime-date-text, .realtime-date, [data-realtime-date]');
  elements.forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = text;
    } else {
      el.textContent = text;
    }
  });
}

/* --------------------------------------------------------------------------
   5. PROMPT SIMULATOR & PRESETS
   -------------------------------------------------------------------------- */
const PROMPT_PRESETS = {
  socratic: {
    id_title: "1. Tutor Socratik (Metode Substitusi - Tanpa Jawaban)",
    en_title: "1. Socratic Tutor (Substitution Method - No Answers)",
    id_prompt: `Bertindaklah sebagai tutor Socratik matematika SMP. Seorang siswa bingung MENGAPA pada metode substitusi SPLDV kita menggantikan variabel y dengan (7 - 2x) dari persamaan 2x + y = 7. 
Jangan berikan jawaban langsung! Ajukan 3 pertanyaan bertahap yang mengarahkan siswa untuk menyadari bahwa y dan (7 - 2x) memiliki nilai yang sama persis.
Dilarang menggunakan kata-kata: "Caranya adalah", "Jawabannya adalah".`,
    en_prompt: `Act as a Socratic junior high mathematics tutor. A student is confused WHY in the system of linear equations substitution method we substitute variable y with (7 - 2x) from the equation 2x + y = 7.
Do NOT give direct answers! Ask 3 step-by-step questions that guide the student to realize that y and (7 - 2x) represent the exact same value.
Forbidden phrases: "The solution is", "The answer is".`,
    id_response: `Output AI (Simulasi Response):
"Halo! Mari kita telusuri bersama ya. 

1. Pertama, jika ada dua barang dengan harga yang sama persis, apakah kamu bisa menukar barang pertama dengan barang kedua dalam transaksi belanja?
2. Sekarang perhatikan persamaan 2x + y = 7. Jika kita ubah menjadi y = 7 - 2x, apa artinya hubungan antara variabel 'y' dan bentuk '(7 - 2x)'?
3. Jika 'y' itu sendiri NILAINYA SAMA DENGAN '(7 - 2x)', apa yang terjadi jika kita mengganti huruf 'y' di persamaan kedua dengan bentuk '(7 - 2x)' tersebut?"`,
    en_response: `AI Output (Simulated Response):
"Hello! Let's explore this step-by-step together:

1. First, if two items have the exact same price, can you exchange the first item for the second item in a shop?
2. Now look at 2x + y = 7. If we rewrite it as y = 7 - 2x, what does that say about the relationship between 'y' and '(7 - 2x)'?
3. If 'y' has the EXACT SAME VALUE as '(7 - 2x)', what happens when you substitute 'y' in the second equation with '(7 - 2x)'?"`,
    id_analysis: "BERHASIL: AI mematuhi batasan Socratik, memicu metakognisi tanpa memberikan jawaban langsung.",
    en_analysis: "SUCCESS: AI adheres to Socratic constraints, prompting metacognition without spoiling the answer."
  },
  error_checker: {
    id_title: "2. Pemeriksa Error (Metode Eliminasi - Scaffolding Tanda)",
    en_title: "2. Error Checker (Elimination Method - Sign Scaffolding)",
    id_prompt: `Seorang siswa menyelesaikan SPLDV:
2x + 3y = 12 ... (1)
x - y = 2    ... (2)
Siswa mengalikan persamaan (2) dengan 3 menjadi 3x - 3y = 6, lalu MENURANGKAN kedua persamaan.
Tugas AI: BERIKAN SATU PERTANYAAN yang membantu siswa menyadari kesalahan tanda (+ / -) saat mengeliminasi. Dilarang memberi tahu jawaban yang benar!`,
    en_prompt: `A student is solving the system of equations:
2x + 3y = 12 ... (1)
x - y = 2    ... (2)
The student multiplied equation (2) by 3 to get 3x - 3y = 6, then SUBTRACTED the equations.
AI Task: Provide ONE QUESTION that helps the student notice their sign error (+ / -). Do NOT state the correct answer!`,
    id_response: `Output AI (Simulasi Response):
"Coba perhatikan kembali tanda pada (+3y) dari persamaan pertama dan (-3y) dari persamaan kedua. 
Jika kamu ingin menjadikan (+3y) dan (-3y) menjadi 0, apakah kedua suku tersebut harus DIKURANGKAN atau DITAMBAHKAN?"`,
    en_response: `AI Output (Simulated Response):
"Look closely at the signs of (+3y) in the first equation and (-3y) in the second equation.
If you want to make (+3y) and (-3y) equal 0, should you SUBTRACT them or ADD them?"`,
    id_analysis: "BERHASIL: AI menargetkan akar miskonsepsi tanda secara presisi.",
    en_analysis: "SUCCESS: AI precisely targets the sign misconception root cause."
  },
  contextual: {
    id_title: "3. Generator Soal Kontekstual Indonesia",
    en_title: "3. Indonesian Contextual Problem Generator",
    id_prompt: `Rancang 1 soal cerita SPLDV kontekstual lokal (harga makanan di kantin sekolah: bakso dan es teh) dengan angka nominal rupiah kelipatan 1.000. Sertakan kunci penyelesaian untuk guru.`,
    en_prompt: `Design 1 contextual system of linear equations word problem (school canteen food prices: meatballs and iced tea) using realistic rupiah values rounded to 1,000s. Include solution steps for the teacher.`,
    id_response: `Output AI (Simulasi Response):
"SOAL CERITA KANTIN SEKOLAH:
- Budi membeli 2 mangkok bakso dan 1 gelas es teh manis seharga Rp 22.000.
- Ani membeli 1 mangkok bakso dan 2 gelas es teh manis seharga Rp 17.000.
Berapakah harga 1 mangkok bakso dan 1 gelas es teh manis secara terpisah?

KUNCI GURU:
Persamaan 1: 2x + y = 22.000
Persamaan 2: x + 2y = 17.000
Solusi: x (bakso) = Rp 9.000, y (es teh) = Rp 4.000."`,
    en_response: `AI Output (Simulated Response):
"SCHOOL CANTEEN WORD PROBLEM:
- Budi buys 2 bowls of meatballs and 1 glass of iced tea for IDR 22,000.
- Ani buys 1 bowl of meatballs and 2 glasses of iced tea for IDR 17,000.
What is the price of 1 bowl of meatballs and 1 glass of iced tea individually?

TEACHER KEY:
Eq 1: 2x + y = 22,000
Eq 2: x + 2y = 17,000
Solution: x (meatballs) = IDR 9,000, y (iced tea) = IDR 4,000."`,
    id_analysis: "AUTENTIK: Konteks lokal Indonesia dengan nominal realistis.",
    en_analysis: "AUTHENTIC: Indonesian local context with realistic values."
  }
};

function initSimulator() {
  const simSelect = document.getElementById('sim-preset-select');
  const simPromptInput = document.getElementById('sim-prompt-input');
  const simOutputBox = document.getElementById('sim-output-box');
  const simAnalysisBox = document.getElementById('sim-analysis-box');
  const simRunBtn = document.getElementById('sim-run-btn');

  if (!simSelect || !simPromptInput) return;

  simSelect.addEventListener('change', (e) => {
    const presetKey = e.target.value;
    const lang = getCurrentLang();
    if (PROMPT_PRESETS[presetKey]) {
      simPromptInput.value = lang === 'en' ? PROMPT_PRESETS[presetKey].en_prompt : PROMPT_PRESETS[presetKey].id_prompt;
      if (simOutputBox) simOutputBox.textContent = lang === 'en' ? "Click 'Test Prompt' to simulate output..." : "Klik 'Uji Prompt di AI' untuk mensimulasikan keluaran...";
      if (simAnalysisBox) simAnalysisBox.textContent = "-";
    }
  });

  if (simRunBtn) {
    simRunBtn.addEventListener('click', () => {
      const presetKey = simSelect.value;
      const lang = getCurrentLang();
      if (PROMPT_PRESETS[presetKey]) {
        simOutputBox.textContent = lang === 'en' ? PROMPT_PRESETS[presetKey].en_response : PROMPT_PRESETS[presetKey].id_response;
        simAnalysisBox.textContent = lang === 'en' ? PROMPT_PRESETS[presetKey].en_analysis : PROMPT_PRESETS[presetKey].id_analysis;
      } else {
        simOutputBox.textContent = lang === 'en' 
          ? `[SIMULATED AI RESPONSE FOR PROMPT]:\n"${simPromptInput.value.substring(0, 100)}..."` 
          : `[MENSIMULASIKAN RESPONS AI FOR PROMPT]:\n"${simPromptInput.value.substring(0, 100)}..."`;
        simAnalysisBox.textContent = lang === 'en'
          ? "Custom prompt evaluated. Pedagogical constraints verified."
          : "Custom Prompt dievaluasi. Memenuhi struktur peran dan batasan pedagogis.";
      }
    });
  }
}

function updateSimulatorLang(lang) {
  const simSelect = document.getElementById('sim-preset-select');
  const simPromptInput = document.getElementById('sim-prompt-input');
  if (!simSelect || !simPromptInput) return;

  const presetKey = simSelect.value;
  if (PROMPT_PRESETS[presetKey]) {
    simPromptInput.value = lang === 'en' ? PROMPT_PRESETS[presetKey].en_prompt : PROMPT_PRESETS[presetKey].id_prompt;
  }
}

/* --------------------------------------------------------------------------
   6. SEARCH & FILTER LOGIC FOR TABLES (ALT & HLT)
   -------------------------------------------------------------------------- */
function initFilters() {
  const searchInput = document.getElementById('table-search-input');
  const statusFilter = document.getElementById('table-status-filter');
  const sessionFilter = document.getElementById('table-session-filter');
  const rows = document.querySelectorAll('.filterable-row');

  if (!rows.length) return;

  function filterTable() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const st = statusFilter ? statusFilter.value : 'all';
    const ss = sessionFilter ? sessionFilter.value : 'all';

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const rowStatus = row.getAttribute('data-status') || '';
      const rowSession = row.getAttribute('data-session') || '';

      const matchesSearch = !q || text.includes(q);
      const matchesStatus = st === 'all' || rowStatus === st;
      const matchesSession = ss === 'all' || rowSession === ss;

      if (matchesSearch && matchesStatus && matchesSession) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (searchInput) searchInput.addEventListener('input', filterTable);
  if (statusFilter) statusFilter.addEventListener('change', filterTable);
  if (sessionFilter) sessionFilter.addEventListener('change', filterTable);
}

/* --------------------------------------------------------------------------
   7. INTERACTIVE TASK CARD CLASSIFIER (LKM P1)
   -------------------------------------------------------------------------- */
const TASK_CARDS_DATA = [
  { id: 1, text_id: "Selesaikan 3x + 2y = 12 dan x - y = 1 dengan metode eliminasi.", text_en: "Solve 3x + 2y = 12 and x - y = 1 using the elimination method.", type_id: "Prosedural", type_en: "Procedural", cat: "A", hint_id: "AI dapat mengecek hitungan / verifikasi cepat.", hint_en: "AI is safe for fast procedural computation verification." },
  { id: 2, text_id: "Buktikan bahwa (2, 3) adalah solusi dari sistem 2x + y = 7 dan x + y = 5.", text_en: "Prove that (2, 3) is a solution to 2x + y = 7 and x + y = 5.", type_id: "Verifikasi", type_en: "Verification", cat: "A", hint_id: "AI aman untuk verifikasi langkah pembuktian.", hint_en: "AI is safe for step-by-step verification." },
  { id: 3, text_id: "Jelaskan secara konseptual mengapa metode substitusi dan eliminasi menghasilkan solusi yang sama.", text_en: "Explain conceptually why substitution and elimination methods yield the exact same solution.", type_id: "Konseptual", type_en: "Conceptual", cat: "B", hint_id: "Perlu pembingkaian Socratik agar AI tidak langsung memberi jawaban.", hint_en: "Requires Socratic framing so AI doesn't spoil the conceptual explanation." },
  { id: 4, text_id: "Temukan kesalahan dalam langkah eliminasi berikut: [langkah salah diberikan].", text_en: "Find the error in the following elimination steps: [given incorrect steps].", type_id: "Identifikasi Error", type_en: "Error Identification", cat: "B", hint_id: "Perlu prompt Pemeriksa Error agar AI menuntun siswa menemukan salahnya sendiri.", hint_en: "Requires Error Checker prompt so AI guides students to discover their mistake." },
  { id: 5, text_id: "Gambarkan secara geometris apa artinya dua garis tidak memiliki titik potong.", text_en: "Graphically illustrate what it means when two lines have no intersection point.", type_id: "Visual / Konseptual", type_en: "Visual / Conceptual", cat: "B", hint_id: "AI bisa membantu visualisasi, namun makna konseptual tetap dipandu guru.", hint_en: "AI assists with visualization, but conceptual meaning remains teacher-guided." },
  { id: 6, text_id: "Buat soal cerita SPLDV tentang harga bakso dan mie ayam di kantin sekolah.", text_en: "Create a system of linear equations word problem about canteen food prices.", type_id: "Kreatif / Kontekstual", type_en: "Creative / Contextual", cat: "A", hint_id: "Sangat cocok untuk Generator Soal Kontekstual lokal.", hint_en: "Ideal for Contextual Problem Generator." },
  { id: 7, text_id: "Rancang satu pertanyaan asesmen yang menguji PEMAHAMAN, bukan sekadar kemampuan menghitung.", text_en: "Design one assessment question testing conceptual understanding, not just computation.", type_id: "Pedagogis", type_en: "Pedagogical", cat: "C", hint_id: "Refleksi pedagogis murni guru, AI berpotensi menghambat intuisi.", hint_en: "Pure teacher pedagogical reflection; direct AI output may hinder teacher intuition." },
  { id: 8, text_id: "Kapan SPLDV memiliki solusi unik, tak terhingga, atau tidak ada? Jelaskan dengan grafik.", text_en: "When does a system of linear equations have a unique solution, infinite solutions, or no solution? Explain with graphs.", type_id: "Higher-Order", type_en: "Higher-Order", cat: "B", hint_id: "Boleh dengan AI Socratik yang menggali grafik bersama siswa.", hint_en: "Suitable with Socratic AI probing graphical representations." }
];

function initCardClassifier() {
  const container = document.getElementById('interactive-cards-container');
  if (!container) return;

  renderTaskCards();
}

function renderTaskCards() {
  const container = document.getElementById('interactive-cards-container');
  if (!container) return;

  const lang = getCurrentLang();

  container.innerHTML = '';
  TASK_CARDS_DATA.forEach(card => {
    const cardText = lang === 'en' ? card.text_en : card.text_id;
    const cardType = lang === 'en' ? card.type_en : card.type_id;

    const btnALabel = lang === 'en' ? '(A) Safe AI' : '(A) AI Aman';
    const btnBLabel = lang === 'en' ? '(B) Needs Framing' : '(B) AI Perlu Pembingkaian';
    const btnCLabel = lang === 'en' ? '(C) May Hinder' : '(C) AI Berpotensi Menghambat';

    const cardEl = document.createElement('div');
    cardEl.className = 'card card-primary card-classifier';
    cardEl.innerHTML = `
      <div style="display:flex; justify-space-between; align-items:center; margin-bottom:10px;">
        <span class="badge-tag">${lang === 'en' ? 'Card' : 'Kartu'} #${card.id} &middot; ${cardType}</span>
        <span id="badge-chosen-${card.id}" class="status-badge" style="display:none;">-</span>
      </div>
      <p style="font-weight:600; color:var(--heading-color); margin-bottom:14px;">"${cardText}"</p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="btn btn-outline" style="padding:6px 12px; font-size:0.8rem;" onclick="selectCardCategory(${card.id}, 'A')">${btnALabel}</button>
        <button type="button" class="btn btn-outline" style="padding:6px 12px; font-size:0.8rem;" onclick="selectCardCategory(${card.id}, 'B')">${btnBLabel}</button>
        <button type="button" class="btn btn-outline" style="padding:6px 12px; font-size:0.8rem;" onclick="selectCardCategory(${card.id}, 'C')">${btnCLabel}</button>
      </div>
      <div id="card-feedback-${card.id}" style="margin-top:12px; font-size:0.83rem; color:var(--text-muted); display:none; padding:12px; background:var(--bg-glass); border-radius:8px;"></div>
    `;
    container.appendChild(cardEl);
  });
}

function selectCardCategory(cardId, category) {
  const cardData = TASK_CARDS_DATA.find(c => c.id === cardId);
  const badgeEl = document.getElementById(`badge-chosen-${cardId}`);
  const feedbackEl = document.getElementById(`card-feedback-${cardId}`);
  const lang = getCurrentLang();

  if (!badgeEl || !feedbackEl || !cardData) return;

  badgeEl.style.display = 'inline-flex';
  if (category === 'A') {
    badgeEl.className = 'status-badge status-sesuai';
    badgeEl.textContent = lang === 'en' ? 'Category A: Safe AI' : 'Kategori A: AI Aman';
  } else if (category === 'B') {
    badgeEl.className = 'status-badge status-sebagian';
    badgeEl.textContent = lang === 'en' ? 'Category B: Needs Framing' : 'Kategori B: Perlu Pembingkaian';
  } else {
    badgeEl.className = 'status-badge status-berbeda';
    badgeEl.textContent = lang === 'en' ? 'Category C: May Hinder' : 'Kategori C: Berpotensi Menghambat';
  }

  const hint = lang === 'en' ? cardData.hint_en : cardData.hint_id;
  const hintHeading = lang === 'en' ? 'Pedagogical Recommendation:' : 'Catatan Pedagogis:';

  feedbackEl.style.display = 'block';
  feedbackEl.innerHTML = `<strong>${hintHeading}</strong> ${hint}`;

  const formInput = document.querySelector(`[name="kat_kartu_${cardId}"]`);
  if (formInput) formInput.value = category;
}

/* --------------------------------------------------------------------------
   8. UTILITIES (EXPORT & PRINT)
   -------------------------------------------------------------------------- */
function exportToPrint() {
  window.print();
}

/* --------------------------------------------------------------------------
   9. EVALUATION TABS (PRE-TEST & POST-TEST)
   -------------------------------------------------------------------------- */
function initEvalTabs() {
  const tabBtns = document.querySelectorAll('.eval-tab-btn');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab) {
        switchEvalTab(targetTab);
      }
    });
  });
}

function switchEvalTab(tabId) {
  const tabBtns = document.querySelectorAll('.eval-tab-btn');
  const tabContents = document.querySelectorAll('.eval-tab-content');

  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  tabContents.forEach(content => {
    if (content.id === tabId) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

/* --------------------------------------------------------------------------
   10. IFRAME EXPAND & CLIPBOARD HELPERS
   -------------------------------------------------------------------------- */
function toggleIframeExpand(containerId, btn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const isExpanded = container.classList.toggle('expanded');
  const lang = getCurrentLang();
  
  if (btn) {
    if (isExpanded) {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/></svg> <span>${lang === 'en' ? 'Normal View' : 'Tinggi Standar'}</span>`;
    } else {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> <span>${lang === 'en' ? 'Expand View' : 'Perbesar Tampilan'}</span>`;
    }
  }
}

function copyToClipboard(text, btn) {
  const lang = getCurrentLang();
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> <span>${lang === 'en' ? 'Copied!' : 'Tersalin!'}</span>`;
      setTimeout(() => {
        btn.innerHTML = originalHtml;
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}


