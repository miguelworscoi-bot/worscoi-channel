import { FilmeItem } from '@/app/api/filmes/route';
import { ImdbDetalhes } from '@/types';

interface OmdbApiResponse {
  Title?: string;
  Year?: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster?: string;
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID?: string;
  Type?: string;
  totalSeasons?: string;
  Response?: string;
}

interface ImdbSuggestItem {
  id?: string;
  l?: string;
  y?: number;
  yr?: string;
  s?: string;
  q?: string;
  qid?: string;
  i?: { imageUrl?: string; width?: number; height?: number };
}

// Cache em memória para evitar requisições repetidas
const cacheDetalhes = new Map<string, ImdbDetalhes>();
const SESSION_CACHE_PREFIX = 'worscoi_imdb_cache_';

/**
 * Normaliza lista de atores a partir de string separada por vírgula
 */
function parseElenco(actorsStr?: string): string[] {
  if (!actorsStr || actorsStr === 'N/A') return [];
  return actorsStr
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== 'N/A');
}

/**
 * Tradução de gêneros em inglês para exibição elegante em português
 */
const TRADUCAO_GENEROS: Record<string, string> = {
  Action: 'Ação',
  Adventure: 'Aventura',
  Animation: 'Animação',
  Biography: 'Biografia',
  Comedy: 'Comédia',
  Crime: 'Crime',
  Documentary: 'Documentário',
  Drama: 'Drama',
  Family: 'Família',
  Fantasy: 'Fantasia',
  Film_Noir: 'Filme Noir',
  History: 'História',
  Horror: 'Terror',
  Music: 'Música',
  Musical: 'Musical',
  Mystery: 'Mistério',
  Romance: 'Romance',
  Sci_Fi: 'Ficção Científica',
  'Sci-Fi': 'Ficção Científica',
  Short: 'Curta-metragem',
  Sport: 'Esporte',
  Superhero: 'Super-herói',
  Thriller: 'Suspense',
  War: 'Guerra',
  Western: 'Faroeste'
};

export function formatarGeneros(generoOriginal?: string): string {
  if (!generoOriginal || generoOriginal === 'N/A') return 'Geral';
  return generoOriginal
    .split(/[,/]/)
    .map((g) => {
      const limpo = g.trim();
      return TRADUCAO_GENEROS[limpo] || limpo;
    })
    .join(' • ');
}

export const ImdbService = {
  /**
   * Busca detalhes aprofundados do IMDb (sinopse, nota, elenco, diretor, prêmios)
   * utilizando a API interna /api/filmes com fallback inteligente no cliente.
   */
  async obterDetalhes(filme: FilmeItem): Promise<ImdbDetalhes> {
    const chave = String(filme.imdbId || filme.titulo || filme.id).toLowerCase().trim();

    // 1. Verifica cache em memória
    if (cacheDetalhes.has(chave)) {
      return cacheDetalhes.get(chave)!;
    }

    // 2. Verifica sessionStorage no navegador
    if (typeof window !== 'undefined') {
      try {
        const armazenado = sessionStorage.getItem(`${SESSION_CACHE_PREFIX}${chave}`);
        if (armazenado) {
          const parsed = JSON.parse(armazenado) as ImdbDetalhes;
          cacheDetalhes.set(chave, parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Erro ao ler cache de sessão IMDb:', e);
      }
    }

    // 3. Tenta consultar a rota interna de API
    try {
      const params = new URLSearchParams({
        action: 'imdb_detalhes'
      });
      if (filme.imdbId && filme.imdbId.startsWith('tt')) {
        params.set('imdbId', filme.imdbId);
      }
      if (filme.titulo) {
        params.set('titulo', filme.titulo);
      }

      const res = await fetch(`/api/filmes?${params.toString()}`, {
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        const dados = await res.json();
        if (dados && (dados.imdbId || dados.titulo || dados.notaImdb)) {
          const formatado: ImdbDetalhes = {
            imdbId: dados.imdbId || filme.imdbId || 'tt0000000',
            titulo: dados.titulo || filme.titulo,
            tituloOriginal: dados.tituloOriginal || dados.Title || filme.titulo,
            ano: dados.ano || dados.Year || filme.ano || 'N/A',
            classificacao: dados.classificacao || dados.Rated || 'Livre',
            duracao: dados.duracao || dados.Runtime || 'N/A',
            genero: formatarGeneros(dados.genero || dados.Genre || filme.genero),
            diretor: dados.diretor && dados.diretor !== 'N/A' ? dados.diretor : undefined,
            roteirista: dados.roteirista && dados.roteirista !== 'N/A' ? dados.roteirista : undefined,
            elenco: Array.isArray(dados.elenco) && dados.elenco.length > 0 ? dados.elenco : parseElenco(dados.Actors || dados.elencoTexto),
            elencoTexto: dados.elencoTexto || dados.Actors || (filme.sinopse?.includes('Elenco:') ? filme.sinopse : 'Elenco oficial IMDb'),
            sinopse: dados.sinopse || dados.Plot || filme.sinopse || 'Sinopse oficial disponível no IMDb.',
            sinopseLocal: filme.sinopse,
            notaImdb: dados.notaImdb || dados.imdbRating || filme.rating || '8.5',
            votosImdb: dados.votosImdb || dados.imdbVotes || 'Mais de 100k votos',
            metascore: dados.metascore && dados.metascore !== 'N/A' ? dados.metascore : undefined,
            premios: dados.premios && dados.premios !== 'N/A' ? dados.premios : undefined,
            capa: dados.capa || dados.Poster || filme.capa,
            tipo: (dados.tipo as 'filme' | 'serie' | 'anime') || filme.tipo || 'filme',
            totalTemporadas: dados.totalTemporadas ? Number(dados.totalTemporadas) : (typeof filme.temporadas === 'number' ? filme.temporadas : undefined),
            pais: dados.pais && dados.pais !== 'N/A' ? dados.pais : undefined,
            idioma: dados.idioma && dados.idioma !== 'N/A' ? dados.idioma : undefined,
            urlImdb: `https://www.imdb.com/title/${dados.imdbId || filme.imdbId || ''}/`,
            fonte: dados.fonte || 'omdb'
          };

          // Salva no cache
          cacheDetalhes.set(chave, formatado);
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem(`${SESSION_CACHE_PREFIX}${chave}`, JSON.stringify(formatado));
            } catch {
              // cota cheia do storage ignorada
            }
          }
          return formatado;
        }
      }
    } catch (apiErr) {
      console.warn('Erro ao consultar /api/filmes para IMDb, tentando fallback direto:', apiErr);
    }

    // 4. Fallback direto pelo cliente se a rota de API estiver inacessível
    try {
      let omdbData: OmdbApiResponse | null = null;
      if (filme.imdbId && filme.imdbId.startsWith('tt')) {
        const omdbRes = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(filme.imdbId)}&plot=full&apikey=trilogy`);
        if (omdbRes.ok) {
          const j = (await omdbRes.json()) as OmdbApiResponse;
          if (j.Response === 'True') omdbData = j;
        }
      }

      if (!omdbData && filme.titulo) {
        const omdbRes = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(filme.titulo)}&plot=full&apikey=trilogy`);
        if (omdbRes.ok) {
          const j = (await omdbRes.json()) as OmdbApiResponse;
          if (j.Response === 'True') omdbData = j;
        }
      }

      if (omdbData) {
        const formatado: ImdbDetalhes = {
          imdbId: omdbData.imdbID || filme.imdbId || 'tt0000000',
          titulo: omdbData.Title || filme.titulo,
          tituloOriginal: omdbData.Title,
          ano: omdbData.Year || filme.ano || 'N/A',
          classificacao: omdbData.Rated && omdbData.Rated !== 'N/A' ? omdbData.Rated : '14+',
          duracao: omdbData.Runtime && omdbData.Runtime !== 'N/A' ? omdbData.Runtime : '110 min',
          genero: formatarGeneros(omdbData.Genre || filme.genero),
          diretor: omdbData.Director && omdbData.Director !== 'N/A' ? omdbData.Director : undefined,
          roteirista: omdbData.Writer && omdbData.Writer !== 'N/A' ? omdbData.Writer : undefined,
          elenco: parseElenco(omdbData.Actors),
          elencoTexto: omdbData.Actors && omdbData.Actors !== 'N/A' ? omdbData.Actors : 'Elenco estelar',
          sinopse: omdbData.Plot && omdbData.Plot !== 'N/A' ? omdbData.Plot : filme.sinopse || '',
          sinopseLocal: filme.sinopse,
          notaImdb: omdbData.imdbRating && omdbData.imdbRating !== 'N/A' ? omdbData.imdbRating : (filme.rating || '8.5'),
          votosImdb: omdbData.imdbVotes && omdbData.imdbVotes !== 'N/A' ? `${omdbData.imdbVotes} votos` : undefined,
          metascore: omdbData.Metascore && omdbData.Metascore !== 'N/A' ? omdbData.Metascore : undefined,
          premios: omdbData.Awards && omdbData.Awards !== 'N/A' ? omdbData.Awards : undefined,
          capa: (omdbData.Poster && omdbData.Poster.startsWith('http') && omdbData.Poster !== 'N/A') ? omdbData.Poster : filme.capa,
          tipo: omdbData.Type === 'series' ? 'serie' : (filme.tipo || 'filme'),
          totalTemporadas: omdbData.totalSeasons ? Number(omdbData.totalSeasons) : (typeof filme.temporadas === 'number' ? filme.temporadas : undefined),
          pais: omdbData.Country && omdbData.Country !== 'N/A' ? omdbData.Country : undefined,
          idioma: omdbData.Language && omdbData.Language !== 'N/A' ? omdbData.Language : undefined,
          urlImdb: `https://www.imdb.com/title/${omdbData.imdbID || filme.imdbId}/`,
          fonte: 'omdb'
        };

        cacheDetalhes.set(chave, formatado);
        return formatado;
      }
    } catch (fallbackErr) {
      console.warn('Fallback direto OMDb falhou:', fallbackErr);
    }

    // 5. Fallback estruturado baseado no próprio catálogo
    const fallbackLocal: ImdbDetalhes = {
      imdbId: filme.imdbId || 'tt0000000',
      titulo: filme.titulo,
      tituloOriginal: filme.titulo,
      ano: filme.ano || '2024',
      classificacao: '14+',
      duracao: filme.tipo === 'serie' ? 'Episódios de 45-60 min' : '120 min',
      genero: formatarGeneros(filme.genero),
      elenco: parseElenco(filme.sinopse?.includes('Elenco') ? filme.sinopse.replace(/.*Elenco[^\w]*/i, '') : ''),
      elencoTexto: filme.sinopse?.includes('Elenco') ? filme.sinopse : 'Elenco principal e equipe técnica',
      sinopse: filme.sinopse || 'Grande produção cinematográfica em alta definição disponível na Filmoteca Worscoi.',
      sinopseLocal: filme.sinopse,
      notaImdb: filme.rating || '8.5',
      votosImdb: 'Avaliação da comunidade IMDb',
      capa: filme.capa,
      tipo: filme.tipo || 'filme',
      totalTemporadas: typeof filme.temporadas === 'number' ? filme.temporadas : undefined,
      urlImdb: `https://www.imdb.com/title/${filme.imdbId || ''}/`,
      fonte: 'catalogo'
    };

    cacheDetalhes.set(chave, fallbackLocal);
    return fallbackLocal;
  },

  /**
   * Realiza pesquisa de títulos diretamente no IMDb para autocompletar e metadados
   */
  async pesquisarNoImdb(termo: string): Promise<FilmeItem[]> {
    if (!termo || termo.trim().length < 2) return [];
    const query = termo.trim().toLowerCase();
    try {
      const firstLetter = query[0];
      const searchUrl = `https://v3.sg.media-imdb.com/suggestion/${firstLetter}/${encodeURIComponent(query)}.json`;
      const res = await fetch(searchUrl, {
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { d?: ImdbSuggestItem[] };
      const items = data.d || [];

      return items
        .filter((item): item is ImdbSuggestItem & { id: string } => Boolean(item.id && item.id.startsWith('tt')))
        .slice(0, 15)
        .map((item, index) => {
          const isSerie = item.q === 'TV series' || item.qid === 'tvSeries';
          const isAnime = Boolean(item.l && /anime|dragon ball|naruto|one piece|jujutsu|shingeki|bleach|kimetsu|demon slayer|ghibli|totoro/i.test(item.l));
          const tipo: 'filme' | 'serie' | 'anime' = isAnime ? 'anime' : (isSerie ? 'serie' : 'filme');
          return {
            id: `imdb_${item.id}_${index}`,
            imdbId: item.id,
            tipo,
            titulo: item.l || 'Título IMDb',
            ano: item.y ? String(item.y) : (item.yr || '2024'),
            genero: isAnime ? 'Anime / Ação' : (isSerie ? 'Série / Drama' : 'Cinema / Aventura'),
            sinopse: item.s ? `Elenco IMDb: ${item.s}. Produção oficial registrada no catálogo IMDb.` : 'Produção oficial cadastrada no catálogo global IMDb.',
            capa: item.i?.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
            trailerUrl: `https://www.youtube-nocookie.com/embed?search=${encodeURIComponent((item.l || '') + ' official trailer')}`,
            rating: '8.5',
            temporadas: isSerie ? 1 : undefined
          };
        });
    } catch (e) {
      console.warn('Erro ao pesquisar sugestões IMDb:', e);
      return [];
    }
  }
};
