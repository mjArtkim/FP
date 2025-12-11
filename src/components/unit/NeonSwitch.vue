<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: 'Label',
  },
})

const emit = defineEmits(['update:modelValue'])

const checked = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const toggle = () => {
  checked.value = !checked.value
}
</script>

<template>
  <label class="flex items-center gap-4 cursor-pointer select-none">
    <!-- 외곽 버튼 -->
    <button
      type="button"
      role="switch"
      :aria-checked="checked"
      @click="toggle"
      class="switch-btn relative inline-flex items-center justify-start p-[2px] rounded-full
            transition-all duration-300"
      :class="checked
        ? 'switch-btn--on shadow-[0_0_8px_rgba(246,25,121,0.3)]'
        : 'switch-btn--off shadow-[inset_0_0_6px_rgba(0,0,0,0.8)]'"
    >
      <!-- 🔥 보더 SVG -->
      <svg
        class="switch-border pointer-events-none absolute inset-0 w-full h-full"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <!-- ON: 핑크 그라데이션 -->
          <linearGradient id="switch-stroke-on" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFC6DF" />
            <stop offset="100%" stop-color="#F61979" />
          </linearGradient>

          <!-- OFF: 회색 그라데이션 -->
          <linearGradient id="switch-stroke-off" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f5f5f5" />
            <stop offset="50%" stop-color="#EEEEEE" />
            <stop offset="100%" stop-color="#CCCCCC" />
          </linearGradient>
        </defs>

        <!-- 🔘 OFF용 회색 보더 (항상 한 바퀴 그려진 상태) -->
        <rect
          class="border-off"
          x="1"
          y="1"
          width="98"
          height="36"
          rx="20"
          ry="20"
          stroke="url(#switch-stroke-off)"
        />

        <!-- 🔆 ON용 핑크 보더 (애니메이션으로 그려짐) -->
        <rect
          class="border-on"
          x="1"
          y="1"
          width="98"
          height="38"
          rx="20"
          ry="20"
          stroke="url(#switch-stroke-on)"
        />
      </svg>

      <!-- 트랙 -->
      <div
        class="relative flex items-center w-[78px] h-[32px] rounded-full transition-all duration-300"
        :class="checked
          ? 'bg-black shadow-[inset_0_0_6px_rgba(0,0,0,0.8),1px_1px_3px_rgba(255,255,255,0.2)]'
          : 'shadow-[1px_1px_3px_rgba(255,255,255,0.3),inset_2px_2px_3px_rgba(0,0,0,0.1)]'"
      >
        <!-- 노브 -->
        <span
          class="relative h-[28px] w-[28px] rounded-full transition-all duration-300 ease-out transform"
          :class="checked
            ? 'translate-x-[48px] border border-[#3f3f3f] bg-gradient-to-br from-[#777] via-[#222] to-[#000] '
            : 'translate-x-[2px] border border-white bg-gradient-to-br from-white  via-[#CCC] to-[#AAA]'"
        >
          <span
            class="absolute inset-[1px] rounded-full transition-all duration-300 ease-out transform"
            :class="checked
              ? 'bg-gradient-to-br from-[#777] via-[#222] to-[#000] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.4),2px_2px_3px_rgba(246,25,121,0.5)]'
              : 'bg-gradient-to-br from-[#fff] via-[#CCC] to-[#AAA] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.6),2px_2px_3px_rgba(0,0,0,0.3)]'"
          />
        </span>
      </div>
    </button>
  </label>
</template>

<style scoped>
.switch-btn {
  position: relative;
  overflow: visible;
}

/* SVG 공통 */
.switch-border rect {
  fill: none;
  stroke-width: 3;
}

/* OFF 보더: 항상 보이게 */
.border-off {
  opacity: 1;
  stroke-dasharray: none;
  stroke-dashoffset: 0;
  transition: opacity 0.4s ease;
}

/* ON 보더: 처음엔 숨겨진 상태 */
.border-on {
  opacity: 0;
  stroke-dasharray: 380; 
  stroke-dashoffset: 380;    
  transition:
    stroke-dashoffset 0.8s ease,
    opacity 0.4s ease;
}

/* ✅ ON일 때: 핑크 보더가 한 바퀴 그려지고, 회색은 사라짐 */
.switch-btn--on .border-on {
  stroke-dashoffset: 0;
  opacity: 1;
}

.switch-btn--on .border-off {
  opacity: 0;
}

/* 선택: OFF로 돌아갈 때 회색이 좀 더 빠르게 들어오게 */
.switch-btn--off .border-off {
  transition: opacity 0.3s ease;
}
</style>

