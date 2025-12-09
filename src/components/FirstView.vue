<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MonthNavigator from '@/components/parttwo/MonthNavigator.vue'
import CalendarGrid from '@/components/parttwo/CalendarGrid.vue'
const viewMode = ref<'list' | 'calendar'>('calendar') 
type EventItem = {
  id: number
  title: string
  start: string // "YYYY-MM-DD"
  end: string   // "YYYY-MM-DD"
}

const now = new Date()
const currentMonth = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
)
const monthData = ref<Record<string, EventItem[]>>({})

const isLoading = ref(false)
const errorMessage = ref('')

const currentList = computed<EventItem[]>(() => {
  return monthData.value[currentMonth.value] || []
})
const loadMonthEventsFromDB = async (month: string): Promise<EventItem[]> => {
  // 여기서 실제 API/Firebase/SQL 호출하면 됨
  // 예: const res = await fetch(`/api/events?month=${month}`)
  //     return await res.json()

  // 더미 데이터
  // month에 따라 다르게 주고 싶으면 조건 분기하면 됨
  if (month === '2025-12') {
    return [
      {     id: 1,
    title: 'Festival Name',
    start: '2025-12-03',
    end: '2025-12-22'},
      {     id: 2,
    title: '다른 페스티벌',
    start: '2025-12-15',
    end: '2025-12-16'},
      {     id: 3,
    title: '다른 페스티벌',
    start: '2025-12-22',
    end: '2025-12-22' },
          {     id: 3,
    title: '다른 페스티벌',
    start: '2025-12-22',
    end: '2025-12-22' },
          {     id: 3,
    title: '다른 페스티벌',
    start: '2025-12-22',
    end: '2025-12-22' },
          {     id: 3,
    title: '다른 페스티벌',
    start: '2025-12-22',
    end: '2025-12-22' },
          {     id: 3,
    title: '다른 페스티벌',
    start: '2025-12-22',
    end: '2025-12-22' },
    ]
  }
  if (month === '2025-11') {
    return [
      {     id: 1,
    title: 'Festival Name',
    start: '2025-11-03',
    end: '2025-11-12'},
      {     id: 1,
    title: '다른 페스티벌',
    start: '2025-11-15',
    end: '2025-11-16'},
    ]
  }
  return []
}

watch(
  currentMonth,
  async (newMonth) => {
    errorMessage.value = ''
    if (monthData.value[newMonth]) return

    try {
      isLoading.value = true
      const events = await loadMonthEventsFromDB(newMonth)
      monthData.value[newMonth] = events
    } catch (e) {
      console.error(e)
      errorMessage.value = '데이터를 불러오는 중 오류가 발생했습니다.'
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <div>
      <div>Today Festival</div>
      <ul></ul>
    </div>
    <div>
      <div>What Festival Here?</div>
      <div>

        <div class="max-w-xl mx-auto p-4 space-y-4">
          <div>
            <MonthNavigator v-model="currentMonth" />
            <div class="flex justify-end mb-3 gap-2">
              <button
                type="button"
                @click="viewMode = 'list'"
                class="px-3 py-1 rounded-full text-sm border"
                :class="viewMode === 'list' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300'"
              >
                리스트형
              </button>
              <button
                type="button"
                @click="viewMode = 'calendar'"
                class="px-3 py-1 rounded-full text-sm border"
                :class="viewMode === 'calendar' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300'"
              >
                달력형
              </button>
            </div>
          </div>
          <div v-if="isLoading" class="text-center text-sm text-gray-500 mb-2">
            Loading...
          </div>
          <div v-if="errorMessage" class="text-center text-sm text-red-500 mb-2">
            {{ errorMessage }}
          </div>
          <div v-if="viewMode === 'list'">
            <ul class="space-y-2">
              <li
                v-for="item in currentList"
                :key="item.id"
                class="p-3 rounded-lg bg-white border flex items-center justify-between"
              >
                <div>
                  <div class="text-sm font-semibold">
                    {{ item.title }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ item.start }} ~ {{ item.end }}
                  </div>
                </div>
              </li>
            </ul>
            <p v-if="!currentList.length" class="text-sm text-gray-400 mt-4 text-center">
              이 달에는 등록된 일정이 없어요.
            </p>
          </div>
          <div v-else>
            <CalendarGrid :month="currentMonth" :events="currentList" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
