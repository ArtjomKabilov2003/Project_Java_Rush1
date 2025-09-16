// $ — это сокращение для querySelector, 
// а $$ — для querySelectorAll, только второй сразу возвращает массив.
/*const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
*/
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
/* 
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

//Datepicker
let dpRoot, dpGrid, dpTitle, dpActive, dpCur = new Date();
const WEEK = ["Mo","Tu","We","Th","Fr","Sa","Su"];
const today = new Date(); today.setHours(0,0,0,0);

function pad(n){ return String(n).padStart(2,"0"); }
function fmt(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function fmtHuman(d){ return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()}`; }

function dpBuild(){
  dpRoot = document.createElement("div");
  dpRoot.className = "dp";
  dpRoot.innerHTML = `
    <div class="dp-header">
      <button class="dp-btn" data-nav="-1">‹</button>
      <div class="dp-title"></div>
      <button class="dp-btn" data-nav="1">›</button>
    </div>
    <div class="dp-week">${WEEK.map(w=>`<div style="text-align:center">${w}</div>`).join("")}</div>
    <div class="dp-grid"></div>
    <div class="dp-footer">
      <button class="dp-link" data-act="reset">Reset</button>
      <button class="dp-link" data-act="apply">Apply</button>
    </div>`;
  document.body.appendChild(dpRoot);
  dpTitle = $(".dp-title", dpRoot);
  dpGrid  = $(".dp-grid", dpRoot);

  dpRoot.addEventListener("click", (e)=>{
    const nav = e.target.closest("[data-nav]");
    if(nav){ dpCur.setMonth(dpCur.getMonth() + Number(nav.dataset.nav)); dpRender(); }

    const cell = e.target.closest(".dp-cell[data-date]");
    if(cell){ $$(".dp-cell.sel", dpGrid).forEach(c=>c.classList.remove("sel")); cell.classList.add("sel"); dpGrid.dataset.sel = cell.dataset.date; }

    const act = e.target.closest("[data-act]");
    if(act){
      if(act.dataset.act==="reset"){ dpActive.value=""; dpActive.dataset.value=""; dpClose(); }
      if(act.dataset.act==="apply"){
        const sel = dpGrid.dataset.sel;
        if(sel){ const d = new Date(sel); dpActive.value = fmtHuman(d); dpActive.dataset.value = fmt(d); }
        dpClose();
      }
    }
  });

  document.addEventListener("keydown", e=>{ if(e.key==="Escape") dpClose(); });
  document.addEventListener("click", e=>{
    if(dpRoot.classList.contains("open") && !dpRoot.contains(e.target) && e.target!==dpActive) dpClose();
  }, true);

  ["scroll","resize"].forEach(evt=>{
    window.addEventListener(evt, ()=>{ if(dpRoot.classList.contains("open") && dpActive) dpPlace(dpActive); }, {passive:true});
  });
}

function dpRender(){
  dpTitle.textContent = dpCur.toLocaleString(undefined,{month:"long", year:"numeric"});
  dpGrid.innerHTML = "";
  const first = new Date(dpCur.getFullYear(), dpCur.getMonth(), 1);
  const start = new Date(first); start.setDate(1 - ((first.getDay()+6)%7)); // Пн
  const minDate = (dpActive?.id==="return" && $("#departure").dataset.value) ? new Date($("#departure").dataset.value) : today;

  for(let i=0;i<42;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    const el = document.createElement("div");
    el.className = "dp-cell";
    el.textContent = d.getDate();
    el.dataset.date = fmt(d);
    if(d.getMonth()!==dpCur.getMonth()) el.style.opacity=".45";
    if(d < minDate) el.classList.add("dis");
    if(dpActive?.dataset.value && fmt(d)===dpActive.dataset.value) el.classList.add("sel");
    dpGrid.appendChild(el);
  }
}

function dpPlace(input){
  const r = input.getBoundingClientRect(), pad = 8;
  const w = dpRoot.offsetWidth || 320, h = dpRoot.offsetHeight || 360;
  let top  = Math.min(window.innerHeight - h - pad, r.bottom + pad);
  let left = Math.min(window.innerWidth  - w - pad, r.left);
  dpRoot.style.top  = Math.max(pad, top)  + "px";
  dpRoot.style.left = Math.max(pad, left) + "px";
}

function dpOpen(input){
  dpActive = input;
  dpCur = input.dataset.value ? new Date(input.dataset.value) : new Date();
  dpCur.setDate(1);
  dpRender();
  dpRoot.classList.add("open");
  dpPlace(input);
}
function dpClose(){ dpRoot.classList.remove("open"); }

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
  $$('.trip-type input[name="trip_type"]').forEach(r=>{
    r.addEventListener("change", ()=>{
      const oneway = r.value==="oneway" && r.checked;
      ret.disabled = oneway; ret.parentElement.style.opacity = oneway ? .6 : 1;
      if(oneway){ ret.value=""; ret.dataset.value=""; }
    });
  });

  // автокомплит
  autocomplete($("#from"), $("#from-list"));
  autocomplete($("#to"),   $("#to-list"));

  // дата-пикер
  dpBuild();
  dep.addEventListener("click", ()=> dpOpen(dep));
  ret.addEventListener("click", ()=> dpOpen(ret));

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
*/
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
