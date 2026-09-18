-- ==============================================================================
-- WORSCOI TV & STREAMING - ESQUEMA COMPLETO PARA SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Este script configura o banco de dados completo no Supabase SQL Editor:
-- 1. Extensões e Tipos
-- 2. Tabela de Perfis de Usuários (sincronizada com Supabase Auth)
-- 3. Tabela de Grade de Canais (com HLS e contingência)
-- 4. Tabela de Tokens e Chaves de Acesso
-- 5. Tabela de Assinaturas e Transações Financeiras
-- 6. Tabela de Notificações Globais em Tempo Real
-- 7. Tabela de Favoritos e Histórico
-- 8. Funções e Triggers Automáticos (Criação de perfil e resgate de token)
-- 9. Políticas de Segurança RLS (Row Level Security)
-- 10. Carga Inicial com os Canais Z Sports (LaLiga, Sport 1 HD, Sport 2)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABELA: PROFILES (Perfis de Usuários)
-- Conectada diretamente ao auth.users do Supabase
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'subscriber', 'vip', 'admin')),
    plano TEXT NOT NULL DEFAULT 'free' CHECK (plano IN ('free', 'mensal', 'trimestral', 'semestral', 'anual', 'vip')),
    plano_ativo BOOLEAN NOT NULL DEFAULT false,
    plano_expira_em TIMESTAMPTZ,
    telefone TEXT,
    pais TEXT DEFAULT 'AO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================================
-- 3. TABELA: CANAIS (Grade de Transmissão HLS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.canais (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'Esportes',
    grupo TEXT,
    rede TEXT,
    pais TEXT DEFAULT 'AO',
    idioma TEXT DEFAULT 'pt',
    qualidade TEXT DEFAULT '1080p FHD',
    descricao TEXT,
    logo TEXT,
    url TEXT NOT NULL,
    backup_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    competicoes TEXT[] DEFAULT ARRAY[]::TEXT[],
    ativo BOOLEAN NOT NULL DEFAULT true,
    destaque BOOLEAN NOT NULL DEFAULT false,
    ordem INTEGER NOT NULL DEFAULT 0,
    visualizacoes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_canais_categoria ON public.canais(categoria);
CREATE INDEX IF NOT EXISTS idx_canais_ativo ON public.canais(ativo);
CREATE INDEX IF NOT EXISTS idx_canais_ordem ON public.canais(ordem);

-- ==============================================================================
-- 4. TABELA: TOKENS_ACESSO (Chaves de Ativação / Vouchers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tokens_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT UNIQUE NOT NULL,
    plano_id TEXT NOT NULL CHECK (plano_id IN ('mensal', 'trimestral', 'semestral', 'anual', 'vip')),
    duracao_dias INTEGER NOT NULL DEFAULT 30,
    ativo BOOLEAN NOT NULL DEFAULT true,
    resgatado BOOLEAN NOT NULL DEFAULT false,
    resgatado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resgatado_em TIMESTAMPTZ,
    criado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expira_em TIMESTAMPTZ,
    observacao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tokens_chave ON public.tokens_acesso(chave);
CREATE INDEX IF NOT EXISTS idx_tokens_ativo ON public.tokens_acesso(ativo, resgatado);

-- ==============================================================================
-- 5. TABELA: ASSINATURAS E TRANSAÇÕES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plano_id TEXT NOT NULL,
    valor NUMERIC(12, 2) NOT NULL,
    moeda TEXT NOT NULL DEFAULT 'AOA',
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'recusado', 'expirado', 'cancelado')),
    metodo_pagamento TEXT NOT NULL DEFAULT 'multicaixa_express' CHECK (metodo_pagamento IN ('multicaixa_express', 'pix', 'stripe', 'transferencia', 'token')),
    recibo_numero TEXT UNIQUE,
    comprovativo_url TEXT,
    data_inicio TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    data_fim TIMESTAMPTZ NOT NULL,
    aprovado_por UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_user ON public.assinaturas(user_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON public.assinaturas(status);

-- ==============================================================================
-- 6. TABELA: NOTIFICACOES_BROADCAST (Avisos aos Clientes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notificacoes_broadcast (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'alerta', 'promocao', 'jogo', 'sistema')),
    canal_id TEXT REFERENCES public.canais(id) ON DELETE SET NULL,
    link TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_por UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_ativo ON public.notificacoes_broadcast(ativo);

-- ==============================================================================
-- 7. TABELA: FAVORITOS E HISTÓRICO DE REPRODUÇÃO
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    canal_id TEXT NOT NULL REFERENCES public.canais(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, canal_id)
);

CREATE TABLE IF NOT EXISTS public.historico_reproducao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    canal_id TEXT NOT NULL REFERENCES public.canais(id) ON DELETE CASCADE,
    tempo_assistido_segundos INTEGER DEFAULT 0,
    ultimo_acesso TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_historico_user ON public.historico_reproducao(user_id, ultimo_acesso DESC);

-- ==============================================================================
-- 8. TRIGGERS & FUNÇÕES AUTOMÁTICAS
-- ==============================================================================

-- A. Atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_canais_updated_at ON public.canais;
CREATE TRIGGER set_canais_updated_at
    BEFORE UPDATE ON public.canais
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_assinaturas_updated_at ON public.assinaturas;
CREATE TRIGGER set_assinaturas_updated_at
    BEFORE UPDATE ON public.assinaturas
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- B. Criação automática de perfil ao cadastrar usuário no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome, role, plano)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        'free'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- C. Função RPC: Resgatar Chave de Token com segurança
CREATE OR REPLACE FUNCTION public.resgatar_token_acesso(chave_input TEXT, usuario_id UUID)
RETURNS JSONB AS $$
DECLARE
    token_record RECORD;
    nova_data_fim TIMESTAMPTZ;
BEGIN
    -- Busca o token ativo
    SELECT * INTO token_record
    FROM public.tokens_acesso
    WHERE chave = UPPER(TRIM(chave_input))
      AND ativo = true
      AND resgatado = false;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Chave inválida, já utilizada ou expirada.');
    END IF;

    -- Calcula nova data de expiração
    nova_data_fim := timezone('utc'::text, now()) + (token_record.duracao_dias || ' days')::INTERVAL;

    -- Atualiza o token
    UPDATE public.tokens_acesso
    SET resgatado = true,
        resgatado_por = usuario_id,
        resgatado_em = timezone('utc'::text, now())
    WHERE id = token_record.id;

    -- Atualiza o perfil do usuário para VIP/Assinante
    UPDATE public.profiles
    SET role = CASE WHEN token_record.plano_id = 'vip' THEN 'vip' ELSE 'subscriber' END,
        plano = token_record.plano_id,
        plano_ativo = true,
        plano_expira_em = nova_data_fim
    WHERE id = usuario_id;

    -- Registra na tabela de assinaturas
    INSERT INTO public.assinaturas (
        user_id,
        plano_id,
        valor,
        moeda,
        status,
        metodo_pagamento,
        recibo_numero,
        data_inicio,
        data_fim
    ) VALUES (
        usuario_id,
        token_record.plano_id,
        0,
        'AOA',
        'ativo',
        'token',
        'REC-TOK-' || substr(md5(random()::text), 1, 8),
        timezone('utc'::text, now()),
        nova_data_fim
    );

    RETURN jsonb_build_object(
        'success', true,
        'plano', token_record.plano_id,
        'duracao_dias', token_record.duracao_dias,
        'expira_em', nova_data_fim
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_broadcast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_reproducao ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles:
CREATE POLICY "Leitura de perfil próprio ou admin" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Atualização do próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas de Canais:
CREATE POLICY "Leitura pública de canais ativos" ON public.canais
    FOR SELECT USING (ativo = true);

CREATE POLICY "Admins podem gerenciar todos os canais" ON public.canais
    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Políticas de Notificações:
CREATE POLICY "Leitura pública de notificações ativas" ON public.notificacoes_broadcast
    FOR SELECT USING (ativo = true);

CREATE POLICY "Admins criam e editam notificações" ON public.notificacoes_broadcast
    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Políticas de Tokens:
CREATE POLICY "Apenas administradores gerenciam tokens" ON public.tokens_acesso
    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Políticas de Favoritos:
CREATE POLICY "Usuário gerencia seus favoritos" ON public.favoritos
    FOR ALL USING (auth.uid() = user_id);

-- Políticas de Histórico:
CREATE POLICY "Usuário gerencia seu histórico" ON public.historico_reproducao
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 10. CARGA INICIAL (SEED DATA): CANAIS Z SPORTS & CANAIS ESSENCIAIS
-- ==============================================================================
INSERT INTO public.canais (id, nome, categoria, grupo, rede, pais, qualidade, descricao, competicoes, url, backup_urls, ordem, destaque)
VALUES
(
    'z-sports-laliga-hd',
    'Z Sports LaLiga HD',
    'Esportes',
    'ZAP Esportes',
    'ZAP',
    'AO',
    '1080p FHD',
    'Transmissão oficial em português de todos os jogos de LaLiga EA Sports (Espanha), Real Madrid, Barcelona e Copa del Rey.',
    ARRAY['LaLiga', 'Copa del Rey', 'El Clásico'],
    'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8?channel=z-sports-laliga-hd',
    ARRAY['https://vivo.canaloncelive.tv/secureoncedos/oncedigital/playlist.m3u8', 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8'],
    1,
    true
),
(
    'z-sport-1-hd',
    'Z Sport 1 HD',
    'Esportes',
    'ZAP Esportes',
    'ZAP',
    'AO',
    '1080p FHD',
    'Canal principal de futebol e competições ao vivo da ZAP: Girabola ZAP, UEFA Champions League e Premier League.',
    ARRAY['Girabola', 'Champions League', 'Premier League', 'Taça de Angola'],
    'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8?channel=z-sport-1-hd',
    ARRAY['https://cdn.freevisiontv.co.za/sttv/smil:1kzn.stream.smil/playlist.m3u8', 'https://vivo.canaloncelive.tv/secureoncedos/oncedigital/playlist.m3u8'],
    2,
    true
),
(
    'z-sport-2-hd',
    'Z Sport 2 HD',
    'Esportes',
    'ZAP Esportes',
    'ZAP',
    'AO',
    '1080p FHD',
    'Segundo canal esportivo da ZAP: Serie A italiana, basquetebol da NBA e Unitel Basket e UFC.',
    ARRAY['NBA', 'Serie A', 'Girabola', 'UFC'],
    'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8?channel=z-sport-2-hd',
    ARRAY['https://bein-xtra-bein.amagi.tv/playlist.m3u8', 'https://5eaccbab48461.streamlock.net:1936/8264/8264/playlist.m3u8'],
    3,
    true
),
(
    'tnt-sports-brasil-hd',
    'TNT Sports Brasil HD',
    'Esportes',
    'TNT Sports',
    'TNT Sports',
    'BR',
    '1080p FHD',
    'Transmissões completas da UEFA Champions League, Paulistão e NBA.',
    ARRAY['Champions League', 'NBA', 'Paulistão'],
    'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8?channel=tnt-sports-brasil-hd',
    ARRAY['http://45.162.64.114/SPACE/index.m3u8'],
    4,
    false
)
ON CONFLICT (id) DO UPDATE 
SET nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    url = EXCLUDED.url,
    backup_urls = EXCLUDED.backup_urls,
    competicoes = EXCLUDED.competicoes;

-- Inserção de Chaves de Token de Teste para o Administrador
INSERT INTO public.tokens_acesso (chave, plano_id, duracao_dias, observacao)
VALUES 
('WOR-VIP-2026', 'vip', 365, 'Chave Anual VIP Master'),
('WOR-LALIGA-30', 'mensal', 30, 'Chave Mensal Acesso LaLiga & Z Sports')
ON CONFLICT (chave) DO NOTHING;
