export const site = {
  name: "Kartonek",
  availability: "Currently employed",

  avatarUrl:
    "https://i.pinimg.com/control1/736x/c8/71/e7/c871e738b34c227f0a062d411e93836b.jpg",

  headline: {
    lead: "Full-stack developer,",
    accent: "modder",
    tail: "after hours.",
  },

  subhead:
    "I build web applications end to end. Outside of work, I develop open-source Minecraft mods.",

  cta: {
    github: "GitHub",
    discord: "Discord",
    signal: "Signal",
  },

  now: {
    title: "Currently",
    activityNote: "GitHub · last 30 days",
    workingWithLabel: "Working with",
    knownStack: ["Java", "Minecraft Modding"] as string[],
  },

  sideProjects: {
    title: "Side Projects",
    description:
      "Open-source Minecraft mods built in my spare time, now used by a large community of players.",
    downloadsLabel: "Downloads",
    modrinth: "Modrinth",
    curseforge: "CurseForge",
  },

  contact: {
    title: "Get in touch",
    github: { platform: "GitHub", handle: "@kartonekk" },
    discord: { platform: "Discord", handle: "kartonekk" },
    signal: { platform: "Signal", handle: "Encrypted line" },
  },

  share: {
    title: "Share",
    url: "link.karton.dev",
    expandHint: "Tap to enlarge",
    closeHint: "Tap to close",
  },

} as const;
