// ============================================================
// script.js — page logic
// You don't need to edit this file. All customization lives in config.js
// ============================================================


// ============================================================
// HAPTIC FEEDBACK ENGINE
// Lightweight tactile feedback exclusively on Start & End
// (Zero haptics during beat loops to eliminate all UI/rendering lag)
// ============================================================
function triggerHaptic(type = "start") {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  if (type === "start" || type === "entry") {
    // Crisp tactile impulse on start/entry
    navigator.vibrate([18, 30, 22]);
  } else if (type === "end") {
    // Clear tactile impulse when audio/video ends or is muted
    navigator.vibrate(25);
  }
}


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
  if (CONFIG.backgroundVideo) {
    bgVideo.src = CONFIG.backgroundVideo;
    const sourceEl = document.getElementById("bg-video-source");
    if (sourceEl) sourceEl.src = CONFIG.backgroundVideo;
    bgVideo.load();
    // Video will play when entry screen is clicked
  }

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
    
    socialContainer.appendChild(a);
  });

  const profileCard = document.getElementById("profile-card");
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
    triggerHaptic("entry"); // Confident tactile pattern on entry unlock
    
    e.currentTarget.classList.add("hidden");

    bgVideo.muted = false;
    const playPromise = bgVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Unmuted video autoplay prevented, falling back to muted:", err);
        bgVideo.muted = true;
        bgVideo.play().catch(() => {});
        const volumeBtn = document.getElementById("volume-btn");
        if (volumeBtn) volumeBtn.textContent = "🔇";
      });
    }
    
    // -- UPGRADED DUAL-BAND ADAPTIVE BEAT DETECTION ENGINE --
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !window.audioCtx) {
        window.audioCtx = new AudioContext();
        const source = window.audioCtx.createMediaElementSource(bgVideo);
        const analyser = window.audioCtx.createAnalyser();
        const gainNode = window.audioCtx.createGain();
        
        window.audioGainNode = gainNode;
        // 512 gives 256 frequency bins for precise kick and snare isolation
        analyser.fftSize = 512; 
        analyser.smoothingTimeConstant = 0.42; // Fast, instantaneous transient attack
        
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(window.audioCtx.destination);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        let lastBeatTime = 0;
        const minTimeBetweenBeats = 110; // allows rapid 16th notes / fast tempos without dropping beats
        const lowHistory = [];
        const midHistory = [];
        let prevLow = 0;
        let prevMid = 0;
        let lowEnv = 0;
        let midEnv = 0;
        let beatAnimTimer = null;
        
        const avatarWrapper = document.getElementById("avatar-wrapper");
        const badgesEl = document.getElementById("badges");
        const discordBox = document.getElementById("discord-presence");
        const socialLinksEl = document.getElementById("social-links");
        const volumeBtnEl = document.getElementById("volume-btn");
        
        function detectBeat() {
          requestAnimationFrame(detectBeat);
          if (bgVideo.paused || bgVideo.muted) {
            if (volumeBtnEl) volumeBtnEl.classList.remove("audio-active");
            return;
          }
          
          if (volumeBtnEl) volumeBtnEl.classList.add("audio-active");
          analyser.getByteFrequencyData(dataArray);
          
          // Band 1: Sub-bass & Kicks (bins 1 to 6, ~40Hz - 260Hz)
          let lowEnergy = 0;
          for (let i = 1; i <= 6; i++) {
            lowEnergy += dataArray[i];
          }
          lowEnergy /= 6;
          
          // Band 2: Snares, Claps, Percussion, Vocals (bins 7 to 25, ~300Hz - 1100Hz)
          let midEnergy = 0;
          for (let i = 7; i <= 25; i++) {
            midEnergy += dataArray[i];
          }
          midEnergy /= 19;
          
          // Flux: frame-to-frame sudden onset jumps
          const lowFlux = Math.max(0, lowEnergy - prevLow);
          const midFlux = Math.max(0, midEnergy - prevMid);
          prevLow = lowEnergy;
          prevMid = midEnergy;
          
          // Envelope decay
          lowEnv = Math.max(lowEnergy, lowEnv * 0.88);
          midEnv = Math.max(midEnergy, midEnv * 0.88);
          
          // Rolling baseline stats (lightweight iteration, zero GC allocations)
          lowHistory.push(lowEnergy);
          if (lowHistory.length > 24) lowHistory.shift();
          let sumLow = 0;
          for (let i = 0; i < lowHistory.length; i++) sumLow += lowHistory[i];
          const avgLow = sumLow / lowHistory.length;
          
          midHistory.push(midEnergy);
          if (midHistory.length > 24) midHistory.shift();
          let sumMid = 0;
          for (let i = 0; i < midHistory.length; i++) sumMid += midHistory[i];
          const avgMid = sumMid / midHistory.length;
          
          // Adaptive Onset Conditions:
          // 1. Kick/bass beat hit
          const isKickBeat = lowEnergy > Math.max(28, avgLow * 1.12) && (lowFlux > 2.5 || lowEnergy >= lowEnv * 0.96);
          // 2. Snare/clap/rhythm beat hit
          const isMidBeat = midEnergy > Math.max(30, avgMid * 1.15) && (midFlux > 3.0 || midEnergy >= midEnv * 0.96);
          // 3. Combined general transient punch
          const combined = lowEnergy * 0.65 + midEnergy * 0.35;
          const avgCombined = avgLow * 0.65 + avgMid * 0.35;
          const isCombinedBeat = combined > Math.max(28, avgCombined * 1.14);
          
          const isBeat = isKickBeat || isMidBeat || isCombinedBeat;
          
          const now = performance.now();
          if (isBeat && (now - lastBeatTime) > minTimeBetweenBeats) {
            lastBeatTime = now;
            
            // Normalized intensity based on drop energy
            const kickExcess = Math.max(0, lowEnergy - avgLow);
            const midExcess = Math.max(0, midEnergy - avgMid);
            const intensity = Math.min(1.0, Math.max(0.2, (kickExcess * 1.2 + midExcess * 0.8) / 45));
            
            // Note: Haptics removed during beats to eliminate mobile lag/stutter
            
            // Pulse profile card with proportional scale
            profileCard.style.setProperty("--beat-pulse", (0.016 + intensity * 0.026).toFixed(3));
            
            // Clear any pending timeout from previous beat
            if (beatAnimTimer) {
              clearTimeout(beatAnimTimer);
              beatAnimTimer = null;
            }
            
            // Apply beat hit animation smoothly (no synchronous layout reflows)
            profileCard.classList.add("beat-hit");
            if (avatarWrapper) avatarWrapper.classList.add("beat-hit");
            if (badgesEl) badgesEl.classList.add("beat-hit");
            if (discordBox) discordBox.classList.add("beat-hit");
            if (socialLinksEl) socialLinksEl.classList.add("beat-hit");
            
            // Background particles shockwave explosion
            if (window.onBeatParticleShockwave) {
              window.onBeatParticleShockwave(intensity);
            }
            
            // Smoothly remove beat-hit after snappy punch
            beatAnimTimer = setTimeout(() => {
              profileCard.classList.remove("beat-hit");
              if (avatarWrapper) avatarWrapper.classList.remove("beat-hit");
              if (badgesEl) badgesEl.classList.remove("beat-hit");
              if (discordBox) discordBox.classList.remove("beat-hit");
              if (socialLinksEl) socialLinksEl.classList.remove("beat-hit");
              beatAnimTimer = null;
            }, 85);
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
  // 3D card tilt on mouse move (gentle on touch to prevent misclicks)
  // --------------------------------------------------------
  if (CONFIG.cardTiltIntensity > 0) {
    const tiltTransform = (x, y) =>
      `translate(-50%, -50%) perspective(${CONFIG.cardTiltPerspective}) rotateX(${x}deg) rotateY(${y}deg)`;

    const resetTransform = () => {
      profileCard.style.transform = tiltTransform(0, 0);
    };

    const applyTilt = (clientX, clientY, factor = 1) => {
      const rect    = profileCard.getBoundingClientRect();
      const offsetX = (clientX - rect.left)  / rect.width  - 0.5;
      const offsetY = (clientY - rect.top)   / rect.height - 0.5;
      profileCard.style.transform = tiltTransform(
        -offsetY * 2 * CONFIG.cardTiltIntensity * factor,
         offsetX * 2 * CONFIG.cardTiltIntensity * factor
      );
    };

    // Mouse
    profileCard.addEventListener("mousemove",  (e) => applyTilt(e.clientX, e.clientY, 1));
    profileCard.addEventListener("mouseleave", resetTransform);

    // Touch (gentle tilt so user doesn't miss links)
    profileCard.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        applyTilt(e.touches[0].clientX, e.touches[0].clientY, 0.35);
      }
    }, { passive: true });
    profileCard.addEventListener("touchend",  resetTransform);
  }

  // --------------------------------------------------------
  // Volume button & Playback status (Start / End haptics)
  // --------------------------------------------------------
  const volumeBtn = document.getElementById("volume-btn");
  volumeBtn.addEventListener("click", () => {
    bgVideo.muted = !bgVideo.muted;
    volumeBtn.textContent = bgVideo.muted ? "🔇" : "🔊";
    triggerHaptic(bgVideo.muted ? "end" : "start");
    
    // Also mute the audio context gain node to prevent double audio playback on some devices
    if (window.audioGainNode) {
      window.audioGainNode.gain.value = bgVideo.muted ? 0 : 1;
    }
  });

  bgVideo.addEventListener("ended", () => {
    triggerHaptic("end");
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
  const chars   = Array.from(text);
  let index     = 0;
  let isTyping  = true;

  function tick() {
    if (isTyping) {
      document.title = chars.slice(0, index + 1).join("");
      index++;
      if (index === chars.length) {
        isTyping = false;
        setTimeout(tick, 1500);
        return;
      }
    } else {
      document.title = chars.slice(0, Math.max(0, index - 1)).join("");
      index--;
      if (index <= 0) isTyping = true;
    }
    setTimeout(tick, 110);
  }

  tick();
}


// ============================================================
// STATUS TYPEWRITER
// ============================================================
function initTypewriter(el, text, speed = 80) {
  const chars    = Array.from(text);
  let i          = 0;
  let isDeleting = false;

  function tick() {
    if (!isDeleting) {
      el.textContent = chars.slice(0, i).join("");
      i++;
      if (i > chars.length) {
        setTimeout(() => { isDeleting = true; tick(); }, 2000);
        return;
      }
    } else {
      el.textContent = chars.slice(0, i).join("");
      i--;
      if (i < 0) {
        i = 0;
        isDeleting = false;
        setTimeout(tick, 600);
        return;
      }
    }
    setTimeout(tick, isDeleting ? speed * 0.45 : speed);
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
  let beatPulseEnergy = 0;

  // Global trigger called by audio analyser on beat drops
  window.onBeatParticleShockwave = (intensity) => {
    beatPulseEnergy = Math.max(beatPulseEnergy, intensity || 0.85);
  };

  document.addEventListener("mousemove", (e) => { mouseX = e.clientX; });
  document.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX;
    }
  }, { passive: true });

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

    // Smoothly decay the beat impulse
    beatPulseEnergy = Math.max(0, beatPulseEnergy * 0.915 - 0.008);

    const parallaxOffset = -(mouseX - canvas.width / 2) * particleParallaxStrength;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const nowTime = performance.now() * 0.001;

    particles.forEach((p) => {
      // Dynamic fall speed increases smoothly during heavy drops
      p.y += p.fallSpeed * (1 + beatPulseEnergy * 0.85);
      if (p.y > canvas.height + 15) {
        p.y     = -15;
        p.baseX = Math.random() * canvas.width;
      }

      const sway = Math.sin(nowTime * p.swaySpeed + p.swayPhase) * (particleSwayAmount * (1 + beatPulseEnergy * 0.3));
      let x = p.baseX + sway + parallaxOffset;
      x = ((x % canvas.width) + canvas.width) % canvas.width;

      // Radial shockwave outward from center profile card on beat drops
      let renderX = x;
      let renderY = p.y;
      if (beatPulseEnergy > 0.01) {
        const dx = x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const distFactor = Math.max(0, 1 - dist / (canvas.width * 0.65));
        const impulse = beatPulseEnergy * 24 * distFactor;
        renderX += (dx / dist) * impulse;
        renderY += (dy / dist) * impulse;
      }

      const renderR = p.r * (1 + beatPulseEnergy * 0.75);
      ctx.globalAlpha = Math.min(1, p.opacity * (1 + beatPulseEnergy * 0.85));
      ctx.beginPath();
      ctx.arc(renderX, renderY, renderR, 0, Math.PI * 2);
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

  document.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }, { passive: true });

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
  let heartbeatTimer = null;
  const statusIconMap = {
    online:  "assets/icons/status/online.png",
    idle:    "assets/icons/status/inactive.png",
    dnd:     "assets/icons/status/busy.png",
    offline: "assets/icons/status/offline.png",
  };

  function connectLanyard() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    lanyardWs = new WebSocket('wss://api.lanyard.rest/socket');

    lanyardWs.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.op === 1) { // Hello event, subscribe to updates
        lanyardWs.send(JSON.stringify({
          op: 2,
          d: { subscribe_to_id: CONFIG.discordId }
        }));
        
        // Start heartbeat safely
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          if (lanyardWs && lanyardWs.readyState === WebSocket.OPEN) {
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
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
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
    let activityText = CONFIG.discordStatus; // Forced as per request
    // Removed real-time custom status override to ensure it says "Unavailable"
    
    document.getElementById('discord-activity').textContent = activityText;
  }

  connectLanyard();
}