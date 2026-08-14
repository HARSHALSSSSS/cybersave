export function parseBulletList(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n+|(?:\r\n)+/)
    .flatMap(line => line.split(/•|·/))
    .map(s => s.replace(/^[-–—]\s*/, '').trim())
    .filter(Boolean);
}

export function getServiceDisplayName(config: {
  overview?: { displayName?: string } | null;
  subService: { name: string };
}) {
  return config.overview?.displayName ?? config.subService.name;
}
