<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MonthNavigator from '@/components/part/MonthNavigator.vue'
import CalendarGrid from '@/components/part/CalendarGrid.vue'
import festivals from '@/testdata/festivals.json'
const allFestivalData = festivals as Record<string, EventItem[]>
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
  // JSON에서 해당 월 데이터 가져오기
  return allFestivalData[month] || []
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
      <div class="text-xs font-semibold">What Festival Here?</div>
      <div>
        <div class="w-full mx-auto p-4 space-y-4">
          <div class="flex items-center justify-between">
            <MonthNavigator v-model="currentMonth" class="w-8/10" />
            <div class="flex justify-end w-2/10 h-[32px] shadow-[0px_0px_3px_rgba(0,0,0,0.2)] p-[2px] rounded-[5px]">
              <button
                type="button"
                @click="viewMode = 'calendar'"
                class="material-symbols-rounded w-[32px] py-[4px] rounded-[5px] text-sm text-center"
                :class="viewMode === 'calendar' ? 'bg-neonpink text-white' : 'bg-white text-gray-600 border-gray-300'"
              >
                calendar_month
              </button>
              <button
                type="button"
                @click="viewMode = 'list'"
                class="material-symbols-rounded w-[32px] py-[4px] rounded-[5px] text-sm text-center"
                :class="viewMode === 'list' ? 'bg-neonpink text-white' : 'bg-white text-gray-600 border-gray-300'"
              >
                lists
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
            <div v-if="!currentList.length" class="text-sm text-gray-400 mt-4 text-center">
              <div>
                OOPS &#58;&#40;
                <br>No events this month.
              </div>
              <button></button>
            </div>
          </div>
          <div v-else>
            <CalendarGrid :month="currentMonth" :events="currentList" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
