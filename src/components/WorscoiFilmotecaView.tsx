'use client';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Film,
  ArrowLeft,
  Play,
  Loader2,
  X,
  Search,
  Info,
  Clapperboard,
  SlidersHorizontal,
  RotateCw,
  ExternalLink,
  Sparkles,
  Maximize2,
  Zap,
  ShieldCheck,
  Globe2,
  Tv,
  Star,
  AlertTriangle,
  Flame,
  LayoutGrid,
  Layers,
  Heart,
  Ghost,
  Laugh,
  Rocket
} from 'lucide-react';
import { FilmeItem } from '@/app/api/filmes/route';
import {
  StreamService,
  StreamProviderId,
  STREAM_IFRAME_ALLOW,
  STREAM_REFERRER_POLICY
} from '@/services/streamService';
import { FilmeCard } from '@/components/FilmeCard';
import { FilmotecaGenreRow } from '@/components/FilmotecaGenreRow';
import { FilmotecaImdbModal } from '@/components/FilmotecaImdbModal';
import { ImdbService } from '@/services/imdbService';

interface WorscoiFilmotecaViewProps {
  onBackToTV: () => void;
}

const LOCAL_STORAGE_FILMOTECAS_KEY = 'playsports_filmoteca_cache_v23';
const LOCAL_STORAGE_FILMOTECAS_TIME_KEY = 'playsports_filmoteca_cache_time_v23';
// Cache de 6 horas
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type ServidorFilme = StreamProviderId;

export function obterUrlFilme(
  filme: FilmeItem,
  servidor: ServidorFilme,
  season: number = 1,
  episode: number = 1
): string {
  return StreamService.getUrlForProvider(filme, servidor, season, episode);
}

export function obterServidorPadrao(filme: FilmeItem): ServidorFilme {
  if (filme.directStreamUrl) return 'direct';
  if (filme.imdbId) return 'videasy';
  if (filme.tmdbId) return 'vidsrc';
  return 'videasy';
}

export interface SecaoGeneroConfig {
  id: string;
  titulo: string;
  subtitulo?: string;
  icon: React.ReactNode;
  corDestaque: string;
  badgeBg: string;
  test: (f: FilmeItem) => boolean;
}

export const SECOES_GENERO: SecaoGeneroConfig[] = [
  {
    id: 'imdb-top',
    titulo: 'IMDb Top 250 & Aclamados',
    subtitulo: 'As maiores notas da história do cinema, séries e animações no ranking oficial IMDb',
    icon: <Star className="w-4 h-4 fill-[#f5c518] text-[#f5c518]" />,
    corDestaque: 'text-[#f5c518]',
    badgeBg: 'bg-[#f5c518]/15 text-[#f5c518] border-[#f5c518]/40',
    test: (f) => {
      const r = f.rating ? parseFloat(f.rating) : 0;
      return Boolean(
        String(f.id).includes('imdb') ||
        (f.imdbId && f.imdbId.startsWith('tt')) ||
        r >= 8.5
      );
    }
  },
  {
    id: 'lancamentos',
    titulo: 'Novos Lançamentos & Em Alta',
    subtitulo: 'Grandes sucessos recentes do cinema e streaming',
    icon: <Flame className="w-4 h-4" />,
    corDestaque: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    test: (f) => {
      const anoNum = parseInt(f.ano, 10);
      return Boolean(f.plataforma || (anoNum && anoNum >= 2024));
    }
  },
  {
    id: 'acao',
    titulo: 'Ação & Aventura',
    subtitulo: 'Adrenalina, combates eletrizantes e jornadas épicas',
    icon: <Zap className="w-4 h-4" />,
    corDestaque: 'text-orange-400',
    badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('acao') ||
        g.includes('ação') ||
        g.includes('action') ||
        g.includes('aventura') ||
        g.includes('adventure')
      );
    }
  },
  {
    id: 'anime',
    titulo: 'Animes & Animação',
    subtitulo: 'Sagas lendárias, produções Crunchyroll e shonens',
    icon: <Sparkles className="w-4 h-4" />,
    corDestaque: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        f.tipo === 'anime' ||
        f.plataforma === 'crunchyroll' ||
        g.includes('anime') ||
        g.includes('animacao') ||
        g.includes('animação') ||
        g.includes('animation')
      );
    }
  },
  {
    id: 'drama',
    titulo: 'Drama & Histórias Profundas',
    subtitulo: 'Roteiros consagrados, biografias e atuações premiadas',
    icon: <Heart className="w-4 h-4" />,
    corDestaque: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('drama') ||
        g.includes('biografia') ||
        g.includes('historia') ||
        g.includes('romance')
      );
    }
  },
  {
    id: 'scifi',
    titulo: 'Ficção Científica & Fantasia',
    subtitulo: 'Futuros distópicos, cosmos, magia e tecnologia',
    icon: <Rocket className="w-4 h-4" />,
    corDestaque: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('ficcao') ||
        g.includes('ficção') ||
        g.includes('sci-fi') ||
        g.includes('fantasia') ||
        g.includes('fantasy')
      );
    }
  },
  {
    id: 'comedia',
    titulo: 'Comédia & Diversão',
    subtitulo: 'O melhor humor para relaxar e dar boas risadas',
    icon: <Laugh className="w-4 h-4" />,
    corDestaque: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return g.includes('comedia') || g.includes('comédia') || g.includes('comedy');
    }
  },
  {
    id: 'terror',
    titulo: 'Terror, Suspense & Mistério',
    subtitulo: 'Frio na espinha, mistérios sombrios e suspense psicológico',
    icon: <Ghost className="w-4 h-4" />,
    corDestaque: 'text-red-400',
    badgeBg: 'bg-red-500/10 text-red-300 border-red-500/30',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('terror') ||
        g.includes('horror') ||
        g.includes('suspense') ||
        g.includes('thriller') ||
        g.includes('misterio') ||
        g.includes('mistério')
      );
    }
  },
  {
    id: 'crime',
    titulo: 'Crime & Policial',
    subtitulo: 'Máfia, golpes, tribunais e investigações policiais',
    icon: <ShieldCheck className="w-4 h-4" />,
    corDestaque: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      return (
        g.includes('crime') ||
        g.includes('policial') ||
        g.includes('investigacao') ||
        g.includes('investigação')
      );
    }
  },
  {
    id: 'super-herois',
    titulo: 'Heróis, HQs & Universos Épicos',
    subtitulo: 'Homem-Aranha, Batman, Superman, Liga da Justiça, DC & Marvel',
    icon: <ShieldCheck className="w-4 h-4" />,
    corDestaque: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    test: (f) => {
      const t = (f.titulo || '').toLowerCase();
      const g = (f.genero || '').toLowerCase();
      const s = (f.sinopse || '').toLowerCase();
      return (
        t.includes('homem-aranha') ||
        t.includes('spider-man') ||
        t.includes('aranhaverso') ||
        t.includes('batman') ||
        t.includes('superman') ||
        t.includes('homem de aço') ||
        t.includes('liga da justiça') ||
        t.includes('justice league') ||
        t.includes('flash') ||
        t.includes('demolidor') ||
        t.includes('daredevil') ||
        t.includes('x-men') ||
        t.includes('guerra civil') ||
        t.includes('watchmen') ||
        t.includes('sandman') ||
        t.includes('invenc') ||
        t.includes('hellboy') ||
        t.includes('vingança') ||
        t.includes('lantern') ||
        g.includes('super-herói') ||
        g.includes('quadrinhos') ||
        s.includes('super-herói') ||
        s.includes('quadrinhos')
      );
    }
  },
  {
    id: 'series',
    titulo: 'Séries de TV & Temporadas',
    subtitulo: 'Temporadas completas com maratonas imperdíveis',
    icon: <Tv className="w-4 h-4" />,
    corDestaque: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    test: (f) => f.tipo === 'serie'
  },
  {
    id: 'classicos',
    titulo: 'Grandes Clássicos do Cinema',
    subtitulo: 'Obras imortais com avaliação máxima no IMDb',
    icon: <Star className="w-4 h-4" />,
    corDestaque: 'text-amber-300',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    test: (f) => {
      const anoNum = parseInt(f.ano, 10);
      return Boolean(f.isClassico || (anoNum && anoNum < 2000));
    }
  },
  {
    id: 'animacoes-imdb',
    titulo: 'Animações Lendárias (Disney, Pixar & Ghibli)',
    subtitulo: 'As maiores animações da história consagradas com notas estelares no IMDb',
    icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    corDestaque: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    test: (f) => {
      const g = (f.genero || '').toLowerCase();
      const t = (f.titulo || '').toLowerCase();
      return (
        f.tipo === 'anime' ||
        g.includes('animação') ||
        g.includes('animacao') ||
        g.includes('animation') ||
        t.includes('rei leão') ||
        t.includes('toy story') ||
        t.includes('aranhaverso') ||
        t.includes('wall-e') ||
        t.includes('chihiro') ||
        t.includes('mononoke') ||
        t.includes('totoro') ||
        t.includes('divertida mente') ||
        t.includes('viva: a vida') ||
        t.includes('como treinar') ||
        t.includes('up: altas')
      );
    }
  }
];

export function WorscoiFilmotecaView({ onBackToTV }: WorscoiFilmotecaViewProps) {
  const [filmes, setFilmes] = useState<FilmeItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const salvo = localStorage.getItem(LOCAL_STORAGE_FILMOTECAS_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignora erro
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const salvo = localStorage.getItem(LOCAL_STORAGE_FILMOTECAS_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return false;
        }
      }
    } catch {
      // Fallback
    }
    return true;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const [filmeAtivo, setFilmeAtivo] = useState<FilmeItem | null>(null);
  const [servidorAtivo, setServidorAtivo] = useState<ServidorFilme>('videasy');
  const [filmeSelecionado, setFilmeSelecionado] = useState<FilmeItem | null>(null);
  const [modoPlayer, setModoPlayer] = useState<ServidorFilme>('videasy');
  const [reloadKey, setReloadKey] = useState(0);
  const [busca, setBusca] = useState('');
  const [generoAtivo, setGeneroAtivo] = useState<string>('todos');
  const [modoVisualizacao, setModoVisualizacao] = useState<'secoes' | 'grelha'>('secoes');
  const [tipoFiltro, setTipoFiltro] = useState<
    'todos' | 'imdb' | 'animacao' | 'filme' | 'serie' | 'anime' | 'classico' | 'hbo' | 'disney' | 'netflix' | 'crunchyroll'
  >('todos');
  const [temporadaAtiva, setTemporadaAtiva] = useState<number>(1);
  const [episodioAtivo, setEpisodioAtivo] = useState<number>(1);
  const [modalTemporada, setModalTemporada] = useState<number>(1);
  const [modalEpisodio, setModalEpisodio] = useState<number>(1);
  const [isInsideIframe, setIsInsideIframe] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Estados e controle do Modal de Metadados Dinâmicos do IMDb
  const [modalImdbFilme, setModalImdbFilme] = useState<FilmeItem | null>(null);
  const [isModalImdbAberto, setIsModalImdbAberto] = useState<boolean>(false);
  const [buscandoNoImdbAoVivo, setBuscandoNoImdbAoVivo] = useState<boolean>(false);
  const [resultadosImdbAoVivo, setResultadosImdbAoVivo] = useState<FilmeItem[]>([]);
  const [mostrarResultadosImdbAoVivo, setMostrarResultadosImdbAoVivo] = useState<boolean>(false);

  const abrirModalImdb = useCallback((filme: FilmeItem) => {
    setModalImdbFilme(filme);
    setIsModalImdbAberto(true);
  }, []);

  const fecharModalImdb = useCallback(() => {
    setIsModalImdbAberto(false);
  }, []);

  const handlePlayFromImdb = useCallback((filme: FilmeItem, season?: number, episode?: number) => {
    setFilmeAtivo(filme);
    setServidorAtivo(obterServidorPadrao(filme));
    if (season) setTemporadaAtiva(season);
    if (episode) setEpisodioAtivo(episode);
    setReloadKey((k) => k + 1);
    setIsModalImdbAberto(false);
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handlePlayCinemaFromImdb = useCallback((filme: FilmeItem) => {
    setFilmeSelecionado(filme);
    setModoPlayer(obterServidorPadrao(filme));
    setIsModalImdbAberto(false);
  }, []);

  const handleSearchActorFromImdb = useCallback((actorName: string) => {
    setBusca(actorName);
    setGeneroAtivo('todos');
    setTipoFiltro('todos');
    setIsModalImdbAberto(false);
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setIsInsideIframe(window.self !== window.top);
      }
    } catch {
      setIsInsideIframe(true);
    }
  }, []);

  const alternarProximoServidor = useCallback(() => {
    if (!filmeAtivo) return;
    const proximo = StreamService.getNextProvider(filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo);
    setServidorAtivo(proximo);
    setReloadKey((k) => k + 1);
  }, [filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo]);

  const recarregarPlayer = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const carregarFilmes = useCallback(async (force = false) => {
    if (!force) {
      try {
        const salvo = localStorage.getItem(LOCAL_STORAGE_FILMOTECAS_KEY);
        const salvoTimestamp = localStorage.getItem(LOCAL_STORAGE_FILMOTECAS_TIME_KEY);
        if (salvo && salvoTimestamp) {
          const idade = Date.now() - Number(salvoTimestamp);
          if (idade < CACHE_MAX_AGE_MS) {
            const parsed = JSON.parse(salvo);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFilmes(parsed);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch {
        // Prossegue com fetch
      }
    }

    if (force) {
      setIsRefreshing(true);
    } else if (filmes.length === 0) {
      setIsLoading(true);
    }

    try {
      const res = await fetch('/api/filmes');
      if (!res.ok) throw new Error('Falha ao obter lista de filmes');
      const dados = await res.json();
      if (Array.isArray(dados) && dados.length > 0) {
        setFilmes(dados);
        try {
          localStorage.setItem(LOCAL_STORAGE_FILMOTECAS_KEY, JSON.stringify(dados));
          localStorage.setItem(LOCAL_STORAGE_FILMOTECAS_TIME_KEY, Date.now().toString());
        } catch {
          // Ignora cota excedida
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar filmes:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filmes.length]);

  useEffect(() => {
    carregarFilmes(false);
  }, [carregarFilmes]);

  // Define o filme ativo padrão com servidor ideal
  useEffect(() => {
    if (!filmeAtivo && filmes.length > 0) {
      const primeiro = filmes[0];
      setFilmeAtivo(primeiro);
      setServidorAtivo(obterServidorPadrao(primeiro));
    }
  }, [filmes, filmeAtivo]);

  // Busca remota oficial quando usuário pesquisa um título fora da lista local
  const executarBuscaGlobal = async (termo: string) => {
    if (!termo || termo.trim().length < 2) return;
    setIsSearchingRemote(true);
    setBuscandoNoImdbAoVivo(true);
    setMostrarResultadosImdbAoVivo(true);
    try {
      const [resLocal, resultadosImdb] = await Promise.allSettled([
        fetch(`/api/filmes?q=${encodeURIComponent(termo.trim())}`).then((r) =>
          r.ok ? (r.json() as Promise<FilmeItem[]>) : []
        ),
        ImdbService.pesquisarNoImdb(termo.trim())
      ]);

      if (resLocal.status === 'fulfilled' && Array.isArray(resLocal.value) && resLocal.value.length > 0) {
        const resultados = resLocal.value;
        setFilmes((prev) => {
          const idsExistentes = new Set(prev.map((f) => String(f.imdbId || f.id)));
          const novos = resultados.filter((r) => !idsExistentes.has(String(r.imdbId || r.id)));
          return [...novos, ...prev];
        });
        const primeiro = resultados[0];
        setFilmeAtivo(primeiro);
        setServidorAtivo(obterServidorPadrao(primeiro));
      }

      if (resultadosImdb.status === 'fulfilled' && Array.isArray(resultadosImdb.value)) {
        setResultadosImdbAoVivo(resultadosImdb.value);
      }
    } catch (err) {
      console.warn('Erro na busca remota:', err);
    } finally {
      setIsSearchingRemote(false);
      setBuscandoNoImdbAoVivo(false);
    }
  };

  // Busca focada puramente em metadados dinâmicos do IMDb
  const executarBuscaImdbAoVivo = async (termo: string) => {
    if (!termo || termo.trim().length < 2) return;
    setBuscandoNoImdbAoVivo(true);
    setMostrarResultadosImdbAoVivo(true);
    try {
      const resultados = await ImdbService.pesquisarNoImdb(termo.trim());
      setResultadosImdbAoVivo(resultados);
      if (resultados.length > 0) {
        // Se encontrar itens, também garante que estejam no catálogo local
        setFilmes((prev) => {
          const idsExistentes = new Set(prev.map((f) => String(f.imdbId || f.id)));
          const novos = resultados.filter((r) => !idsExistentes.has(String(r.imdbId || r.id)));
          return [...novos, ...prev];
        });
      }
    } catch (err) {
      console.warn('Erro ao pesquisar no IMDb:', err);
    } finally {
      setBuscandoNoImdbAoVivo(false);
    }
  };

  const normalizar = (texto: string) =>
    (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Filtragem base por categoria/plataforma (IMDb Top, animações, filmes, séries, animes, hbo, netflix, etc.)
  const filmesBase = useMemo(() => {
    return filmes.filter((f) => {
      if (tipoFiltro === 'imdb') {
        const r = f.rating ? parseFloat(f.rating) : 0;
        return Boolean(
          String(f.id).includes('imdb') ||
          (f.imdbId && f.imdbId.startsWith('tt')) ||
          r >= 8.5
        );
      } else if (tipoFiltro === 'animacao') {
        const g = (f.genero || '').toLowerCase();
        const t = (f.titulo || '').toLowerCase();
        return (
          f.tipo === 'anime' ||
          g.includes('animação') ||
          g.includes('animacao') ||
          g.includes('animation') ||
          t.includes('rei leão') ||
          t.includes('toy story') ||
          t.includes('aranhaverso') ||
          t.includes('wall-e') ||
          t.includes('chihiro') ||
          t.includes('totoro') ||
          t.includes('divertida mente') ||
          t.includes('viva: a vida')
        );
      } else if (tipoFiltro === 'filme') {
        if (f.tipo && f.tipo !== 'filme') return false;
        if (f.isClassico) return false;
      } else if (tipoFiltro === 'serie') {
        if (f.tipo !== 'serie') return false;
      } else if (tipoFiltro === 'anime') {
        if (f.tipo !== 'anime') return false;
      } else if (tipoFiltro === 'classico') {
        const anoNum = parseInt(f.ano, 10);
        if (!f.isClassico && (!anoNum || anoNum >= 2000)) return false;
      } else if (tipoFiltro === 'hbo') {
        if (f.plataforma !== 'hbo') return false;
      } else if (tipoFiltro === 'disney') {
        if (f.plataforma !== 'disney') return false;
      } else if (tipoFiltro === 'netflix') {
        if (f.plataforma !== 'netflix') return false;
      } else if (tipoFiltro === 'crunchyroll') {
        if (f.plataforma !== 'crunchyroll' && f.tipo !== 'anime') return false;
      }
      return true;
    });
  }, [filmes, tipoFiltro]);

  // Seção de gênero ativa no momento (caso selecionada uma aba específica)
  const secaoAtiva = useMemo(() => {
    if (generoAtivo === 'todos') return null;
    return SECOES_GENERO.find((s) => s.id === generoAtivo) || null;
  }, [generoAtivo]);

  // Agrupamento por seções de gênero (usado na exibição de fileiras/carrosséis)
  const secoesAgrupadas = useMemo(() => {
    const termo = normalizar(busca);
    return SECOES_GENERO.map((sec) => {
      const itens = filmesBase.filter((f) => {
        if (!sec.test(f)) return false;
        if (!termo) return true;
        const tituloNorm = normalizar(f.titulo);
        const generoNorm = normalizar(f.genero);
        const sinopseNorm = normalizar(f.sinopse);
        const imdbNorm = normalizar(f.imdbId || '');
        const plataformaNorm = normalizar(f.plataforma || '');
        return (
          tituloNorm.includes(termo) ||
          generoNorm.includes(termo) ||
          sinopseNorm.includes(termo) ||
          imdbNorm.includes(termo) ||
          plataformaNorm.includes(termo)
        );
      });
      return {
        ...sec,
        filmes: itens
      };
    }).filter((sec) => sec.filmes.length > 0);
  }, [filmesBase, busca]);

  // Filtragem local por categoria/tipo e gênero
  const filmesFiltrados = useMemo(() => {
    const termo = normalizar(busca);
    return filmesBase.filter((f) => {
      // Filtro por gênero específico
      if (generoAtivo !== 'todos') {
        const sec = SECOES_GENERO.find((s) => s.id === generoAtivo);
        if (sec) {
          if (!sec.test(f)) return false;
        } else {
          const generoFilmeNorm = normalizar(f.genero);
          const generoAtivoNorm = normalizar(generoAtivo);
          if (!generoFilmeNorm.includes(generoAtivoNorm)) {
            return false;
          }
        }
      }

      if (!termo) return true;

      const tituloNorm = normalizar(f.titulo);
      const generoNorm = normalizar(f.genero);
      const sinopseNorm = normalizar(f.sinopse);
      const imdbNorm = normalizar(f.imdbId || '');
      const plataformaNorm = normalizar(f.plataforma || '');

      return (
        tituloNorm.includes(termo) ||
        generoNorm.includes(termo) ||
        sinopseNorm.includes(termo) ||
        imdbNorm.includes(termo) ||
        plataformaNorm.includes(termo)
      );
    });
  }, [filmesBase, busca, generoAtivo]);

  const handleSelecionarFilme = (filme: FilmeItem) => {
    setFilmeAtivo(filme);
    setServidorAtivo(obterServidorPadrao(filme));
    setTemporadaAtiva(1);
    setEpisodioAtivo(1);
    abrirModalImdb(filme);
  };

  const handlePlayDireto = (filme: FilmeItem) => {
    setFilmeAtivo(filme);
    setServidorAtivo(obterServidorPadrao(filme));
    setTemporadaAtiva(1);
    setEpisodioAtivo(1);
    setReloadKey((k) => k + 1);
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setGeneroAtivo('todos');
    setTipoFiltro('todos');
  };

  const renderServerPill = (
    id: ServidorFilme,
    label: string,
    icon: React.ReactNode,
    currentServer: ServidorFilme,
    onSelect: (s: ServidorFilme) => void,
    highlight = false
  ) => {
    const isSelected = currentServer === id;
    return (
      <button
        type="button"
        id={`filmoteca-server-${id}`}
        onClick={() => onSelect(id)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
          isSelected
            ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
            : highlight
            ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30'
            : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 flex flex-col min-h-full">
      {/* CABEÇALHO DA FILMOTECA */}
      <div className="flex flex-col gap-4 pb-6 border-b border-zinc-900/80 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="filmoteca-back-header-btn"
              onClick={onBackToTV}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
              title="Voltar para TV ao vivo"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2D55]/20 to-zinc-900 border border-[#FF2D55]/40 flex items-center justify-center shadow-lg shadow-[#FF2D55]/10">
                <Film className="w-5 h-5 text-[#FF2D55]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Filmoteca & Cinema VOD
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF2D55]/10 text-[#FF2D55] border border-[#FF2D55]/20">
                    Multi-Provedor VIP
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Transmissão sob demanda dos verdadeiros filmes em alta definição com múltiplos servidores
                </p>
              </div>
            </div>
          </div>

          {/* BARRA DE PESQUISA PRINCIPAL E BOTÃO DE RECARREGAR */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="w-full md:w-96 relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  id="filmoteca-search-input"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executarBuscaGlobal(busca);
                    } else if (e.key === 'Escape') {
                      setBusca('');
                    }
                  }}
                  placeholder="Pesquisar filme, série, animação ou título no IMDb..."
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-900 text-zinc-100 text-xs placeholder:text-zinc-500 border border-zinc-800 focus:outline-none focus:border-[#FF2D55]/60 focus:ring-1 focus:ring-[#FF2D55]/30 transition"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {busca && (
                    <button
                      type="button"
                      id="filmoteca-clear-search-btn"
                      onClick={() => {
                        setBusca('');
                        setMostrarResultadosImdbAoVivo(false);
                      }}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                      title="Limpar pesquisa"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    id="filmoteca-do-search-btn"
                    onClick={() => executarBuscaGlobal(busca)}
                    disabled={isSearchingRemote || !busca.trim()}
                    className="p-1.5 rounded-lg bg-[#FF2D55] text-white hover:bg-[#e0264a] transition disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold"
                    title="Pesquisar catálogo global"
                  >
                    {isSearchingRemote ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Buscar'
                    )}
                  </button>
                  <button
                    type="button"
                    id="filmoteca-do-imdb-search-btn"
                    onClick={() => executarBuscaImdbAoVivo(busca)}
                    disabled={buscandoNoImdbAoVivo || !busca.trim()}
                    className="px-2 py-1.5 rounded-lg bg-[#f5c518] hover:bg-[#e4b512] text-black transition disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-sm"
                    title="Buscar metadados dinâmicos e títulos no IMDb"
                  >
                    {buscandoNoImdbAoVivo ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span>IMDb</span>
                    )}
                  </button>
                </div>
              </div>
              {busca && (
                <div className="flex items-center gap-2 mt-1.5 px-1 flex-wrap">
                  <button
                    type="button"
                    id="filmoteca-quick-imdb-search-trigger"
                    onClick={() => executarBuscaImdbAoVivo(busca)}
                    className="text-[11px] text-[#f5c518] hover:text-amber-300 transition flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Buscar &quot;{busca}&quot; no IMDb ao vivo (sinopse, nota e elenco)</span>
                  </button>
                </div>
              )}
            </div>

            {isInsideIframe && (
              <button
                type="button"
                id="filmoteca-header-open-tab-btn"
                onClick={() => StreamService.openAppInNewTab()}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 shadow-sm"
                title="Executar sem sandbox: Abre o Worscoi Channel em uma aba dedicada sem iframes"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Desativar Sandbox (Nova Aba)</span>
                <span className="sm:hidden">Nova Aba</span>
              </button>
            )}

            <button
              type="button"
              id="filmoteca-refresh-btn"
              onClick={() => carregarFilmes(true)}
              disabled={isRefreshing || isLoading}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Recarregar catálogo atualizado"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF2D55]' : ''}`} />
            </button>
          </div>
        </div>

        {/* ABAS DE CATEGORIA PRINCIPAL & PLATAFORMAS DE STREAMING */}
        {!isLoading && filmes.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2 pb-1">
            <button
              type="button"
              id="filter-category-all"
              onClick={() => setTipoFiltro('todos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'todos'
                  ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              <span>Todos os Títulos</span>
            </button>

            {/* TOP IMDB */}
            <button
              type="button"
              id="filter-category-imdb"
              onClick={() => setTipoFiltro('imdb')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'imdb'
                  ? 'bg-[#f5c518] text-black shadow-md shadow-[#f5c518]/30 ring-1 ring-[#f5c518]'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-[#f5c518] border border-[#f5c518]/40'
              }`}
            >
              <span className="font-black px-1 py-0.5 bg-black text-[#f5c518] text-[9px] rounded leading-none">IMDb</span>
              <span>Top IMDb (Aclamados)</span>
            </button>

            {/* ANIMAÇÕES */}
            <button
              type="button"
              id="filter-category-animacoes"
              onClick={() => setTipoFiltro('animacao')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'animacao'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Animações & Disney</span>
            </button>

            {/* HBO / MAX */}
            <button
              type="button"
              id="filter-category-hbo"
              onClick={() => setTipoFiltro('hbo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'hbo'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-purple-900/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>HBO / Max</span>
            </button>

            {/* DISNEY+ */}
            <button
              type="button"
              id="filter-category-disney"
              onClick={() => setTipoFiltro('disney')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'disney'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-blue-300 border border-blue-900/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Disney+</span>
            </button>

            {/* NETFLIX */}
            <button
              type="button"
              id="filter-category-netflix"
              onClick={() => setTipoFiltro('netflix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'netflix'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-1 ring-red-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-red-900/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Netflix</span>
            </button>

            {/* CRUNCHYROLL */}
            <button
              type="button"
              id="filter-category-crunchyroll"
              onClick={() => setTipoFiltro('crunchyroll')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'crunchyroll'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 ring-1 ring-orange-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-orange-400 border border-orange-900/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>Crunchyroll</span>
            </button>

            <button
              type="button"
              id="filter-category-filmes"
              onClick={() => setTipoFiltro('filme')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'filme'
                  ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Filmes Modernos</span>
            </button>

            <button
              type="button"
              id="filter-category-classicos"
              onClick={() => setTipoFiltro('classico')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'classico'
                  ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Clássicos Antigos (IMDb)</span>
            </button>

            <button
              type="button"
              id="filter-category-series"
              onClick={() => setTipoFiltro('serie')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'serie'
                  ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span>Séries de TV</span>
            </button>

            <button
              type="button"
              id="filter-category-animes"
              onClick={() => setTipoFiltro('anime')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                tipoFiltro === 'anime'
                  ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
              <span>Animes</span>
            </button>
          </div>
        )}

        {/* SISTEMA DE ABAS DE GÊNERO & ALTERNADOR DE MODO (SEÇÕES vs GRELHA) */}
        {!isLoading && filmes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-1 border-t border-zinc-900">
            {/* ABAS DE NAVEGAÇÃO DE GÊNERO */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1 max-w-full">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1 mr-1 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF2D55]" />
                <span>Gêneros:</span>
              </span>

              {/* ABA TODOS OS GÊNEROS */}
              <button
                type="button"
                id="filter-genre-all"
                onClick={() => setGeneroAtivo('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  generoAtivo === 'todos'
                    ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todos</span>
              </button>

              {/* ABAS DEFINIDAS EM SECOES_GENERO */}
              {SECOES_GENERO.map((sec) => {
                const totalSec = filmesBase.filter((f) => sec.test(f)).length;
                if (totalSec === 0) return null;
                const isSelected = generoAtivo === sec.id;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    id={`filter-genre-tab-${sec.id}`}
                    onClick={() => setGeneroAtivo(isSelected ? 'todos' : sec.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    <span className={isSelected ? 'text-white' : sec.corDestaque}>
                      {sec.icon}
                    </span>
                    <span>{sec.titulo.split('&')[0].trim()}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-black/30 text-white font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {totalSec}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* CONTROLES DO LADO DIREITO: ALTERNADOR SEÇÕES / GRELHA & CONTADOR */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              {/* TOGGLE MODO SEÇÕES / GRELHA (ATIVO QUANDO EM 'TODOS') */}
              {generoAtivo === 'todos' && !busca && (
                <div className="flex items-center p-0.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                  <button
                    type="button"
                    id="filmoteca-view-sections-btn"
                    onClick={() => setModoVisualizacao('secoes')}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      modoVisualizacao === 'secoes'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Exibir catálogo agrupado por seções / carrosséis de gênero"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#FF2D55]" />
                    <span className="hidden md:inline">Por Seções</span>
                  </button>
                  <button
                    type="button"
                    id="filmoteca-view-grid-btn"
                    onClick={() => setModoVisualizacao('grelha')}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      modoVisualizacao === 'grelha'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Exibir em grelha contínua"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden md:inline">Grelha</span>
                  </button>
                </div>
              )}

              <div className="text-xs text-zinc-500 font-mono shrink-0">
                {filmesFiltrados.length === filmes.length ? (
                  <span>{filmes.length} títulos disponíveis</span>
                ) : (
                  <span className="text-zinc-400">
                    <span className="text-[#FF2D55] font-semibold">
                      {filmesFiltrados.length}
                    </span>{' '}
                    de {filmes.length} títulos
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PLAYER PRINCIPAL DE CINEMA / FILME ATIVO */}
      {!isLoading && (
        <div ref={playerContainerRef} className="w-full max-w-full mb-8 flex flex-col gap-3">
          {filmeAtivo && (
            <div className="w-full max-w-full flex flex-col gap-2">
              {/* BARRA DE SELEÇÃO DE PROVEDORES E FONTES */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-zinc-950/95 rounded-xl border border-zinc-800/90 text-xs shadow-xl">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono mr-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#FF2D55]" />
                    <span>Fontes:</span>
                  </span>

                  {filmeAtivo.directStreamUrl &&
                    renderServerPill(
                      'direct',
                      'Nativo (HTML5 Sem Bloqueios)',
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
                      servidorAtivo,
                      setServidorAtivo,
                      true
                    )}

                  {renderServerPill(
                    'videasy',
                    'Fonte 1: Videasy VIP (Recomendada)',
                    <Film className="w-3 h-3 text-cyan-400" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'vidsrc',
                    'Fonte 2: VidSrc Ultra',
                    <Tv className="w-3 h-3 text-amber-400" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'vidsrcin',
                    'Fonte 3: VidSrc In',
                    <Sparkles className="w-3 h-3 text-emerald-400" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'vidlink',
                    'Fonte 4: VidLink Pro (Ultra HD)',
                    <Play className="w-3 h-3 fill-current text-white" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {renderServerPill(
                    'autoembed',
                    'Fonte 5: AutoEmbed VIP',
                    <Globe2 className="w-3 h-3 text-indigo-400" />,
                    servidorAtivo,
                    setServidorAtivo
                  )}

                  {filmeAtivo.trailerUrl &&
                    renderServerPill(
                      'trailer',
                      'Trailer Oficial',
                      <Sparkles className="w-3 h-3 text-amber-300" />,
                      servidorAtivo,
                      setServidorAtivo
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="filmoteca-open-external-safe"
                    onClick={() => {
                      const url = obterUrlFilme(filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo);
                      if (url) StreamService.openSafeExternal(url);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Abre o player numa aba dedicada sem restrições de sandbox ou navegador"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Ecrã Externo Seguro</span>
                  </button>
                </div>
              </div>

              {/* SELETOR DE TEMPORADAS E EPISÓDIOS (PARA SÉRIES E ANIMES) */}
              {(filmeAtivo.tipo === 'serie' || filmeAtivo.tipo === 'anime') && (
                <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-zinc-950/95 border border-zinc-800 text-xs shadow-lg">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/30">
                        {filmeAtivo.tipo === 'anime' ? 'ANIME' : 'SÉRIE'}
                      </span>
                      <span className="text-zinc-200 font-semibold">
                        Assistindo: Temporada {temporadaAtiva} • Episódio {episodioAtivo}
                      </span>
                    </div>

                    {/* Seleção de Temporada */}
                    {filmeAtivo.temporadas && filmeAtivo.temporadas > 1 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-zinc-400 text-[11px] font-mono">Temporadas:</span>
                        {Array.from({ length: Math.min(filmeAtivo.temporadas, 15) }, (_, i) => i + 1).map((s) => (
                          <button
                            key={`temp-${s}`}
                            type="button"
                            onClick={() => {
                              setTemporadaAtiva(s);
                              setEpisodioAtivo(1);
                              setReloadKey((k) => k + 1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              temporadaAtiva === s
                                ? 'bg-[#FF2D55] text-white shadow-sm ring-1 ring-[#FF2D55]'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                            }`}
                          >
                            T{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Seleção de Episódios */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Escolha o episódio da Temporada {temporadaAtiva}:</span>
                      <span className="font-mono text-zinc-500">
                        Episódio {episodioAtivo} de {filmeAtivo.episodiosPorTemporada || 12}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1 max-w-full">
                      {Array.from(
                        { length: Math.min(filmeAtivo.episodiosPorTemporada || 12, 40) },
                        (_, i) => i + 1
                      ).map((ep) => (
                        <button
                          key={`ep-${ep}`}
                          type="button"
                          onClick={() => {
                            setEpisodioAtivo(ep);
                            setReloadKey((k) => k + 1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer shrink-0 ${
                            episodioAtivo === ep
                              ? 'bg-gradient-to-r from-[#FF2D55] to-[#e0264a] text-white shadow-md shadow-[#FF2D55]/30 ring-1 ring-[#FF2D55]'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
                          }`}
                          title={`Reproduzir Episódio ${ep}`}
                        >
                          EP {ep}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AVISO DE QUALIDADE E DICA DE CONTORNAR POLÍTICAS DE SANDBOX */}
              <div className="px-3.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-[11px] text-zinc-400 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Reprodução do título sob demanda. Se uma fonte demorar ou ficar escura no seu navegador, selecione outra fonte acima ou use o <strong>Ecrã Externo</strong>.
                  </span>
                </span>
                <span className="text-zinc-500 font-mono text-[10px] hidden sm:inline">
                  IMDb: {filmeAtivo.imdbId || 'HD'} {filmeAtivo.tmdbId ? `• TMDB: ${filmeAtivo.tmdbId}` : ''}
                </span>
              </div>

              {/* BANNER DE DESATIVAÇÃO DE SANDBOX HERDADO (AI STUDIO IFRAME) */}
              {isInsideIframe && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-zinc-950 border border-amber-500/40 text-xs shadow-lg">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="font-semibold text-amber-200">
                        Aviso de Restrição de Sandbox (Visualizador Embutido)
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Se o player apresentar &quot;Playback blocked / restricted (sandboxed) frame&quot;, clique ao lado para assistir sem qualquer restrição de sandbox herdada pelo navegador:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      id="filmoteca-unconstrained-player-btn"
                      onClick={() => {
                        const url = obterUrlFilme(filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo);
                        if (url) StreamService.openSafeExternal(url);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FF2D55] hover:bg-[#e0264a] text-white font-semibold text-[11px] flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      title="Abre o player em uma janela/aba dedicada sem qualquer restrição de sandbox"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Ecrã Livre (Sem Sandbox)</span>
                    </button>
                    <button
                      type="button"
                      id="filmoteca-open-app-newtab-btn"
                      onClick={() => StreamService.openAppInNewTab()}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                      title="Abre toda a aplicação numa nova aba do navegador, removendo 100% dos iframes do editor"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir App em Nova Aba</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TELA DE REPRODUÇÃO (VÍDEO NATIVO OU IFRAME OTIMIZADO) */}
          <div
            className="relative w-full aspect-video max-w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl shrink-0"
            style={{ aspectRatio: '16 / 9' }}
          >
            {/* BOTÃO FLUTUANTE DE DESBLOQUEIO DE SANDBOX NO TOPO DO PLAYER */}
            {filmeAtivo && (
              <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  id="filmoteca-overlay-safe-external"
                  onClick={() => {
                    const url = obterUrlFilme(filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo);
                    if (url) StreamService.openSafeExternal(url);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-black/85 hover:bg-[#FF2D55] text-white text-[11px] font-semibold backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 shadow-xl cursor-pointer"
                  title="Abrir reprodutor fora do iframe para contornar qualquer erro de sandbox"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ecrã Sem Sandbox</span>
                </button>
              </div>
            )}

            {filmeAtivo ? (
              servidorAtivo === 'direct' && filmeAtivo.directStreamUrl ? (
                <video
                  key={`${filmeAtivo.id}-direct-${reloadKey}`}
                  src={filmeAtivo.directStreamUrl}
                  controls
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                >
                  Seu navegador não suporta reprodução direta deste formato de vídeo.
                </video>
              ) : (
                <iframe
                  key={`${filmeAtivo.id}-${servidorAtivo}-${temporadaAtiva}-${episodioAtivo}-${reloadKey}`}
                  src={obterUrlFilme(filmeAtivo, servidorAtivo, temporadaAtiva, episodioAtivo)}
                  title={filmeAtivo.titulo}
                  width="100%"
                  height="100%"
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  referrerPolicy={STREAM_REFERRER_POLICY}
                  allow={STREAM_IFRAME_ALLOW}
                  className="absolute inset-0 w-full h-full bg-black border-0"
                ></iframe>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Selecione um filme para iniciar
              </div>
            )}
          </div>

          {/* ASSISTENTE DE REPRODUÇÃO RÁPIDA (FALLBACK & CORREÇÃO 1-CLIQUE) */}
          {filmeAtivo && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs shadow-md">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-zinc-300">
                  Fonte ativa: <strong className="text-white uppercase font-mono">{servidorAtivo}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  id="filmoteca-next-server-btn"
                  onClick={alternarProximoServidor}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 transition cursor-pointer flex items-center gap-1.5 text-[11px] font-medium"
                  title="Se a tela estiver preta ou demorando, clique aqui para trocar de fonte"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#FF2D55]" />
                  <span>Alternar Servidor (Se não reproduzir)</span>
                </button>

                <button
                  type="button"
                  id="filmoteca-reload-player-btn"
                  onClick={recarregarPlayer}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/80 transition cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Recarregar player atual"
                >
                  <RotateCw className="w-3 h-3 text-zinc-400" />
                  <span>Recarregar</span>
                </button>

                <button
                  type="button"
                  id="filmoteca-direct-external-btn"
                  onClick={() => {
                    const url = obterUrlFilme(filmeAtivo, servidorAtivo);
                    if (url) StreamService.openSafeExternal(url);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#FF2D55] hover:bg-[#e0264a] text-white transition cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold shadow-sm"
                  title="Abre o player em nova aba sem nenhuma limitação de iframe ou navegador"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ecrã Externo (Sem Bloqueios)</span>
                </button>
              </div>
            </div>
          )}

          {/* BARRA DE INFORMAÇÕES DO FILME ATIVO */}
          {filmeAtivo && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 shadow-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    {filmeAtivo.titulo}
                  </h2>
                  {filmeAtivo.plataforma === 'hbo' && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-700 text-white font-mono font-black text-[9px]">
                      HBO MAX
                    </span>
                  )}
                  {filmeAtivo.plataforma === 'disney' && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono font-black text-[9px]">
                      DISNEY+
                    </span>
                  )}
                  {filmeAtivo.plataforma === 'netflix' && (
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono font-black text-[9px]">
                      NETFLIX
                    </span>
                  )}
                  {filmeAtivo.plataforma === 'crunchyroll' && (
                    <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-mono font-black text-[9px]">
                      CRUNCHYROLL
                    </span>
                  )}
                  {filmeAtivo.rating && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black font-mono shadow flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      <span>{filmeAtivo.rating}</span>
                    </span>
                  )}
                  {filmeAtivo.imdbId && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/30">
                      {filmeAtivo.imdbId}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {filmeAtivo.ano}
                  </span>
                  <span className="text-xs text-[#FF2D55] font-semibold">
                    {filmeAtivo.genero}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {filmeAtivo.sinopse}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  id="filmoteca-open-imdb-details-btn"
                  onClick={() => abrirModalImdb(filmeAtivo)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-[#f5c518] hover:bg-[#e4b512] transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Ver sinopse completa, nota e elenco dinâmico no IMDb"
                >
                  <span className="font-black text-[10px] bg-black text-[#f5c518] px-1 rounded">IMDb</span>
                  <span>Ficha & Elenco</span>
                </button>
                <button
                  type="button"
                  id="filmoteca-open-theater-modal-btn"
                  onClick={() => {
                    setFilmeSelecionado(filmeAtivo);
                    setModoPlayer(servidorAtivo);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Abrir reprodutor em modo teatro / tela expandida"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Modo Teatro</span>
                </button>
                <div className="text-[11px] text-emerald-400/90 font-mono bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Filme Completo</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ESTADO DE CARREGAMENTO */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="w-8 h-8 text-[#FF2D55] animate-spin mb-4" />
          <p className="text-sm font-medium text-zinc-300">
            Carregando repositório de filmes em alta resolução...
          </p>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Conectando fontes VidLink, Videasy, VidSrc e streams diretos
          </p>
        </div>
      )}

      {/* RENDERIZAÇÃO DO CATÁLOGO: SEÇÕES AGRUPADAS POR GÊNERO, GRELHA OU ABA ATIVA */}
      {!isLoading && (
        <div className="flex flex-col gap-6">
          {/* CASO 1: BUSCA ATIVA */}
          {busca.trim().length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#FF2D55]" />
                  <span className="text-sm font-semibold text-zinc-200">
                    Resultados para &quot;<span className="text-white">{busca}</span>&quot;
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {filmesFiltrados.length} encontrados
                  </span>
                </div>
                <button
                  type="button"
                  id="filmoteca-clear-search-view-btn"
                  onClick={() => setBusca('')}
                  className="text-xs font-medium text-zinc-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar busca</span>
                </button>
              </div>

              {filmesFiltrados.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {filmesFiltrados.map((filme) => (
                    <FilmeCard
                      key={`search-${filme.id}`}
                      filme={filme}
                      isAtivo={filmeAtivo?.id === filme.id}
                      onSelect={handleSelecionarFilme}
                      onOpenImdb={abrirModalImdb}
                      onPlayDirect={handlePlayDireto}
                      onOpenTeatro={(f) => {
                        setFilmeSelecionado(f);
                        setModoPlayer(obterServidorPadrao(f));
                        setModalTemporada(1);
                        setModalEpisodio(1);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* RESULTADOS AO VIVO DO IMDB (SINOPSE, NOTA E ELENCO) */}
              {mostrarResultadosImdbAoVivo && resultadosImdbAoVivo.length > 0 && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#f5c518] text-black font-black text-[10px] uppercase tracking-wider">
                        IMDb Metadados
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        Resultados encontrados no IMDb com sinopse, nota e elenco
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {resultadosImdbAoVivo.length} títulos
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {resultadosImdbAoVivo.map((filme) => (
                      <FilmeCard
                        key={`imdb-search-${filme.id}`}
                        filme={filme}
                        isAtivo={filmeAtivo?.id === filme.id}
                        onSelect={handleSelecionarFilme}
                        onOpenImdb={abrirModalImdb}
                        onPlayDirect={handlePlayDireto}
                        onOpenTeatro={(f) => {
                          setFilmeSelecionado(f);
                          setModoPlayer(obterServidorPadrao(f));
                          setModalTemporada(1);
                          setModalEpisodio(1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASO 2: VISUALIZAÇÃO DE UM GÊNERO ESPECÍFICO (QUANDO UMA ABA DE GÊNERO FOR CLICADA) */}
          {!busca && generoAtivo !== 'todos' && (
            <div className="flex flex-col gap-4">
              {/* CABEÇALHO DO GÊNERO SELECIONADO */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-inner ${
                      secaoAtiva?.corDestaque || 'text-[#FF2D55]'
                    }`}
                  >
                    {secaoAtiva?.icon || <SlidersHorizontal className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {secaoAtiva?.titulo || generoAtivo}
                      </h2>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {filmesFiltrados.length} títulos
                      </span>
                    </div>
                    {secaoAtiva?.subtitulo && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {secaoAtiva.subtitulo}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  id="filmoteca-back-to-all-sections-btn"
                  onClick={() => setGeneroAtivo('todos')}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition flex items-center gap-2 text-xs font-semibold cursor-pointer shrink-0 self-start sm:self-center shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ver Todos os Gêneros</span>
                </button>
              </div>

              {/* GRELHA COMPLETA DO GÊNERO ESCOLHIDO */}
              {filmesFiltrados.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {filmesFiltrados.map((filme) => (
                    <FilmeCard
                      key={`genre-grid-${filme.id}`}
                      filme={filme}
                      isAtivo={filmeAtivo?.id === filme.id}
                      onSelect={handleSelecionarFilme}
                      onOpenImdb={abrirModalImdb}
                      onPlayDirect={handlePlayDireto}
                      onOpenTeatro={(f) => {
                        setFilmeSelecionado(f);
                        setModoPlayer(obterServidorPadrao(f));
                        setModalTemporada(1);
                        setModalEpisodio(1);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CASO 3: MODO SEÇÕES AGRUPADAS POR GÊNERO (MODO PADRÃO) */}
          {!busca && generoAtivo === 'todos' && modoVisualizacao === 'secoes' && (
            <div className="flex flex-col gap-6">
              {secoesAgrupadas.map((secao) => (
                <FilmotecaGenreRow
                  key={`row-${secao.id}`}
                  id={secao.id}
                  titulo={secao.titulo}
                  icon={secao.icon}
                  corDestaque={secao.corDestaque}
                  filmes={secao.filmes}
                  filmeAtivoId={filmeAtivo?.id !== undefined ? String(filmeAtivo.id) : undefined}
                  onSelectFilme={handleSelecionarFilme}
                  onOpenImdb={abrirModalImdb}
                  onPlayDirect={handlePlayDireto}
                  onOpenTeatro={(f) => {
                    setFilmeSelecionado(f);
                    setModoPlayer(obterServidorPadrao(f));
                    setModalTemporada(1);
                    setModalEpisodio(1);
                  }}
                  onVerTodos={(genreId) => setGeneroAtivo(genreId)}
                />
              ))}
            </div>
          )}

          {/* CASO 4: MODO GRELHA GERAL COMPLETA */}
          {!busca && generoAtivo === 'todos' && modoVisualizacao === 'grelha' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filmesFiltrados.map((filme) => (
                <FilmeCard
                  key={`all-grid-${filme.id}`}
                  filme={filme}
                  isAtivo={filmeAtivo?.id === filme.id}
                  onSelect={handleSelecionarFilme}
                  onOpenImdb={abrirModalImdb}
                  onPlayDirect={handlePlayDireto}
                  onOpenTeatro={(f) => {
                    setFilmeSelecionado(f);
                    setModoPlayer(obterServidorPadrao(f));
                    setModalTemporada(1);
                    setModalEpisodio(1);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ESTADO QUANDO NENHUM FILME FOR ENCONTRADO */}
      {!isLoading && filmesFiltrados.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
            <Info className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-300">
            Nenhum filme na lista local para &quot;{busca}&quot;
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
            Deseja buscar este título diretamente no catálogo global IMDb e gerar as fontes de reprodução?
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              id="filmoteca-search-global-btn"
              onClick={() => executarBuscaGlobal(busca)}
              disabled={isSearchingRemote}
              className="px-4 py-2 rounded-xl bg-[#FF2D55] hover:bg-[#e0264a] text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isSearchingRemote ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe2 className="w-3.5 h-3.5" />
              )}
              <span>Buscar no Catálogo Global IMDb</span>
            </button>
            <button
              type="button"
              id="filmoteca-search-imdb-direct-btn"
              onClick={() => executarBuscaImdbAoVivo(busca)}
              disabled={buscandoNoImdbAoVivo}
              className="px-4 py-2 rounded-xl bg-[#f5c518] hover:bg-[#e4b512] text-xs font-black text-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {buscandoNoImdbAoVivo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Buscar Ficha no IMDb</span>
            </button>
            <button
              type="button"
              id="filmoteca-reset-filters-btn"
              onClick={limparFiltros}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-800 transition cursor-pointer"
            >
              Limpar busca
            </button>
          </div>

          {/* EXIBIÇÃO DE RESULTADOS IMDB AO VIVO MESMO SE NÃO HOUVER NA LISTA LOCAL */}
          {resultadosImdbAoVivo.length > 0 && (
            <div className="w-full max-w-6xl mt-8 pt-6 border-t border-zinc-800 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#f5c518] text-black font-black text-[10px] uppercase tracking-wider">
                    IMDb Ao Vivo
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Títulos encontrados no IMDb com sinopse, nota e elenco
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  {resultadosImdbAoVivo.length} títulos
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {resultadosImdbAoVivo.map((filme) => (
                  <FilmeCard
                    key={`empty-imdb-${filme.id}`}
                    filme={filme}
                    isAtivo={filmeAtivo?.id === filme.id}
                    onSelect={handleSelecionarFilme}
                    onOpenImdb={abrirModalImdb}
                    onPlayDirect={handlePlayDireto}
                    onOpenTeatro={(f) => {
                      setFilmeSelecionado(f);
                      setModoPlayer(obterServidorPadrao(f));
                      setModalTemporada(1);
                      setModalEpisodio(1);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DO REPRODUTOR DE FILME SELECIONADO (MODO TEATRO) */}
      {filmeSelecionado && (() => {
        const urlAtiva = obterUrlFilme(filmeSelecionado, modoPlayer, modalTemporada, modalEpisodio);
        const isDirectVideo = modoPlayer === 'direct' && Boolean(filmeSelecionado.directStreamUrl);

        return (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
            onClick={() => setFilmeSelecionado(null)}
          >
            <div
              className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* BARRA SUPERIOR DO MODAL */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90">
                <div className="flex items-center gap-2 min-w-0">
                  <Clapperboard className="w-4 h-4 text-[#FF2D55] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {filmeSelecionado.titulo}
                  </span>
                  {filmeSelecionado.plataforma === 'hbo' && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-700 text-white font-mono font-black text-[9px] shrink-0">
                      HBO MAX
                    </span>
                  )}
                  {filmeSelecionado.plataforma === 'disney' && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono font-black text-[9px] shrink-0">
                      DISNEY+
                    </span>
                  )}
                  {filmeSelecionado.plataforma === 'netflix' && (
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono font-black text-[9px] shrink-0">
                      NETFLIX
                    </span>
                  )}
                  {filmeSelecionado.plataforma === 'crunchyroll' && (
                    <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-mono font-black text-[9px] shrink-0">
                      CRUNCHYROLL
                    </span>
                  )}
                  {filmeSelecionado.tipo === 'serie' && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600/90 text-white font-mono font-bold text-[9px]">
                      SÉRIE
                    </span>
                  )}
                  {filmeSelecionado.tipo === 'anime' && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white font-mono font-bold text-[9px]">
                      ANIME
                    </span>
                  )}
                  {filmeSelecionado.rating && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black font-mono shrink-0 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      <span>{filmeSelecionado.rating}</span>
                    </span>
                  )}
                  {filmeSelecionado.imdbId && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-400/30 text-[9px] font-mono font-bold shrink-0">
                      {filmeSelecionado.imdbId}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 shrink-0">
                    {filmeSelecionado.ano}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {urlAtiva && (
                    <button
                      type="button"
                      id="filmoteca-open-external-btn"
                      onClick={() => StreamService.openSafeExternal(urlAtiva)}
                      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-200 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition"
                      title="Abrir em Nova Aba Isolada"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ecrã Externo Seguro</span>
                    </button>
                  )}
                  <button
                    type="button"
                    id="filmoteca-modal-close-btn"
                    onClick={() => setFilmeSelecionado(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                    title="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SELEÇÃO DE FONTES NO MODAL */}
              <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 overflow-x-auto text-xs">
                {filmeSelecionado.directStreamUrl &&
                  renderServerPill(
                    'direct',
                    'Nativo HTML5',
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />,
                    modoPlayer,
                    setModoPlayer,
                    true
                  )}

                {renderServerPill(
                  'videasy',
                  'Fonte 1: Videasy VIP',
                  <Film className="w-3 h-3 text-cyan-400" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {renderServerPill(
                  'vidsrc',
                  'Fonte 2: VidSrc Ultra',
                  <Tv className="w-3 h-3 text-amber-400" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {renderServerPill(
                  'vidsrcin',
                  'Fonte 3: VidSrc In',
                  <Sparkles className="w-3 h-3 text-emerald-400" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {renderServerPill(
                  'vidlink',
                  'Fonte 4: VidLink Pro',
                  <Play className="w-3 h-3 fill-current" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {renderServerPill(
                  'autoembed',
                  'Fonte 5: AutoEmbed VIP',
                  <Globe2 className="w-3 h-3 text-indigo-400" />,
                  modoPlayer,
                  setModoPlayer
                )}

                {filmeSelecionado.trailerUrl &&
                  renderServerPill(
                    'trailer',
                    'Trailer',
                    <Sparkles className="w-3 h-3 text-amber-300" />,
                    modoPlayer,
                    setModoPlayer
                  )}
              </div>

              {/* SELETOR DE TEMPORADAS E EPISÓDIOS NO MODO TEATRO (SÉRIES E ANIMES) */}
              {(filmeSelecionado.tipo === 'serie' || filmeSelecionado.tipo === 'anime') && (
                <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-zinc-300 font-medium text-[11px]">
                      Temporada {modalTemporada} • Episódio {modalEpisodio}
                    </span>
                    {filmeSelecionado.temporadas && filmeSelecionado.temporadas > 1 && (
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500 text-[10px]">Temporada:</span>
                        {Array.from({ length: Math.min(filmeSelecionado.temporadas, 12) }, (_, i) => i + 1).map((s) => (
                          <button
                            key={`modal-t-${s}`}
                            type="button"
                            onClick={() => {
                              setModalTemporada(s);
                              setModalEpisodio(1);
                              setReloadKey((k) => k + 1);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              modalTemporada === s
                                ? 'bg-[#FF2D55] text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            T{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
                    {Array.from(
                      { length: Math.min(filmeSelecionado.episodiosPorTemporada || 12, 30) },
                      (_, i) => i + 1
                    ).map((ep) => (
                      <button
                        key={`modal-ep-${ep}`}
                        type="button"
                        onClick={() => {
                          setModalEpisodio(ep);
                          setReloadKey((k) => k + 1);
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-mono font-bold shrink-0 ${
                          modalEpisodio === ep
                            ? 'bg-[#FF2D55] text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        EP {ep}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ÁREA DE REPRODUÇÃO */}
              <div
                className="relative aspect-video w-full max-w-full bg-black flex items-center justify-center overflow-hidden shrink-0"
                style={{ aspectRatio: '16 / 9' }}
              >
                {urlAtiva && (
                  <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
                    <button
                      type="button"
                      id="modal-overlay-safe-external"
                      onClick={() => StreamService.openSafeExternal(urlAtiva)}
                      className="px-2.5 py-1.5 rounded-lg bg-black/85 hover:bg-[#FF2D55] text-white text-[11px] font-semibold backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 shadow-xl cursor-pointer"
                      title="Abrir reprodutor fora do iframe para contornar qualquer erro de sandbox"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ecrã Sem Sandbox</span>
                    </button>
                  </div>
                )}
                {urlAtiva ? (
                  isDirectVideo ? (
                    <video
                      key={`${urlAtiva}-${reloadKey}`}
                      src={urlAtiva}
                      controls
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-contain bg-black"
                    >
                      Seu navegador não suporta este formato de vídeo.
                    </video>
                  ) : (
                    <iframe
                      key={`${filmeSelecionado.id}-${modoPlayer}-${modalTemporada}-${modalEpisodio}-${reloadKey}`}
                      src={urlAtiva}
                      title={filmeSelecionado.titulo}
                      className="absolute inset-0 w-full h-full border-0 bg-black"
                      allowFullScreen
                      referrerPolicy={STREAM_REFERRER_POLICY}
                      allow={STREAM_IFRAME_ALLOW}
                    />
                  )
                ) : (
                  <div className="text-center p-6 text-zinc-500">
                    <Film className="w-12 h-12 mx-auto mb-2 text-zinc-700" />
                    <p className="text-xs">Link de vídeo indisponível para este item.</p>
                  </div>
                )}
              </div>

              {/* BARRA DE RESOLUÇÃO RÁPIDA NO MODAL */}
              {urlAtiva && (
                <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Se não reproduzir de imediato, troque a fonte ou abra no Ecrã Externo:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = StreamService.getNextProvider(
                          filmeSelecionado,
                          modoPlayer,
                          modalTemporada,
                          modalEpisodio
                        );
                        setModoPlayer(next);
                        setReloadKey((k) => k + 1);
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3 text-[#FF2D55]" />
                      <span>Alternar Fonte</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => StreamService.openSafeExternal(urlAtiva)}
                      className="px-2.5 py-1 rounded bg-[#FF2D55] hover:bg-[#e0264a] text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ecrã Externo (Sem Bloqueios)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DETALHES E SINOPSE */}
              <div className="p-4 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-zinc-400 font-mono">Gênero:</span>
                    <span className="text-[#FF2D55] font-semibold">
                      {filmeSelecionado.genero}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {filmeSelecionado.sinopse}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    id="filmoteca-modal-imdb-info-btn"
                    onClick={() => {
                      abrirModalImdb(filmeSelecionado);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#f5c518] hover:bg-[#e4b512] text-black font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm text-xs"
                    title="Ver sinopse completa, nota e elenco no IMDb"
                  >
                    <span className="font-black text-[10px] bg-black text-[#f5c518] px-1 rounded">IMDb</span>
                    <span>Ficha & Elenco</span>
                  </button>
                  <button
                    type="button"
                    id="filmoteca-modal-back-btn"
                    onClick={() => setFilmeSelecionado(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition cursor-pointer font-medium"
                  >
                    Voltar à Filmoteca
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL DE METADADOS DINÂMICOS DO IMDB (SINOPSE, NOTA, ELENCO E STREAMING) */}
      <FilmotecaImdbModal
        filme={modalImdbFilme}
        isOpen={isModalImdbAberto}
        onClose={fecharModalImdb}
        onPlay={handlePlayFromImdb}
        onPlayCinema={handlePlayCinemaFromImdb}
        onSearchActor={handleSearchActorFromImdb}
      />
    </div>
  );
}
