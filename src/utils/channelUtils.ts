import { Canal } from '@/types';

export function getChannelQuality(canal: Canal): '4K' | '1080p' | 'HD' {
  const name = canal.nome.toLowerCase();
  if (name.includes('4k') || name.includes('uhd')) return '4K';
  if (name.includes('1080') || name.includes('fhd') || name.includes('full hd')) return '1080p';
  return 'HD';
}

export function getSportTag(canal: Canal): string {
  const name = canal.nome.toLowerCase();
  if (
    name.includes('futebol') ||
    name.includes('liga') ||
    name.includes('champions') ||
    name.includes('premier') ||
    name.includes('laliga') ||
    name.includes('serie a') ||
    name.includes('zap viva') ||
    name.includes('copa') ||
    name.includes('football') ||
    name.includes('soccer')
  ) {
    return 'Futebol';
  }
  if (name.includes('nba') || name.includes('basquete') || name.includes('basket')) {
    return 'Basquete';
  }
  if (
    name.includes('ufc') ||
    name.includes('combate') ||
    name.includes('fight') ||
    name.includes('boxe') ||
    name.includes('wwe')
  ) {
    return 'Lutas';
  }
  if (
    name.includes('f1') ||
    name.includes('formula') ||
    name.includes('moto') ||
    name.includes('racing') ||
    name.includes('rally')
  ) {
    return 'Velocidade';
  }
  if (name.includes('tennis') || name.includes('tênis')) {
    return 'Tênis';
  }
  if (
    name.includes('news') ||
    name.includes('notícia') ||
    name.includes('cnn') ||
    name.includes('globo') ||
    name.includes('record') ||
    name.includes('band') ||
    canal.categoria === 'Notícias'
  ) {
    return 'Notícias';
  }
  if (
    name.includes('filme') ||
    name.includes('cinema') ||
    name.includes('telecine') ||
    name.includes('movie') ||
    canal.categoria === 'Lazer'
  ) {
    return 'Filmes';
  }
  return 'Esportes';
}

export function getNetworkBadge(canal: Canal): {
  label: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  iconText: string;
} {
  if (canal.isCustom) {
    return {
      label: 'Próprio',
      badgeBg: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      iconText: '📡',
    };
  }
  if (canal.rede === 'beIN Sports' || canal.nome.toLowerCase().includes('bein')) {
    return {
      label: 'beIN Sports',
      badgeBg: 'bg-purple-500/15',
      textColor: 'text-purple-300',
      borderColor: 'border-purple-500/30',
      iconText: '🟣',
    };
  }
  if (
    canal.rede === 'ZAP' ||
    canal.pais === 'AO' ||
    canal.nome.toLowerCase().includes('zap') ||
    canal.nome.toLowerCase().includes('angola') ||
    canal.nome.toLowerCase().includes('zimbo')
  ) {
    return {
      label: 'ZAP Angola',
      badgeBg: 'bg-orange-500/15',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      iconText: '🇦🇴',
    };
  }
  if (canal.rede === 'SuperSport' || canal.nome.toLowerCase().includes('supersport')) {
    return {
      label: 'SuperSport',
      badgeBg: 'bg-indigo-500/15',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      iconText: '🏆',
    };
  }
  if (canal.rede === 'Vivo' || canal.nome.toLowerCase().includes('vivo')) {
    return {
      label: 'Vivo TV',
      badgeBg: 'bg-fuchsia-500/15',
      textColor: 'text-fuchsia-400',
      borderColor: 'border-fuchsia-500/30',
      iconText: '📱',
    };
  }
  if (canal.pais === 'BR') {
    return {
      label: 'Brasil',
      badgeBg: 'bg-yellow-500/15',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/30',
      iconText: '🇧🇷',
    };
  }
  return {
    label: canal.categoria || 'Geral',
    badgeBg: 'bg-zinc-800/60',
    textColor: 'text-zinc-300',
    borderColor: 'border-zinc-700/60',
    iconText: '⚡',
  };
}
