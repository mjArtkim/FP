<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp } from '@/utils/auth'
import { createProfile } from '@/utils/profile'
import { useI18n } from '@/i18n'

const router = useRouter()
const { t } = useI18n()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const phone = ref('')
const birthYear = ref('')
const birthMonth = ref('')
const birthDay = ref('')
const city = ref('')
const country = ref('')
const agreed = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const years = Array.from({ length: 60 }, (_, index) => `${1965 + index}`)
const months = Array.from({ length: 12 }, (_, index) => `${index + 1}`.padStart(2, '0'))
const days = Array.from({ length: 31 }, (_, index) => `${index + 1}`.padStart(2, '0'))

const isFormInvalid = computed(
  () =>
    !fullName.value.trim() ||
    !email.value.trim() ||
    !password.value ||
    !confirmPassword.value ||
    !agreed.value
)

const formatDob = () => {
  if (!birthYear.value || !birthMonth.value || !birthDay.value) return ''
  return `${birthYear.value}-${birthMonth.value}-${birthDay.value}`
}

const handleSubmit = async () => {
  if (!fullName.value.trim()) {
    errorMessage.value = t('auth.signup.errors.nameRequired')
    return
  }

  if (!email.value || !password.value) {
    errorMessage.value = t('auth.signup.errors.missingCredentials')
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = t('auth.signup.errors.passwordLength')
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = t('auth.signup.errors.passwordMismatch')
    return
  }

  if (!agreed.value) {
    errorMessage.value = t('auth.signup.errors.termsRequired')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const user = await signUp(email.value, password.value)
    await createProfile(user.uid, {
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      dob: formatDob(),
      city: city.value.trim(),
      country: country.value.trim(),
    })
    router.replace('/mypage')
  } catch (error) {
    const message = error instanceof Error ? error.message : t('auth.signup.errors.failed')
    errorMessage.value = message
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/login')
}
</script>

<template>
  <section class="min-h-screen bg-[var(--surface)] text-[var(--text)] px-6 py-10">
    <div class="mx-auto flex w-full max-w-md flex-col gap-8">
      <header class="flex items-start justify-between">
        <div class="flex flex-col gap-2">
          <div class="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{{ t('common.brand') }}</div>
          <h1 class="text-2xl font-semibold">{{ t('auth.signup.title') }}</h1>
        </div>
        <div class="text-xs font-semibold text-[var(--muted)]">{{ t('auth.signup.guestLabel') }}</div>
      </header>

      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.signup.nameLabel') }}
          <input
            v-model="fullName"
            type="text"
            autocomplete="name"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            :placeholder="t('auth.signup.namePlaceholder')"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.signup.emailLabel') }}
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            :placeholder="t('auth.signup.emailPlaceholder')"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.signup.passwordLabel') }}
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            :placeholder="t('auth.signup.passwordPlaceholder')"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.signup.confirmPasswordLabel') }}
          <input
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            :placeholder="t('auth.signup.confirmPasswordPlaceholder')"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.signup.phoneLabel') }} <span class="text-[var(--muted)]">{{ t('auth.signup.optional') }}</span>
          <input
            v-model="phone"
            type="tel"
            autocomplete="tel"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            :placeholder="t('auth.signup.phonePlaceholder')"
          />
        </label>

        <div class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.signup.dobLabel') }} <span class="text-[var(--muted)]">{{ t('auth.signup.optional') }}</span>
          <div class="grid grid-cols-3 gap-2">
            <select
              v-model="birthYear"
              class="w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            >
              <option value="">{{ t('auth.signup.year') }}</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
            <select
              v-model="birthMonth"
              class="w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            >
              <option value="">{{ t('auth.signup.month') }}</option>
              <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
            </select>
            <select
              v-model="birthDay"
              class="w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            >
              <option value="">{{ t('auth.signup.day') }}</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>
        </div>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.signup.cityLabel') }} <span class="text-[var(--muted)]">{{ t('auth.signup.optional') }}</span>
          <input
            v-model="city"
            type="text"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            :placeholder="t('auth.signup.cityPlaceholder')"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.signup.countryLabel') }}
          <select
            v-model="country"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          >
            <option value="">{{ t('auth.signup.countryPlaceholder') }}</option>
            <option value="South Korea">{{ t('auth.signup.countries.southKorea') }}</option>
            <option value="Japan">{{ t('auth.signup.countries.japan') }}</option>
            <option value="United States">{{ t('auth.signup.countries.unitedStates') }}</option>
            <option value="United Kingdom">{{ t('auth.signup.countries.unitedKingdom') }}</option>
            <option value="Germany">{{ t('auth.signup.countries.germany') }}</option>
          </select>
        </label>

        <label class="flex items-start gap-3 text-xs text-[var(--muted)]">
          <input v-model="agreed" type="checkbox" class="mt-0.5 h-4 w-4" />
          <span>{{ t('auth.signup.terms') }}</span>
        </label>

        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
            @click="handleCancel"
          >
            {{ t('auth.signup.cancel') }}
          </button>
          <button
            type="submit"
            class="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="isSubmitting || isFormInvalid"
          >
            {{ isSubmitting ? t('auth.signup.submitting') : t('auth.signup.submit') }}
          </button>
        </div>
      </form>

      <p class="text-sm text-[var(--muted)]">
        {{ t('auth.signup.alreadyHaveAccount') }}
        <router-link to="/login" class="font-semibold text-[var(--accent)]">{{ t('auth.signup.signIn') }}</router-link>
      </p>
    </div>
  </section>
</template>
