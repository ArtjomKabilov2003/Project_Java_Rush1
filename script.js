// $ — это сокращение для querySelector, 
// а $$ — для querySelectorAll, только второй сразу возвращает массив.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Stations (оставлено без изменений)
const Stations = [
    "Zermatt Bus Terminal", "Interlaken Ost Bus Station", "Grindelwald Bus Terminal", "Lauterbrunnen Bahnhof", "Lucerne Bahnhofquai", "Chamonix-Mont-Blanc Sud (France, near Swiss border)", "Geneva Bus Station", "Bern PostAuto Terminal", "Gstaad Bus Station", "St. Moritz Bahnhof PostAuto", "Verbier Village", "Davos Platz Postautohaltestelle", "Andermatt Gotthardpass", "Täsch Bahnhof (Shuttle to Zermatt)", "Flims Dorf Post",
    "Chamonix Sud Bus Station", "Annecy Gare Routière", "Grenoble Gare Routière", "Nice Airport (Bus to Alps)", "Bourg-Saint-Maurice Gare Routière", "Les Gets Gare Routière", "Val d'Isère Centre", "Courchevel 1850", "Megève Place du Village",
    "Aosta Autostazione", "Bolzano Autostazione", "Trento Autostazione", "Cortina d'Ampezzo Autostazione", "Bormio Bus Station", "Livigno Centro", "Merano Autostazione", "Sestriere Bus Stop", "Ortisei (St. Ulrich) Autostazione", "Canazei Piazza Marconi",
    "Innsbruck Hauptbahnhof Bus Terminal", "Salzburg Süd Busbahnhof", "Mayrhofen Bahnhof", "Lech am Arlberg Postamt", "Kitzbühel Hahnenkammbahn", "Ischgl Seilbahn", "Zell am See Postplatz", "Bad Gastein Bahnhof", "St. Anton am Arlberg Bahnhof", "Sölden Postamt",
    "Garmisch-Partenkirchen Bahnhof (Bus Station)", "Berchtesgaden Busbahnhof", "Oberstdorf Busbahnhof", "Füssen Bahnhof (Bus Station)", "Mittenwald Bahnhof (Bus Station)",
    "Bled Bus Station", "Bohinj Jezero", "Kranjska Gora Avtobusna Postaja"
];

// --- Вспомогательные функции для работы с датами ---
let dpRoot, dpGrid, dpTitle, dpActive, dpCur = new Date();
const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const today = new Date();
today.setHours(0, 0, 0, 0); // Обнуляем время для today

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fmtHuman(d) { return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`; }
function dateEq(d1, d2) { 
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); 
}


// --- 1. Autocomplete Logic (ИСПРАВЛЕНО) ---
function autocomplete(input, list) {
    function show(items) {
        list.innerHTML = items.slice(0, 12).map((t, i) => `<li role="option" data-i="${i}">${t}</li>`).join("");
        // ИСПОЛЬЗУЕМ КЛАСС .show
        list.classList.toggle("show", items.length > 0);
        input.setAttribute('aria-expanded', items.length > 0);
    }
    input.addEventListener("input", () => {
        clearError(input);
        const q = input.value.trim().toLowerCase();
        if (!q) return list.classList.remove("show");
        show(Stations.filter(s => s.toLowerCase().includes(q)));
    });
    input.addEventListener("focus", () => {
        const q = input.value.trim().toLowerCase();
        show(q ? Stations.filter(s => s.toLowerCase().includes(q)) : Stations);
    });
    list.addEventListener("click", (e) => {
        const li = e.target.closest("li");
        if (!li) return;
        input.value = li.textContent;
        list.classList.remove("show");
        input.setAttribute('aria-expanded', 'false');
        clearError(input);
        input.focus();
    });
    document.addEventListener("click", e => {
        if (e.target !== input && !list.contains(e.target)) list.classList.remove("show");
    });
}


// --- 2. Datepicker Logic ---
function dpBuild() {
    if (!dpRoot) {
        dpRoot = document.createElement("div");
        dpRoot.className = "dp";
        dpRoot.innerHTML = `
            <div class="dp-header">
                <button class="dp-btn" data-nav="-1" aria-label="Previous month">‹</button>
                <div class="dp-title"></div>
                <button class="dp-btn" data-nav="1" aria-label="Next month">›</button>
            </div>
            <div class="dp-week">${WEEK.map(w => `<div style="text-align:center">${w}</div>`).join("")}</div>
            <div class="dp-grid"></div>
            <div class="dp-footer">
                <button class="dp-link" data-act="reset">Reset</button>
                <button class="dp-link" data-act="apply">Apply</button>
            </div>`;
        document.body.appendChild(dpRoot);
        dpTitle = $(".dp-title", dpRoot);
        dpGrid = $(".dp-grid", dpRoot);

        dpRoot.addEventListener("click", (e) => {
            const nav = e.target.closest("[data-nav]");
            if (nav) { dpCur.setMonth(dpCur.getMonth() + Number(nav.dataset.nav)); dpRender(); }

            const cell = e.target.closest(".dp-cell[data-date]");
            if (cell && !cell.classList.contains("is-disabled")) {
                $$(".dp-cell.sel", dpGrid).forEach(c => c.classList.remove("sel"));
                cell.classList.add("sel");
                dpGrid.dataset.sel = cell.dataset.date;
            }

            const act = e.target.closest("[data-act]");
            if (act) {
                if (act.dataset.act === "reset") {
                    dpActive.value = "";
                    dpActive.dataset.value = "";
                    clearError(dpActive);
                    dpClose();
                }
                if (act.dataset.act === "apply") {
                    const sel = dpGrid.dataset.sel;
                    if (sel) {
                        const d = new Date(sel);
                        dpActive.value = fmtHuman(d);
                        dpActive.dataset.value = fmt(d);
                        clearError(dpActive);

                        if (dpActive.id === 'departure') {
                            const ret = $("#return");
                            const retDateVal = ret.dataset.value;
                            if (retDateVal) {
                                if (new Date(retDateVal) < d) {
                                    ret.value = "";
                                    ret.dataset.value = "";
                                    clearError(ret);
                                }
                            }
                        }
                    }
                    dpClose();
                }
            }
        });

        document.addEventListener("keydown", e => { if (e.key === "Escape") dpClose(); });
        document.addEventListener("click", e => {
            if (dpRoot.classList.contains("open") && !dpRoot.contains(e.target) && e.target !== dpActive) dpClose();
        }, true);

        ["scroll", "resize"].forEach(evt => {
            window.addEventListener(evt, () => { if (dpRoot.classList.contains("open") && dpActive) dpPlace(dpActive); }, { passive: true });
        });
    }
}

function dpRender() {
    dpTitle.textContent = dpCur.toLocaleString(undefined, { month: "long", year: "numeric" });
    dpGrid.innerHTML = "";

    const first = new Date(dpCur.getFullYear(), dpCur.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));

    let minDate = today;
    if (dpActive?.id === "return" && $("#departure").dataset.value) {
        minDate = new Date($("#departure").dataset.value);
        minDate.setHours(0, 0, 0, 0);
    }

    const currentSel = dpActive?.dataset.value;
    dpGrid.dataset.sel = currentSel || '';

    for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const dDateOnly = new Date(d); dDateOnly.setHours(0, 0, 0, 0);

        const el = document.createElement("div");
        el.className = "dp-cell";
        el.textContent = d.getDate();
        el.dataset.date = fmt(d);

        if (dateEq(d, today)) el.classList.add("is-today");

        if (d.getMonth() !== dpCur.getMonth()) el.classList.add("is-out");

        if (dDateOnly.getTime() < minDate.getTime()) {
            el.classList.add("is-disabled");
        }

        if (currentSel && fmt(d) === currentSel) {
            el.classList.add("sel");
            dpGrid.dataset.sel = currentSel;
        }

        dpGrid.appendChild(el);
    }
}

function dpPlace(input) {
    dpRoot.classList.add('open'); 
    
    const r = input.getBoundingClientRect(), pad = 8;
    const w = dpRoot.offsetWidth, h = dpRoot.offsetHeight;
    
    let top = r.bottom + pad + window.scrollY; 
    let left = r.left + window.scrollX;

    if (r.bottom + h + pad > window.innerHeight) {
        top = r.top - h - pad + window.scrollY;
    }

    if (r.left + w + pad > window.innerWidth) {
        left = window.innerWidth - w - pad + window.scrollX;
    }
    
    dpRoot.style.top = Math.max(pad + window.scrollY, top) + "px";
    dpRoot.style.left = Math.max(pad + window.scrollX, left) + "px";
}

function dpOpen(input) {
    dpActive = input;
    dpCur = input.dataset.value ? new Date(input.dataset.value) : new Date();
    dpCur.setDate(1); 
    dpRender();
    
    dpPlace(input);
    
    dpRoot.classList.add("open"); 
    clearError(input);
}

function dpClose() { 
    dpRoot.classList.remove("open"); 
}


// --- 3. Validation and Error Display (без изменений) ---
function displayError(inputElement, message) {
    let errorEl = inputElement.parentElement.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.classList.add('error-message');
        inputElement.parentNode.insertBefore(errorEl, inputElement.nextSibling);
    }
    errorEl.textContent = message;
    inputElement.classList.add('is-invalid'); 
}

function clearError(inputElement) {
    const errorEl = inputElement.parentElement.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
    inputElement.classList.remove('is-invalid');
}


// --- 4. Main Initialization (без изменений) ---
window.addEventListener("DOMContentLoaded", () => {
    // Бургер-меню
    const burger = $("#burger");
    const mobileMenu = $("#mobileMenu");
    burger?.addEventListener("click", () => { 
        mobileMenu?.classList.toggle("open"); 
        document.body.classList.toggle("no-scroll"); 
        burger.classList.toggle("is-active");
        burger.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
    });
    
    // Пассажиры
    const pax = $("#passengers"), countEl = $("#count");
    const minusBtn = $("#minus"), plusBtn = $("#plus");
    const setPax = n => { 
        n = Math.min(12, Math.max(1, Number(n) || 1));
        pax.value = n;
        countEl.textContent = n;
        if (minusBtn) minusBtn.disabled = n <= 1;
        if (plusBtn) plusBtn.disabled = n >= 12;
    };
    if (minusBtn) minusBtn.addEventListener("click", () => setPax(pax.value - 1));
    if (plusBtn) plusBtn.addEventListener("click", () => setPax(+pax.value + 1));
    setPax(pax.value || 1);

    // Тип поездки (Round/One Way)
    const ret = $("#return"), dep = $("#departure");
    const retParent = ret.closest('div'); 
    
    $$('input[name="trip_type"]').forEach(r => {
        r.addEventListener("change", () => {
            const oneway = r.value === "oneway" && r.checked;
            ret.disabled = oneway; 
            
            retParent.classList.toggle('disabled-field', oneway);
            
            if (oneway) { 
                ret.value = ""; 
                ret.dataset.value = ""; 
                clearError(ret);
            } 
            
            if (dpRoot && dpRoot.classList.contains('open') && dpActive.id === 'return') {
                dpRender();
            }
        });
    });

    // Автокомплит
    autocomplete($("#from"), $("#from-list"));
    autocomplete($("#to"), $("#to-list"));

    // Дата-пикер
    dpBuild();
    dep.addEventListener("click", () => dpOpen(dep));
    ret.addEventListener("click", () => {
        if (!ret.disabled) {
            dpOpen(ret);
        }
    });

    // Форма
    $("#bookingForm").addEventListener("submit", (e) => {
        e.preventDefault();
        
        $$('.error-message').forEach(el => el.remove());
        $$('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        const data = {
            type: ($$('input[name="trip_type"]').find(r => r.checked) || {}).value || "round",
            from: $("#from").value.trim(),
            to: $("#to").value.trim(),
            depart: dep.dataset.value || "",
            ret: ret.dataset.value || "",
            pax: pax.value
        };
        
        let isValid = true;
        
        if (!data.from) { displayError($("#from"), "Please enter departure station."); isValid = false; }
        if (!data.to) { displayError($("#to"), "Please enter arrival station."); isValid = false; }
        if (data.from && data.to && data.from.toLowerCase() === data.to.toLowerCase()) { displayError($("#to"), "Departure and arrival must differ."); isValid = false; }

        if (!data.depart) { 
            displayError(dep, "Please select a departure date."); 
            isValid = false; 
        } 
        else {
            const departDate = new Date(data.depart);
            if (departDate < today) { displayError(dep, "Departure date cannot be in the past."); isValid = false; }
        }

        if (data.type === "round" && !ret.disabled) {
            if (!data.ret) { 
                displayError(ret, "Please select a return date."); 
                isValid = false; 
            } 
            else if (data.depart) {
                const departDate = new Date(data.depart);
                const returnDate = new Date(data.ret);
                if (returnDate < departDate) { displayError(ret, "Return date cannot be before departure."); isValid = false; }
            }
        }

        if (isValid) {
            const qs = new URLSearchParams(data).toString();
            console.log("Submitting form data:", data);
            location.href = `bus-list.html?${qs}`;
        }
    });
});
// FAQ
document.querySelectorAll(".faq details").forEach(d=>{
  const s = d.querySelector("summary");
  const dur = 300;
  d.style.overflow = "hidden";
  d.style.transition = `height ${dur}ms ease`;

  const setH = h=> d.style.height = h + "px";
  const collapsed = ()=> setH(s.offsetHeight);
  const expanded  = ()=> setH(d.scrollHeight);

  if(d.open) expanded(); else collapsed();

  s.addEventListener("click", e=>{
    e.preventDefault();
    if(!d.open){
      collapsed(); d.open = true; requestAnimationFrame(expanded);
    }else{
      expanded();  requestAnimationFrame(()=>{ collapsed(); setTimeout(()=>{ d.open=false; }, dur); });
    }
  });

  window.addEventListener("resize", ()=>{ if(d.open) expanded(); else collapsed(); });
});
const burger = document.getElementById('burger');
const drawer = document.getElementById('mobileMenu');

burger.addEventListener('click', ()=>{
  const isOpen = drawer.classList.toggle('open');
  burger.classList.toggle('is-active', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
  drawer.setAttribute('aria-hidden', String(!isOpen));
  document.body.classList.toggle('no-scroll', isOpen);
});

// по ESC и клику по ссылке закрываем 
document.addEventListener('keydown', e=>{
  if(e.key==='Escape' && drawer.classList.contains('open')) burger.click();
});
drawer.addEventListener('click', e=>{
  if(e.target.closest('.drawer-list a')) burger.click();
});
