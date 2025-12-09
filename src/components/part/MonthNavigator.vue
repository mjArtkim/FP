<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string // "YYYY-MM"
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// year / month 분해
const year = computed(() => Number(props.modelValue.split('-')[0]))
const month = computed(() => Number(props.modelValue.split('-')[1]))

// 화면에 보여줄 라벨 (ex: 2025.12)
const label = computed(() => {
  return `${year.value}.${String(month.value).padStart(2, '0')}`
})

const changeMonth = (delta: number) => {
  let y = year.value
  let m = month.value + delta

  if (m <= 0) {
    m = 12
    y -= 1
  } else if (m > 12) {
    m = 1
    y += 1
  }

  const newValue = `${y}-${String(m).padStart(2, '0')}`
  emit('update:modelValue', newValue)
}
</script>

<template>
  <div class="flex items-center font-gugi">
    <button @click="changeMonth(-1)" class="material-symbols-rounded text-3xl">keyboard_arrow_left</button>
    <div class="text-xl font-semibold px-2">
      {{ label }}
    </div>
    <button @click="changeMonth(1)" class="material-symbols-rounded text-3xl">keyboard_arrow_right</button>
  </div>
</template>