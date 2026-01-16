<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signIn } from '@/utils/auth'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Email and password are required.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await signIn(email.value, password.value)
    const redirectTo = (route.query.redirect as string) || '/'
    router.replace(redirectTo)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed.'
    errorMessage.value = message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="min-h-screen bg-[var(--surface)] text-[var(--text)] px-6 py-10">
    <div class="mx-auto flex w-full max-w-md flex-col gap-8">
      <header class="flex flex-col gap-2">
        <div class="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Festival Pulse</div>
        <h1 class="text-2xl font-semibold">Log in</h1>
        <p class="text-sm text-[var(--muted)]">Sign in to access your personalized festival page.</p>
      </header>

      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-2 text-sm font-semibold">
          Email
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="rounded-lg border border-[var(--stroke)] bg-[var(--surface-alt)] px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          Password
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="rounded-lg border border-[var(--stroke)] bg-[var(--surface-alt)] px-3 py-2 text-sm"
            placeholder="Enter your password"
          />
        </label>

        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Signing in...' : 'Log in' }}
        </button>
      </form>
      <p class="text-sm text-[var(--muted)]">
        New here?
        <router-link to="/signup" class="font-semibold text-[var(--accent)]">Create account</router-link>
      </p>
    </div>
  </section>
</template>
