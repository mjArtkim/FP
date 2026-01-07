<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'  
import { useI18n } from '@/i18n'
const router = useRouter()
const { t, currentLocale } = useI18n()

const goToFestivalDetail = (id: number) => {
  router.push({
    name: 'festivaldetail', 
    params: { id },
  })
}

type EventItem = {
  id: number
  title: string
  start: string
  end: string 
}
type WeekDay = {
  day: number | null 
  dateStr: string | null 
}
type WeekSegment = {
  id: number
  title: string
  startCol: number
  span: number
  event: EventItem 
}
type WeekLane = WeekSegment[]
type Week = {
  days: WeekDay[]
  lanes: WeekLane[]
  hiddenByCol: number[] 
  hiddenEventsByCol: EventItem[][]
}
const formatMD = (dateStr: string) => {
  return dateStr.slice(5)
}
const props = defineProps<{
  month: string 
  events: EventItem[]
}>()

const parseMonth = (value: string) => {
  const [yearStr, monthStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  if (!Number.isInteger(year) || !Number.isInteger(month)) return null
  return { year, month }
}

const toDateStr = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const MAX_LANES_PER_WEEK = 2

const calendarDays = computed<WeekDay[]>(() => {
  const parsed = parseMonth(props.month)
  if (!parsed) return []
  const { year, month } = parsed

  const firstDay = new Date(year, month - 1, 1)
  const lastDate = new Date(year, month, 0).getDate()
  const startWeekday = firstDay.getDay() 
  const days: WeekDay[] = []

  for (let i = 0; i < startWeekday; i++) {
    days.push({ day: null, dateStr: null })
  }

  for (let d = 1; d <= lastDate; d++) {
    days.push({
      day: d,
      dateStr: toDateStr(year, month, d),
    })
  }

  // 뒤 빈칸
  const remainder = days.length % 7
  if (remainder !== 0) {
    const toAdd = 7 - remainder
    for (let i = 0; i < toAdd; i++) {
      days.push({ day: null, dateStr: null })
    }
  }

  return days
})

const weeks = computed<Week[]>(() => {
  const days = calendarDays.value
  if (!days.length) return []
  const result: Week[] = []

  for (let i = 0; i < days.length; i += 7) {
    const weekDays = days.slice(i, i + 7)

    let weekStartStr: string | null = null
    let weekEndStr: string | null = null
    for (const d of weekDays) {
      if (d.dateStr) {
        weekStartStr = d.dateStr
        break
      }
    }
    for (let idx = weekDays.length - 1; idx >= 0; idx--) {
      const d = weekDays[idx]
      if (d?.dateStr) {
        weekEndStr = d.dateStr
        break
      }
    }

    const segments: WeekSegment[] = []

    if (weekStartStr && weekEndStr) {
      for (const e of props.events) {
        if (e.end < weekStartStr || e.start > weekEndStr) continue

        const segStartStr = e.start < weekStartStr ? weekStartStr : e.start
        const segEndStr = e.end > weekEndStr ? weekEndStr : e.end

        const startCol = weekDays.findIndex((d) => d.dateStr === segStartStr)
        const endCol = weekDays.findIndex((d) => d.dateStr === segEndStr)

        if (startCol === -1 || endCol === -1) continue

        segments.push({
          id: e.id,
          title: e.title,
          startCol,
          span: endCol - startCol + 1,
          event: e,                // 🔹 원본 이벤트 저장
        })
      }
    }

    segments.sort(
      (a, b) => a.startCol - b.startCol || b.span - a.span || a.id - b.id
    )

    const lanes: WeekLane[] = []
    const hiddenByCol = Array(7).fill(0) as number[]
    const hiddenEventsByCol: EventItem[][] = Array.from({ length: 7 }, () => [])

    const isOverlap = (a: WeekSegment, b: WeekSegment) => {
      const aEnd = a.startCol + a.span - 1
      const bEnd = b.startCol + b.span - 1
      return !(aEnd < b.startCol || bEnd < a.startCol)
    }

    for (const seg of segments) {
      let placed = false
      for (const lane of lanes) {
        const hasOverlap = lane.some((existing) => isOverlap(existing, seg))
        if (!hasOverlap) {
          lane.push(seg)
          placed = true
          break
        }
      }

      if (!placed) {
        if (lanes.length < MAX_LANES_PER_WEEK) {
          lanes.push([seg])
        } else {
          // 🔹 lane 초과 → 숨김 처리 + 날짜별로 이벤트 저장
          const start = seg.startCol
          const end = seg.startCol + seg.span - 1
          for (let col = start; col <= end && col < 7; col++) {
            if (col >= 0 && col < hiddenByCol.length) {
              hiddenByCol[col] = (hiddenByCol[col] ?? 0) + 1
              const bucket = hiddenEventsByCol[col]
              if (bucket) {
                bucket.push(seg.event)
              }
            }
          }
        }
      }
    }

    result.push({
      days: weekDays,
      lanes,
      hiddenByCol,
      hiddenEventsByCol,
    })
  }

  return result
})

const openMore = ref<{ weekIndex: number; colIndex: number } | null>(null)

const dayLabels = computed(() =>
  currentLocale.value === 'ko'
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
)

const toggleMore = (weekIndex: number, colIndex: number) => {
  if (
    openMore.value &&
    openMore.value.weekIndex === weekIndex &&
    openMore.value.colIndex === colIndex
  ) {
    // 같은 +n 다시 클릭 → 닫기
    openMore.value = null
  } else {
    // 새로 열기
    openMore.value = { weekIndex, colIndex }
  }
}
</script>

<template>
  <div class="w-full">
    <div class="grid grid-cols-7 text-center mb-2 text-sm font-gugi">
      <div class="text-pulsered">{{ dayLabels[0] }}</div>
      <div>{{ dayLabels[1] }}</div>
      <div>{{ dayLabels[2] }}</div>
      <div>{{ dayLabels[3] }}</div>
      <div>{{ dayLabels[4] }}</div>
      <div>{{ dayLabels[5] }}</div>
      <div class="text-pulsedarkblue">{{ dayLabels[6] }}</div>
    </div>

    <!-- 주 -->
    <div class="space-y-4">
      <div
        v-for="(week, wi) in weeks"
        :key="wi"
        class="border-t border-gray-200 pt-2 h-[100px]"
      >
        <!-- 날짜 -->
        <div class="grid grid-cols-7 text-sm mb-1 font-gugi">
          <div
            v-for="(day, di) in week.days"
            :key="di"
            class="pl-2"
          >
            <span
              v-if="day.day"
              :class="{
                'text-pulsered': di === 0,
                'text-pulsedarkblue': di === 6,
              }"
            >
              {{ day.day }}
            </span>
          </div>
        </div>

        <!-- 이벤트 bar 줄 -->
        <div class="space-y-1 relative">
          <div
            v-for="(lane, li) in week.lanes"
            :key="li"
            class="grid grid-cols-7 gap-0 h-6 relative"
          >
            <div
              v-for="seg in lane"
              :key="seg.id"
              class="h-[16px] flex items-center text-[12px] bg-indigo-100 text-slate-700 rounded-[3px] px-2 overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer pc:hover:bg-indigo-300"
              :style="{ gridColumn: `${seg.startCol + 1} / span ${seg.span}` }"
              @click="goToFestivalDetail(seg.id)" 
            >
              {{ seg.title }}
            </div>
          </div>

          <!-- +n -->
          <div class="grid grid-cols-7 text-[10px] text-pulsegray mt-2 ">
            <div
              v-for="(cnt, ci) in week.hiddenByCol"
              :key="ci"
              class="h-4 flex items-center justify-start"
            >
              <div
                v-if="cnt > 0"
                class="group inline-flex md:relative"
              >
                <!-- +n 뱃지-->
                <button
                  type="button"
                  class="inline-flex items-center justify-center px-1.5 py-[1px] text-[12px] cursor-pointer pc:hover:text-neonpink"
                  @click.stop="toggleMore(wi, ci)"
                >
                  +{{ cnt }}
                </button>
                <!-- 클릭 시 제목 리스트만 보여주는 툴팁-->
                <div
                  v-if="openMore && openMore.weekIndex === wi && openMore.colIndex === ci"
                  class="absolute top-4 z-20 shadow-[2px_2px_5px_rgba(0,0,0,0.2),inset_1px_1px_5px_rgba(255,255,255,0.5)]
                      bg-black/50 border backdrop-blur-[5px] border-white/30 rounded-md shadow-md
                        w-full md:w-[350px] text-[12px] py-1 cursor-pointer text-white"
                  :class="ci >= 4 ? 'right-0' : 'left-0'"
                >
                  <div class="flex justify-between items-center px-2 py-1 border-b border-white/30 text-[12px] font-semibold">
                    <span>{{ t('calendar.moreEvents') }}</span>
                    <button
                      type="button"
                      class="material-symbols-rounded text-white pc:hover:text-gray text-[16px] leading-none pc:hover:text-neonpink"
                      @click.stop="openMore = null"
                    >close</button>
                  </div>
                  <div
                    v-for="ev in week.hiddenEventsByCol[ci]"
                    :key="ev.id"
                    class="px-2 py-[2px] pc:hover:bg-gray-900 whitespace-nowrap pc:hover:text-neonpink cursor-pointer"
                    @click="goToFestivalDetail(ev.id)"
                  >
                    {{ formatMD(ev.start) }} ~ {{ formatMD(ev.end) }}
                    {{ ev.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
