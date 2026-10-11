export function resolveAssetUrl(
  path: string,
  partyId: string | null,
): string {
  if (
    !path ||
    /^(https?:|data:|blob:)/i.test(path) ||
    path.startsWith('/') ||
    !partyId
  ) {
    return path
  }

  const relativePath = path.replace(/^(\.\/)+/, '')

  return `/api/parties/${encodeURIComponent(partyId)}/${relativePath}`
}