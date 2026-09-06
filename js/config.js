// ============================================================
// config.js — the only file you need to edit
// ============================================================

const CONFIG = {

  // ----------------------------------------------------------
  // PROFILE
  // ----------------------------------------------------------
  profileName:   "Abdul Rahman",      // name shown on the card
  nameTooltip:   "Oñooo",         // tooltip on hover over the name
  nameEffect:    "noise",         // "noise" = TV interference | "none" = plain text
  statusText:    "🏃🏿‍➡️ Isso é muita areia hoje...", // text below the name (typewriter effect)
  tabTitle:      "@Abdul Rahman",      // animated browser tab title
  entrySymbol:   "⛧",            // symbol shown on the entry screen

  // ----------------------------------------------------------
  // FILES — place them in assets/ with these exact names
  // ----------------------------------------------------------
  avatar:              "assets/avatar.jpg",
  backgroundVideo:     "assets/background.mp4",
  customCursor:        "assets/cursor.png",
  customCursorHotspot: "0 0",    // "0 0" = tip of the cursor (top-left corner)

  // ----------------------------------------------------------
  // AVATAR
  // ----------------------------------------------------------
  avatarSize:       "118px",
  // animated Discord-style decoration — leave "" to disable
  avatarDecoration: "https://cdn.discordapp.com/avatar-decoration-presets/a_da532f804b47f1681006c2996eb07b2a.png",

  // ----------------------------------------------------------
  // BADGES / ROLES
  // Add, remove or reorder. "icon" = path inside assets/badges/
  // ----------------------------------------------------------
  badges: [
    { icon: "assets/badges/owner.png",    label: "Owner"    },
    { icon: "assets/badges/verified.png", label: "Verified" },
    { icon: "assets/badges/partner.png",  label: "Partner"  },
    { icon: "assets/badges/hate.gif",     label: "hate"     },
  ],
  badgeSize:                "22px",
  badgeContainerBackground: "rgba(172, 200, 255, 0.08)",
  badgeContainerBorder:     "2px solid rgba(172, 200, 255, 0.04)",

  // ----------------------------------------------------------
  // DISCORD REAL-TIME SETTINGS (LANYARD API)
  // ----------------------------------------------------------
  // To make this real-time:
  // 1. Join the Lanyard Discord server (discord.gg/lanyard)
  // 2. Put your Discord User ID below
  // 3. Set useRealtimeDiscord to true
  useRealtimeDiscord: true,
  discordId: "1332618299678265356", // e.g. "123456789012345678"

  // ----------------------------------------------------------
  // DISCORD (STATIC FALLBACK)
  // Used if useRealtimeDiscord is false or Lanyard cannot connect
  // ----------------------------------------------------------
  discordUsername: "Jofagg_",
  discordStatus:   "acalme-se vadia...",
  discordAvatar:   "assets/discord-avatar.jpg",
  discordAvatarSize:   "74px",
  discordAvatarBorder: "2px solid rgba(200, 27, 27, 0.15)",
  // status: "online" | "idle" | "dnd" | "offline"
  discordPresenceStatus: "online",

  // ----------------------------------------------------------
  // SOCIAL LINKS
  // Add, remove or reorder. "icon" = path inside assets/icons/
  // ----------------------------------------------------------
  socialLinks: [
    { name: "Instagram", url: "https://www.instagram.com/_a.r.malik_/?utm_source=gr&r=nametag",         icon: "assets/icons/instagram.png" },
    { name: "Discord",   url: "https://discord.com/users/Jofagg_", icon: "assets/icons/discord.png"   },
    { name: "TikTok",    url: "https://www.tiktok.com/user",           icon: "assets/icons/tiktok.png"    },
    { name: "OnlyFans",  url: "https://onlyfans.com/user",          icon: "assets/icons/onlyfans.png"  },
    { name: "Github",  url: "https://github.com/user",          icon: "assets/icons/github.png"  },

  ],
  iconSize:         "36px",
  iconBorderRadius: "8px",
  iconGlowColor:    "#ffd1d1",

  // ----------------------------------------------------------
  // CARD
  // ----------------------------------------------------------
  cardMaxWidth:        "44rem",
  cardBorderRadius:    "85px",
  cardBackground:      "rgba(200, 27, 27, 0.03)",
  cardBorder:          "none",
  cardRevealDelay:     300,        // ms between entry click and card appearance
  cardTiltIntensity:   15,         // tilt degrees on mouse move (0 = disabled)
  cardTiltPerspective: "1000px",   // 3D perspective (lower = more dramatic)

  // ----------------------------------------------------------
  // DISCORD BOX (presence box inside the card)
  // ----------------------------------------------------------
  discordBoxBackground: "rgba(172, 200, 255, 0.07)",
  discordBoxRadius:     "14px",
  discordBoxBorder:     "2px solid rgba(172, 200, 255, 0.05)",

  // ----------------------------------------------------------
  // COLORS / STYLE
  // ----------------------------------------------------------
  usernameGlow: "0 0 16.5px #acc8ff", // name glow ("none" to disable)

  // ----------------------------------------------------------
  // BACKGROUND PARTICLES
  // ----------------------------------------------------------
  particleColor:            "#b31f1f",
  particleCount:            70,
  particleFallDuration:     10,    // seconds to cross the screen top to bottom
  particleSwayDuration:     3,     // seconds per horizontal sway cycle
  particleSwayAmount:       80,    // pixels of horizontal sway
  particleParallaxStrength: 0.08,  // mouse parallax strength (0 = disabled)

  // ----------------------------------------------------------
  // CURSOR TRAIL
  // ----------------------------------------------------------
  shootingStarColors:       ["#ffd87a", "#ffc847", "#fff4cc"],
  shootingStarSize:         3,
  shootingStarMaxParticles: 4,     // particles spawned per mouse movement
  shootingStarFadeFrames:   30,    // frames until each particle fades out
  shootingStarGlow:         8,     // glow intensity around each sparkle

};