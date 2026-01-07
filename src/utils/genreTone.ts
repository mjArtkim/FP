export type GenreTone = {
  id: string
  label: string
  keywords: string[]
  classes: string
}

export type GenreGroup = {
  id: string
  label: string
  classes: string
  children: GenreTone[]
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
    classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10',
  },
  {
    id: 'techno',
    label: 'Techno',
    keywords: ['techno', 'minimal', 'acid', 'industrial', 'hard techno', 'melodic techno'],
    classes: 'bg-[var(--bg)] text-pulsedarkblue border-pulsedarkblue pc:hover:bg-pulsedarkblue/10',
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
    classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10',
  },
  {
    id: 'trance',
    label: 'Trance',
    keywords: ['trance', 'psytrance', 'uplifting', 'progressive trance', 'goa'],
    classes: 'bg-[var(--bg)] text-[#00919C] border-[#00919C] pc:hover:bg-[#00919C]/10',
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
    classes: 'bg-[var(--bg)] text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10',
  },
  {
    id: 'dance',
    label: 'Dance',
    keywords: ['dance', 'edm', 'electronica', 'club', 'electronic'],
    classes: 'bg-[var(--bg)] text-[#FFA71A] border-[#FFA71A] pc:hover:bg-[#FFA71A]/10',
  },
  {
    id: 'hiphop',
    label: 'Hip Hop',
    keywords: ['hip hop', 'hip-hop', 'rap', 'grime'],
    classes: 'bg-[var(--bg)] text-[#797979] border-[#797979] pc:hover:bg-[#797979]/10',
  },
  {
    id: 'rnb',
    label: 'R&B',
    keywords: ['r&b', 'rnb', 'soul', 'funk'],
    classes: 'bg-[var(--bg)] text-amber-700 border-amber-300 pc:hover:bg-amber-100',
  },
  {
    id: 'rock',
    label: 'Rock',
    keywords: ['rock', 'metal', 'punk', 'alternative', 'alt rock', 'hard rock'],
    classes: 'bg-[var(--bg)] text-gray-700 border-gray-300 pc:hover:bg-gray-100',
  },
  {
    id: 'indie',
    label: 'Indie',
    keywords: ['indie', 'indie rock'],
    classes: 'bg-[var(--bg)] text-emerald-700 border-emerald-300 pc:hover:bg-emerald-100',
  },
  {
    id: 'jazz',
    label: 'Jazz',
    keywords: ['jazz', 'blues'],
    classes: 'bg-[var(--bg)] text-yellow-700 border-yellow-300 pc:hover:bg-yellow-100',
  },
  {
    id: 'classical',
    label: 'Classical',
    keywords: ['classical', 'orchestral', 'film score', 'score'],
    classes: 'bg-[var(--bg)] text-slate-600 border-slate-300 pc:hover:bg-slate-100',
  },
  {
    id: 'ambient',
    label: 'Ambient',
    keywords: ['ambient', 'chill', 'downtempo', 'lo-fi', 'lofi'],
    classes: 'bg-[var(--bg)] text-cyan-700 border-cyan-300 pc:hover:bg-cyan-100',
  },
  {
    id: 'latin',
    label: 'Latin',
    keywords: ['latin', 'reggaeton', 'salsa', 'bossa', 'afro', 'afrobeats', 'moombahton'],
    classes: 'bg-[var(--bg)] text-orange-700 border-orange-300 pc:hover:bg-orange-100',
  },
]

export const GENRE_GROUPS: GenreGroup[] = [
  {
    id: 'house',
    label: 'House',
    classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10',
    children: [
      { id: 'deep-house', label: 'Deep House', keywords: ['deep house'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
      { id: 'progressive-house', label: 'Progressive House', keywords: ['progressive house'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
      { id: 'tech-house', label: 'Tech House', keywords: ['tech house'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
      { id: 'future-house', label: 'Future House', keywords: ['future house'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
      { id: 'bass-house', label: 'Bass House', keywords: ['bass house'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
      { id: 'big-room', label: 'Big Room', keywords: ['big room'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
      { id: 'electro-house', label: 'Electro House', keywords: ['electro house'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
      { id: 'tropical-house', label: 'Tropical House', keywords: ['tropical house'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
      { id: 'garage-house', label: 'Garage House', keywords: ['garage house'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
      { id: 'uk-garage', label: 'UK Garage', keywords: ['uk garage'], classes: 'bg-[var(--bg)] text-[#0090EF] border-[#0090EF] pc:hover:bg-[#0090EF]/10' },
    ],
  },
  {
    id: 'bass',
    label: 'Bass',
    classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10',
    children: [
      { id: 'dubstep', label: 'Dubstep', keywords: ['dubstep'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'drum-and-bass', label: 'Drum & Bass', keywords: ['drum and bass', 'drum & bass', 'dnb'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'breakbeat', label: 'Breakbeat', keywords: ['breakbeat'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'trap', label: 'Trap', keywords: ['trap'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'future-bass', label: 'Future Bass', keywords: ['future bass'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'riddim', label: 'Riddim', keywords: ['riddim'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'brostep', label: 'Brostep', keywords: ['brostep'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'hardstyle', label: 'Hardstyle', keywords: ['hardstyle'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'hardcore', label: 'Hardcore', keywords: ['hardcore'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'deathstep', label: 'Deathstep', keywords: ['deathstep'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
      { id: 'frenchcore', label: 'Frenchcore', keywords: ['frenchcore'], classes: 'bg-[var(--bg)] text-pulsered border-pulsered pc:hover:bg-pulsered/10' },
    ],
  },
  {
    id: 'pop',
    label: 'Pop',
    classes: 'bg-[var(--bg)] text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10',
    children: [
      { id: 'dance-pop', label: 'Dance Pop', keywords: ['dance-pop', 'dance pop'], classes: 'bg-[var(--bg)] text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10' },
      { id: 'synthpop', label: 'Synthpop', keywords: ['synthpop'], classes: 'bg-[var(--bg)] text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10' },
      { id: 'electropop', label: 'Electropop', keywords: ['electropop'], classes: 'bg-[var(--bg)] text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10' },
      { id: 'k-pop', label: 'K-Pop', keywords: ['k-pop', 'kpop'], classes: 'bg-[var(--bg)] text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10' },
      { id: 'j-pop', label: 'J-Pop', keywords: ['j-pop', 'jpop'], classes: 'bg-[var(--bg)] text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10' },
      { id: 'indie-pop', label: 'Indie Pop', keywords: ['indie pop'], classes: 'bg-[var(--bg)] text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10' },
      { id: 'hyperpop', label: 'Hyperpop', keywords: ['hyperpop'], classes: 'bg-[var(--bg)] text-[#5300EF] border-[#5300EF] pc:hover:bg-[#5300EF]/10' },
    ],
  },
  {
    id: 'trance',
    label: 'Trance',
    classes: 'bg-[var(--bg)] text-[#00919C] border-[#00919C] pc:hover:bg-[#00919C]/10',
    children: [
      { id: 'psytrance', label: 'Psytrance', keywords: ['psytrance'], classes: 'bg-[var(--bg)] text-[#00919C] border-[#00919C] pc:hover:bg-[#00919C]/10' },
      { id: 'uplifting', label: 'Uplifting', keywords: ['uplifting'], classes: 'bg-[var(--bg)] text-[#00919C] border-[#00919C] pc:hover:bg-[#00919C]/10' },
      { id: 'progressive-trance', label: 'Progressive Trance', keywords: ['progressive trance'], classes: 'bg-[var(--bg)] text-[#00919C] border-[#00919C] pc:hover:bg-[#00919C]/10' },
      { id: 'goa', label: 'Goa', keywords: ['goa'], classes: 'bg-[var(--bg)] text-[#00919C] border-[#00919C] pc:hover:bg-[#00919C]/10' },
    ],
  },
  {
    id: 'techno',
    label: 'Techno',
    classes: 'bg-[var(--bg)] text-pulsedarkblue border-pulsedarkblue pc:hover:bg-pulsedarkblue/10',
    children: [
      { id: 'minimal', label: 'Minimal', keywords: ['minimal'], classes: 'bg-[var(--bg)] text-pulsedarkblue border-pulsedarkblue pc:hover:bg-pulsedarkblue/10' },
      { id: 'acid', label: 'Acid', keywords: ['acid'], classes: 'bg-[var(--bg)] text-pulsedarkblue border-pulsedarkblue pc:hover:bg-pulsedarkblue/10' },
      { id: 'industrial', label: 'Industrial', keywords: ['industrial'], classes: 'bg-[var(--bg)] text-pulsedarkblue border-pulsedarkblue pc:hover:bg-pulsedarkblue/10' },
      { id: 'hard-techno', label: 'Hard Techno', keywords: ['hard techno'], classes: 'bg-[var(--bg)] text-pulsedarkblue border-pulsedarkblue pc:hover:bg-pulsedarkblue/10' },
      { id: 'melodic-techno', label: 'Melodic Techno', keywords: ['melodic techno'], classes: 'bg-[var(--bg)] text-pulsedarkblue border-pulsedarkblue pc:hover:bg-pulsedarkblue/10' },
    ],
  },
  {
    id: 'dance',
    label: 'Dance',
    classes: 'bg-[var(--bg)] text-[#FFA71A] border-[#FFA71A] pc:hover:bg-[#FFA71A]/10',
    children: [
      { id: 'edm', label: 'EDM', keywords: ['edm'], classes: 'bg-[var(--bg)] text-[#FFA71A] border-[#FFA71A] pc:hover:bg-[#FFA71A]/10' },
      { id: 'electronica', label: 'Electronica', keywords: ['electronica'], classes: 'bg-[var(--bg)] text-[#FFA71A] border-[#FFA71A] pc:hover:bg-[#FFA71A]/10' },
      { id: 'club', label: 'Club', keywords: ['club'], classes: 'bg-[var(--bg)] text-[#FFA71A] border-[#FFA71A] pc:hover:bg-[#FFA71A]/10' },
      { id: 'electronic', label: 'Electronic', keywords: ['electronic'], classes: 'bg-[var(--bg)] text-[#FFA71A] border-[#FFA71A] pc:hover:bg-[#FFA71A]/10' },
    ],
  },
  // {
  //   id: 'hiphop',
  //   label: 'Hip Hop',
  //   classes: 'bg-[var(--bg)] text-[#797979] border-[#797979] pc:hover:bg-[#797979]/10',
  //   children: [
  //     { id: 'hip-hop', label: 'Hip Hop', keywords: ['hip hop', 'hip-hop'], classes: 'bg-[var(--bg)] text-[#797979] border-[#797979] pc:hover:bg-[#797979]/10' },
  //     { id: 'rap', label: 'Rap', keywords: ['rap'], classes: 'bg-[var(--bg)] text-[#797979] border-[#797979] pc:hover:bg-[#797979]/10' },
  //     { id: 'grime', label: 'Grime', keywords: ['grime'], classes: 'bg-[var(--bg)] text-[#797979] border-[#797979] pc:hover:bg-[#797979]/10' },
  //   ],
  // },
  // {
  //   id: 'rnb',
  //   label: 'R&B',
  //   classes: 'bg-[var(--bg)] text-amber-700 border-amber-300 pc:hover:bg-amber-100',
  //   children: [
  //     { id: 'rnb', label: 'R&B', keywords: ['r&b', 'rnb'], classes: 'bg-[var(--bg)] text-amber-700 border-amber-300 pc:hover:bg-amber-100' },
  //     { id: 'soul', label: 'Soul', keywords: ['soul'], classes: 'bg-[var(--bg)] text-amber-700 border-amber-300 pc:hover:bg-amber-100' },
  //     { id: 'funk', label: 'Funk', keywords: ['funk'], classes: 'bg-[var(--bg)] text-amber-700 border-amber-300 pc:hover:bg-amber-100' },
  //   ],
  // },
  // {
  //   id: 'rock',
  //   label: 'Rock',
  //   classes: 'bg-[var(--bg)] text-gray-700 border-gray-300 pc:hover:bg-gray-100',
  //   children: [
  //     { id: 'metal', label: 'Metal', keywords: ['metal'], classes: 'bg-[var(--bg)] text-gray-700 border-gray-300 pc:hover:bg-gray-100' },
  //     { id: 'punk', label: 'Punk', keywords: ['punk'], classes: 'bg-[var(--bg)] text-gray-700 border-gray-300 pc:hover:bg-gray-100' },
  //     { id: 'alternative', label: 'Alternative', keywords: ['alternative'], classes: 'bg-[var(--bg)] text-gray-700 border-gray-300 pc:hover:bg-gray-100' },
  //     { id: 'alt-rock', label: 'Alt Rock', keywords: ['alt rock'], classes: 'bg-[var(--bg)] text-gray-700 border-gray-300 pc:hover:bg-gray-100' },
  //     { id: 'hard-rock', label: 'Hard Rock', keywords: ['hard rock'], classes: 'bg-[var(--bg)] text-gray-700 border-gray-300 pc:hover:bg-gray-100' },
  //   ],
  // },
  // {
  //   id: 'indie',
  //   label: 'Indie',
  //   classes: 'bg-[var(--bg)] text-emerald-700 border-emerald-300 pc:hover:bg-emerald-100',
  //   children: [
  //     { id: 'indie', label: 'Indie', keywords: ['indie'], classes: 'bg-[var(--bg)] text-emerald-700 border-emerald-300 pc:hover:bg-emerald-100' },
  //     { id: 'indie-rock', label: 'Indie Rock', keywords: ['indie rock'], classes: 'bg-[var(--bg)] text-emerald-700 border-emerald-300 pc:hover:bg-emerald-100' },
  //   ],
  // },
  // {
  //   id: 'jazz',
  //   label: 'Jazz',
  //   classes: 'bg-[var(--bg)] text-yellow-700 border-yellow-300 pc:hover:bg-yellow-100',
  //   children: [
  //     { id: 'jazz', label: 'Jazz', keywords: ['jazz'], classes: 'bg-[var(--bg)] text-yellow-700 border-yellow-300 pc:hover:bg-yellow-100' },
  //     { id: 'blues', label: 'Blues', keywords: ['blues'], classes: 'bg-[var(--bg)] text-yellow-700 border-yellow-300 pc:hover:bg-yellow-100' },
  //   ],
  // },
  // {
  //   id: 'classical',
  //   label: 'Classical',
  //   classes: 'bg-[var(--bg)] text-slate-600 border-slate-300 pc:hover:bg-slate-100',
  //   children: [
  //     { id: 'classical', label: 'Classical', keywords: ['classical'], classes: 'bg-[var(--bg)] text-slate-600 border-slate-300 pc:hover:bg-slate-100' },
  //     { id: 'orchestral', label: 'Orchestral', keywords: ['orchestral'], classes: 'bg-[var(--bg)] text-slate-600 border-slate-300 pc:hover:bg-slate-100' },
  //     { id: 'film-score', label: 'Film Score', keywords: ['film score'], classes: 'bg-[var(--bg)] text-slate-600 border-slate-300 pc:hover:bg-slate-100' },
  //     { id: 'score', label: 'Score', keywords: ['score'], classes: 'bg-[var(--bg)] text-slate-600 border-slate-300 pc:hover:bg-slate-100' },
  //   ],
  // },
  // {
  //   id: 'ambient',
  //   label: 'Ambient',
  //   classes: 'bg-[var(--bg)] text-cyan-700 border-cyan-300 pc:hover:bg-cyan-100',
  //   children: [
  //     { id: 'ambient', label: 'Ambient', keywords: ['ambient'], classes: 'bg-[var(--bg)] text-cyan-700 border-cyan-300 pc:hover:bg-cyan-100' },
  //     { id: 'chill', label: 'Chill', keywords: ['chill'], classes: 'bg-[var(--bg)] text-cyan-700 border-cyan-300 pc:hover:bg-cyan-100' },
  //     { id: 'downtempo', label: 'Downtempo', keywords: ['downtempo'], classes: 'bg-[var(--bg)] text-cyan-700 border-cyan-300 pc:hover:bg-cyan-100' },
  //     { id: 'lofi', label: 'Lo-Fi', keywords: ['lo-fi', 'lofi'], classes: 'bg-[var(--bg)] text-cyan-700 border-cyan-300 pc:hover:bg-cyan-100' },
  //   ],
  // },
  // {
  //   id: 'latin',
  //   label: 'Latin',
  //   classes: 'bg-[var(--bg)] text-orange-700 border-orange-300 pc:hover:bg-orange-100',
  //   children: [
  //     { id: 'latin', label: 'Latin', keywords: ['latin'], classes: 'bg-[var(--bg)] text-orange-700 border-orange-300 pc:hover:bg-orange-100' },
  //     { id: 'reggaeton', label: 'Reggaeton', keywords: ['reggaeton'], classes: 'bg-[var(--bg)] text-orange-700 border-orange-300 pc:hover:bg-orange-100' },
  //     { id: 'salsa', label: 'Salsa', keywords: ['salsa'], classes: 'bg-[var(--bg)] text-orange-700 border-orange-300 pc:hover:bg-orange-100' },
  //     { id: 'bossa', label: 'Bossa', keywords: ['bossa'], classes: 'bg-[var(--bg)] text-orange-700 border-orange-300 pc:hover:bg-orange-100' },
  //     { id: 'afro', label: 'Afro', keywords: ['afro'], classes: 'bg-[var(--bg)] text-orange-700 border-orange-300 pc:hover:bg-orange-100' },
  //     { id: 'afrobeats', label: 'Afrobeats', keywords: ['afrobeats'], classes: 'bg-[var(--bg)] text-orange-700 border-orange-300 pc:hover:bg-orange-100' },
  //     { id: 'moombahton', label: 'Moombahton', keywords: ['moombahton'], classes: 'bg-[var(--bg)] text-orange-700 border-orange-300 pc:hover:bg-orange-100' },
  //   ],
  // },
]

const DEFAULT_GENRE_TONE = 'bg-[var(--bg)] border-[var(--stroke)] text-[var(--text)]'

export const getGenreToneClass = (genre: string): string => {
  const key = genre.toLowerCase()
  for (const rule of GENRE_TONES) {
    if (rule.keywords.some((word) => key.includes(word))) return rule.classes
  }
  return DEFAULT_GENRE_TONE
}
