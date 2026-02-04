<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<template>
  <section class="min-h-screen bg-[var(--surface)] text-[var(--text)] px-6 py-10">
    <div class="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <div class="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{{ t('notFound.code') }}</div>
      <h1 class="text-3xl font-semibold">{{ t('notFound.title') }}</h1>
      <p class="text-sm text-[var(--muted)]">{{ t('notFound.subtitle') }}</p>
      <router-link
        to="/"
        class="rounded-full bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
      >
        {{ t('notFound.goHome') }}
      </router-link>
    </div>
  </section>
</template>
