<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteCurrentUser, getCurrentUser, signOutUser, updateCurrentEmail } from '@/utils/auth'
import { deleteProfile, getProfile, updateProfile } from '@/utils/profile'
import { clearStoredKey, KeyStorageError } from '@/utils/crypto'
import { submitArtist, submitFestival } from '@/utils/adminSubmissions'
import AdminModal from '@/components/unit/AdminModal.vue'
import { useI18n } from '@/i18n'

const isEditing = ref(false)
const isAdminOpen = ref(false)
const isSaving = ref(false)
const isLoading = ref(true)
const errorMessage = ref('')
const actionMessage = ref('')
const userId = ref('')
const userRole = ref<'guest' | 'user' | 'admin'>('guest')
const router = useRouter()
const { t } = useI18n()

const profile = reactive({
  name: '',
  email: '',
  password: '************',
  phone: '',
  dob: '',
  city: '',
  country: '',
})

const draftProfile = reactive({ ...profile })

const maskedPassword = computed(() => {
  const length = Math.max(10, profile.password.length)
  return '*'.repeat(length)
})

const optionalValue = (value: string) => (value.trim() ? value : t('profile.optionalEmpty'))

const startEdit = () => {
  Object.assign(draftProfile, profile)
  isEditing.value = true
}

const cancelEdit = () => {
  Object.assign(draftProfile, profile)
  isEditing.value = false
  errorMessage.value = ''
  actionMessage.value = ''
}

const saveEdit = async () => {
  if (!userId.value) return
  isSaving.value = true
  errorMessage.value = ''
  actionMessage.value = ''

  try {
    if (draftProfile.email && draftProfile.email !== profile.email) {
      await updateCurrentEmail(draftProfile.email)
    }

    await updateProfile(userId.value, {
      fullName: draftProfile.name.trim(),
      email: draftProfile.email.trim(),
      phone: draftProfile.phone.trim(),
      dob: draftProfile.dob.trim(),
      city: draftProfile.city.trim(),
      country: draftProfile.country.trim(),
    })
    Object.assign(profile, draftProfile)
    profile.password = '************'
    isEditing.value = false
    actionMessage.value = t('profile.updateSuccess')
  } catch (error) {
    if (error instanceof KeyStorageError) {
      errorMessage.value = t('profile.secureStorageUnavailable')
    } else {
      const message = error instanceof Error ? error.message : t('profile.updateFailed')
      errorMessage.value = message
    }
  } finally {
    isSaving.value = false
  }
}

const festivalForm = reactive({
  role: 'FESTIVAL',
  name: '',
  year: '',
  month: '',
  day: '',
  location: '',
  country: '',
  ticketLink: '',
  infoLink: '',
  lineup: '',
  imageName: '',
  artistName: '',
  artistYear: '',
  artistMonth: '',
  artistDay: '',
  artistCity: '',
  artistCountry: '',
  artistLabels: '',
  artistGenres: '',
  artistActiveYear: '',
  aboutLink: '',
  instagramLink: '',
  youtubeLink: '',
  appleMusicLink: '',
  spotifyLink: '',
  soundcloudLink: '',
  artistImageName: '',
})

const years = Array.from({ length: 8 }, (_, index) => `${2024 + index}`)
const months = Array.from({ length: 12 }, (_, index) => `${index + 1}`.padStart(2, '0'))
const days = Array.from({ length: 31 }, (_, index) => `${index + 1}`.padStart(2, '0'))

const openAdmin = () => {
  isAdminOpen.value = true
}

const closeAdmin = () => {
  isAdminOpen.value = false
}

const saveAdmin = async () => {
  if (userRole.value !== 'admin') {
    errorMessage.value = t('profile.adminOnly')
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  actionMessage.value = ''

  try {
    if (festivalForm.role === 'FESTIVAL') {
      await submitFestival({
        type: 'festival',
        title: festivalForm.name.trim(),
        date: {
          year: festivalForm.year,
          month: festivalForm.month,
          day: festivalForm.day,
        },
        location: festivalForm.location.trim(),
        country: festivalForm.country.trim(),
        ticketLink: festivalForm.ticketLink.trim(),
        infoLink: festivalForm.infoLink.trim(),
        lineup: festivalForm.lineup.trim(),
        imageName: festivalForm.imageName,
      })
    } else {
      await submitArtist({
        type: 'artist',
        name: festivalForm.artistName.trim(),
        born: {
          year: festivalForm.artistYear,
          month: festivalForm.artistMonth,
          day: festivalForm.artistDay,
        },
        city: festivalForm.artistCity.trim(),
        country: festivalForm.artistCountry.trim(),
        labels: festivalForm.artistLabels.trim(),
        genres: festivalForm.artistGenres.trim(),
        yearsActive: festivalForm.artistActiveYear.trim(),
        links: {
          about: festivalForm.aboutLink.trim(),
          instagram: festivalForm.instagramLink.trim(),
          youtube: festivalForm.youtubeLink.trim(),
          appleMusic: festivalForm.appleMusicLink.trim(),
          spotify: festivalForm.spotifyLink.trim(),
          soundcloud: festivalForm.soundcloudLink.trim(),
        },
        imageName: festivalForm.artistImageName,
      })
    }

    actionMessage.value = t('profile.submissionSaved')
    isAdminOpen.value = false
  } catch (error) {
    const message = error instanceof Error ? error.message : t('profile.saveFailed')
    errorMessage.value = message
  } finally {
    isSaving.value = false
  }
}

const loadProfile = async () => {
  isLoading.value = true
  errorMessage.value = ''
  actionMessage.value = ''

  try {
    const user = await getCurrentUser()
    if (!user) {
      router.replace('/login')
      return
    }
    userId.value = user.uid

    const stored = await getProfile(user.uid, user.email ?? '')
    const name = stored?.fullName ?? ''
    userRole.value = stored?.role === 'admin' ? 'admin' : 'user'
    if (!stored) {
      userRole.value = 'user'
    }
    Object.assign(profile, {
      name,
      email: stored?.email ?? user.email ?? '',
      phone: stored?.phone ?? '',
      dob: stored?.dob ?? '',
      city: stored?.city ?? '',
      country: stored?.country ?? '',
      password: '************',
    })
    Object.assign(draftProfile, profile)
  } catch (error) {
    if (error instanceof KeyStorageError) {
      errorMessage.value = t('profile.secureStorageUnavailable')
    } else {
      const message = error instanceof Error ? error.message : t('profile.loadFailed')
      errorMessage.value = message
    }
  } finally {
    isLoading.value = false
  }
}

const handleLogout = async () => {
  await signOutUser()
  router.replace('/login')
}

const handleDelete = async () => {
  if (!userId.value) return
  if (!window.confirm(t('profile.deleteConfirm'))) return

  isSaving.value = true
  errorMessage.value = ''
  actionMessage.value = ''

  try {
    await deleteProfile(userId.value)
    await deleteCurrentUser()
    await clearStoredKey(userId.value)
    router.replace('/')
  } catch (error) {
    const message = error instanceof Error ? error.message : t('profile.deleteFailed')
    errorMessage.value = message
  } finally {
    isSaving.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <section class="min-h-[100dvh] bg-[var(--bg)] text-[var(--text)] px-6 pt-3 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pc:pt-8">
    <div class="mx-auto flex w-full max-w-md flex-col gap-8">
      <header class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <div
            class="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--surface-alt)] text-[var(--muted)]"
          >
            <span class="material-symbols-rounded text-base">tune</span>
          </div>
          <div>
            <div class="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{{ t('profile.titleLabel') }}</div>
            <h1 class="mt-1 text-xl font-semibold">{{ t('profile.title') }}</h1>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <span class="text-xs font-semibold text-[var(--muted)]">{{ t('profile.roleLabel') }}</span>
          <button
            v-if="!isEditing"
            type="button"
            class="flex items-center gap-2 rounded-lg border border-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent)]"
            @click="startEdit"
          >
            <span class="material-symbols-rounded text-base">edit</span>
            {{ t('profile.edit') }}
          </button>
          <div v-else class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-[var(--stroke)] px-3 py-1.5 text-sm font-semibold text-[var(--muted)]"
              @click="cancelEdit"
            >
              {{ t('profile.cancel') }}
            </button>
            <button
              type="button"
              class="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
              @click="saveEdit"
              :disabled="isSaving"
            >
              {{ isSaving ? t('profile.saving') : t('profile.save') }}
            </button>
          </div>
        </div>
      </header>

      <p v-if="isLoading" class="text-sm text-[var(--muted)]">{{ t('profile.loading') }}</p>
      <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
        {{ errorMessage }}
      </p>
      <p v-if="actionMessage" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
        {{ actionMessage }}
      </p>

      <div class="rounded-2xl border border-[var(--stroke)] bg-[var(--surface-alt)]/70">
        <div class="flex items-start gap-3 border-b border-[var(--stroke)] px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">badge</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.name') }}</div>
            <div v-if="!isEditing" class="text-sm font-semibold">{{ profile.name }}</div>
            <input
              v-else
              v-model="draftProfile.name"
              type="text"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div class="flex items-start gap-3 border-b border-[var(--stroke)] px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">mail</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.email') }}</div>
            <div v-if="!isEditing" class="text-sm">{{ profile.email }}</div>
            <input
              v-else
              v-model="draftProfile.email"
              type="email"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div class="flex items-start gap-3 border-b border-[var(--stroke)] px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">lock</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.password') }}</div>
            <div v-if="!isEditing" class="text-sm">{{ maskedPassword }}</div>
            <input
              v-else
              v-model="draftProfile.password"
              type="password"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
              :placeholder="t('profile.passwordManaged')"
              disabled
            />
          </div>
        </div>
        <div class="flex items-start gap-3 border-b border-[var(--stroke)] px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">call</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">
              {{ t('profile.phone') }} <span class="text-[var(--muted)]">{{ t('profile.optionalTag') }}</span>
            </div>
            <div v-if="!isEditing" class="text-sm">{{ optionalValue(profile.phone) }}</div>
            <input
              v-else
              v-model="draftProfile.phone"
              type="tel"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
              :placeholder="t('profile.phonePlaceholder')"
            />
          </div>
        </div>
        <div class="flex items-start gap-3 border-b border-[var(--stroke)] px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">event</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">
              {{ t('profile.dob') }} <span class="text-[var(--muted)]">{{ t('profile.optionalTag') }}</span>
            </div>
            <div v-if="!isEditing" class="text-sm">{{ optionalValue(profile.dob) }}</div>
            <input
              v-else
              v-model="draftProfile.dob"
              type="date"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div class="flex items-start gap-3 border-b border-[var(--stroke)] px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">location_city</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">
              {{ t('profile.city') }} <span class="text-[var(--muted)]">{{ t('profile.optionalTag') }}</span>
            </div>
            <div v-if="!isEditing" class="text-sm">{{ optionalValue(profile.city) }}</div>
            <input
              v-else
              v-model="draftProfile.city"
              type="text"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
              :placeholder="t('profile.cityPlaceholder')"
            />
          </div>
        </div>
        <div class="flex items-start gap-3 px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">public</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.country') }}</div>
            <div v-if="!isEditing" class="text-sm">{{ profile.country }}</div>
            <input
              v-else
              v-model="draftProfile.country"
              type="text"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <button
          type="button"
          class="flex items-center gap-3 rounded-xl border border-[var(--stroke)] px-4 py-3 text-sm font-semibold"
          @click="openAdmin"
          v-if="userRole === 'admin'"
        >
          <span class="material-symbols-rounded text-lg">admin_panel_settings</span>
          {{ t('profile.adminPage') }}
        </button>
        <button
          type="button"
          class="flex items-center gap-3 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-500"
          @click="handleDelete"
          :disabled="isSaving"
        >
          <span class="material-symbols-rounded text-lg">delete</span>
          {{ t('profile.deleteAccount') }}
        </button>
        <button
          type="button"
          class="flex items-center gap-3 rounded-xl border border-[var(--stroke)] px-4 py-3 text-sm font-semibold text-[var(--accent)]"
          @click="handleLogout"
        >
          <span class="material-symbols-rounded text-lg">logout</span>
          {{ t('profile.logout') }}
        </button>
      </div>
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-6"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-6"
    >
      <div v-if="isAdminOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pb-12">
        <AdminModal
          :festival-form="festivalForm"
          :years="years"
          :months="months"
          :days="days"
          @close="closeAdmin"
          @save="saveAdmin"
        />
      </div>
    </transition>
  </section>
</template>
