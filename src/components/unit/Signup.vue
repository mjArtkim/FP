<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp } from '@/utils/auth'
import { createProfile } from '@/utils/profile'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const phone = ref('')
const birthYear = ref('')
const birthMonth = ref('')
const birthDay = ref('')
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
    errorMessage.value = 'Full name is required.'
    return
  }

  if (!email.value || !password.value) {
    errorMessage.value = 'Email and password are required.'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (!agreed.value) {
    errorMessage.value = 'Please agree to the terms to continue.'
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
      country: country.value.trim(),
    })
    router.replace('/mypage')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign up failed.'
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
          <div class="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Festival Pulse</div>
          <h1 class="text-2xl font-semibold">Create an Account</h1>
        </div>
        <div class="text-xs font-semibold text-[var(--muted)]">Guest</div>
      </header>

      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-2 text-sm font-semibold">
          Full name
          <input
            v-model="fullName"
            type="text"
            autocomplete="name"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            placeholder="e.g. Hong Gill Dong"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          Email Address
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            placeholder="e.g. you@example.com"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          Password
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            placeholder="Minimum 8 characters"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          Confirm Password
          <input
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            placeholder="Re-enter your password"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          Phone Number <span class="text-[var(--muted)]">(optional)</span>
          <input
            v-model="phone"
            type="tel"
            autocomplete="tel"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            placeholder="e.g. +82 000 000 000"
          />
        </label>

        <div class="flex flex-col gap-2 text-sm font-semibold">
          Date of Birth <span class="text-[var(--muted)]">(optional)</span>
          <div class="grid grid-cols-3 gap-2">
            <select
              v-model="birthYear"
              class="w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            >
              <option value="">Year</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
            <select
              v-model="birthMonth"
              class="w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            >
              <option value="">Month</option>
              <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
            </select>
            <select
              v-model="birthDay"
              class="w-full border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
            >
              <option value="">Day</option>
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>
        </div>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          Country / Region
          <select
            v-model="country"
            class="border-b border-[var(--stroke)] bg-transparent px-1 py-2 text-sm focus:outline-none"
          >
            <option value="">Select your country</option>
            <option value="South Korea">South Korea</option>
            <option value="Japan">Japan</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
          </select>
        </label>

        <label class="flex items-start gap-3 text-xs text-[var(--muted)]">
          <input v-model="agreed" type="checkbox" class="mt-0.5 h-4 w-4" />
          <span>I agree to the Terms of Service and Privacy Policy.</span>
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
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="isSubmitting || isFormInvalid"
          >
            {{ isSubmitting ? 'Creating...' : 'Sign Up' }}
          </button>
        </div>
      </form>

      <p class="text-sm text-[var(--muted)]">
        Already have an account?
        <router-link to="/login" class="font-semibold text-[var(--accent)]">Sign in</router-link>
      </p>
    </div>
  </section>
</template>
