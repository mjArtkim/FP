import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/utils/firebase'
import { getProfileRole } from '@/utils/roles'
import { normalizeExternalUrl } from '@/utils/links'

type FestivalSubmission = {
  type: 'festival'
  title: string
  date: { year: string; month: string; day: string }
  location: string
  country: string
  ticketLink: string
  infoLink: string
  lineup: string
  imageName: string
}

type ArtistSubmission = {
  type: 'artist'
  name: string
  born: { year: string; month: string; day: string }
  city: string
  country: string
  labels: string
  genres: string
  yearsActive: string
  links: {
    about: string
    instagram: string
    youtube: string
    appleMusic: string
    spotify: string
    soundcloud: string
  }
  imageName: string
}

export const submitFestival = async (payload: FestivalSubmission) => {
  const user = auth.currentUser
  if (!user) throw new Error('Login required.')
  const role = await getProfileRole(user.uid)
  if (role !== 'admin') throw new Error('Admin only.')
  await addDoc(collection(db, 'adminSubmissions'), {
    ...payload,
    ticketLink: normalizeExternalUrl(payload.ticketLink),
    infoLink: normalizeExternalUrl(payload.infoLink),
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    status: 'pending',
  })
}

export const submitArtist = async (payload: ArtistSubmission) => {
  const user = auth.currentUser
  if (!user) throw new Error('Login required.')
  const role = await getProfileRole(user.uid)
  if (role !== 'admin') throw new Error('Admin only.')
  await addDoc(collection(db, 'adminSubmissions'), {
    ...payload,
    links: {
      about: normalizeExternalUrl(payload.links.about),
      instagram: normalizeExternalUrl(payload.links.instagram),
      youtube: normalizeExternalUrl(payload.links.youtube),
      appleMusic: normalizeExternalUrl(payload.links.appleMusic),
      spotify: normalizeExternalUrl(payload.links.spotify),
      soundcloud: normalizeExternalUrl(payload.links.soundcloud),
    },
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    status: 'pending',
  })
}
