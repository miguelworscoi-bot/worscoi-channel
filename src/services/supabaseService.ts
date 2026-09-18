/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Canal, CategoriaCanalGeral } from '@/types';

// =========================================================================
// WORSCOI TV - CLIENTE E SERVIÇO SUPABASE (POSTGRESQL & REALTIME)
// =========================================================================

interface SupabaseCanalRecord {
  id: string;
  nome: string;
  categoria?: string;
  grupo?: string;
  rede?: string;
  pais?: string;
  logo?: string;
  url: string;
  backup_urls?: string[];
  qualidade?: string;
  ativo?: boolean;
  ordem?: number;
}

interface SupabaseTokenRedeemResponse {
  success: boolean;
  message?: string;
  plano?: string;
  duracao_dias?: number;
  expira_em?: string;
}

let supabaseInstance: SupabaseClient | null = null;

/**
 * Retorna as credenciais do Supabase a partir das variáveis de ambiente Vite.
 */
export function getSupabaseCredentials(): { url: string | undefined; anonKey: string | undefined } {
  const envObj = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const url = envObj?.VITE_SUPABASE_URL;
  const anonKey = envObj?.VITE_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

/**
 * Verifica se as variáveis de ambiente do Supabase estão configuradas.
 */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && url.trim().length > 0 && anonKey && anonKey.trim().length > 0);
}

/**
 * Inicializa e retorna a instância singleton do cliente Supabase.
 * Se as chaves não estiverem no .env, retorna null de forma segura sem travar o app.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (error) {
    console.warn('[Supabase] Erro ao inicializar cliente Supabase:', error);
    return null;
  }
}

/**
 * Testa a conexão em tempo real com o banco de dados Supabase.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  channelCount?: number;
  tablesFound?: string[];
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no ambiente.',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      connected: false,
      message: 'Falha ao inicializar o cliente Supabase.',
    };
  }

  try {
    // Tenta consultar a tabela de canais
    const { data, error, count } = await supabase
      .from('canais')
      .select('id, nome', { count: 'exact' })
      .limit(5);

    if (error) {
      return {
        connected: false,
        message: `Erro na consulta SQL: ${error.message} (Código: ${error.code})`,
      };
    }

    return {
      connected: true,
      message: 'Conectado com sucesso ao PostgreSQL do Supabase!',
      channelCount: count ?? data?.length ?? 0,
      tablesFound: ['canais', 'profiles', 'tokens_acesso', 'notificacoes_broadcast'],
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `Exceção de rede ou SSL: ${errorMsg}`,
    };
  }
}

/**
 * Busca todos os canais ativos cadastrados no Supabase.
 */
export async function fetchCanaisFromSupabase(): Promise<Canal[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('canais')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error || !data) {
      console.warn('[Supabase] Erro ao buscar canais:', error?.message);
      return [];
    }

    return (data as SupabaseCanalRecord[]).map((item) => ({
      id: item.id,
      nome: item.nome,
      categoria: (item.categoria as CategoriaCanalGeral) || 'Esportes',
      grupo: item.grupo,
      rede: item.rede as Canal['rede'],
      pais: item.pais,
      logo: item.logo || '',
      url: item.url,
      backupUrls: item.backup_urls || [],
      qualidade: item.qualidade,
    }));
  } catch (error) {
    console.error('[Supabase] Falha ao carregar canais do Supabase:', error);
    return [];
  }
}

/**
 * Salva ou atualiza um canal no Supabase.
 */
export async function upsertCanalInSupabase(canal: Canal): Promise<{ success: boolean; message?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase não configurado.' };
  }

  try {
    const payload = {
      id: canal.id || canal.nome.toLowerCase().replace(/\s+/g, '-'),
      nome: canal.nome,
      categoria: canal.categoria || 'Esportes',
      grupo: (canal as { grupo?: string }).grupo || 'Worscoi TV',
      rede: canal.rede || 'ZAP',
      pais: canal.pais || 'AO',
      logo: canal.logo,
      url: canal.url,
      backup_urls: canal.backupUrls || [],
      ativo: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('canais').upsert(payload, { onConflict: 'id' });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, message: msg };
  }
}

/**
 * Resgata uma chave de token no Supabase via Procedure RPC.
 */
export async function redeemTokenInSupabase(
  chave: string,
  userId: string
): Promise<SupabaseTokenRedeemResponse> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase não está configurado.' };
  }

  try {
    const { data, error } = await supabase.rpc('resgatar_token_acesso', {
      chave_input: chave,
      usuario_id: userId,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return data as SupabaseTokenRedeemResponse;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

/**
 * Assina atualizações em tempo real (Supabase Realtime) na tabela de canais.
 */
export function subscribeToCanaisRealtime(onUpdate: () => void): (() => void) | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('public:canais')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'canais' }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.warn('[Supabase Realtime] Erro ao assinar tabela de canais:', error);
    return null;
  }
}
