<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MonthNavigator from '@/components/part/MonthNavigator.vue'
import CalendarGrid from '@/components/part/CalendarGrid.vue'
import festivals from '@/testdata/festivals.json'


type EventItem = {
  id: number
  title: string
  start: string 
  end: string  
  image: string
  city: string
  contry: string
  lineup: string
}
const shortText = (text: string, limit = 12) => {
  return text.length > limit ? text.slice(0, limit) + '...' : text
}
const lineText = (text: string, limit = 25) => {
  return text.length > limit ? text.slice(0, limit) + '...' : text
}
const formatMD = (dateStr: string) => {
  return dateStr.slice(5)
}
const allFestivalData = festivals as Record<string, EventItem[]>
const viewMode = ref<'list' | 'calendar'>('calendar') 

const now = new Date()
const todayMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const currentMonth = ref(todayMonthKey)
const monthData = ref<Record<string, EventItem[]>>({})

const isLoading = ref(false)
const errorMessage = ref('')

const currentList = computed<EventItem[]>(() => {
  return monthData.value[currentMonth.value] || []
})
const loadMonthEventsFromDB = async (month: string): Promise<EventItem[]> => {
  return allFestivalData[month] || []
}
const todayList = computed<EventItem[]>(() => {
  return monthData.value[todayMonthKey] || allFestivalData[todayMonthKey] || []
})
const todayEvents = computed<EventItem[]>(() => {
  const today = now.toISOString().slice(0, 10)
  return todayList.value.filter(
    (event) => event.start <= today && today <= event.end
  )
})
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
  <div class="pc:grid pc:p-8 pc:grid-cols-[40%_60%] pc:h-screen pc:overflow-hidden">
    <div class="px-5 w-full overflow-hidden pc:px-0">
      <div class="text-xs font-bold py-2
      pc:text-base
      ">Today Festival</div>
      <ul v-if="todayEvents.length" class="flex flex-nowrap gap-6 overflow-auto w-screen pl-1 py-3 pr-10
      pc:flex-col pc:w-full pc:gap-5 pc:h-[90vh] pc:overflow-auto">
        <li
          v-for="item in todayEvents"
          :key="item.id"
          class="w-[130px] h-[130px] flex-shrink-0 p-[10px] rounded-lg bg-white shadow-[1px_1px_6px_rgba(0,0,0,0.2)] flex flex-col content-center 
          pc:w-full pc:flex-row pc:shadow-none pc:h-[220px] pc:border-b pc:rounded-none pc:bg-transparent pc:px-0 pc:pt-0 pc:pb-[20px]"
        >
          <router-link :to="{ name: 'festivaldetail', params: { id: item.id } }" class="pc:flex">
            <img
              :src="item.image"
              alt="festival"
              class="w-full h-[60px] object-cover rounded-[10px] pc:w-[150px] pc:h-full"
            />
            <div class="pc:pl-5">
              <div class="flex flex-col pc:hidden">
                <div class="text-xs font-black py-[10px]">
                  {{ shortText(item.title) }}
                </div>
                <div class="text-xs truncate">
                  {{ shortText(item.city + ' / ' + item.contry) }}
                </div>
              </div>
              <div class="hidden pc:flex pc:flex-col pc:shrink-0 pc:justify-between pc:h-[90%]">
                <div class="text-xl font-black py-[10px]">
                  {{ item.title }}
                </div>
                <div class="text-base truncate">
                    {{ formatMD(item.start) }} ~ {{ formatMD(item.end) }}
                </div>
                <div class="text-base truncate">
                  {{ item.city + ' / ' + item.contry }}
                </div>
                <div class="text-base truncate">
                  {{ lineText(item.lineup) }}
                </div>
              </div>
            </div>
          </router-link>
        </li>
      </ul>
      <div v-else class="text-base text-gray-400 text-center py-8 border-b">Let’s focus on work today 💪</div>
    </div>
    <div class="px-5">
      <div class="text-xs font-bold pt-5 pb-2 pc:text-base">What Festival Here?</div>
      <div>
        <div class="w-full mx-auto py-4 space-y-4 mb-[100px] pc:h-[90vh] pc:overflow-auto pc:max-w-[700px] pc:mx-2">
          <div class="flex items-center justify-between">
            <MonthNavigator v-model="currentMonth" class="w-8/10" />
            <div class="flex justify-end w-2/10 h-[32px] shadow-[0_0_3px_var(--shadow-weak)] p-[2px] rounded-[5px] pc:mr-2">
              <div id="viewToggle" class="relative w-[64px] h-full">
                <input
                  type="checkbox"
                  class="chlist absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                  :checked="viewMode === 'list'"
                  @change="viewMode = $event.target.checked ? 'list' : 'calendar'"
                />
                <div class="absolute inset-0 z-10 flex justify-between items-center ">
                  <div class="material-symbols-rounded w-[32px] py-[4px] rounded-[5px] text-sm text-center"
                    :class="viewMode === 'calendar' ? 'text-transparent' : 'text-[var(--text)]'">
                    calendar_month
                  </div>
                  <div class="material-symbols-rounded w-[32px] py-[4px] rounded-[5px] text-sm text-center"
                    :class="viewMode === 'list' ? 'text-transparent' : 'text-[var(--text)]'">
                    lists
                  </div>
                </div>
                <div
                  class="cltogl absolute top-[0px] left-[0px] w-[32px] h-[28px] rounded-[4px] flex items-center justify-center bg-[#F61979]  transition-all duration-300 ease-out z-20"
                  :class="viewMode === 'calendar'
                    ? 'text-white left-[0px]'
                    : 'text-white left-[32px]'"
                >
                  <div class="material-symbols-rounded w-[32px] py-[4px] rounded-[5px] text-sm text-center">
                    {{ viewMode === 'calendar' ? 'calendar_month' : 'lists' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isLoading" class="text-center text-sm text-gray-500 mb-2">
            Loading...
          </div>
          <div v-if="errorMessage" class="text-center text-sm text-red-500 mb-2">
            {{ errorMessage }}
          </div>
          <div v-if="viewMode === 'list'">
            <ul class="space-y-7">
              <li
                v-for="item in currentList"
                :key="item.id"
                class="p-[10px] rounded-lg bg-white border grid grid-cols-[30%_50%_20%] shadow-[1px_1px_6px_rgba(0,0,0,0.2)] pc:max-w-[98%]"
              >
                <img
                  :src="item.image"
                  alt="festival"
                  class="w-[100px] object-cover rounded-[10px] shadow-[2px_2px_3px_rgba(0,0,0,0.2)] pc:w-[150px] pc:h-[80px]"
                />
                <div class="flex flex-col justify-between px-2">
                  <div class="text-sm font-semibold ">
                    {{ item.title }}
                  </div>
                  <div class="text-xs">
                    {{ formatMD(item.start) }} ~ {{ formatMD(item.end) }}
                  </div>
                  <div class="text-xs">
                    {{ item.city }} / {{ item.contry }}
                  </div>
                </div>
                <button class="p-[8px] text-sm text-pulseblue  text-center border border-pulseblue rounded-md self-center justify-self-center">Detail</button>
              </li>
            </ul>
            <div v-if="!currentList.length" class="h-[450px] flex flex-col content-center justify-center items-center">
              <div class="text-3xl text-gray-400 my-4 text-center">
                OOPS &#58;&#40;
                <br>No events this month.
              </div>
              <button class="w-3/5 text-xl text-blue-200 mt-4 text-center border border-blue-200 rounded-md py-1 shadow-[0_0_3px_rgba(0,0,0,0.1)]">View other days 👀</button>
            </div>
          </div>
          <div v-else>
            <CalendarGrid :month="currentMonth" :events="currentList"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
