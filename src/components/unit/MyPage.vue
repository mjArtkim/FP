<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteCurrentUser, getCurrentUser, signOutUser, updateCurrentEmail } from '@/utils/auth'
import { deleteProfile, getProfile, updateProfile } from '@/utils/profile'
import { clearStoredKey } from '@/utils/crypto'

const isEditing = ref(false)
const isAdminOpen = ref(false)
const isSaving = ref(false)
const isLoading = ref(true)
const errorMessage = ref('')
const actionMessage = ref('')
const userId = ref('')
const userRole = ref<'guest' | 'user' | 'admin'>('guest')
const router = useRouter()

const profile = reactive({
  name: '',
  email: '',
  password: '************',
  phone: '',
  dob: '',
  country: '',
})

const draftProfile = reactive({ ...profile })

const maskedPassword = computed(() => {
  const length = Math.max(10, profile.password.length)
  return '*'.repeat(length)
})

const optionalValue = (value: string) => (value.trim() ? value : 'Optional')

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
      country: draftProfile.country.trim(),
    })
    Object.assign(profile, draftProfile)
    profile.password = '************'
    isEditing.value = false
    actionMessage.value = 'Profile updated.'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed.'
    errorMessage.value = message
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
})

const years = Array.from({ length: 8 }, (_, index) => `${2024 + index}`)
const months = Array.from({ length: 12 }, (_, index) => `${index + 1}`.padStart(2, '0'))
const days = Array.from({ length: 31 }, (_, index) => `${index + 1}`.padStart(2, '0'))

const handleImage = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  festivalForm.imageName = file?.name ?? ''
}

const openAdmin = () => {
  isAdminOpen.value = true
}

const closeAdmin = () => {
  isAdminOpen.value = false
}

const saveAdmin = () => {
  isAdminOpen.value = false
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
      country: stored?.country ?? '',
      password: '************',
    })
    Object.assign(draftProfile, profile)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load profile.'
    errorMessage.value = message
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
  if (!window.confirm('Delete your account and all data?')) return

  isSaving.value = true
  errorMessage.value = ''
  actionMessage.value = ''

  try {
    await deleteProfile(userId.value)
    await deleteCurrentUser()
    clearStoredKey(userId.value)
    router.replace('/')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed.'
    errorMessage.value = message
  } finally {
    isSaving.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <section class="min-h-screen bg-[var(--surface)] text-[var(--text)] px-6 py-8">
    <div class="mx-auto flex w-full max-w-md flex-col gap-8">
      <header class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <div
            class="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--surface-alt)] text-[var(--muted)]"
          >
            <span class="material-symbols-rounded text-base">tune</span>
          </div>
          <div>
            <div class="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">User</div>
            <h1 class="mt-1 text-xl font-semibold">User Configuration</h1>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <span class="text-xs font-semibold text-[var(--muted)]">USER</span>
          <button
            v-if="!isEditing"
            type="button"
            class="flex items-center gap-2 rounded-lg border border-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent)]"
            @click="startEdit"
          >
            <span class="material-symbols-rounded text-base">edit</span>
            Edit
          </button>
          <div v-else class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-[var(--stroke)] px-3 py-1.5 text-sm font-semibold text-[var(--muted)]"
              @click="cancelEdit"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
              @click="saveEdit"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </header>

      <p v-if="isLoading" class="text-sm text-[var(--muted)]">Loading profile...</p>
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
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">Name</div>
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
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">Email Address</div>
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
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">Password</div>
            <div v-if="!isEditing" class="text-sm">{{ maskedPassword }}</div>
            <input
              v-else
              v-model="draftProfile.password"
              type="password"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
              placeholder="Managed by Firebase"
              disabled
            />
          </div>
        </div>
        <div class="flex items-start gap-3 border-b border-[var(--stroke)] px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">call</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">
              Phone Number <span class="text-[var(--muted)]">(optional)</span>
            </div>
            <div v-if="!isEditing" class="text-sm">{{ optionalValue(profile.phone) }}</div>
            <input
              v-else
              v-model="draftProfile.phone"
              type="tel"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
        </div>
        <div class="flex items-start gap-3 border-b border-[var(--stroke)] px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">event</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">
              Date of Birth <span class="text-[var(--muted)]">(optional)</span>
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
        <div class="flex items-start gap-3 px-4 py-4">
          <span class="material-symbols-rounded text-lg text-[var(--muted)]">public</span>
          <div class="flex w-full flex-col gap-1">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">Country / Region</div>
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
          Admin Page
        </button>
        <button
          type="button"
          class="flex items-center gap-3 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-500"
          @click="handleDelete"
          :disabled="isSaving"
        >
          <span class="material-symbols-rounded text-lg">delete</span>
          Delete Account
        </button>
        <button
          type="button"
          class="flex items-center gap-3 rounded-xl border border-[var(--stroke)] px-4 py-3 text-sm font-semibold text-[var(--accent)]"
          @click="handleLogout"
        >
          <span class="material-symbols-rounded text-lg">logout</span>
          LogOut
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
      <div v-if="isAdminOpen" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-6">
        <div class="w-full max-w-md rounded-2xl bg-[var(--surface)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
          <div class="flex items-center justify-between pb-4">
            <div class="text-xs font-semibold uppercase text-[var(--muted)]">Admin</div>
            <div class="text-lg font-semibold">Artist or Festival</div>
          </div>

          <div class="space-y-4 text-sm">
            <div>
              <label class="text-xs font-semibold uppercase text-[var(--muted)]">Festival</label>
              <select
                v-model="festivalForm.role"
                class="mt-2 w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
              >
                <option value="FESTIVAL">FESTIVAL</option>
                <option value="ARTIST">ARTIST</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold uppercase text-[var(--muted)]">Festival Name</label>
              <input
                v-model="festivalForm.name"
                type="text"
                placeholder="e.g. Hong Gill Dong"
                class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-semibold uppercase text-[var(--muted)]">Date</label>
              <div class="mt-2 grid grid-cols-3 gap-2">
                <select
                  v-model="festivalForm.year"
                  class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2 py-2 text-sm"
                >
                  <option value="">Select Year</option>
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
                <select
                  v-model="festivalForm.month"
                  class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2 py-2 text-sm"
                >
                  <option value="">Select Month</option>
                  <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
                </select>
                <select
                  v-model="festivalForm.day"
                  class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2 py-2 text-sm"
                >
                  <option value="">Select Day</option>
                  <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold uppercase text-[var(--muted)]">Location</label>
              <input
                v-model="festivalForm.location"
                type="text"
                placeholder="City Here"
                class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-semibold uppercase text-[var(--muted)]">Country</label>
              <input
                v-model="festivalForm.country"
                type="text"
                placeholder="Select your country"
                class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-semibold uppercase text-[var(--muted)]">Ticket Link</label>
              <input
                v-model="festivalForm.ticketLink"
                type="text"
                placeholder="LINK HERE"
                class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-semibold uppercase text-[var(--muted)]">Info Link</label>
              <input
                v-model="festivalForm.infoLink"
                type="text"
                placeholder="LINK HERE"
                class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-semibold uppercase text-[var(--muted)]">Line Up</label>
              <input
                v-model="festivalForm.lineup"
                type="text"
                placeholder="ARTIST HERE"
                class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label class="text-xs font-semibold uppercase text-[var(--muted)]">Image</label>
              <div class="mt-2 flex items-center gap-2 border-b border-[var(--stroke)] pb-2">
                <input
                  type="file"
                  class="hidden"
                  id="festival-image"
                  @change="handleImage"
                />
                <label for="festival-image" class="cursor-pointer text-[var(--muted)]">
                  {{ festivalForm.imageName || 'Open File' }}
                </label>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
              @click="closeAdmin"
            >
              Close
            </button>
            <button
              type="button"
              class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
              @click="saveAdmin"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>
