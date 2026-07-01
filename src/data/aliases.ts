export const championAliases: Record<string, string[]> = {
  "Aurelion Sol": ["as", "aurelion", "sol", "aurelion sol"],
  "Bel'Veth": ["bel", "belveth", "bel'veth"],
  "Cho'Gath": ["cho", "chogath", "cho'gath"],
  "Dr. Mundo": ["dr mundo", "mundo", "dr"],
  "K'Sante": ["ksante", "k'sante", "sante"],
  "Kai'Sa": ["kaisa", "kai'sa"],
  "Katarina": ["kat", "katarina"],
  "Kha'Zix": ["khazix", "kha'zix", "kha"],
  "Kog'Maw": ["kog", "kogmaw", "kog'maw"],
  "LeBlanc": ["lb", "leblanc", "le blanc"],
  "Lee Sin": ["lee", "lee sin"],
  "Master Yi": ["yi", "masteryi", "master yi"],
  "Miss Fortune": ["mf", "miss fortune"],
  "Rek'Sai": ["reksai", "rek'sai", "rek"],
  "Tahm Kench": ["tahm", "tahm kench"],
  "Twisted Fate": ["tf", "twisted fate"],
  "Vel'Koz": ["velkoz", "vel'koz", "vel"],
  "Xin Zhao": ["xin", "xin zhao"],
  "Aurelion": ["as", "aurelion"],
  "Jarvan IV": ["jarvan", "jarvan iv", "jarvan 4"],
  "Karma": ["karma"],
  "Karthus": ["karthus"],
  "Kindred": ["kindred", "lamb", "wolf"],
  "Nunu & Willump": ["nunu", "nunu willump", "nunu & willump"],
  "Renata Glasc": ["renata", "renata glasc"],
  "Taliyah": ["taliyah"],
  "Wukong": ["wukong", "monkey king"],
  "Xayah": ["xayah"],
  "Rakan": ["rakan"],
  "Zoe": ["zoe"],
  "Zyra": ["zyra"],
};

export function normalizeChampionName(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(championAliases)) {
    if (aliases.includes(lower)) return canonical;
    if (canonical.toLowerCase() === lower) return canonical;
  }
  return input;
}
