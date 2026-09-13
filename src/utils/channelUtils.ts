import { Canal, FiltroAtivo, CategoriaCanalGeral } from '@/types';

export interface ChannelCategoryBadge {
  categoria: CategoriaCanalGeral;
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

  // 1. Bonecos & Animes (Kids & Anime)
  if (
    cat.includes('boneco') ||
    cat.includes('anime') ||
    cat.includes('infantil') ||
    cat.includes('kids') ||
    canal.categoria === 'Bonecos' ||
    name.includes('nickelodeon') ||
    name.includes('cartoon') ||
    name.includes('disney channel') ||
    name.includes('disney junior') ||
    name.includes('disney xd') ||
    name.includes('panda kids') ||
    name.includes('nick jr') ||
    name.includes('gloob') ||
    name.includes('rá-tim-bum') ||
    name.includes('discovery kids') ||
    name.includes('boomerang') ||
    name.includes('pbs kids') ||
    name.includes('boing') ||
    name.includes('clan tve') ||
    name.includes('anime') ||
    name.includes('crunchyroll') ||
    name.includes('gulli') ||
    name.includes('kika') ||
    name.includes('toggo')
  ) {
    return {
      categoria: 'Bonecos',
      filtro: 'Bonecos',
      label: 'Bonecos & Animes',
      icon: '🧸',
      badgeBg: 'bg-amber-500/15 hover:bg-amber-500/25',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-500/30',
      dotColor: 'bg-amber-400',
    };
  }

  // 2. Novelas & Dramas
  if (
    cat.includes('novela') ||
    cat.includes('drama') ||
    canal.categoria === 'Novelas' ||
    name.includes('novela') ||
    name.includes('zap novelas') ||
    name.includes('telemundo') ||
    name.includes('televisa') ||
    name.includes('estrellas') ||
    name.includes('univision') ||
    name.includes('caracol') ||
    name.includes('rcn') ||
    name.includes('tvi ficção')
  ) {
    return {
      categoria: 'Novelas',
      filtro: 'Novelas',
      label: 'Novelas',
      icon: '🎭',
      badgeBg: 'bg-rose-500/15 hover:bg-rose-500/25',
      textColor: 'text-rose-300',
      borderColor: 'border-rose-500/30',
      dotColor: 'bg-rose-400',
    };
  }

  // 3. Músicas & Shows
  if (
    cat.includes('música') ||
    cat.includes('musica') ||
    cat.includes('music') ||
    canal.categoria === 'Músicas' ||
    name.includes('mtv') ||
    name.includes('trace') ||
    name.includes('afro music') ||
    name.includes('mcm') ||
    name.includes('mezzo') ||
    name.includes('stingray') ||
    name.includes('deluxe music') ||
    name.includes('sol música') ||
    name.includes('vh1') ||
    name.includes('bet') ||
    name.includes('cmc')
  ) {
    return {
      categoria: 'Músicas',
      filtro: 'Músicas',
      label: 'Músicas',
      icon: '🎵',
      badgeBg: 'bg-pink-500/15 hover:bg-pink-500/25',
      textColor: 'text-pink-300',
      borderColor: 'border-pink-500/30',
      dotColor: 'bg-pink-400',
    };
  }

  // 4. Notícias
  if (
    cat.includes('notícia') ||
    cat.includes('noticias') ||
    cat.includes('news') ||
    canal.categoria === 'Notícias' ||
    name.includes('notícia') ||
    name.includes('noticia') ||
    name.includes('news') ||
    name.includes('cnn') ||
    name.includes('globonews') ||
    name.includes('bandnews') ||
    name.includes('record news') ||
    name.includes('jovem pan') ||
    name.includes('al jazeera') ||
    name.includes('sky news') ||
    name.includes('euronews') ||
    name.includes('france 24') ||
    name.includes('dw') ||
    name.includes('sic notícias') ||
    name.includes('rtp 3') ||
    name.includes('cmtv') ||
    name.includes('zap viva') ||
    name.includes('tpa notícias') ||
    name.includes('girassol')
  ) {
    return {
      categoria: 'Notícias',
      filtro: 'Notícias',
      label: 'Notícias',
      icon: '📰',
      badgeBg: 'bg-blue-500/15 hover:bg-blue-500/25',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-500/30',
      dotColor: 'bg-blue-400',
    };
  }

  // 5. Filmes & Séries
  if (
    cat.includes('filme') ||
    cat.includes('cinema') ||
    cat.includes('movie') ||
    cat.includes('series') ||
    cat.includes('lazer') ||
    canal.categoria === 'Filmes' ||
    name.includes('telecine') ||
    name.includes('hbo') ||
    name.includes('cinemax') ||
    name.includes('megapix') ||
    name.includes('canal brasil') ||
    name.includes('warner') ||
    name.includes('sony channel') ||
    name.includes('axn') ||
    name.includes('universal') ||
    name.includes('star channel') ||
    name.includes('fx') ||
    name.includes('cinecanal') ||
    name.includes('eurochannel') ||
    name.includes('amc') ||
    name.includes('tcm') ||
    name.includes('apple tv')
  ) {
    return {
      categoria: 'Filmes',
      filtro: 'Filmes',
      label: 'Filmes & Séries',
      icon: '🍿',
      badgeBg: 'bg-purple-500/15 hover:bg-purple-500/25',
      textColor: 'text-purple-300',
      borderColor: 'border-purple-500/30',
      dotColor: 'bg-purple-400',
    };
  }

  // 6. Esportes (Categoria principal de esportes)
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
  } else if (comps.includes('champions league') || name.includes('champions') || name.includes('campeones')) {
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

  if (comps.includes('libertadores') || name.includes('libertadores')) return 'Libertadores';
  if (comps.includes('champions league') || name.includes('champions')) return 'Champions';
  if (comps.includes('laliga') || name.includes('laliga') || name.includes('la liga')) return 'LaLiga';
  if (canal.rede === 'TNT Sports' || name.includes('tnt sports')) return 'TNT Sports';
  if (comps.includes('nba') || name.includes('nba')) return 'NBA';
  if (comps.includes('mls') || name.includes('mls')) return 'MLS';

  if (canal.categoria === 'Bonecos' || name.includes('cartoon') || name.includes('anime')) return 'Desenhos';
  if (canal.categoria === 'Novelas') return 'Novelas';
  if (canal.categoria === 'Notícias') return 'Notícias';
  if (canal.categoria === 'Músicas') return 'Músicas';
  if (canal.categoria === 'Filmes') return 'Filmes';

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
  if (name.includes('f1') || name.includes('formula') || name.includes('racing')) return 'Velocidade';
  return canal.categoria || 'Esportes';
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
      label: 'Champions',
      badgeBg: 'bg-sky-500/15',
      textColor: 'text-sky-400',
      borderColor: 'border-sky-500/40',
      iconText: '⭐',
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

  if (comps.includes('laliga') || name.includes('laliga') || name.includes('la liga')) {
    return {
      label: 'LaLiga',
      badgeBg: 'bg-rose-500/15',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      iconText: '🇪🇸',
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

  if (canal.rede === 'DAZN' || name.includes('dazn')) {
    return {
      label: 'DAZN',
      badgeBg: 'bg-zinc-800',
      textColor: 'text-zinc-200',
      borderColor: 'border-zinc-700',
      iconText: '🥊',
    };
  }

  if (canal.rede === 'Sport TV' || name.includes('sport tv')) {
    return {
      label: 'Sport TV',
      badgeBg: 'bg-blue-500/15',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      iconText: '⚽',
    };
  }

  if (canal.rede === 'ZAP' || canal.pais === 'AO' || name.includes('zap') || name.includes('angola')) {
    return {
      label: 'ZAP Angola',
      badgeBg: 'bg-orange-500/15',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      iconText: '🇦🇴',
    };
  }

  if (canal.pais === 'PT' || name.includes('portugal') || name.includes('rtp') || name.includes('sic') || name.includes('tvi')) {
    return {
      label: 'Portugal',
      badgeBg: 'bg-emerald-500/15',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      iconText: '🇵🇹',
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
    iconText: '📺',
  };
}
