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

const $ = (s,el=document)=>el.querySelector(s);

/* ===== AUTOCOMPLETE ===== */
function attachAutocomplete(input, list){
  function render(items){
    list.innerHTML = "";
    if(!items.length){ list.classList.remove("show"); input.setAttribute("aria-expanded","false"); return; }
    items.slice(0,12).forEach((s,i)=>{
      const li = document.createElement("li");
      li.role="option"; li.id=`${input.id}-opt-${i}`; li.textContent=s;
      li.addEventListener("click", ()=>{ input.value = s; list.classList.remove("show"); input.setAttribute("aria-expanded","false"); input.focus(); });
      list.appendChild(li);
    });
    list.classList.add("show"); input.setAttribute("aria-expanded","true");
  }
  input.addEventListener("input", ()=>{
    const q = input.value.trim().toLowerCase();
    if(!q){ list.classList.remove("show"); input.setAttribute("aria-expanded","false"); return; }
    render(Stations.filter(s=>s.toLowerCase().includes(q)));
  });
  input.addEventListener("focus", ()=> render(Stations));
  document.addEventListener("click", (e)=>{
    if(!list.contains(e.target) && e.target!==input){ list.classList.remove("show"); input.setAttribute("aria-expanded","false"); }
  });
}

/* ===== DATEPICKER (lightweight) ===== */
const dp = (function(){
  let root, title, grid, week, activeInput, cur;
  const WEEK = Array.from({length:7},(_,i)=> new Date(2025,0,i+5).toLocaleDateString(undefined,{weekday:"short"}).slice(0,2)); // Mo Tu...
  const today = new Date(); today.setHours(0,0,0,0);

  function fmt(d){ // YYYY-MM-DD
    const m = `${d.getMonth()+1}`.padStart(2,"0");
    const day = `${d.getDate()}`.padStart(2,"0");
    return `${d.getFullYear()}-${m}-${day}`;
  }
  function fmtHuman(d){ // DD.MM.YYYY
    const day = `${d.getDate()}`.padStart(2,"0");
    const m = `${d.getMonth()+1}`.padStart(2,"0");
    return `${day}.${m}.${d.getFullYear()}`;
  }

  function mount(){
    root = document.createElement("div"); root.className = "dp"; root.setAttribute("role","dialog");
    root.innerHTML = `
      <div class="dp-header">
        <button class="dp-btn" data-nav="-1" aria-label="Prev month">‹</button>
        <div class="dp-title"></div>
        <button class="dp-btn" data-nav="1" aria-label="Next month">›</button>
      </div>
      <div class="dp-week"></div>
      <div class="dp-grid"></div>
      <div class="dp-footer">
        <button class="dp-link" data-act="reset">Reset</button>
        <button class="dp-link" data-act="apply">Apply</button>
      </div>`;
    document.body.appendChild(root);
    title = $(".dp-title",root); grid = $(".dp-grid",root); week = $(".dp-week",root);
    week.innerHTML = WEEK.map(w=>`<div style="text-align:center">${w}</div>`).join("");

    root.addEventListener("click",(e)=>{
      const btn = e.target.closest(".dp-btn");
      if(btn){ cur.setMonth(cur.getMonth()+Number(btn.dataset.nav)); render(); }
      const cell = e.target.closest(".dp-cell[data-date]");
      if(cell){ [...grid.children].forEach(c=>c.classList.remove("sel")); cell.classList.add("sel"); grid.dataset.sel = cell.dataset.date; }
      const act = e.target.closest("[data-act]");
      if(act){
        if(act.dataset.act==="reset"){ activeInput.value = ""; activeInput.dataset.value = ""; close(); }
        if(act.dataset.act==="apply"){
          const sel = grid.dataset.sel;
          if(sel){ const d = new Date(sel); activeInput.value = fmtHuman(d); activeInput.dataset.value = fmt(d); }
          close();
        }
      }
    });
    document.addEventListener("keydown", e=>{ if(e.key==="Escape") close(); });
    document.addEventListener("click", e=>{ if(root.classList.contains("open") && !root.contains(e.target) && e.target!==activeInput) close(); }, true);
  }

  function render(){
    title.textContent = cur.toLocaleString(undefined,{month:"long", year:"numeric"});
    grid.innerHTML = "";
    const first = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - ((first.getDay()+6)%7)); // Monday start
    const minDate = activeInput.id==="return" && $("#departure").dataset.value ? new Date($("#departure").dataset.value) : today;
    for(let i=0;i<42;i++){
      const d = new Date(start); d.setDate(start.getDate()+i);
      const cell = document.createElement("div");
      cell.className = "dp-cell";
      cell.textContent = d.getDate();
      cell.dataset.date = fmt(d);
      if(d.getMonth()!==cur.getMonth()) cell.style.opacity=".45";
      if(d < minDate) cell.classList.add("dis");
      if(activeInput.dataset.value && fmt(d)===activeInput.dataset.value) cell.classList.add("sel");
      grid.appendChild(cell);
    }
  }

  function openFor(input){
    activeInput = input;
    cur = activeInput.dataset.value ? new Date(activeInput.dataset.value) : new Date();
    cur.setDate(1);
    render();
    // position near input
    const r = input.getBoundingClientRect();
    const top = Math.min(window.innerHeight-360, r.bottom+8);
    const left = Math.min(window.innerWidth-340, r.left);
    root.style.transform = `translate(${left}px,${top + window.scrollY}px)`;
    root.classList.add("open");
  }
  function close(){ root.classList.remove("open"); }
  return { init(){
      if(!root) mount();
      $("#departure").addEventListener("click",()=>openFor($("#departure")));
      $("#return").addEventListener("click",()=>openFor($("#return")));
    }
  };
})();

/* ===== MAIN ===== */
window.addEventListener("DOMContentLoaded", () => {
  // burger
  const burger = $("#burger"), drawer = $("#mobileMenu"), closeBtn = $("#drawerClose");
  const openMenu = ()=>{ drawer.classList.add("open"); burger.setAttribute("aria-expanded","true"); document.body.classList.add("no-scroll"); };
  const closeMenu = ()=>{ drawer.classList.remove("open"); burger.setAttribute("aria-expanded","false"); document.body.classList.remove("no-scroll"); };
  burger?.addEventListener("click", openMenu);
  closeBtn?.addEventListener("click", closeMenu);

  // passengers
  const minus = $("#minus"), plus = $("#plus"), countEl = $("#count"), pax = $("#passengers");
  const setPax = n => { n=Math.min(12,Math.max(1,Number(n)||1)); countEl.textContent=n; pax.value=n; };
  minus.addEventListener("click",()=>setPax(Number(pax.value)-1));
  plus.addEventListener("click",()=>setPax(Number(pax.value)+1));
  setPax(pax.value||1);

  // trip type -> disable return
  const ret = $("#return"), dep = $("#departure");
  const radios = [...document.querySelectorAll('input[name="trip_type"]')];
  function syncTrip(){
    const one = radios.some(r=>r.checked && r.value==="oneway");
    ret.disabled = one; ret.parentElement.style.opacity = one ? .6 : 1;
    if(one){ ret.value=""; ret.dataset.value=""; }
  }
  radios.forEach(r=>r.addEventListener("change", syncTrip)); syncTrip();

  // autocomplete
  attachAutocomplete($("#from"), $("#from-list"));
  attachAutocomplete($("#to"), $("#to-list"));

  // datepicker
  dp.init();

  // submit + validation + redirect
  $("#bookingForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = {
      type: radios.find(r=>r.checked)?.value || "round",
      from: $("#from").value.trim(),
      to: $("#to").value.trim(),
      depart: dep.dataset.value || "",
      ret: ret.dataset.value || "",
      pax: pax.value
    };
    const errs = [];
    if(!data.from) errs.push("Please enter departure station.");
    if(!data.to) errs.push("Please enter arrival station.");
    if(data.from && data.to && data.from===data.to) errs.push("Departure and arrival must differ.");
    if(!data.depart) errs.push("Please select a departure date.");
    const today = new Date(); today.setHours(0,0,0,0);
    if(data.depart && new Date(data.depart) < today) errs.push("Departure date cannot be in the past.");
    if(data.type==="round"){
      if(!data.ret) errs.push("Please select a return date (round trip).");
      if(data.ret && data.depart && new Date(data.ret) < new Date(data.depart)) errs.push("Return date cannot be before departure.");
    }
    const n = Number(data.pax); if(!(n>=1 && n<=12)) errs.push("Passengers must be between 1 and 12.");
    if(errs.length){ alert(errs[0]); return; }
    const qs = new URLSearchParams(data).toString();
    window.location.href = `bus-list.html?${qs}`;
  });
});