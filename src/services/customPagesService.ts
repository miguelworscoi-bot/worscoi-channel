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

// Páginas padrão (inicia vazio para não poluir o menu)
export const PAGINAS_PERSONALIZADAS_PADRAO: CustomPage[] = [];

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
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PAGES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filtra páginas de exemplo eliminadas
      return parsed.filter(
        (p: CustomPage) => p.id !== 'page_jogos_hoje' && p.id !== 'page_canais_vip' && p.id !== 'page_parceiros'
      );
    }
  } catch (err) {
    console.error('Erro ao ler páginas personalizadas:', err);
  }
  return [];
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
