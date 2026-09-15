import { NextResponse } from 'next/server';

export interface FilmeItem {
  id: number | string;
  imdbId?: string;
  tmdbId?: string;
  titulo: string;
  ano: string;
  genero: string;
  sinopse: string;
  capa: string;
  videoUrl?: string;
  directStreamUrl?: string;
  trailerUrl?: string;
  fallbackUrl?: string;
  dailymotionUrl?: string;
  searchUrl?: string;
  rating?: string;
}

// Catálogo com filmes REAIS, lançados e com disponibilidade confirmada nos principais provedores de stream
const CATALOGO_BASE: FilmeItem[] = [
  {
    id: 1,
    imdbId: 'tt6263850',
    tmdbId: '533535',
    titulo: 'Deadpool & Wolverine',
    ano: '2024',
    genero: 'Ação / Comédia / Ficção Científica',
    sinopse: 'Wade Wilson leva uma vida tranquila até que a AVT o recruta para uma missão épica que o força a cruzar caminhos com um Wolverine amargurado para salvar seu universo.',
    capa: 'https://m.media-amazon.com/images/M/MV5BNzRiMjg0MzUtNTQ1Eg00Y2RmLWE4ZTItZDA0MGNkNmJhNGYxXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/73_1biulkYk?autoplay=1',
    rating: '8.1'
  },
  {
    id: 2,
    imdbId: 'tt15239678',
    tmdbId: '693134',
    titulo: 'Duna: Parte 2',
    ano: '2024',
    genero: 'Ficção Científica / Aventura / Drama',
    sinopse: 'Paul Atreides une-se a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram a sua família, enfrentando uma escolha entre o amor de sua vida e o destino do universo.',
    capa: 'https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/Way9Dexny3w?autoplay=1',
    rating: '8.6'
  },
  {
    id: 3,
    imdbId: 'tt4154796',
    tmdbId: '299534',
    titulo: 'Vingadores: Ultimato',
    ano: '2019',
    genero: 'Ação / Aventura / Ficção Científica',
    sinopse: 'Após Thanos eliminar metade de toda a vida no universo, os Vingadores remanescentes reúnem forças para desfazer os atos do titã e restaurar a ordem no cosmos.',
    capa: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/TcMBFSGVi1c?autoplay=1',
    rating: '8.4'
  },
  {
    id: 4,
    imdbId: 'tt0816692',
    tmdbId: '157336',
    titulo: 'Interestelar',
    ano: '2014',
    genero: 'Ficção Científica / Aventura / Drama',
    sinopse: 'Com a Terra à beira do colapso ecológico, um grupo de exploradores e cientistas espaciais viaja através de um buraco de minhoca recém-descoberto em busca de um novo lar para a humanidade.',
    capa: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/zSWdZVtXT7E?autoplay=1',
    rating: '8.7'
  },
  {
    id: 5,
    imdbId: 'tt15398776',
    tmdbId: '872585',
    titulo: 'Oppenheimer',
    ano: '2023',
    genero: 'Biografia / Drama / História',
    sinopse: 'A história do físico teórico J. Robert Oppenheimer, diretor do Laboratório de Los Alamos durante o Projeto Manhattan e seu papel fundamental no desenvolvimento da primeira bomba atômica.',
    capa: 'https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/uYPbbksJxIg?autoplay=1',
    rating: '8.9'
  },
  {
    id: 6,
    imdbId: 'tt9362722',
    tmdbId: '569094',
    titulo: 'Homem-Aranha: Através do Aranhaverso',
    ano: '2023',
    genero: 'Animação / Ação / Aventura',
    sinopse: 'Miles Morales é catapultado pelo Multiverso, onde encontra uma equipe de Pessoas-Aranha encarregadas de proteger sua própria existência contra uma ameaça que divide os heróis.',
    capa: 'https://m.media-amazon.com/images/M/MV5BNThiZjA3MjItZGY5Ni00ZmJhLWEwN2EtOTBlYTA3CGExOTU2XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/cqGjhVJWtEg?autoplay=1',
    rating: '8.7'
  },
  {
    id: 7,
    imdbId: 'tt0468569',
    tmdbId: '155',
    titulo: 'Batman: O Cavaleiro das Trevas',
    ano: '2008',
    genero: 'Ação / Crime / Suspense',
    sinopse: 'Quando a ameaça conhecida como Coringa emerge de seu passado misterioso para espalhar caos em Gotham, o Batman deve aceitar um dos maiores testes psicológicos e físicos de sua cruzada.',
    capa: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/EXeTwQWrcwY?autoplay=1',
    rating: '9.0'
  },
  {
    id: 8,
    imdbId: 'tt1745960',
    tmdbId: '361743',
    titulo: 'Top Gun: Maverick',
    ano: '2022',
    genero: 'Ação / Drama',
    sinopse: 'Após mais de trinta anos de serviço como um dos melhores aviadores da Marinha, Pete "Maverick" Mitchell lidera uma unidade de elite dos formandos de Top Gun em uma missão de precisão sem precedentes.',
    capa: 'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00MlQ0LWJkNzUtM2RhMjNjYTIxNmFlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/giXco2jaZ_4?autoplay=1',
    rating: '8.3'
  },
  {
    id: 9,
    imdbId: 'tt0172495',
    tmdbId: '98',
    titulo: 'Gladiador',
    ano: '2000',
    genero: 'Ação / Aventura / Épico',
    sinopse: 'Um antigo general romano traído pelo herdeiro do trono busca vingança contra o imperador corrupto que assassinou sua família e o condenou à escravidão na arena do Coliseu.',
    capa: 'https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/owK1qxDselE?autoplay=1',
    rating: '8.5'
  },
  {
    id: 10,
    imdbId: 'tt1630029',
    tmdbId: '76600',
    titulo: 'Avatar: O Caminho da Água',
    ano: '2022',
    genero: 'Ficção Científica / Ação / Aventura',
    sinopse: 'Jake Sully e Neytiri formam uma família e fazem tudo para permanecerem juntos, navegando pelos oceanos de Pandora quando uma antiga ameaça retorna para terminar o que começou.',
    capa: 'https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/d9MyW72ELq0?autoplay=1',
    rating: '7.6'
  },
  {
    id: 11,
    imdbId: 'tt10366206',
    tmdbId: '603692',
    titulo: 'John Wick 4: Baba Yaga',
    ano: '2023',
    genero: 'Ação / Suspense / Crime',
    sinopse: 'John Wick descobre um caminho para derrotar a Alta Cúpula. No entanto, antes de conquistar sua liberdade, ele deve enfrentar um novo inimigo poderoso com alianças globais.',
    capa: 'https://m.media-amazon.com/images/M/MV5BNDExZDE4MmEtNmFiMy00M2JhLWFjYjctYzVhMDVlZTBjOGNhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/qEVUtrk8_B4?autoplay=1',
    rating: '7.7'
  },
  {
    id: 12,
    imdbId: 'tt0133093',
    tmdbId: '603',
    titulo: 'Matrix',
    ano: '1999',
    genero: 'Ação / Ficção Científica',
    sinopse: 'Um jovem programador de computadores descobre que o mundo em que vive é uma simulação digital criada por máquinas inteligentes que dominam a humanidade.',
    capa: 'https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/m8e-FF8MsqU?autoplay=1',
    rating: '8.7'
  },
  {
    id: 13,
    imdbId: 'tt22022452',
    tmdbId: '1022789',
    titulo: 'Divertida Mente 2',
    ano: '2024',
    genero: 'Animação / Aventura / Comédia',
    sinopse: 'Riley entra na adolescência e a Sala de Comando passa por uma reforma repentina para abrir espaço para novas emoções inesperadas, lideradas pela Ansiedade.',
    capa: 'https://m.media-amazon.com/images/M/MV5BYWY6ZWVhYzEtNzc1ZS00NzRhLTk2ZjUtMTlhYjg4ZDA1NmVkXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/VWavstJydZU?autoplay=1',
    rating: '7.7'
  },
  {
    id: 14,
    imdbId: 'tt0068646',
    tmdbId: '238',
    titulo: 'O Poderoso Chefão',
    ano: '1972',
    genero: 'Crime / Drama',
    sinopse: 'O patriarca envelhecido de uma dinastia do crime organizado de Nova York transfere o controle de seu império clandestino para seu filho mais relutante.',
    capa: 'https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtMDRjZWQ2NjEyZTE1XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/sY1S34973zA?autoplay=1',
    rating: '9.2'
  },
  {
    id: 15,
    imdbId: 'tt0120616',
    tmdbId: '564',
    titulo: 'A Múmia',
    ano: '1999',
    genero: 'Ação / Aventura / Fantasia',
    sinopse: 'Nas areias do Egito em 1926, o explorador Rick O\'Connell lidera uma expedição que acidentalmente desperta a múmia maldita do sumo sacerdote Imhotep.',
    capa: 'https://m.media-amazon.com/images/M/MV5BMTY4YWE0OGMtNjU0Yi00YzIwLTk3NTktM2ZiYWQwNjM4MmMxXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/f7oKxlaUBac?autoplay=1',
    rating: '7.1'
  },
  {
    id: 16,
    imdbId: 'tt14539740',
    tmdbId: '823464',
    titulo: 'Godzilla e Kong: O Novo Império',
    ano: '2024',
    genero: 'Ação / Ficção Científica / Aventura',
    sinopse: 'Godzilla e Kong devem deixar de lado suas rivalidades para enfrentar uma colossal ameaça oculta na Terra Oca que põe em risco a sobrevivência de titãs e humanos.',
    capa: 'https://m.media-amazon.com/images/M/MV5BYzA0Mjk5M2MtMzY2NC00ODFlLWFmYjgtOTYwNjIyZTZmMTc0XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/qqrpMRDuPfc?autoplay=1',
    rating: '6.4'
  },
  {
    id: 17,
    imdbId: 'tt0063350',
    tmdbId: '10331',
    titulo: 'A Noite dos Mortos-Vivos',
    ano: '1968',
    genero: 'Terror / Mistério / Clássico',
    sinopse: 'Sete estranhos encontram-se presos em uma casa de fazenda rural cercada por mortos-vivos ressuscitados, lutando desesperadamente para sobreviver até o amanhecer.',
    capa: 'https://m.media-amazon.com/images/M/MV5BMjA4ODQ5OTAwMV5BMl5BanBnXkFtZTgwNTMyNTc4MTE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    directStreamUrl: 'https://ia800301.us.archive.org/17/items/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/fW_n6b9i4eY?autoplay=1',
    rating: '7.8'
  },
  {
    id: 18,
    imdbId: 'tt0032553',
    tmdbId: '914',
    titulo: 'O Grande Ditador',
    ano: '1940',
    genero: 'Comédia / Drama / Clássico',
    sinopse: 'A genial obra-prima satírica de Charlie Chaplin, interpretando simultaneamente um barbeiro judeu perseguido e o ditador tirânico Adenoid Hynkel.',
    capa: 'https://m.media-amazon.com/images/M/MV5BMmExNzU2ZWMtYzUwYi00YmM2LTkxZTQtNmVhNjY0NTMyMWFlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    directStreamUrl: 'https://ia600208.us.archive.org/16/items/TheGreatDictator_201804/The%20Great%20Dictator.mp4',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/J7GY1Xg6X20?autoplay=1',
    rating: '8.2'
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    // Se houver busca em tempo real por um filme que não está no catálogo local
    if (query && query.length >= 2) {
      try {
        const firstLetter = query[0].toLowerCase();
        const searchUrl = `https://v3.sg.media-imdb.com/suggestion/${firstLetter}/${encodeURIComponent(query.toLowerCase())}.json`;
        
        const imdbRes = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json'
          }
        });

        if (imdbRes.ok) {
          const imdbData = await imdbRes.json();
          const items = imdbData.d || [];
          
          const filmesEncontrados: FilmeItem[] = items
            .filter((item: { id?: string; q?: string; y?: number }) => 
              item.id && 
              item.id.startsWith('tt') && 
              (item.q === 'feature' || item.q === 'movie' || Boolean(item.y))
            )
            .slice(0, 12)
            .map((item: { id: string; l: string; y?: number; s?: string; i?: { imageUrl?: string } }, index: number) => ({
              id: `imdb_${item.id}_${index}`,
              imdbId: item.id,
              titulo: item.l,
              ano: item.y ? String(item.y) : 'Cinema',
              genero: 'Cinema / Streaming',
              sinopse: item.s ? `Elenco principal: ${item.s}` : `Produção cinematográfica oficial (${item.y || 'Global'}).`,
              capa: item.i?.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80',
              trailerUrl: `https://www.youtube-nocookie.com/embed?search=${encodeURIComponent(item.l + ' official trailer')}`,
              rating: 'HD'
            }));

          if (filmesEncontrados.length > 0) {
            return NextResponse.json(filmesEncontrados);
          }
        }
      } catch (searchErr) {
        console.warn('Erro ao consultar sugestão remota IMDb:', searchErr);
      }
    }

    // Retorna catálogo curado principal
    return NextResponse.json(CATALOGO_BASE);
  } catch (error) {
    console.error('Erro ao responder catálogo de filmes:', error);
    return NextResponse.json(CATALOGO_BASE);
  }
}
