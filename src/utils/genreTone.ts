export type GenreTone = {
  id: string
  label: string
  keywords: string[]
  classes: string
}

export const GENRE_TONES: GenreTone[] = [
  {
    id: 'house',
    label: 'House',
    keywords: [
      'house',
      'deep house',
      'progressive house',
      'tech house',
      'future house',
      'bass house',
      'big room',
      'electro house',
      'tropical house',
      'garage house',
      'uk garage',
    ],
    classes: 'bg-white text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10',
  },
  {
    id: 'techno',
    label: 'Techno',
    keywords: ['techno', 'minimal', 'acid', 'industrial', 'hard techno', 'melodic techno'],
    classes: 'bg-white text-pulsedarkblue border-pulsedarkblue pc:hover:bg-pulsedarkblue/10',
  },
  {
    id: 'bass',
    label: 'Bass',
    keywords: [
      'bass',
      'dubstep',
      'drum and bass',
      'drum & bass',
      'dnb',
      'breakbeat',
      'trap',
      'future bass',
      'riddim',
      'brostep',
      'hardstyle',
      'hardcore',
      'deathstep',
      'frenchcore'
    ],
    classes: 'bg-white text-pulsered border-pulsered pc:hover:bg-pulsered/10',
  },
  {
    id: 'trance',
    label: 'Trance',
    keywords: ['trance', 'psytrance', 'uplifting', 'progressive trance', 'goa'],
    classes: 'bg-white text-[#00919C] border-[#00919C] pc:hover:bg-[#00919C]/10',
  },
  {
    id: 'pop',
    label: 'Pop',
    keywords: [
      'pop',
      'dance-pop',
      'dance-pop',
      'synthpop',
      'electropop',
      'k-pop',
      'j-pop',
      'indie pop',
      'hyperpop',
    ],
    classes: 'bg-white text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10',
  },
  {
    id: 'dance',
    label: 'Dance',
    keywords: ['dance', 'edm', 'electronica', 'club', 'electronic'],
    classes: 'bg-white text-[#FFA71A] border-[#FFA71A] pc:hover:bg-[#FFA71A]/10',
  },
  {
    id: 'hiphop',
    label: 'Hip Hop',
    keywords: ['hip hop', 'hip-hop', 'rap', 'grime'],
    classes: 'bg-white text-[#797979] border-[#797979] pc:hover:bg-[#797979]/10',
  },
  {
    id: 'rnb',
    label: 'R&B',
    keywords: ['r&b', 'rnb', 'soul', 'funk'],
    classes: 'bg-white text-amber-700 border-amber-300 pc:hover:bg-amber-100',
  },
  {
    id: 'rock',
    label: 'Rock',
    keywords: ['rock', 'metal', 'punk', 'alternative', 'alt rock', 'hard rock'],
    classes: 'bg-white text-gray-700 border-gray-300 pc:hover:bg-gray-100',
  },
  {
    id: 'indie',
    label: 'Indie',
    keywords: ['indie', 'indie rock'],
    classes: 'bg-white text-emerald-700 border-emerald-300 pc:hover:bg-emerald-100',
  },
  {
    id: 'jazz',
    label: 'Jazz',
    keywords: ['jazz', 'blues'],
    classes: 'bg-white text-yellow-700 border-yellow-300 pc:hover:bg-yellow-100',
  },
  {
    id: 'classical',
    label: 'Classical',
    keywords: ['classical', 'orchestral', 'film score', 'score'],
    classes: 'bg-white text-slate-600 border-slate-300 pc:hover:bg-slate-100',
  },
  {
    id: 'ambient',
    label: 'Ambient',
    keywords: ['ambient', 'chill', 'downtempo', 'lo-fi', 'lofi'],
    classes: 'bg-white text-cyan-700 border-cyan-300 pc:hover:bg-cyan-100',
  },
  {
    id: 'latin',
    label: 'Latin',
    keywords: ['latin', 'reggaeton', 'salsa', 'bossa', 'afro', 'afrobeats', 'moombahton'],
    classes: 'bg-white text-orange-700 border-orange-300 pc:hover:bg-orange-100',
  },
]

const DEFAULT_GENRE_TONE = 'bg-white border-[var(--stroke)] text-[var(--text)]'

export const getGenreToneClass = (genre: string): string => {
  const key = genre.toLowerCase()
  for (const rule of GENRE_TONES) {
    if (rule.keywords.some((word) => key.includes(word))) return rule.classes
  }
  return DEFAULT_GENRE_TONE
}
