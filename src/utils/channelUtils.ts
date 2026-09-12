import { Canal, FiltroAtivo } from '@/types';

export interface ChannelCategoryBadge {
  categoria: 'Esportes' | 'Notícias' | 'Filmes';
  filtro: FiltroAtivo;
  label: string;
  icon: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  subTag?: {
    label: string;
    filtro: FiltroAtivo;
    icon: string;
    badgeBg: string;
    textColor: string;
    borderColor: string;
  };
}

export function getChannelCategoryInfo(canal: Canal): ChannelCategoryBadge {
  const cat = (canal.categoria || '').toLowerCase();
  const name = canal.nome.toLowerCase();
  const comps = (canal.competicoes || []).map((c) => c.toLowerCase());

  // 1. Notícias
  if (
    cat.includes('notícia') ||
    cat.includes('noticias') ||
    cat.includes('news') ||
    name.includes('notícia') ||
    name.includes('noticia') ||
    name.includes('news') ||
    name.includes('cnn') ||
    name.includes('globo news') ||
    name.includes('bandnews') ||
    name.includes('record news') ||
    name.includes('jovem pan') ||
    name.includes('jornal') ||
    name.includes('agro') ||
    name.includes('bloomberg')
  ) {
    return {
      categoria: 'Notícias',
      filtro: 'Notícias',
      label: 'Notícias',
      icon: '📰',
      badgeBg: 'bg-blue-500/15 hover:bg-blue-500/25',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      dotColor: 'bg-blue-400',
    };
  }

  // 2. Filmes & Séries (Lazer)
  if (
    cat.includes('lazer') ||
    cat.includes('filme') ||
    cat.includes('cinema') ||
    cat.includes('movie') ||
    cat.includes('series') ||
    name.includes('filme') ||
    name.includes('cinema') ||
    name.includes('telecine') ||
    name.includes('megapix') ||
    name.includes('hbo') ||
    name.includes('max') ||
    name.includes('paramount') ||
    name.includes('universal') ||
    name.includes('warner') ||
    name.includes('comedy') ||
    name.includes('cartoon') ||
    name.includes('disney') ||
    name.includes('anime')
  ) {
    return {
      categoria: 'Filmes',
      filtro: 'Lazer',
      label: 'Filmes',
      icon: '🍿',
      badgeBg: 'bg-purple-500/15 hover:bg-purple-500/25',
      textColor: 'text-purple-300',
      borderColor: 'border-purple-500/30',
      dotColor: 'bg-purple-400',
    };
  }

  // 3. Esportes (Categoria principal de esportes)
  let subTag: ChannelCategoryBadge['subTag'] | undefined;

  if (comps.includes('libertadores') || name.includes('libertadores')) {
    subTag = {
      label: 'Libertadores',
      filtro: 'Libertadores',
      icon: '🏆',
      badgeBg: 'bg-amber-500/15 hover:bg-amber-500/25',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
    };
  } else if (comps.includes('champions league') || name.includes('champions')) {
    subTag = {
      label: 'Champions',
      filtro: 'Champions League',
      icon: '⭐',
      badgeBg: 'bg-sky-500/15 hover:bg-sky-500/25',
      textColor: 'text-sky-400',
      borderColor: 'border-sky-500/40',
    };
  } else if (canal.rede === 'TNT Sports' || name.includes('tnt sports')) {
    subTag = {
      label: 'TNT Sports',
      filtro: 'TNT Sports',
      icon: '⚡',
      badgeBg: 'bg-yellow-500/15 hover:bg-yellow-500/25',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/40',
    };
  } else if (comps.includes('laliga') || name.includes('laliga') || name.includes('la liga')) {
    subTag = {
      label: 'LaLiga',
      filtro: 'LaLiga',
      icon: '🇪🇸',
      badgeBg: 'bg-rose-500/15 hover:bg-rose-500/25',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
    };
  } else if (comps.includes('nba') || canal.rede === 'NBA TV' || name.includes('nba')) {
    subTag = {
      label: 'NBA',
      filtro: 'NBA',
      icon: '🏀',
      badgeBg: 'bg-indigo-500/15 hover:bg-indigo-500/25',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
    };
  } else if (comps.includes('mls') || name.includes('mls')) {
    subTag = {
      label: 'MLS',
      filtro: 'MLS',
      icon: '🇺🇸',
      badgeBg: 'bg-teal-500/15 hover:bg-teal-500/25',
      textColor: 'text-teal-400',
      borderColor: 'border-teal-500/40',
    };
  } else if (
    name.includes('futebol') ||
    name.includes('liga') ||
    name.includes('premier') ||
    name.includes('serie a') ||
    name.includes('copa') ||
    name.includes('football') ||
    name.includes('soccer')
  ) {
    subTag = {
      label: 'Futebol',
      filtro: 'Futebol',
      icon: '⚽',
      badgeBg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
    };
  }

  return {
    categoria: 'Esportes',
    filtro: 'Esportes',
    label: 'Esportes',
    icon: '⚽',
    badgeBg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    subTag,
  };
}

export function getChannelQuality(canal: Canal): '4K' | '1080p' | 'HD' {
  const name = canal.nome.toLowerCase();
  if (name.includes('4k') || name.includes('uhd')) return '4K';
  if (name.includes('1080') || name.includes('fhd') || name.includes('full hd')) return '1080p';
  return 'HD';
}

export function getSportTag(canal: Canal): string {
  const name = canal.nome.toLowerCase();
  const comps = (canal.competicoes || []).map((c) => c.toLowerCase());

  if (comps.includes('libertadores') || name.includes('libertadores')) {
    return 'Libertadores';
  }
  if (comps.includes('champions league') || name.includes('champions')) {
    return 'Champions';
  }
  if (comps.includes('nba') || name.includes('nba')) {
    return 'NBA';
  }
  if (comps.includes('laliga') || name.includes('laliga') || name.includes('la liga')) {
    return 'LaLiga';
  }
  if (comps.includes('mls') || name.includes('mls') || name.includes('major league soccer')) {
    return 'MLS';
  }
  if (canal.rede === 'TNT Sports' || name.includes('tnt sports')) {
    return 'TNT Sports';
  }

  if (
    name.includes('futebol') ||
    name.includes('liga') ||
    name.includes('premier') ||
    name.includes('serie a') ||
    name.includes('zap viva') ||
    name.includes('copa') ||
    name.includes('football') ||
    name.includes('soccer')
  ) {
    return 'Futebol';
  }
  if (name.includes('basquete') || name.includes('basket')) {
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
  const name = canal.nome.toLowerCase();
  const comps = (canal.competicoes || []).map((c) => c.toLowerCase());

  if (canal.isCustom) {
    return {
      label: 'Próprio',
      badgeBg: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      iconText: '📡',
    };
  }

  if (canal.rede === 'TNT Sports' || name.includes('tnt sports')) {
    return {
      label: 'TNT Sports',
      badgeBg: 'bg-yellow-500/15',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/40',
      iconText: '⚡',
    };
  }

  if (comps.includes('libertadores') || name.includes('libertadores')) {
    return {
      label: 'Libertadores',
      badgeBg: 'bg-amber-500/15',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      iconText: '🏆',
    };
  }

  if (comps.includes('champions league') || name.includes('champions')) {
    return {
      label: 'Champions League',
      badgeBg: 'bg-sky-500/15',
      textColor: 'text-sky-400',
      borderColor: 'border-sky-500/40',
      iconText: '⭐',
    };
  }

  if (canal.rede === 'NBA TV' || comps.includes('nba') || name.includes('nba')) {
    return {
      label: 'NBA',
      badgeBg: 'bg-blue-500/15',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/40',
      iconText: '🏀',
    };
  }

  if (comps.includes('laliga') || name.includes('laliga') || name.includes('la liga')) {
    return {
      label: 'LaLiga',
      badgeBg: 'bg-rose-500/15',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      iconText: '🇪🇸',
    };
  }

  if (comps.includes('mls') || name.includes('mls')) {
    return {
      label: 'MLS',
      badgeBg: 'bg-emerald-500/15',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      iconText: '🇺🇸',
    };
  }

  if (canal.rede === 'ESPN' || name.includes('espn')) {
    return {
      label: 'ESPN',
      badgeBg: 'bg-red-500/15',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/40',
      iconText: '🔴',
    };
  }

  if (canal.rede === 'Fox Sports' || name.includes('fox sports')) {
    return {
      label: 'Fox Sports',
      badgeBg: 'bg-indigo-500/15',
      textColor: 'text-indigo-300',
      borderColor: 'border-indigo-500/40',
      iconText: '🔷',
    };
  }

  if (canal.rede === 'beIN Sports' || name.includes('bein')) {
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
    name.includes('zap') ||
    name.includes('angola') ||
    name.includes('zimbo')
  ) {
    return {
      label: 'ZAP Angola',
      badgeBg: 'bg-orange-500/15',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      iconText: '🇦🇴',
    };
  }
  if (canal.rede === 'SuperSport' || name.includes('supersport')) {
    return {
      label: 'SuperSport',
      badgeBg: 'bg-indigo-500/15',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      iconText: '🏆',
    };
  }
  if (canal.rede === 'Vivo' || name.includes('vivo')) {
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
