(function(){
  const canvas = document.getElementById("spiralCanvas");
  const ctx = canvas.getContext("2d");

  const params = {
    arms: 3,
    turns: 7,
    density: 0.6,
    radius: 180,
    thickness: 3,
    twist: 0.2,
    noiseAmp: 0.15,
    color1: "#7c3aed",
    color2: "#06b6d4",
    background: "#020617"
  };

  let morphT = 0;
  let playing = true;

  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function draw(){
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (!W || !H) return;

    ctx.fillStyle = params.background;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.lineCap = "round";

    const total = Math.max(60, Math.floor(params.density * 2000));
    const twoPi = Math.PI * 2;

    for(let a=0; a<Math.max(1, Math.round(params.arms)); a++){
      ctx.beginPath();
      for(let i=0; i<=total; i++){
        const t = i / total;
        const theta = t * params.turns * twoPi + (a * twoPi) / Math.max(1, params.arms) + params.twist * t * twoPi;
        const r = params.radius * t * (1 + params.noiseAmp * Math.sin(theta + morphT));
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const grd = ctx.createLinearGradient(-params.radius, -params.radius, params.radius, params.radius);
      grd.addColorStop(0, params.color1);
      grd.addColorStop(1, params.color2);
      ctx.strokeStyle = grd;
      ctx.lineWidth = params.thickness;
      ctx.stroke();
    }

    ctx.restore();
  }

  function loop(){
    if (playing){
      morphT += 0.01;
    }
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // UI wiring
  function bindRange(id, key, formatter){
    const input = document.getElementById(id);
    const span = document.getElementById(id + "Val");
    if (!input) return;
    input.addEventListener("input", () => {
      let v = parseFloat(input.value);
      if (key === "arms" || key === "turns") v = Math.round(v);
      params[key] = v;
      if (span){
        span.textContent = formatter ? formatter(v) : String(v);
      }
    });
  }

  bindRange("arms", "arms");
  bindRange("turns", "turns");
  bindRange("density", "density", v => v.toFixed(2));
  bindRange("radius", "radius");
  bindRange("thickness", "thickness", v => v.toFixed(1));
  bindRange("twist", "twist", v => v.toFixed(2));
  bindRange("noiseAmp", "noiseAmp", v => v.toFixed(2));

  function bindColor(id, key){
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("input", () => {
      params[key] = input.value;
    });
  }

  bindColor("color1", "color1");
  bindColor("color2", "color2");
  bindColor("background", "background");

  const btn = document.getElementById("playPauseBtn");
  btn.addEventListener("click", () => {
    playing = !playing;
    btn.textContent = playing ? "Pause" : "Play";
  });

  // kleine Sicherheits-Checks (Testfälle)
  console.assert(params.radius > 0, "Radius > 0");
  console.assert(params.arms >= 1, "Arms >= 1");
})();