// Gerador de logos SVG embutidos em base64/URI com alta performance e sem falhas de rede
export function createSvgLogo(text: string, subText: string, bg: string, textColor = '#ffffff', subColor = '#00e676'): string {
  const safeText = text.slice(0, 14);
  const safeSub = subText.slice(0, 16);
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="${bg}"/><text x="50" y="50" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="15" fill="${textColor}" text-anchor="middle">${safeText}</text><text x="50" y="74" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="9" fill="${subColor}" text-anchor="middle" letter-spacing="1">${safeSub}</text></svg>`
    )
  );
}
