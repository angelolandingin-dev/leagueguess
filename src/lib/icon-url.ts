export function getIconPath(championName: string, iconFile: string): string {
  return `/champion-icons/${encodeURIComponent(championName)}/${encodeURIComponent(iconFile)}`;
}
