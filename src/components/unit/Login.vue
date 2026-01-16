<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signIn } from '@/utils/auth'
import { useI18n } from '@/i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = t('auth.login.missingCredentials')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await signIn(email.value, password.value)
    const redirectTo = (route.query.redirect as string) || '/'
    router.replace(redirectTo)
  } catch (error) {
    const message = error instanceof Error ? error.message : t('auth.login.failed')
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
        <div class="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{{ t('common.brand') }}</div>
        <h1 class="text-2xl font-semibold">{{ t('auth.login.title') }}</h1>
        <p class="text-sm text-[var(--muted)]">{{ t('auth.login.subtitle') }}</p>
      </header>

      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.login.emailLabel') }}
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="rounded-lg border border-[var(--stroke)] bg-[var(--surface-alt)] px-3 py-2 text-sm"
            :placeholder="t('auth.login.emailPlaceholder')"
          />
        </label>

        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.login.passwordLabel') }}
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="rounded-lg border border-[var(--stroke)] bg-[var(--surface-alt)] px-3 py-2 text-sm"
            :placeholder="t('auth.login.passwordPlaceholder')"
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
          {{ isSubmitting ? t('auth.login.submitting') : t('auth.login.submit') }}
        </button>
      </form>
      <p class="text-sm text-[var(--muted)]">
        {{ t('auth.login.newHere') }}
        <router-link to="/signup" class="font-semibold text-[var(--accent)]">{{ t('auth.login.createAccount') }}</router-link>
      </p>
      <p class="text-sm text-[var(--muted)]">
        <router-link to="/forgot-password" class="font-semibold text-[var(--accent)]">
          {{ t('auth.reset.link') }}
        </router-link>
      </p>
    </div>
  </section>
</template>
