<script setup lang="ts">
import { useI18n } from '@/i18n'

const { locale, setLocale } = useI18n()

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement | null
  if (!target) return
  setLocale(target.value)
}
</script>

<template>
  <label class="inline-flex items-center gap-2 text-xs font-semibold">
    <div class="text-[var(--muted)] material-symbols-rounded">language</div>
    <div class="relative">
      <select
        class="appearance-none rounded-full border border-[var(--stroke)] bg-[var(--surface)] px-3 py-1 pr-7 text-xs font-semibold text-[var(--text)] focus:outline-none focus:border-neonpink"
        :value="locale"
        @change="onChange"
      >
        <option value="en">EN</option>
        <option value="ko">KR</option>
      </select>
      <span class="material-symbols-rounded pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base text-[var(--muted)]">
        expand_more
      </span>
    </div>
  </label>
</template>
