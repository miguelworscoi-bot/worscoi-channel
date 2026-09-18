/**
 * Serviço de Gerenciamento e Persistência de Páginas com Links Personalizados
 * Permite criar páginas dedicadas no Worscoi com URLs amigáveis, embeds, botões e listas de links.
 */

export interface CustomLinkItem {
  id: string;
  titulo: string;
  url: string;
  descricao?: string;
  categoria?: string;
  icone?: string; // 'tv' | 'link' | 'video' | 'globe' | 'star' | 'external'
  destaque?: boolean;
}

export interface CustomPage {
  id: string;
  slug: string; // Ex: "jogos-do-dia", "zap-sports", "parceiros", "guia-vip"
  titulo: string;
  descricao?: string;
  icone?: string; // Nome do ícone ou chave
  badge?: string; // Ex: "NOVO", "VIP", "LIVE"
  badgeCor?: string; // Ex: "emerald", "cyan", "rose", "amber"
  ativoNoMenu: boolean; // Se deve ser exibida na barra lateral e atalhos
  ordem?: number;
  tipoConteudo: 'links_list' | 'iframe_embed' | 'canal_redirect';
  embedUrl?: string; // Usado quando tipoConteudo for 'iframe_embed'
  links: CustomLinkItem[];
  criadoEm: string;
  atualizadoEm: string;
}

const LOCAL_STORAGE_CUSTOM_PAGES_KEY = 'worscoi_custom_pages_v1';

// Páginas padrão ativadas automaticamente para enriquecer a experiência
export const PAGINAS_PERSONALIZADAS_PADRAO: CustomPage[] = [
  {
    id: 'page_jogos_hoje',
    slug: 'jogos-do-dia',
    titulo: 'Jogos do Dia & Agenda',
    descricao: 'Guia completo com os principais confrontos de futebol e links diretos para assistir',
    icone: 'calendar',
    badge: 'AO VIVO',
    badgeCor: 'rose',
    ativoNoMenu: true,
    ordem: 1,
    tipoConteudo: 'links_list',
    links: [
      {
        id: 'link_zap1',
        titulo: 'ZAP Sports 1 — LaLiga & Girabola',
        url: '/?canal=zap-sports-1',
        descricao: 'Cobertura ao vivo em HD dos maiores clássicos',
        categoria: 'Futebol Ao Vivo',
        icone: 'tv',
        destaque: true,
      },
      {
        id: 'link_zap2',
        titulo: 'ZAP Sports 2 — Transmissão Simultânea',
        url: '/?canal=zap-sports-2',
        descricao: 'Segunda tela com jogos simultâneos',
        categoria: 'Futebol Ao Vivo',
        icone: 'tv',
        destaque: false,
      },
      {
        id: 'link_tnt',
        titulo: 'TNT Sports & Champions League',
        url: '/?canal=tnt-sports',
        descricao: 'Os maiores clubes da Europa ao vivo',
        categoria: 'UEFA Champions League',
        icone: 'star',
        destaque: true,
      },
      {
        id: 'link_espn',
        titulo: 'ESPN & Premier League Inglesa',
        url: '/?canal=espn',
        descricao: 'Campeonato Inglês e ligas internacionais',
        categoria: 'Futebol Internacional',
        icone: 'globe',
        destaque: false,
      },
    ],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'page_canais_vip',
    slug: 'canais-vip',
    titulo: 'Canais VIP & Premium',
    descricao: 'Acesso rápido e direto às transmissões de alta performance da rede',
    icone: 'sparkles',
    badge: 'PRO',
    badgeCor: 'cyan',
    ativoNoMenu: true,
    ordem: 2,
    tipoConteudo: 'links_list',
    links: [
      {
        id: 'link_premiere',
        titulo: 'Premiere Clubes — Multijogos',
        url: '/?canal=premiere',
        descricao: 'Transmissão contínua com qualidade adaptativa',
        categoria: 'Assinatura',
        icone: 'tv',
        destaque: true,
      },
      {
        id: 'link_sportv',
        titulo: 'SporTV HD — Cobertura Esportiva 24h',
        url: '/?canal=sportv',
        descricao: 'Notícias, debates e transmissões ao vivo',
        categoria: 'Esportes Gerais',
        icone: 'tv',
        destaque: false,
      },
      {
        id: 'link_ge',
        titulo: 'Portal de Resultados & Tabelas GE',
        url: 'https://ge.globo.com/',
        descricao: 'Acompanhe a tabela oficial, classificação e estatísticas',
        categoria: 'Estatísticas',
        icone: 'external',
        destaque: false,
      },
    ],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 'page_parceiros',
    slug: 'parceiros',
    titulo: 'Central de Parceiros & Links',
    descricao: 'Portais esportivos oficiais, suporte da comunidade e comunidades de transmissão',
    icone: 'share-2',
    badge: 'LINKS',
    badgeCor: 'emerald',
    ativoNoMenu: true,
    ordem: 3,
    tipoConteudo: 'links_list',
    links: [
      {
        id: 'link_suporte_zap',
        titulo: 'Suporte Oficial Worscoi no WhatsApp',
        url: 'https://wa.me/244900000000?text=Ol%C3%A1%2C%20gostaria%20de%20ajuda%20com%20o%20Worscoi%20PRO',
        descricao: 'Atendimento rápido e ativação de chaves de assinatura',
        categoria: 'Suporte',
        icone: 'globe',
        destaque: true,
      },
      {
        id: 'link_zap_ao',
        titulo: 'Guia de Programação ZAP TV',
        url: 'https://www.zap.co.ao/',
        descricao: 'Consulte a grade completa da ZAP Angola e Moçambique',
        categoria: 'Oficial',
        icone: 'external',
        destaque: false,
      },
    ],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
];

/**
 * Normaliza qualquer texto para um slug de URL seguro
 */
export function formatSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'pagina';
}

/**
 * Carrega todas as páginas personalizadas do localStorage (com fallback para as padrões)
 */
export function getCustomPages(): CustomPage[] {
  if (typeof window === 'undefined') return PAGINAS_PERSONALIZADAS_PADRAO;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PAGES_KEY);
    if (!raw) {
      // Salva as padrões no primeiro acesso
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_PAGES_KEY, JSON.stringify(PAGINAS_PERSONALIZADAS_PADRAO));
      return PAGINAS_PERSONALIZADAS_PADRAO;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Erro ao ler páginas personalizadas:', err);
  }
  return PAGINAS_PERSONALIZADAS_PADRAO;
}

/**
 * Salva a lista inteira de páginas personalizadas no localStorage
 */
export function saveCustomPages(pages: CustomPage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_PAGES_KEY, JSON.stringify(pages));
    // Dispara evento customizado para sincronizar abas e componentes instantaneamente
    window.dispatchEvent(new CustomEvent('worscoi_custom_pages_updated', { detail: pages }));
  } catch (err) {
    console.error('Erro ao salvar páginas personalizadas:', err);
  }
}

/**
 * Cria ou atualiza uma página personalizada
 */
export function upsertCustomPage(pageData: Partial<CustomPage> & { titulo: string }): CustomPage {
  const existing = getCustomPages();
  const slug = formatSlug(pageData.slug || pageData.titulo);
  const now = new Date().toISOString();

  const id = pageData.id || `page_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const index = existing.findIndex((p) => p.id === id || p.slug === slug);

  const newPage: CustomPage = {
    id,
    slug,
    titulo: pageData.titulo.trim(),
    descricao: pageData.descricao?.trim() || '',
    icone: pageData.icone || 'link',
    badge: pageData.badge?.trim(),
    badgeCor: pageData.badgeCor || 'cyan',
    ativoNoMenu: pageData.ativoNoMenu ?? true,
    ordem: pageData.ordem ?? existing.length + 1,
    tipoConteudo: pageData.tipoConteudo || 'links_list',
    embedUrl: pageData.embedUrl?.trim(),
    links: pageData.links || [],
    criadoEm: index >= 0 ? existing[index].criadoEm : now,
    atualizadoEm: now,
  };

  let updatedList: CustomPage[];
  if (index >= 0) {
    updatedList = [...existing];
    updatedList[index] = newPage;
  } else {
    updatedList = [...existing, newPage];
  }

  saveCustomPages(updatedList);
  return newPage;
}

/**
 * Remove uma página personalizada
 */
export function deleteCustomPage(id: string): void {
  const existing = getCustomPages();
  const filtered = existing.filter((p) => p.id !== id && p.slug !== id);
  saveCustomPages(filtered);
}

/**
 * Adiciona um link a uma página existente
 */
export function addLinkToPage(pageSlugOrId: string, link: Omit<CustomLinkItem, 'id'>): CustomPage | null {
  const existing = getCustomPages();
  const index = existing.findIndex((p) => p.id === pageSlugOrId || p.slug === pageSlugOrId);
  if (index === -1) return null;

  const target = existing[index];
  const newLinkItem: CustomLinkItem = {
    ...link,
    id: `link_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };

  const updatedPage: CustomPage = {
    ...target,
    links: [newLinkItem, ...(target.links || [])],
    atualizadoEm: new Date().toISOString(),
  };

  existing[index] = updatedPage;
  saveCustomPages(existing);
  return updatedPage;
}

/**
 * Remove um link de uma página existente
 */
export function removeLinkFromPage(pageSlugOrId: string, linkId: string): CustomPage | null {
  const existing = getCustomPages();
  const index = existing.findIndex((p) => p.id === pageSlugOrId || p.slug === pageSlugOrId);
  if (index === -1) return null;

  const target = existing[index];
  const updatedPage: CustomPage = {
    ...target,
    links: (target.links || []).filter((l) => l.id !== linkId),
    atualizadoEm: new Date().toISOString(),
  };

  existing[index] = updatedPage;
  saveCustomPages(existing);
  return updatedPage;
}
