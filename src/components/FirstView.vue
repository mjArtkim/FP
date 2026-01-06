<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import MonthNavigator from '@/components/part/MonthNavigator.vue'
import CalendarGrid from '@/components/part/CalendarGrid.vue'
import festivals from '@/data/festivals.json'
import { useI18n } from '@/i18n'


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
const lineText = (text: string, limit = 30) => {
  return text.length > limit ? text.slice(0, limit) + '...' : text
}
const formatMD = (dateStr: string) => {
  return dateStr.slice(5)
}
const allFestivalData = festivals as Record<string, EventItem[]>
const viewMode = ref<'list' | 'calendar'>('calendar') 
const { t } = useI18n()

const showMonthPicker = ref(false)
const monthChoice = ref('')
const availableMonths = computed(() => {
  return Object.keys(allFestivalData)
    .filter((m) => m >= todayMonthKey)
    .sort()
})
const isDropdownOpen = ref(false)
const pickerRef = ref<HTMLElement | null>(null)
const activeIndex = ref(0)

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

const setActiveFromChoice = () => {
  const idx = availableMonths.value.indexOf(monthChoice.value)
  activeIndex.value = idx >= 0 ? idx : 0
}

const openMonthPicker = () => {
  monthChoice.value = ""
  showMonthPicker.value = true
  setActiveFromChoice()
}

const confirmMonthPicker = () => {
  currentMonth.value = monthChoice.value
  viewMode.value = 'list'
  showMonthPicker.value = false
  isDropdownOpen.value = false
}

const closeMonthPicker = () => {
  showMonthPicker.value = false
  isDropdownOpen.value = false
}

const formatMonthLabel = (value: string) => {
  const [y, m] = value.split('-')
  return `${y}.${m}`
}

const toggleDropdown = () => {
  if (!availableMonths.value.length) return
  if (isDropdownOpen.value) {
    isDropdownOpen.value = false
    return
  }
  setActiveFromChoice()
  isDropdownOpen.value = true
}

const selectMonth = (value: string) => {
  monthChoice.value = value
  activeIndex.value = availableMonths.value.indexOf(value)
  isDropdownOpen.value = false
}

const onKeydown = (e: KeyboardEvent) => {
  if (!availableMonths.value.length) return

  const lastIndex = availableMonths.value.length - 1
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!isDropdownOpen.value) {
      setActiveFromChoice()
      isDropdownOpen.value = true
    } else {
      activeIndex.value = Math.min(activeIndex.value + 1, lastIndex)
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (!isDropdownOpen.value) {
      setActiveFromChoice()
      isDropdownOpen.value = true
    } else {
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
    }
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (!isDropdownOpen.value) {
      setActiveFromChoice()
      isDropdownOpen.value = true
    } else {
      const value = availableMonths.value[activeIndex.value]
      selectMonth(value)
    }
  } else if (e.key === 'Escape') {
    isDropdownOpen.value = false
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (!pickerRef.value) return
  if (!pickerRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const goToToday = () => {
  currentMonth.value = todayMonthKey
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
      errorMessage.value = t('firstView.loadError')
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
      ">{{ t('firstView.todayFestival') }}</div>
      <ul v-if="todayEvents.length" class="flex flex-nowrap gap-6 overflow-auto w-screen pl-1 py-3 pr-10
      pc:flex-col pc:w-full pc:gap-2 pc:h-[90vh] pc:overflow-auto">
        <li
          v-for="item in todayEvents"
          :key="item.id"
          class="w-[130px] h-[130px] flex-shrink-0 p-[10px] rounded-lg bg-[var(--bg)] shadow-[1px_1px_6px_var(--shadow-weak)] flex flex-col content-center 
          pc:w-full pc:flex-row pc:shadow-none pc:h-[220px] pc:border-b pc:bg-transparent pc:rounded-none pc:px-[10px] pc:py-[20px] pc:hover:bg-gray-300/20 pc:hover:rounded-lg transition-all duration-300"
        >
          <router-link :to="{ name: 'festivaldetail', params: { id: item.id } }" class="pc:flex ">
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
                <div class="text-sm truncate">
                    {{ formatMD(item.start) }} ~ {{ formatMD(item.end) }}
                </div>
                <div class="text-sm truncate">
                  {{ item.city + ' / ' + item.contry }}
                </div>
                <div class="text-sm truncate">
                  {{ lineText(item.lineup) }}
                </div>
              </div>
            </div>
          </router-link>
        </li>
      </ul>
      <div v-else class="text-base text-gray-400 text-center py-8 border-b pc:h-[50vh] pc:flex pc:flex-col pc:justify-center pc:text-2xl">
        {{ t('firstView.emptyToday') }}
      </div>
    </div>
    <div class="px-5">
      <div class="text-xs font-bold pt-5 pb-2 pc:text-base">
        {{ t('firstView.whatFestivalHere') }}
      </div>
      <div>
        <div class="w-full mx-auto py-4 mb-[100px] pc:h-[90vh] pc:overflow-auto pc:mx-2 pc:px-2">
          <div class="flex items-center justify-between">
            <MonthNavigator v-model="currentMonth" class="w-8/10" @click="goToToday" />
            <div class="flex justify-end w-2/10 h-[32px] shadow-[0_0_3px_var(--shadow-weak)] p-[2px] rounded-[5px] pc:mr-3">
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
            {{ t('common.loading') }}
          </div>
          <div v-if="errorMessage" class="text-center text-sm text-red-500 mb-2">
            {{ errorMessage }}
          </div>
          <div v-if="viewMode === 'list'" class="my-4">
            <ul class="space-y-7">
              <li
                v-for="item in currentList"
                :key="item.id"
                class="p-[10px] rounded-lg bg-[var(--bg)] grid grid-cols-[30%_50%_20%] shadow-[1px_1px_6px_var(--shadow-weak)] pc:max-w-[97%] pc:grid-cols-[25%_60%_15%]"
              >
                <img
                  :src="item.image"
                  alt="festival"
                  class="w-[100px] object-cover rounded-[10px] shadow-[2px_2px_3px_rgba(0,0,0,0.2)] pc:w-full pc:h-[80px]"
                />
                <div class="flex flex-col justify-between px-2 pc:px-3">
                  <div class="text-sm font-semibold pc:text-base">
                    {{ item.title }}
                  </div>
                  <div class="text-xs pc:text-sm">
                    {{ formatMD(item.start) }} ~ {{ formatMD(item.end) }}
                  </div>
                  <div class="text-xs pc:text-sm">
                    {{ item.city }} / {{ item.contry }}
                  </div>
                </div>
                <router-link :to="{ name: 'festivaldetail', params: { id: item.id } }" class="p-[8px] text-sm text-pulseblue  text-center border border-pulseblue rounded-md self-center justify-self-center pc:w-full pc:hover:bg-pulseblue pc:hover:text-white">
                  {{ t('common.detail') }}
                </router-link>
              </li>
            </ul>
            <div v-if="!currentList.length" class="h-[450px] flex flex-col content-center justify-center items-center">
              <div class="text-3xl text-gray-400 my-4 text-center">
                {{ t('firstView.oops') }}
                <br>{{ t('firstView.noEventsThisMonth') }}
              </div>
              <button
                class="w-3/5 text-xl text-blue-200 mt-4 text-center border border-blue-200 rounded-md py-1 shadow-[0_0_3px_rgba(0,0,0,0.1)]"
                @click="openMonthPicker"
              >
                {{ t('firstView.viewOtherMonths') }}
              </button>
            </div>
          </div>
          <div v-else>
            <CalendarGrid :month="currentMonth" :events="currentList"/>
          </div>
          <div
            v-if="showMonthPicker"
            class="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-40 p-5"
          >
            <div class="w-full max-w-[360px] rounded-[12px] bg-[var(--bg)] shadow-[0_12px_30px_rgba(0,0,0,0.18)] p-5">
              <div class="flex items-center justify-between">
                <div class="text-lg font-semibold">{{ t('firstView.monthPickerTitle') }}</div>
                <button class="material-symbols-rounded text-2xl" @click="closeMonthPicker">
                  close
                </button>
              </div>
              <div class="space-y-2">
                <label class="text-sm text-gray-500">{{ t('common.month') }}</label>
                <div ref="pickerRef" class="relative">
                  <button
                    type="button"
                    class="w-full border rounded-md px-3 py-2 bg-[var(--bg)] text-left focus:outline-none focus:border-pulseblue pr-10"
                    :class="monthChoice === '' ? 'text-gray-500' : 'text-[var(--text)]'"
                    @click="toggleDropdown"
                    @keydown="onKeydown"
                  >
                    <span>
                      {{ monthChoice === '' ? t('common.selectMonth') : formatMonthLabel(monthChoice) }}
                    </span>
                    <span class="material-symbols-rounded pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      keyboard_arrow_down
                    </span>
                  </button>
                  <div
                    v-if="isDropdownOpen"
                    class="absolute left-0 right-0 max-h-56 overflow-auto rounded-md border bg-[var(--bg)] shadow-lg z-50"
                    role="listbox"
                    :aria-label="t('firstView.monthOptions')"
                  >
                    <button
                      v-for="(m, idx) in availableMonths"
                      :key="m"
                      type="button"
                      role="option"
                      class="w-full px-3 py-2 text-left pc:hover:bg-black/5 focus:bg-black/5 focus:outline-none"
                      :class="[
                        m === monthChoice ? 'font-semibold' : '',
                        idx === activeIndex ? 'bg-black/5' : '',
                        'text-[var(--text)]'
                      ]"
                      @mouseenter="activeIndex = idx"
                      @click="selectMonth(m)"
                    >
                      {{ formatMonthLabel(m) }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <button class="px-4 py-2 rounded-md border border-gray-300 text-sm" @click="closeMonthPicker">
                  {{ t('common.cancel') }}
                </button>
                <button class="px-4 py-2 rounded-md bg-neonpink text-white text-sm" @click="confirmMonthPicker">
                  {{ t('common.move') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
