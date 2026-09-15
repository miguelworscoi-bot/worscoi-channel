import { NextResponse } from 'next/server';

export interface FilmeItem {
  id: number;
  imdbId?: string;
  titulo: string;
  ano: string;
  genero: string;
  sinopse: string;
  capa: string;
  videoUrl?: string;
  trailerUrl?: string;
  fallbackUrl?: string;
  dailymotionUrl?: string;
  searchUrl?: string;
}

export async function GET() {
  try {
    // Catálogo com fontes multicanais (Dailymotion, YouTube, MultiEmbed, Provedores Independentes)
    const filmesEpicos: FilmeItem[] = [
      {
        id: 1,
        imdbId: "tt22084616",
        titulo: "Homem-Aranha: Um Novo Dia",
        ano: "2026",
        genero: "Ação / Aventura / Ficção Científica",
        sinopse: "Após os acontecimentos de Sem Volta Para Casa, Peter Parker tenta reconstruir a sua vida anônima em Nova Iorque enquanto enfrenta uma nova ameaça e o surgimento de teias orgânicas.",
        capa: "https://m.media-amazon.com/images/M/MV5BOWNjYWM3NWItOGE0ZS00MWRjLThiZWEtYjc4ZmNmMmU5ZTVmXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/xat72da?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/62bIsvRcPv0?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt22084616",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt22084616",
        searchUrl: "https://www.google.com/search?q=assistir+Homem-Aranha+Um+Novo+Dia+filme+completo+online+gratis"
      },
      {
        id: 2,
        imdbId: "tt19861162",
        titulo: "A Odisseia",
        ano: "2024",
        genero: "Drama / Épico / História",
        sinopse: "Vinte anos após partir para a Guerra de Troia, Ulisses regressa a Ítaca exausto e irreconhecível, descobrindo que o seu palácio foi tomado por pretendentes cruéis que ameaçam Penélope e o seu filho.",
        capa: "https://m.media-amazon.com/images/M/MV5BMDNlNzQ5NDAtYTdlZC00YTRiLTg0ZWUtMmY5NWYyNzdiYTYyXkEyXkFqcGc@._V1_SX300.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/x98zyh8?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/lrZqQBA9v3Q?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt19861162",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt19861162",
        searchUrl: "https://www.google.com/search?q=assistir+A+Odisseia+The+Return+2024+filme+completo+online+dublado"
      },
      {
        id: 3,
        imdbId: "tt29355505",
        titulo: "Toy Story 5",
        ano: "2026",
        genero: "Animação / Aventura / Família",
        sinopse: "Woody, Buzz Lightyear, Jessie e o grupo enfrentam o seu maior desafio na era digital quando um tablet eletrónico inteligente chamado Lilypad monopoliza a atenção de Bonnie.",
        capa: "https://m.media-amazon.com/images/M/MV5BZTI1YTBiNmEtYWUxZi00YzFkLWIzNjMtMmZjMmY2NzM0ZWMzXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/xajr5y2?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/c51ND9Hdbw0?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt29355505",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt29355505",
        searchUrl: "https://www.google.com/search?q=assistir+Toy+Story+5+filme+completo+online+dublado"
      },
      {
        id: 4,
        imdbId: "tt6718170",
        titulo: "Super Mario Galaxy: O Filme",
        ano: "2026",
        genero: "Animação / Aventura / Fantasia",
        sinopse: "Mario, Luigi e a Princesa Peach são lançados numa odisseia espacial pelo cosmos para deter a conquista intergaláctica de Bowser e encontrar a misteriosa guardiã das estrelas, Rosalina.",
        capa: "https://m.media-amazon.com/images/M/MV5BOWFmNmY2YjAtZTgyNy00MjBmLWI1YWMtMjFjZjkxYjYyOTVmXkEyXkFqcGc@._V1_QL75_UX380_CR0,20,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/x9tolwq?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/GuCejewteF8?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt6718170",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt6718170",
        searchUrl: "https://www.google.com/search?q=assistir+Super+Mario+Galaxy+O+Filme+completo+online"
      },
      {
        id: 5,
        imdbId: "tt11378946",
        titulo: "Michael",
        ano: "2026",
        genero: "Biografia / Drama / Musical",
        sinopse: "A trajetória monumental de Michael Jackson, desde a infância nos palcos com os Jackson 5 até a ascensão global como o Rei do Pop e as complexidades por trás do maior artista do século.",
        capa: "https://m.media-amazon.com/images/M/MV5BNzllNmRlN2EtMDQyOC00ODJjLTg4OWQtZDNmNGU3YzlkNjc1XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/x8rfzq8?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/mbtgEE6rkxw?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt11378946",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt11378946",
        searchUrl: "https://www.google.com/search?q=assistir+Michael+filme+completo+online+dublado"
      },
      {
        id: 6,
        imdbId: "tt33612209",
        titulo: "O Diabo Veste Prada 2",
        ano: "2026",
        genero: "Comédia / Drama",
        sinopse: "Miranda Priestly enfrenta o colapso das revistas impressas e é forçada a confrontar a sua antiga rival e assistente Emily Charlton, agora líder de um poderoso grupo de publicidade de moda.",
        capa: "https://m.media-amazon.com/images/M/MV5BZmM3ZDU3ODItZmY5Yi00OTQ2LWE5OTctZTA5NDBhMWJkOGY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/x9r166k?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/9c-DrMe8o5Q?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt33612209",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt33612209",
        searchUrl: "https://www.google.com/search?q=assistir+O+Diabo+Veste+Prada+2+filme+completo+online"
      },
      {
        id: 7,
        imdbId: "tt32141377",
        titulo: "Extermínio: O Templo dos Ossos",
        ano: "2026",
        genero: "Terror / Ficção Científica / Suspense",
        sinopse: "Quase três décadas após o surto inicial do vírus da fúria, comunidades isoladas sobrevivem em ruínas fortificadas enquanto enfrentam uma nova e sinistra evolução dos infectados.",
        capa: "https://m.media-amazon.com/images/M/MV5BZGU2M2Y1YTItMWYxNS00NDYxLThhOTYtNjNhOWUzNjA3MTYwXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/x9pxqlw?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/mcvLKldPM08?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt32141377",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt32141377",
        searchUrl: "https://www.google.com/search?q=assistir+Exterminio+O+Templo+dos+Ossos+28+years+later+filme+completo"
      },
      {
        id: 8,
        imdbId: "tt30825738",
        titulo: "O Mandaloriano e Grogu",
        ano: "2026",
        genero: "Ficção Científica / Ação / Aventura",
        sinopse: "Din Djarin e o jovem aprendiz Grogu partem numa aventura cinematográfica de grande escala pelos confins da galáxia para proteger a frágil Nova República contra conspirações imperiais.",
        capa: "https://m.media-amazon.com/images/M/MV5BYjRkYzAzNjktZmRhMy00NjRiLWE0OTMtYmRmMTE5NDkzY2NlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/x9r24ji?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/OrvEkEwrDU4?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt30825738",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt30825738",
        searchUrl: "https://www.google.com/search?q=assistir+O+Mandaloriano+e+Grogu+filme+completo+online"
      },
      {
        id: 9,
        imdbId: "tt12042730",
        titulo: "Devoradores de Estrelas",
        ano: "2026",
        genero: "Ficção Científica / Aventura / Drama",
        sinopse: "O cientista Ryland Grace acorda sem memória numa nave espacial distante e percebe que é o único sobrevivente de uma missão vital para salvar a humanidade e o Sol da extinção cósmica.",
        capa: "https://m.media-amazon.com/images/M/MV5BNTkwNzJiYTctNzI3NC00NjE1LTlhYjktY2Q5MTdmMWFmNzcxXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/x9zjuf0?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/m08TxIsFTRI?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt12042730",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt12042730",
        searchUrl: "https://www.google.com/search?q=assistir+Devoradores+de+Estrelas+Project+Hail+Mary+filme+completo"
      },
      {
        id: 10,
        imdbId: "tt17490712",
        titulo: "Mortal Kombat 2",
        ano: "2026",
        genero: "Ação / Fantasia / Artes Marciais",
        sinopse: "Cole Young e os campeões de Raiden recrutam a lenda do cinema Johnny Cage para combater as forças implacáveis de Shao Kahn e da Exoterra no torneio que decidirá o destino do Plano Terreno.",
        capa: "https://m.media-amazon.com/images/M/MV5BNTg2YWNkN2EtMzc1Ny00ZTBhLWFmYTItMmMyNzhjNjhhNmVhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/xa7yqj2?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/RDMIUwMO67I?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt17490712",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt17490712",
        searchUrl: "https://www.google.com/search?q=assistir+Mortal+Kombat+2+filme+completo+online+dublado"
      },
      {
        id: 11,
        imdbId: "tt32588798",
        titulo: "Da Magia à Sedução: Feitiço de Amor",
        ano: "2026",
        genero: "Comédia Romântica / Fantasia / Drama",
        sinopse: "As irmãs Sally e Gillian Owens regressam mais unidas para guiar uma nova geração de descendentes e confrontar os segredos do feitiço ancestral de amor que acompanha a família.",
        capa: "https://m.media-amazon.com/images/M/MV5BMWUyY2UyNjgtYTg5MC00MDZmLWE1MzEtZmU2YWE2ZTMzMjUwXkEyXkFqcGc@._V1_QL75_UY562_CR35,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/xaiqj12?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/Ho10_4IX1jE?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt32588798",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt32588798",
        searchUrl: "https://www.google.com/search?q=assistir+Da+Magia+a+Seducao+Feitico+de+Amor+Practical+Magic+2"
      },
      {
        id: 12,
        imdbId: "tt0120616",
        titulo: "The Mummy",
        ano: "1999",
        genero: "Ação / Aventura / Fantasia",
        sinopse: "Nas areias do Egito em 1926, o explorador Rick O'Connell lidera uma expedição que acidentalmente desperta a múmia maldita do sumo sacerdote Imhotep, iniciando uma corrida desesperada pela sobrevivência.",
        capa: "https://m.media-amazon.com/images/M/MV5BMTY4YWE0OGMtNjU0Yi00YzIwLTk3NTktM2ZiYWQwNjM4MmMxXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/x2us6l1?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/f7oKxlaUBac?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt0120616",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt0120616",
        searchUrl: "https://www.google.com/search?q=assistir+A+Mumia+1999+The+Mummy+filme+completo+dublado"
      },
      {
        id: 13,
        imdbId: "tt29356163",
        titulo: "PAW Patrol: O Filme Dino",
        ano: "2026",
        genero: "Animação / Aventura / Infantil",
        sinopse: "Ryder e os heróicos filhotes da Patrulha Canina viajam para uma terra esquecida repleta de dinossauros para protegê-los de um vulcão ativo e das travessuras do Prefeito Humdinger.",
        capa: "https://m.media-amazon.com/images/M/MV5BY2E2Y2Q0Y2ItZTUyZS00MzllLTkwYmQtYjdmNzM3NGRiYjFmXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
        dailymotionUrl: "https://www.dailymotion.com/embed/video/xayhkxi?autoplay=1",
        trailerUrl: "https://www.youtube-nocookie.com/embed/xgI5iYmOf5Q?autoplay=1",
        videoUrl: "https://multiembed.mov/directstream.php?video_id=tt29356163",
        fallbackUrl: "https://vidsrc.me/embed/movie?imdb=tt29356163",
        searchUrl: "https://www.google.com/search?q=assistir+Patrulha+Canina+Dino+filme+completo+online+dublado"
      }
    ];

    return NextResponse.json(filmesEpicos);
  } catch {
    return NextResponse.json({ error: 'Erro ao carregar catálogo' }, { status: 500 });
  }
}


