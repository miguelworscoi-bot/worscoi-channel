export * from '@/utils/channelLogoUtils';

// Gerador de logos SVG vetorizados estilizados com identidade visual premium de transmissão
export function createSvgLogo(
  text: string,
  subText: string,
  bg: string,
  textColor = '#ffffff',
  subColor = '#00e676'
): string {
  const safeText = text.slice(0, 14);
  const safeSub = subText.slice(0, 16);
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <radialGradient id="badgeGlow" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
          </radialGradient>
        </defs>
        <rect width="120" height="120" rx="26" fill="${bg}"/>
        <rect width="120" height="120" rx="26" fill="url(#badgeGlow)"/>
        <rect x="6" y="6" width="108" height="108" rx="20" fill="none" stroke="${textColor}" stroke-opacity="0.15" stroke-width="1.5"/>
        <circle cx="60" cy="50" r="32" fill="#000000" fill-opacity="0.25"/>
        <text x="60" y="56" font-family="'Impact','Arial Black',system-ui,sans-serif" font-weight="900" font-size="20" fill="${textColor}" text-anchor="middle" letter-spacing="-0.5">${safeText}</text>
        <rect x="18" y="86" width="84" height="20" rx="6" fill="#000000" fill-opacity="0.45" stroke="${subColor}" stroke-opacity="0.4" stroke-width="1"/>
        <text x="60" y="100" font-family="'Arial Black',system-ui,sans-serif" font-weight="900" font-size="9" fill="${subColor}" text-anchor="middle" letter-spacing="1.5">${safeSub}</text>
      </svg>`
    )
  );
}
