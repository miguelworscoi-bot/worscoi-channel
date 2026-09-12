export interface TrailerData {
  videoUrl: string;
  youtubeUrl: string;
}

export const GAME_TRAILERS: Record<string, TrailerData> = {
  'elden ring': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256860551/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=E3Huy2ypGYw',
  },
  'cyberpunk 2077': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/257081132/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=UnA7tepsc7s',
  },
  "baldur's gate 3": {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256987424/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=1T22wNlUiNh8',
  },
  'resident evil 4': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256998125/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=j5Ic2z36Udg',
  },
  'the witcher 3': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/257411252/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=c0i88t0Kacs',
  },
  'the witcher 3: wild hunt': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/257411252/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=c0i88t0Kacs',
  },
  'red dead redemption 2': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256768236/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=eaW0tYpxyp0',
  },
  'grand theft auto v': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/257109786/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=QkkoHAzjnUs',
  },
  'black myth: wukong': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/257048125/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=18-xvKG3_oM',
  },
  'hades ii': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/257204779/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=l-iHM_yebn8',
  },
  'hades 2': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/257204779/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=l-iHM_yebn8',
  },
  'helldivers 2': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/257416388/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=l_98kd_Qc4c',
  },
  'dave the diver': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256955037/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=yW63b36vQzE',
  },
  'hogwarts legacy': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256920367/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=1O6QstnCpnc',
  },
  'god of war': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256864004/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=hfJ4Km46A-0',
  },
  'hollow knight': {
    videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256682033/movie480.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=UAO2urG23S4',
  },
};

const DEFAULT_TRAILER: TrailerData = {
  videoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/256860551/movie480.mp4',
  youtubeUrl: 'https://www.youtube.com/watch?v=E3Huy2ypGYw',
};

export function getGameTrailer(gameTitle: string): TrailerData {
  const lower = gameTitle.toLowerCase();
  for (const [key, data] of Object.entries(GAME_TRAILERS)) {
    if (lower.includes(key)) {
      return data;
    }
  }
  return DEFAULT_TRAILER;
}

export function getGameTrailerUrl(gameTitle: string): string {
  return getGameTrailer(gameTitle).videoUrl;
}
