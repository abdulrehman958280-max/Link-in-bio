// ============================================================
// script.js — page logic
// You don't need to edit this file. All customization lives in config.js
// ============================================================


// ============================================================
// INIT — runs once the HTML is ready
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  // -- Entry screen symbol --
  document.getElementById("entry-symbol").textContent = CONFIG.entrySymbol;

  // -- Name + interference effect --
  initNameEffect();

  // -- Badges --
  document.documentElement.style.setProperty("--badge-size",             CONFIG.badgeSize);
  document.documentElement.style.setProperty("--badge-container-bg",     CONFIG.badgeContainerBackground);
  document.documentElement.style.setProperty("--badge-container-border", CONFIG.badgeContainerBorder);

  const badgesContainer = document.getElementById("badges");
  (CONFIG.badges || []).forEach((badge) => {
    const item    = document.createElement("div");
    item.className = "badge-item";

    const tooltip = document.createElement("span");
    tooltip.className   = "badge-tooltip";
    tooltip.textContent = badge.label || "";

    const img = document.createElement("img");
    img.src = badge.icon;
    img.alt = badge.label || "";

    item.appendChild(tooltip);
    item.appendChild(img);
    badgesContainer.appendChild(item);
  });

  // -- Avatar --
  document.getElementById("avatar").src = CONFIG.avatar;
  document.documentElement.style.setProperty("--avatar-size", CONFIG.avatarSize);

  const decorationEl = document.getElementById("avatar-decoration");
  if (CONFIG.avatarDecoration) {
    decorationEl.src = CONFIG.avatarDecoration;
  } else {
    decorationEl.style.display = "none";
  }

  // -- Background video --
  const bgVideo = document.getElementById("bg-video");
  document.getElementById("bg-video-source").src = CONFIG.backgroundVideo;
  bgVideo.load();

  // -- Card appearance --
  document.documentElement.style.setProperty("--card-max-width",        CONFIG.cardMaxWidth);
  document.documentElement.style.setProperty("--card-border-radius",    CONFIG.cardBorderRadius);
  document.documentElement.style.setProperty("--card-background",       CONFIG.cardBackground);
  document.documentElement.style.setProperty("--card-border",           CONFIG.cardBorder);
  document.documentElement.style.setProperty("--card-tilt-perspective", CONFIG.cardTiltPerspective);
  document.documentElement.style.setProperty("--username-glow",         CONFIG.usernameGlow);

  // -- Discord box --
  document.documentElement.style.setProperty("--discord-box-background", CONFIG.discordBoxBackground);
  document.documentElement.style.setProperty("--discord-box-radius",     CONFIG.discordBoxRadius);
  document.documentElement.style.setProperty("--discord-box-border",     CONFIG.discordBoxBorder);
  document.documentElement.style.setProperty("--discord-avatar-size",    CONFIG.discordAvatarSize);
  document.documentElement.style.setProperty("--discord-avatar-border",  CONFIG.discordAvatarBorder);

  // -- Social icons --
  document.documentElement.style.setProperty("--icon-size",          CONFIG.iconSize);
  document.documentElement.style.setProperty("--icon-border-radius", CONFIG.iconBorderRadius);
  document.documentElement.style.setProperty("--icon-glow-color",    CONFIG.iconGlowColor);

  const socialContainer = document.getElementById("social-links");
  CONFIG.socialLinks.forEach((link) => {
    const a = document.createElement("a");
    a.href   = link.url;
    a.target = "_blank";
    a.rel    = "noopener noreferrer";
    a.title  = link.name;

    const icon = document.createElement("img");
    icon.className = "social-icon";
    icon.src = link.icon;
    icon.alt = link.name;

    a.appendChild(icon);
    
    // Add haptic feedback on click
    a.addEventListener("mousedown", () => {
      if (navigator.vibrate) navigator.vibrate(10);
    });

    socialContainer.appendChild(a);
  });

  // Haptic feedback for the profile card
  const profileCard = document.getElementById("profile-card");
  profileCard.addEventListener("mousedown", () => {
    if (navigator.vibrate) navigator.vibrate(10);
  });
  document.getElementById("discord-username").textContent = CONFIG.discordUsername;
  document.getElementById("discord-activity").textContent = CONFIG.discordStatus;
  document.getElementById("discord-avatar").src           = CONFIG.discordAvatar;

  const statusIconMap = {
    online:  "assets/icons/status/online.png",
    idle:    "assets/icons/status/inactive.png",
    dnd:     "assets/icons/status/busy.png",
    offline: "assets/icons/status/offline.png",
  };
  document.getElementById("discord-status-icon").src =
    statusIconMap[CONFIG.discordPresenceStatus] || statusIconMap.offline;

  if (CONFIG.useRealtimeDiscord) {
    initLanyard();
  }

  // -- Custom cursor --
  if (CONFIG.customCursor) {
    const style = document.createElement("style");
    style.textContent = `* { cursor: url("${CONFIG.customCursor}") ${CONFIG.customCursorHotspot}, auto !important; }`;
    document.head.appendChild(style);
  }

  // -- Tab title typewriter --
  initTabTitle(CONFIG.tabTitle);

  // -- Cursor sparkle trail (active from page load) --
  initCursorTrail();

  // --------------------------------------------------------
  // Entry screen click — starts everything
  // --------------------------------------------------------

  document.getElementById("entry-screen").addEventListener("click", (e) => {
    if (navigator.vibrate) navigator.vibrate(20); // Small haptic on entry
    
    e.currentTarget.classList.add("hidden");

    bgVideo.muted = false;
    bgVideo.play();
    
    // -- ENHANCED AUDIO BEAT DETECTION --
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !window.audioCtx) {
        window.audioCtx = new AudioContext();
        const source = window.audioCtx.createMediaElementSource(bgVideo);
        const analyser = window.audioCtx.createAnalyser();
        const gainNode = window.audioCtx.createGain();
        
        window.audioGainNode = gainNode;
        // 256 gives better frequency grouping for kicks/bass without being too slow
        analyser.fftSize = 256; 
        analyser.smoothingTimeConstant = 0.7; // Faster response to drops
        
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(window.audioCtx.destination);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        let lastBeatTime = 0;
        let minTimeBetweenBeats = 280; // slightly strict to avoid double triggers
        let energyHistory = [];
        
        function detectBeat() {
          requestAnimationFrame(detectBeat);
          if (bgVideo.paused || bgVideo.muted) return;
          
          analyser.getByteFrequencyData(dataArray);
          
          // Focus strictly on Kick/Bass bins (bins 1 to 5 cover ~80Hz to 400Hz)
          let currentEnergy = 0;
          for(let i = 1; i <= 5; i++) {
             currentEnergy += dataArray[i];
          }
          currentEnergy /= 5;

          energyHistory.push(currentEnergy);
          if (energyHistory.length > 25) energyHistory.shift();

          // Calculate moving average
          let avgEnergy = energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length;
          
          // Dynamic threshold: Must be 25% higher than average, and at least 150 volume
          let isBeat = currentEnergy > (avgEnergy * 1.25) && currentEnergy > 150;

          const now = performance.now();
          if (isBeat && (now - lastBeatTime) > minTimeBetweenBeats) {
            lastBeatTime = now;
            
            if (navigator.vibrate) navigator.vibrate(25); // Haptic feedback
            
            // Force CSS reflow to restart animation on every hit perfectly
            profileCard.classList.remove("beat-hit");
            void profileCard.offsetWidth; 
            profileCard.classList.add("beat-hit");
            
            setTimeout(() => {
              profileCard.classList.remove("beat-hit");
            }, 150); 
          }
        }
        
        detectBeat();
        
        if (window.audioCtx.state === 'suspended') {
          window.audioCtx.resume();
        }
      }
    } catch (err) {
      console.warn("Audio context failed:", err);
    }

    initParticles();

    setTimeout(() => {
      profileCard.classList.add("revealed");
      initTypewriter(document.getElementById("profile-status"), CONFIG.statusText, 60);
    }, CONFIG.cardRevealDelay);
  }, { once: true });

  // --------------------------------------------------------
  // 3D card tilt on mouse move
  // --------------------------------------------------------
  if (CONFIG.cardTiltIntensity > 0) {
    const tiltTransform = (x, y) =>
      `translate(-50%, -50%) perspective(${CONFIG.cardTiltPerspective}) rotateX(${x}deg) rotateY(${y}deg)`;

    const resetTransform = () => {
      profileCard.style.transform = tiltTransform(0, 0);
    };

    const applyTilt = (clientX, clientY) => {
      const rect    = profileCard.getBoundingClientRect();
      const offsetX = (clientX - rect.left)  / rect.width  - 0.5;
      const offsetY = (clientY - rect.top)   / rect.height - 0.5;
      profileCard.style.transform = tiltTransform(
        -offsetY * 2 * CONFIG.cardTiltIntensity,
         offsetX * 2 * CONFIG.cardTiltIntensity
      );
    };

    // Mouse
    profileCard.addEventListener("mousemove",  (e) => applyTilt(e.clientX, e.clientY));
    profileCard.addEventListener("mouseleave", resetTransform);

    // Touch (mobile)
    profileCard.addEventListener("touchmove", (e) => applyTilt(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    profileCard.addEventListener("touchend",  resetTransform);
  }

  // --------------------------------------------------------
  // Volume button
  // --------------------------------------------------------
  const volumeBtn = document.getElementById("volume-btn");
  volumeBtn.addEventListener("click", () => {
    bgVideo.muted = !bgVideo.muted;
    volumeBtn.textContent = bgVideo.muted ? "🔇" : "🔊";
    
    // Also mute the audio context gain node to prevent double audio playback on some devices
    if (window.audioGainNode) {
      window.audioGainNode.gain.value = bgVideo.muted ? 0 : 1;
    }
  });

});


// ============================================================
// NAME INTERFERENCE EFFECT
// Applies an SVG displacement filter to the name span.
// The filter seed changes every 40ms, making the letters
// "vibrate" like a bad TV signal — all done by the GPU.
// ============================================================
function initNameEffect() {
  const nameEl  = document.getElementById("name-text");
  const tooltip = document.getElementById("name-tooltip");

  nameEl.textContent  = CONFIG.profileName;
  tooltip.textContent = CONFIG.nameTooltip || "";

  if (CONFIG.nameEffect !== "noise") {
    nameEl.style.filter = "none";
    return;
  }

  const turb = document.getElementById("name-turb");
  const disp = document.getElementById("name-disp");

  setInterval(() => {
    turb.setAttribute("seed", Math.floor(Math.random() * 9999));
    // 80% of the time: heavy distortion / 20%: almost clean
    const scale = Math.random() < 0.8
      ? 4 + Math.random() * 8
      : 0.5 + Math.random() * 2;
    disp.setAttribute("scale", scale.toFixed(1));
  }, 40);
}


// ============================================================
// TAB TITLE TYPEWRITER
// Types the title in the browser tab, pauses, deletes, repeats.
// ============================================================
function initTabTitle(text) {
  let index     = 0;
  let isTyping  = true;

  function tick() {
    if (isTyping) {
      document.title = text.substring(0, index + 1);
      index++;
      if (index === text.length) {
        isTyping = false;
        setTimeout(tick, 1500);
        return;
      }
    } else {
      document.title = text.substring(0, index - 1);
      index--;
      if (index === 0) isTyping = true;
    }
    setTimeout(tick, 100);
  }

  tick();
}


// ============================================================
// STATUS TYPEWRITER
// ============================================================
function initTypewriter(el, text, speed = 80) {
  let i          = 0;
  let isDeleting = false;

  function tick() {
    if (!isDeleting) {
      el.textContent = text.substring(0, i);
      i++;
      if (i > text.length) {
        setTimeout(() => { isDeleting = true; tick(); }, 1800);
        return;
      }
    } else {
      el.textContent = text.substring(0, i);
      i--;
      if (i < 0) {
        i = 0;
        isDeleting = false;
        setTimeout(tick, 500);
        return;
      }
    }
    setTimeout(tick, isDeleting ? speed * 0.5 : speed);
  }

  tick();
}


// ============================================================
// BACKGROUND PARTICLES
// Dots that fall from top to bottom with a gentle horizontal
// sway. They also shift opposite to the mouse movement,
// creating a parallax depth effect.
// Starts only after the entry screen is clicked.
// ============================================================
function initParticles() {
  const canvas = document.getElementById("bg-canvas");
  const ctx    = canvas.getContext("2d");

  const { particleColor, particleCount, particleFallDuration,
          particleSwayDuration, particleSwayAmount, particleParallaxStrength } = CONFIG;

  let particles = [];
  let mouseX    = window.innerWidth / 2;

  document.addEventListener("mousemove", (e) => { mouseX = e.clientX; });

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        baseX:      Math.random() * canvas.width,
        y:          Math.random() * canvas.height * 1.5 - canvas.height * 0.5,
        r:          1 + Math.random() * 1.8,
        swayPhase:  Math.random() * Math.PI * 2,
        swaySpeed:  (Math.random() * 0.6 + 0.7) / particleSwayDuration,
        fallSpeed:  (canvas.height * 1.1) / (particleFallDuration * 60) * (0.7 + Math.random() * 0.6),
        opacity:    0.4 + Math.random() * 0.6,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = particleColor;

    const parallaxOffset = -(mouseX - canvas.width / 2) * particleParallaxStrength;

    particles.forEach((p) => {
      p.y += p.fallSpeed;
      if (p.y > canvas.height + 10) {
        p.y     = -10;
        p.baseX = Math.random() * canvas.width;
      }

      const sway = Math.sin(performance.now() * 0.001 * p.swaySpeed + p.swayPhase) * particleSwayAmount;
      let x = p.baseX + sway + parallaxOffset;
      x = ((x % canvas.width) + canvas.width) % canvas.width;

      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  window.addEventListener("resize", () => { resize(); createParticles(); });
  requestAnimationFrame(draw);
}


// ============================================================
// CURSOR SPARKLE TRAIL
// 4-pointed star sparkles that appear at the cursor position
// and fade out while drifting. Spawning is done inside the
// requestAnimationFrame loop (not in mousemove) to avoid lag.
// ============================================================
function initCursorTrail() {
  const canvas = document.getElementById("cursor-canvas");
  const ctx    = canvas.getContext("2d");

  const { shootingStarColors, shootingStarSize,
          shootingStarMaxParticles, shootingStarFadeFrames,
          shootingStarGlow } = CONFIG;

  let particles = [];
  let mouseX = -999, mouseY = -999;
  let lastX  = -999, lastY  = -999;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawStar(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo( size * 0.2, -size * 0.2,  size, 0);
    ctx.quadraticCurveTo( size * 0.2,  size * 0.2,  0,    size);
    ctx.quadraticCurveTo(-size * 0.2,  size * 0.2, -size, 0);
    ctx.quadraticCurveTo(-size * 0.2, -size * 0.2,  0,   -size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn new particles only when the mouse has moved
    if (mouseX !== lastX || mouseY !== lastY) {
      for (let i = 0; i < shootingStarMaxParticles; i++) {
        particles.push({
          x:             mouseX,
          y:             mouseY,
          vx:            (Math.random() - 0.5) * 1.2,
          vy:            (Math.random() - 0.5) * 1.2,
          life:          1,
          size:          shootingStarSize * (0.5 + Math.random() * 0.7),
          rotation:      Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.12,
          twinklePhase:  Math.random() * Math.PI * 2,
          color:         shootingStarColors[Math.floor(Math.random() * shootingStarColors.length)],
        });
      }
      lastX = mouseX;
      lastY = mouseY;
    }

    particles.forEach((p) => {
      p.x        += p.vx;
      p.y        += p.vy;
      p.vx       *= 0.97;
      p.vy       *= 0.97;
      p.rotation += p.rotationSpeed;
      p.life     -= 1 / shootingStarFadeFrames;

      const life    = Math.max(p.life, 0);
      const twinkle = 0.75 + 0.25 * Math.sin(performance.now() * 0.015 + p.twinklePhase);

      ctx.globalAlpha = life;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = shootingStarGlow;
      drawStar(p.x, p.y, p.size * life * twinkle, p.rotation);
    });

    particles     = particles.filter((p) => p.life > 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

// ============================================================
// LANYARD API (REAL-TIME DISCORD PRESENCE)
// ============================================================
function initLanyard() {
  if (!CONFIG.discordId || CONFIG.discordId === "YOUR_DISCORD_ID_HERE") {
    console.warn("Lanyard: Please set your discordId in config.js");
    return;
  }

  let lanyardWs = null;
  const statusIconMap = {
    online:  "assets/icons/status/online.png",
    idle:    "assets/icons/status/inactive.png",
    dnd:     "assets/icons/status/busy.png",
    offline: "assets/icons/status/offline.png",
  };

  function connectLanyard() {
    lanyardWs = new WebSocket('wss://api.lanyard.rest/socket');

    lanyardWs.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.op === 1) { // Hello event, subscribe to updates
        lanyardWs.send(JSON.stringify({
          op: 2,
          d: { subscribe_to_id: CONFIG.discordId }
        }));
        
        // Start heartbeat
        setInterval(() => {
          if (lanyardWs.readyState === WebSocket.OPEN) {
            lanyardWs.send(JSON.stringify({ op: 3 }));
          }
        }, msg.d.heartbeat_interval);
      } else if (msg.op === 0) { // Dispatch event
        if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
          updateRealtimeUI(msg.d);
        }
      }
    };

    lanyardWs.onclose = () => {
      setTimeout(connectLanyard, 5000); // Reconnect on close
    };
  }

  function updateRealtimeUI(data) {
    const user = data.discord_user;
    
    // 1. Avatar Update
    const avatarExt = user.avatar && user.avatar.startsWith('a_') ? 'gif' : 'png';
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarExt}?size=512`
        : 'assets/discord-avatar.jpg';
    
    document.getElementById('avatar').src = avatarUrl;
    document.getElementById('discord-avatar').src = avatarUrl;

    // 2. Avatar Decoration Update
    const avatarDeco = document.getElementById('avatar-decoration');
    if (user.avatar_decoration_data && user.avatar_decoration_data.asset) {
        avatarDeco.src = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=96&passthrough=true`;
        avatarDeco.style.display = 'block';
    } else {
        avatarDeco.style.display = 'none'; // hide if removed
    }

    // 3. Status Icon Update
    const statusIcon = document.getElementById('discord-status-icon');
    statusIcon.src = statusIconMap[data.discord_status] || statusIconMap.offline;

    // 4. Username Update
    document.getElementById('discord-username').textContent = user.display_name || user.username;

    // 5. Activity Update
    let activityText = CONFIG.discordStatus; // fallback
    const customStatus = data.activities.find(a => a.type === 4);
    if (customStatus) {
        activityText = customStatus.state || customStatus.name || "No activity";
    } else if (data.activities.length > 0) {
        activityText = `Playing ${data.activities[0].name}`;
    }
    
    document.getElementById('discord-activity').textContent = activityText;
  }

  connectLanyard();
}