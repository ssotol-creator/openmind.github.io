// script.js - interactivity for OPENMIND
document.addEventListener('DOMContentLoaded', ()=>{

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', ()=> {
    document.body.classList.toggle('theme-night');
    document.body.classList.toggle('theme-day');
    playFx();
  });

  // Sound toggle and audio elements
  const bgAudio = document.getElementById('bgAudio');
  const fxAudio = document.getElementById('fxAudio');
  const soundToggle = document.getElementById('soundToggle');
  let soundOn = true;
  // try autoplay (may be blocked by browser)
  function tryPlayBg(){ if(soundOn){ bgAudio.volume = 0.28; bgAudio.play().catch(()=>{}); } }
  tryPlayBg();
  soundToggle.addEventListener('click', ()=> {
    soundOn = !soundOn;
    if(soundOn){ bgAudio.play().catch(()=>{}); soundToggle.textContent='🔊' } else { bgAudio.pause(); soundToggle.textContent='🔈' }
    playFx();
  });

  // Play fx
  function playFx(){ try{ fxAudio.currentTime=0; fxAudio.play(); }catch(e){} }

  // Accordion toggles with fx
  document.querySelectorAll('.toggle-acc').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const card = btn.closest('.card');
      card.classList.toggle('open');
      if(card.classList.contains('open')) {
        card.querySelector('.acc-panel').style.maxHeight = card.querySelector('.acc-panel').scrollHeight + 'px';
      } else {
        card.querySelector('.acc-panel').style.maxHeight = 0;
      }
      if(soundOn) playFx();
    })
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(t=>{
    t.addEventListener('click', ()=>{
      document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      const tab = t.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(c=>c.classList.add('hidden'));
      document.getElementById(tab).classList.remove('hidden');
      if(soundOn) playFx();
    })
  });

  // Tests quick links scroll
  document.querySelectorAll('[data-test]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const test = a.dataset.test;
      document.getElementById('tests').scrollIntoView({behavior:'smooth'});
      if(soundOn) playFx();
    })
  });

  // Suggestions CSV logic using localStorage
  const suggestionForm = document.getElementById('suggestionForm');
  const STORAGE_KEY = 'openmind_suggestions_v21';
  function loadSuggestions(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch(e){ return []; } }
  function saveSuggestions(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

  suggestionForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const rating = document.getElementById('rating').value;
    const feeling = document.getElementById('feeling').value;
    const comment = document.getElementById('comment').value.replace(/\n/g, ' ');
    const timestamp = new Date().toISOString();
    const arr = loadSuggestions();
    arr.push({ timestamp, rating, feeling, comment });
    saveSuggestions(arr);
    // generate CSV and download
    const headers = ['timestamp','rating','feeling','comment'];
    const rows = [headers].concat(arr.map(r=>[r.timestamp,r.rating,r.feeling,r.comment]));
    const csv = rows.map(r=> r.map(c=>{
      if(c==null) return '';
      const s = String(c).replace(/"/g,'""');
      if(s.search(/[,\"\n]/)>=0) return `"${s}"`; else return s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sugerencias.csv'; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    if(soundOn) playFx();
    alert('Gracias — tu sugerencia se descargó como sugerencias.csv y quedó guardada localmente.');
    document.getElementById('comment').value = '';
  });

  document.getElementById('clearBtn').addEventListener('click', ()=>{
    if(!confirm('¿Eliminar todas las sugerencias guardadas localmente?')) return;
    localStorage.removeItem(STORAGE_KEY);
    if(soundOn) playFx();
    alert('Acumulado eliminado.');
  });

  // Wellbeing form simple submit (no external send)
  document.getElementById('wellForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    if(soundOn) playFx();
    alert('Gracias por completar el test. Esto es solo orientativo.');
  });

  // Small interactions with glow on hover
  document.querySelectorAll('.btn, .neon-btn').forEach(b=>{
    b.addEventListener('mouseenter', ()=>{ if(soundOn) playFx(); });
  });

  // Cursor magic: particles drawn on canvas following pointer
  const canvas = document.getElementById('cursorCanvas');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  let particles = [];
  function addParticle(x,y){
    particles.push({x,y,vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2, life:60, size: 6+Math.random()*6, hue: Math.random()*360});
  }
  window.addEventListener('pointermove', (e)=>{ addParticle(e.clientX, e.clientY); });
  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.life--;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},100%,60%,${p.life/70})`;
      ctx.arc(p.x, p.y, p.size * (p.life/70), 0, Math.PI*2);
      ctx.fill();
      if(p.life<=0) particles.splice(i,1);
    }
    requestAnimationFrame(loop);
  }
  loop();

  // Small wiggle animation for elements when opened
  const observer = new MutationObserver((muts)=>{
    muts.forEach(m=>{
      m.addedNodes.forEach(n=>{
        if(n.classList && n.classList.contains('open')){
          n.animate([{transform:'scale(0.98)'},{transform:'scale(1.02)'},{transform:'scale(1)'}],{duration:500,iterations:1});
        }
      });
    });
  });
  document.querySelectorAll('.card').forEach(c=>observer.observe(c,{attributes:true,childList:true,subtree:false}));

});


// ---- Activar blur en tarjetas al abrir ----
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const bg = card.querySelector(".card-background");
    if (bg) {
      bg.classList.add("blur");
    }
  });
});

// ---- Quitar blur al cerrar modal ----
document.querySelectorAll(".close-modal").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".card-background").forEach(bg => {
      bg.classList.remove("blur");
    });
  });
});



// 📈 Recomendaciones por Porcentaje de Bienestar Mental
function mostrarRecomendaciones(porcentaje) {
  let mensaje = "";

  if (porcentaje >= 90 && porcentaje <= 100) {
    mensaje = `
      <h3>🏆 Nivel de Bienestar: 90–100%</h3>
      <ul>
        <li>✅ Continúa tus prácticas actuales</li>
        <li>✅ Comparte tus estrategias con otros</li>
        <li>✅ Mantén el equilibrio vida-trabajo</li>
        <li>✅ Sé mentor de bienestar para otros</li>
      </ul>
    `;
  } else if (porcentaje >= 70 && porcentaje <= 89) {
    mensaje = `
      <h3>🌟 Nivel de Bienestar: 70–89%</h3>
      <ul>
        <li>✅ Establece una rutina de mindfulness</li>
        <li>✅ Practica gratitud diaria</li>
        <li>✅ Mantén conexiones sociales significativas</li>
        <li>✅ Establece límites saludables</li>
      </ul>
    `;
  } else if (porcentaje >= 50 && porcentaje <= 69) {
    mensaje = `
      <h3>📚 Nivel de Bienestar: 50–69%</h3>
      <ul>
        <li>✅ Busca apoyo profesional preventivo</li>
        <li>✅ Establece una rutina de autocuidado básico</li>
        <li>✅ Practica técnicas de respiración diaria</li>
        <li>✅ Reduce compromisos innecesarios</li>
      </ul>
    `;
  } else if (porcentaje >= 0 && porcentaje <= 49) {
    mensaje = `
      <h3>🆘 Nivel de Bienestar: 0–49%</h3>
      <ul>
        <li>✅ Contacta un profesional de salud mental hoy</li>
        <li>✅ Comparte tus sentimientos con alguien de confianza</li>
        <li>✅ Elimina fuentes de estrés innecesarias</li>
        <li>✅ Prioriza descanso y nutrición básica</li>
      </ul>
    `;
  }

  // Mensaje positivo final
  mensaje += `
    <div class="mensaje-final">
      <p>🌈 Donde quiera que estés en tu camino de bienestar, recuerda:</p>
      <p>Cada día es una nueva oportunidad para cuidar de ti mismo/a.</p>
      <p>Tu valor no depende de tu estado mental actual.</p>
      <p>Mereces apoyo, comprensión y cuidado.</p>
      <p><strong>¡Tú importas! 💖</strong></p>
      <hr>
      <p><strong>🌟 Contacto de Apoyo Inmediato:</strong></p>
      <p>Línea 106: #106 (24/7)<br>
      WhatsApp OPENMIND: <a href="https://wa.me/573023265907" target="_blank">wa.me/573023265907</a><br>
      Psicóloga Ana Rodríguez: 320 654 9871</p>
    </div>
  `;

  // Mostrar el mensaje en el contenedor de resultados
  const resultadoDiv = document.getElementById("resultado");
  if (resultadoDiv) {
    resultadoDiv.innerHTML += mensaje;
  }
}
