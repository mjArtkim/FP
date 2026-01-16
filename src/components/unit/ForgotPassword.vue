<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendResetEmail } from '@/utils/auth'
import { useI18n } from '@/i18n'

const router = useRouter()
const { t } = useI18n()

const email = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleSubmit = async () => {
  if (!email.value) {
    errorMessage.value = t('auth.reset.missingEmail')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await sendResetEmail(email.value)
    successMessage.value = t('auth.reset.sent')
  } catch (error) {
    const message = error instanceof Error ? error.message : t('auth.reset.failed')
    errorMessage.value = message
  } finally {
    isSubmitting.value = false
  }
}

const handleBack = () => {
  router.push('/login')
}
</script>

<template>
  <section class="min-h-screen bg-[var(--surface)] text-[var(--text)] px-6 py-10">
    <div class="mx-auto flex w-full max-w-md flex-col gap-8">
      <header class="flex flex-col gap-2">
        <div class="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{{ t('common.brand') }}</div>
        <h1 class="text-2xl font-semibold">{{ t('auth.reset.title') }}</h1>
        <p class="text-sm text-[var(--muted)]">{{ t('auth.reset.subtitle') }}</p>
      </header>

      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-2 text-sm font-semibold">
          {{ t('auth.reset.emailLabel') }}
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="rounded-lg border border-[var(--stroke)] bg-[var(--surface-alt)] px-3 py-2 text-sm"
            :placeholder="t('auth.reset.emailPlaceholder')"
          />
        </label>

        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ errorMessage }}
        </p>
        <p
          v-if="successMessage"
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600"
        >
          {{ successMessage }}
        </p>

        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
            @click="handleBack"
          >
            {{ t('auth.reset.back') }}
          </button>
          <button
            type="submit"
            class="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? t('auth.reset.sending') : t('auth.reset.send') }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
