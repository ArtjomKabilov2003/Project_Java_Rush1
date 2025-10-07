// $ — это сокращение для querySelector, 
// а $$ — для querySelectorAll, только второй сразу возвращает массив.
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];

// Stations
const Stations = [
    // Switzerland
    "Zermatt Bus Terminal",
    "Interlaken Ost Bus Station",
    "Grindelwald Bus Terminal",
    "Lauterbrunnen Bahnhof",
    "Lucerne Bahnhofquai",
    "Chamonix-Mont-Blanc Sud (France, near Swiss border)",
    "Geneva Bus Station",
    "Bern PostAuto Terminal",
    "Gstaad Bus Station",
    "St. Moritz Bahnhof PostAuto",
    "Verbier Village",
    "Davos Platz Postautohaltestelle",
    "Andermatt Gotthardpass",
    "Täsch Bahnhof (Shuttle to Zermatt)",
    "Flims Dorf Post",

    // France
    "Chamonix Sud Bus Station",
    "Annecy Gare Routière",
    "Grenoble Gare Routière",
    "Nice Airport (Bus to Alps)",
    "Bourg-Saint-Maurice Gare Routière",
    "Morzine Gare Routière",
    "Les Gets Gare Routière",
    "Val d'Isère Centre",
    "Courchevel 1850",
    "Megève Place du Village",

    // Italy
    "Aosta Autostazione",
    "Bolzano Autostazione",
    "Trento Autostazione",
    "Cortina d'Ampezzo Autostazione",
    "Bormio Bus Station",
    "Livigno Centro",
    "Merano Autostazione",
    "Sestriere Bus Stop",
    "Ortisei (St. Ulrich) Autostazione",
    "Canazei Piazza Marconi",

    // Austria
    "Innsbruck Hauptbahnhof Bus Terminal",
    "Salzburg Süd Busbahnhof",
    "Mayrhofen Bahnhof",
    "Lech am Arlberg Postamt",
    "Kitzbühel Hahnenkammbahn",
    "Ischgl Seilbahn",
    "Zell am See Postplatz",
    "Bad Gastein Bahnhof",
    "St. Anton am Arlberg Bahnhof",
    "Sölden Postamt",

    // Germany
    "Garmisch-Partenkirchen Bahnhof (Bus Station)",
    "Berchtesgaden Busbahnhof",
    "Oberstdorf Busbahnhof",
    "Füssen Bahnhof (Bus Station)",
    "Mittenwald Bahnhof (Bus Station)",

    // Slovenia
    "Bled Bus Station",
    "Bohinj Jezero",
    "Kranjska Gora Avtobusna Postaja"
];


//Autocomplete

function autocomplete(input, list){
  function show(items){
    list.innerHTML = items.slice(0,12).map((t,i)=>`<li data-i="${i}">${t}</li>`).join("");
    list.classList.toggle("show", items.length>0);
  }
  input.addEventListener("input", ()=>{
    const q = input.value.trim().toLowerCase();
    if(!q) return list.classList.remove("show");
    show(Stations.filter(s=>s.toLowerCase().includes(q)));
  });
  input.addEventListener("focus", ()=> show(Stations));
  list.addEventListener("click", (e)=>{
    const li = e.target.closest("li"); if(!li) return;
    input.value = li.textContent; list.classList.remove("show"); input.focus();
  });
  document.addEventListener("click", e=>{
    if(e.target!==input && !list.contains(e.target)) list.classList.remove("show");
  });
}



// Html Main
window.addEventListener("DOMContentLoaded", ()=>{
  // меню
  $("#burger")?.addEventListener("click", ()=>{ $("#mobileMenu")?.classList.add("open"); document.body.classList.add("no-scroll"); });
  $("#drawerClose")?.addEventListener("click", ()=>{ $("#mobileMenu")?.classList.remove("open"); document.body.classList.remove("no-scroll"); });

  // пассажиры
  const pax = $("#passengers"), countEl = $("#count");
  const setPax = n=>{ n=Math.min(12,Math.max(1,Number(n)||1)); pax.value=n; countEl.textContent=n; };
  $("#minus").addEventListener("click", ()=> setPax(pax.value-1));
  $("#plus").addEventListener("click",  ()=> setPax(+pax.value+1));
  setPax(pax.value||1);

  // тип поездки
  const ret = $("#return"), dep = $("#departure");
  $$('.segmented input[name="trip_type"]').forEach(r=>{
    r.addEventListener("change", ()=>{
      const oneway = r.value==="oneway" && r.checked;
      ret.disabled = oneway; ret.parentElement.style.opacity = oneway ? .6 : 1;
      if(oneway){ ret.value=""; ret.dataset.value=""; }
    });
  });

  // автокомплит
  autocomplete($("#from"), $("#from-list"));
  autocomplete($("#to"),   $("#to-list"));

 
  // форма
  $("#bookingForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = {
      type: ($$('input[name="trip_type"]').find(r=>r.checked)||{}).value || "round",
      from: $("#from").value.trim(),
      to:   $("#to").value.trim(),
      depart: dep.dataset.value || "",
      ret:    ret.dataset.value || "",
      pax:    pax.value
    };
    const errs=[];
    if(!data.from) errs.push("Please enter departure station.");
    if(!data.to) errs.push("Please enter arrival station.");
    if(data.from && data.to && data.from===data.to) errs.push("Departure and arrival must differ.");
    if(!data.depart) errs.push("Please select a departure date.");
    const t = new Date(); t.setHours(0,0,0,0);
    if(data.depart && new Date(data.depart)<t) errs.push("Departure date cannot be in the past.");
    if(data.type==="round"){
      if(!data.ret) errs.push("Please select a return date (round trip).");
      if(data.ret && data.depart && new Date(data.ret)<new Date(data.depart)) errs.push("Return date cannot be before departure.");
    }
    const n = +data.pax; if(!(n>=1 && n<=12)) errs.push("Passengers must be between 1 and 12.");
    if(errs.length) return alert(errs[0]);
    const qs = new URLSearchParams(data).toString();
    location.href = `bus-list.html?${qs}`;
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
// ==== элементы (как у тебя)
const leftMonthYearEl = document.getElementById('left-month-year');
const rightMonthYearEl = document.getElementById('right-month-year');
const prevMonthBtn     = document.getElementById('prev-month-btn');
const nextMonthBtn     = document.getElementById('next-month-btn');
const currMonthDatesEl = document.getElementById('curr-month-dates');
const nextMonthDatesEl = document.getElementById('next-month-dates');
const applyBtn         = document.querySelector('.calendar-footer .apply-btn');
const resetBtn         = document.querySelector('.calendar-footer .reset-btn');

// поля формы (у тебя уже есть)
const depInput = document.getElementById('departure');
const retInput = document.getElementById('return');

// утилиты
const pad = n => String(n).padStart(2,'0');
const toISO = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const toHuman = (d, loc='en-GB') => d.toLocaleDateString(loc, { day:'numeric', month:'long', year:'numeric' });
const sameDay = (a,b) => a && b && a.getFullYear()==b.getFullYear() && a.getMonth()==b.getMonth() && a.getDate()==b.getDate();
const between = (d, a, b) => a && b && d>=a && d<=b;

class Calendar {
  #left; #right;            // Date: 1-е число левого и правого месяцев
  #start = null;            // выбранный выезд
  #end = null;              // выбранный возврат (для round)
  #min = new Date();        // нельзя раньше сегодня

  constructor() {
    this.#min.setHours(0,0,0,0);
    const now = new Date(); now.setDate(1);
    this.#left  = new Date(now);
    this.#right = new Date(now.getFullYear(), now.getMonth()+1, 1);
  }

  init(){
    // восстановим из инпутов, если уже есть
    if (depInput?.dataset.value) this.#start = new Date(depInput.dataset.value);
    if (retInput?.dataset.value) this.#end   = new Date(retInput.dataset.value);
    this.render();

    prevMonthBtn.addEventListener('click', ()=>{ 
      const prev = new Date(this.#left.getFullYear(), this.#left.getMonth()-1, 1);
      const minM = new Date(this.#min.getFullYear(), this.#min.getMonth(), 1);
      if(prev < minM) return; // не листать в прошлое
      this.#left = prev;
      this.#right = new Date(prev.getFullYear(), prev.getMonth()+1, 1);
      this.render();
    });
    nextMonthBtn.addEventListener('click', ()=>{
      const next = new Date(this.#left.getFullYear(), this.#left.getMonth()+1, 1);
      this.#left = next;
      this.#right = new Date(next.getFullYear(), next.getMonth()+1, 1);
      this.render();
    });

    // делегирование кликов по дням
    const onClickDay = (e)=>{
      const btn = e.target.closest('button.date');
      if(!btn || btn.disabled) return;
      const iso = btn.dataset.date;
      const d = new Date(iso); d.setHours(0,0,0,0);

      const oneway = document.querySelector('.segmented input[name="trip_type"]:checked')?.value === 'oneway';
      if (oneway){
        this.#start = d; this.#end = null;
      } else {
        if(!this.#start || this.#end){ // начинаем новый диапазон
          this.#start = d; this.#end = null;
        } else if (d < this.#start){   // если кликнули раньше старта — перекинем
          this.#end = this.#start; this.#start = d;
        } else {
          this.#end = d;
        }
      }
      this.render();
    };
    currMonthDatesEl.addEventListener('click', onClickDay);
    nextMonthDatesEl.addEventListener('click', onClickDay);

    // Apply / Reset
    applyBtn?.addEventListener('click', ()=>{
      if(!this.#start) this.#start = new Date(this.#min);

      depInput.value = toHuman(this.#start);
      depInput.dataset.value = toISO(this.#start);

      const oneway = document.querySelector('.segmented input[name="trip_type"]:checked')?.value === 'oneway';
      if (oneway){
        retInput.value = ""; retInput.dataset.value = "";
      } else {
        const end = this.#end ? this.#end : new Date(this.#start.getFullYear(), this.#start.getMonth(), this.#start.getDate()+3);
        retInput.value = toHuman(end);
        retInput.dataset.value = toISO(end);
      }
      // чтобы твоя валидация/логика знала о смене
      depInput.dispatchEvent(new Event('change'));
      retInput.dispatchEvent(new Event('change'));
    });

    resetBtn?.addEventListener('click', ()=>{
      this.#start = this.#end = null;
      depInput.value = depInput.dataset.value = "";
      retInput.value = retInput.dataset.value = "";
      this.render();
    });

    // смена типа поездки — очищаем возврат и визуально дизейблим
    document.querySelectorAll('.segmented input[name="trip_type"]').forEach(r=>{
      r.addEventListener('change', ()=>{
        const oneway = (r.value==='oneway' && r.checked);
        retInput.disabled = oneway;
        retInput.parentElement.style.opacity = oneway ? .6 : 1;
        if(oneway){ this.#end = null; retInput.value=""; retInput.dataset.value=""; this.render(); }
      });
    });
  }

  render(){
    // заголовки
    leftMonthYearEl.textContent  = this.#left.toLocaleString('en',{month:'long',year:'numeric'});
    rightMonthYearEl.textContent = this.#right.toLocaleString('en',{month:'long',year:'numeric'});

    // перерисуем сетки
    currMonthDatesEl.innerHTML = this.#buildMonthHTML(this.#left);
    nextMonthDatesEl.innerHTML = this.#buildMonthHTML(this.#right);
  }

  #buildMonthHTML(baseDate){
    const y = baseDate.getFullYear(), m = baseDate.getMonth();
    const first = new Date(y, m, 1);
    const startIdx = (first.getDay()+6)%7; // Monday=0
    const dim = new Date(y, m+1, 0).getDate();

    let html = '';
    // пустые ячейки до 1-го
    for(let i=0;i<startIdx;i++) html += `<span class="empty"></span>`;

    for(let d=1; d<=dim; d++){
      const date = new Date(y, m, d); date.setHours(0,0,0,0);
      const iso = toISO(date);
      let cls = "date";
      if (this.#start && !this.#end && sameDay(date, this.#start)) cls += " selected range-start";
      if (this.#end) {
        if (sameDay(date, this.#start)) cls += " selected range-start";
        else if (sameDay(date, this.#end)) cls += " selected range-end";
        else if (between(date, this.#start, this.#end)) cls += " in-range";
      }
      const disabled = date < this.#min ? ' disabled' : '';
      html += `<button class="${cls}" data-date="${iso}"${disabled}>${d}</button>`;
    }
    return html;
  }
}

// инициализация
const calendar = new Calendar();
calendar.init();

// ВАЖНО: твоя форма уже делает redirect на bus-list.html.
// Если у тебя есть своя валидация — оставь. На всякий случай — быстрая проверка:
document.getElementById('bookingForm')?.addEventListener('submit', (e)=>{
  const type = document.querySelector('.segmented input[name="trip_type"]:checked')?.value || 'round';
  const depISO = depInput.dataset.value || "";
  const retISO = retInput.dataset.value || "";
  const errs = [];
  if (!depISO) errs.push('Please select a departure date.');
  if (type==='round' && !retISO) errs.push('Please select a return date.');
  if (type==='round' && depISO && retISO && new Date(retISO) < new Date(depISO)) errs.push('Return date cannot be before departure.');
  if (errs.length){ e.preventDefault(); alert(errs[0]); }
  // если всё ок — уйдут параметры, т.к. в input.value мы не трогаем ISO;
  // при желании можно перед сабмитом принудительно: depInput.value=depISO; if(type==='round') retInput.value=retISO;
});
