export const site = {
  name: "Kartonek",
  availability: "Currently employed",

  avatarUrl:
    "https://i.pinimg.com/control1/736x/c8/71/e7/c871e738b34c227f0a062d411e93836b.jpg",

  headline: {
    lead: "Kartonekk",
  },

  subhead:
    "Full Stack Developer... Sometimes mods.",

  seo: {
    jobTitle: "Full-Stack Developer",
    alternateNames: ["Kartonekk", "kartonekk"] as string[],
  },

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
      "Open-source Minecraft mod.",
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
