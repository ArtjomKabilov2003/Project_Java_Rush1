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

// Autocomplete
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

// Утилиты для календаря
const pad = n => String(n).padStart(2,'0');
const toISO = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const toHuman = (d, loc='en-GB') => d.toLocaleDateString(loc, { day:'numeric', month:'long', year:'numeric' });
const sameDay = (a,b) => a && b && a.getFullYear()==b.getFullYear() && a.getMonth()==b.getMonth() && a.getDate()==b.getDate();
const between = (d, a, b) => a && b && d>=a && d<=b;

// Calendar class
// Calendar class
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
    // Получаем элементы с проверкой на существование
    const depInput = document.getElementById('departure');
    const retInput = document.getElementById('return');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const resetBtn = document.querySelector('.calendar-footer .reset-btn');
    const currMonthDatesEl = document.getElementById('curr-month-dates');
    const nextMonthDatesEl = document.getElementById('next-month-dates');

    // Если календарь не найден на странице, выходим
    if (!currMonthDatesEl || !nextMonthDatesEl) {
      console.log('Calendar elements not found on this page');
      return;
    }

    // восстановим из инпутов, если уже есть
    if (depInput?.dataset.value) this.#start = new Date(depInput.dataset.value);
    if (retInput?.dataset.value) this.#end   = new Date(retInput.dataset.value);
    
    this.render();

    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', ()=>{ 
        const prev = new Date(this.#left.getFullYear(), this.#left.getMonth()-1, 1);
        const minM = new Date(this.#min.getFullYear(), this.#min.getMonth(), 1);
        if(prev < minM) return; // не листать в прошлое
        this.#left = prev;
        this.#right = new Date(prev.getFullYear(), prev.getMonth()+1, 1);
        this.render();
      });
    }
    
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', ()=>{
        const next = new Date(this.#left.getFullYear(), this.#left.getMonth()+1, 1);
        this.#left = next;
        this.#right = new Date(next.getFullYear(), next.getMonth()+1, 1);
        this.render();
      });
    }

    // делегирование кликов по дням
    const onClickDay = (e)=>{
      const btn = e.target.closest('button.date');
      if(!btn || btn.disabled) return;
      const iso = btn.dataset.date;
      const d = new Date(iso); d.setHours(0,0,0,0);

      const oneway = document.querySelector('.segmented input[name="trip_type"]:checked')?.value === 'oneway';
      
      if (oneway){
        // Для one-way просто выбираем дату
        this.#start = d; 
        this.#end = null;
        
        // Автоматически обновляем поля ввода
        if (depInput) {
          depInput.value = toHuman(d);
          depInput.dataset.value = toISO(d);
        }
        if (retInput) {
          retInput.value = "";
          retInput.dataset.value = "";
        }
      } else {
        // Для round trip выбираем диапазон
        if(!this.#start || this.#end){ 
          // Начинаем новый диапазон
          this.#start = d; 
          this.#end = null;
        } else if (d < this.#start){   
          // Если кликнули раньше старта — перекидываем
          this.#end = this.#start; 
          this.#start = d;
        } else {
          // Завершаем выбор диапазона
          this.#end = d;
          
          // Автоматически обновляем поля ввода
          if (depInput && this.#start) {
            depInput.value = toHuman(this.#start);
            depInput.dataset.value = toISO(this.#start);
          }
          if (retInput && this.#end) {
            retInput.value = toHuman(this.#end);
            retInput.dataset.value = toISO(this.#end);
          }
        }
      }
      this.render();
    };
    
    currMonthDatesEl.addEventListener('click', onClickDay);
    nextMonthDatesEl.addEventListener('click', onClickDay);

    // Reset
    if (resetBtn) {
      resetBtn.addEventListener('click', ()=>{
        this.#start = this.#end = null;
        if (depInput) {
          depInput.value = depInput.dataset.value = "";
        }
        if (retInput) {
          retInput.value = retInput.dataset.value = "";
        }
        this.render();
      });
    }

    // смена типа поездки — очищаем возврат и визуально дизейблим
    document.querySelectorAll('.segmented input[name="trip_type"]').forEach(r=>{
      r.addEventListener('change', ()=>{
        const oneway = (r.value==='oneway' && r.checked);
        if (retInput) {
          retInput.disabled = oneway;
          if (retInput.parentElement) {
            retInput.parentElement.style.opacity = oneway ? .6 : 1;
          }
          if(oneway){ 
            this.#end = null; 
            retInput.value=""; 
            retInput.dataset.value=""; 
            this.render(); 
          }
        }
      });
    });
  }

  render(){
    const leftMonthYearEl = document.getElementById('left-month-year');
    const rightMonthYearEl = document.getElementById('right-month-year');
    const currMonthDatesEl = document.getElementById('curr-month-dates');
    const nextMonthDatesEl = document.getElementById('next-month-dates');

    // Проверяем существование элементов
    if (!leftMonthYearEl || !rightMonthYearEl || !currMonthDatesEl || !nextMonthDatesEl) {
      return;
    }

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
      
      // Определяем классы для визуального выделения
      let cls = "date";
      
      if (this.#start && sameDay(date, this.#start)) {
        cls += " range-start";
        if (this.#end && sameDay(date, this.#end)) {
          cls += " range-start-end"; // Если начало и конец совпадают
        }
      } else if (this.#end && sameDay(date, this.#end)) {
        cls += " range-end";
      } else if (this.#start && this.#end && between(date, this.#start, this.#end)) {
        cls += " in-range";
      }
      
      const disabled = date < this.#min ? ' disabled' : '';
      html += `<button class="${cls}" data-date="${iso}"${disabled}>${d}</button>`;
    }
    return html;
  }
}

// Html Main
window.addEventListener("DOMContentLoaded", ()=>{
  // Инициализация только если есть форма бронирования
  const bookingForm = document.getElementById('bookingForm');
  
  if (bookingForm) {
    // пассажиры
    const pax = $("#passengers"), countEl = $("#count");
    
    if (pax && countEl) {
      const setPax = n => {
        n = Math.min(12, Math.max(1, Number(n) || 1));
        pax.value = n;              // обновляем hidden input
        countEl.textContent = n;    // обновляем отображение
      };
      
      const minusBtn = $("#minus");
      const plusBtn = $("#plus");
      
      if (minusBtn) {
        minusBtn.addEventListener("click", ()=> setPax(pax.value-1));
      }
      
      if (plusBtn) {
        plusBtn.addEventListener("click",  ()=> setPax(+pax.value+1));
      }
      
      setPax(pax.value||1);
    }

    // тип поездки
    const ret = $("#return");
    const tripTypeRadios = $$('.segmented input[name="trip_type"]');
    
    if (ret && tripTypeRadios.length > 0) {
      tripTypeRadios.forEach(r=>{
        r.addEventListener("change", ()=>{
          const oneway = r.value==="oneway" && r.checked;
          ret.disabled = oneway; 
          if (ret.parentElement) {
            ret.parentElement.style.opacity = oneway ? .6 : 1;
          }
          if(oneway){ 
            ret.value=""; 
            ret.dataset.value=""; 
          }
        });
      });
    }

    // автокомплит
    const fromInput = $("#from");
    const fromList = $("#from-list");
    const toInput = $("#to");
    const toList = $("#to-list");
    
    if (fromInput && fromList) {
      autocomplete(fromInput, fromList);
    }
    
    if (toInput && toList) {
      autocomplete(toInput, toList);
    }

        // форма - ИСПРАВЛЕННАЯ ВЕРСИЯ
    bookingForm.addEventListener("submit", (e)=>{
      e.preventDefault();
      
      // Получаем элементы с проверкой
      const depInput = document.getElementById('departure');
      const retInput = document.getElementById('return');
      const fromInput = document.getElementById('from');
      const toInput = document.getElementById('to');
      const paxInput = document.getElementById('passengers');
      
      if (!depInput || !fromInput || !toInput || !paxInput) {
        alert("Form elements not found");
        return;
      }
      
      // Получаем актуальные значения из календаря
      const oneway = document.querySelector('.segmented input[name="trip_type"]:checked')?.value === 'oneway';
      
      // Получаем выбранные даты
      let departDate = depInput.dataset?.value || "";
      let returnDate = retInput?.dataset?.value || "";
      
      // Если дата отправления не выбрана, используем сегодняшнюю
      if (!departDate) {
        const today = new Date();
        departDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      }

      const data = {
        type: ($$('input[name="trip_type"]').find(r=>r.checked)||{}).value || "round",
        from: fromInput.value.trim(),
        to: toInput.value.trim(),
        departure: departDate,
        return: oneway ? "" : returnDate,
        passengers: paxInput.value
      };

      // Валидация
      const errs=[];
      if(!data.from) errs.push("Please enter departure station.");
      if(!data.to) errs.push("Please enter arrival station.");
      if(data.from && data.to && data.from===data.to) errs.push("Departure and arrival must differ.");
      
      const today = new Date(); today.setHours(0,0,0,0);
      if(data.departure && new Date(data.departure) < today) errs.push("Departure date cannot be in the past.");
      
      // ДОБАВЛЯЕМ проверку для round trip - дата возвращения обязательна
      if(data.type==="round" && !data.return) {
        errs.push("Please select return date for round trip.");
      }
      
      if(data.type==="round" && data.return){
        if(new Date(data.return) < new Date(data.departure)) errs.push("Return date cannot be before departure.");
      }
      
      const n = +data.passengers; 
      if(!(n>=1 && n<=12)) errs.push("Passengers must be between 1 and 12.");
      
      if(errs.length) return alert(errs[0]);
      
      // Формируем URL с параметрами
      const qs = new URLSearchParams();
      qs.append('from', data.from);
      qs.append('to', data.to);
      qs.append('departure', data.departure);
      if (data.return) qs.append('return', data.return);
      qs.append('passengers', data.passengers);
      qs.append('type', data.type);
      
      location.href = `bus-list.html?${qs.toString()}`;
    });

    // Инициализация календаря
    const calendar = new Calendar();
    calendar.init();
  }

  // Инициализация FAQ если есть на странице
  const faqElements = document.querySelectorAll(".faq details");
  if (faqElements.length > 0) {
    faqElements.forEach(d=>{
      const s = d.querySelector("summary");
      if (!s) return;
      
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
  }

  // Мобильное меню
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('mobileMenu');

  if (burger && drawer) {
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
  }
});