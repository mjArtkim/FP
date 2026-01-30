<script setup lang="ts">
import { toRefs } from 'vue'
import { useI18n } from '@/i18n'

const props = defineProps<{
  festivalForm: Record<string, any>
  years: string[]
  months: string[]
  days: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

const { t } = useI18n()
const { festivalForm, years, months, days } = toRefs(props)

const handleImage = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  festivalForm.value.imageName = file?.name ?? ''
}

const handleArtistImage = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  festivalForm.value.artistImageName = file?.name ?? ''
}
</script>

<template>
  <div
    class="w-full max-w-[min(92vw,720px)] max-h-[85dvh] overflow-y-auto rounded-2xl bg-[var(--surface)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
  >
    <div class="flex items-center justify-between pb-4">
      <div class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.adminTitle') }}</div>
      <div class="text-lg font-semibold">{{ t('profile.adminSubtitle') }}</div>
    </div>

    <div class="space-y-4 text-sm">
      <div>
        <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.adminTypeLabel') }}</label>
        <select
          v-model="festivalForm.role"
          class="mt-2 w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-3 py-2 text-sm"
        >
          <option value="FESTIVAL">{{ t('profile.festivalOption') }}</option>
          <option value="ARTIST">{{ t('profile.artistOption') }}</option>
        </select>
      </div>

      <template v-if="festivalForm.role === 'FESTIVAL'">
        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.festivalName') }}</label>
          <input
            v-model="festivalForm.name"
            type="text"
            :placeholder="t('auth.signup.namePlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.date') }}</label>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <select
              v-model="festivalForm.year"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2 py-2 text-sm"
            >
              <option value="">{{ t('profile.yearSelect') }}</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
            <select
              v-model="festivalForm.month"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2 py-2 text-sm"
            >
              <option value="">{{ t('profile.monthSelect') }}</option>
              <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
            </select>
            <select
              v-model="festivalForm.day"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2 py-2 text-sm"
            >
              <option value="">{{ t('profile.daySelect') }}</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.location') }}</label>
          <input
            v-model="festivalForm.location"
            type="text"
            :placeholder="t('profile.locationPlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.country') }}</label>
          <input
            v-model="festivalForm.country"
            type="text"
            :placeholder="t('profile.countryPlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.ticketLink') }}</label>
          <input
            v-model="festivalForm.ticketLink"
            type="text"
            :placeholder="t('profile.linkPlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.infoLink') }}</label>
          <input
            v-model="festivalForm.infoLink"
            type="text"
            :placeholder="t('profile.linkPlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.lineup') }}</label>
          <input
            v-model="festivalForm.lineup"
            type="text"
            :placeholder="t('profile.lineupPlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.image') }}</label>
          <div class="mt-2 flex items-center gap-2 border-b border-[var(--stroke)] pb-2">
            <input
              type="file"
              class="hidden"
              id="festival-image"
              @change="handleImage"
            />
            <label for="festival-image" class="cursor-pointer text-[var(--muted)]">
              {{ festivalForm.imageName || t('profile.openFile') }}
            </label>
          </div>
        </div>
      </template>

      <template v-else>
        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.artistName') }}</label>
          <input
            v-model="festivalForm.artistName"
            type="text"
            :placeholder="t('auth.signup.namePlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.born') }}</label>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <select
              v-model="festivalForm.artistYear"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2 py-2 text-sm"
            >
              <option value="">{{ t('profile.yearSelect') }}</option>
              <option v-for="year in years" :key="`artist-${year}`" :value="year">{{ year }}</option>
            </select>
            <select
              v-model="festivalForm.artistMonth"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2 py-2 text-sm"
            >
              <option value="">{{ t('profile.monthSelect') }}</option>
              <option v-for="month in months" :key="`artist-${month}`" :value="month">{{ month }}</option>
            </select>
            <select
              v-model="festivalForm.artistDay"
              class="w-full rounded-md border border-[var(--stroke)] bg-[var(--surface)] px-2 py-2 text-sm"
            >
              <option value="">{{ t('profile.daySelect') }}</option>
              <option v-for="day in days" :key="`artist-${day}`" :value="day">{{ day }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.cityAdmin') }}</label>
          <input
            v-model="festivalForm.artistCity"
            type="text"
            :placeholder="t('profile.cityPlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.country') }}</label>
          <input
            v-model="festivalForm.artistCountry"
            type="text"
            :placeholder="t('profile.countryPlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.labels') }}</label>
          <input
            v-model="festivalForm.artistLabels"
            type="text"
            :placeholder="t('profile.labelsPlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.genres') }}</label>
          <select
            v-model="festivalForm.artistGenres"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          >
            <option value="">{{ t('profile.genresPlaceholder') }}</option>
            <option value="Electronic">{{ t('profile.genreOptions.electronic') }}</option>
            <option value="House">{{ t('profile.genreOptions.house') }}</option>
            <option value="Techno">{{ t('profile.genreOptions.techno') }}</option>
            <option value="Hip Hop">{{ t('profile.genreOptions.hipHop') }}</option>
            <option value="Pop">{{ t('profile.genreOptions.pop') }}</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.yearsActive') }}</label>
          <input
            v-model="festivalForm.artistActiveYear"
            type="text"
            :placeholder="t('profile.yearsActivePlaceholder')"
            class="mt-2 w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.aboutLink') }}</label>
          <div class="mt-2 space-y-2">
            <div class="flex items-center gap-3 border-b border-[var(--stroke)] pb-2">
              <span class="material-symbols-rounded text-sm text-[var(--muted)]">home</span>
              <input
                v-model="festivalForm.aboutLink"
                type="text"
                :placeholder="t('profile.linkPlaceholder')"
                class="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div class="flex items-center gap-3 border-b border-[var(--stroke)] pb-2">
              <span class="material-symbols-rounded text-sm text-[var(--muted)]">photo_camera</span>
              <input
                v-model="festivalForm.instagramLink"
                type="text"
                :placeholder="t('profile.linkPlaceholder')"
                class="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div class="flex items-center gap-3 border-b border-[var(--stroke)] pb-2">
              <span class="material-symbols-rounded text-sm text-[var(--muted)]">smart_display</span>
              <input
                v-model="festivalForm.youtubeLink"
                type="text"
                :placeholder="t('profile.linkPlaceholder')"
                class="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div class="flex items-center gap-3 border-b border-[var(--stroke)] pb-2">
              <span class="material-symbols-rounded text-sm text-[var(--muted)]">music_note</span>
              <input
                v-model="festivalForm.appleMusicLink"
                type="text"
                :placeholder="t('profile.linkPlaceholder')"
                class="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div class="flex items-center gap-3 border-b border-[var(--stroke)] pb-2">
              <span class="material-symbols-rounded text-sm text-[var(--muted)]">headphones</span>
              <input
                v-model="festivalForm.spotifyLink"
                type="text"
                :placeholder="t('profile.linkPlaceholder')"
                class="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div class="flex items-center gap-3 border-b border-[var(--stroke)] pb-2">
              <span class="material-symbols-rounded text-sm text-[var(--muted)]">graphic_eq</span>
              <input
                v-model="festivalForm.soundcloudLink"
                type="text"
                :placeholder="t('profile.linkPlaceholder')"
                class="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase text-[var(--muted)]">{{ t('profile.image') }}</label>
          <div class="mt-2 flex items-center gap-2 border-b border-[var(--stroke)] pb-2">
            <input
              type="file"
              class="hidden"
              id="artist-image"
              @change="handleArtistImage"
            />
            <label for="artist-image" class="cursor-pointer text-[var(--muted)]">
              {{ festivalForm.artistImageName || t('profile.openFile') }}
            </label>
          </div>
        </div>
      </template>
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <button
        type="button"
        class="rounded-lg border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
        @click="emit('close')"
      >
        {{ t('profile.close') }}
      </button>
      <button
        type="button"
        class="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
        @click="emit('save')"
      >
        {{ t('profile.saveButton') }}
      </button>
    </div>
  </div>
</template>
