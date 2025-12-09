<script setup lang="ts">
import { computed } from 'vue'

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
}
type WeekLane = WeekSegment[]
type Week = {
  days: WeekDay[]
  lanes: WeekLane[]
  hiddenByCol: number[] 
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

    const weekStartStr = weekDays[0]?.dateStr ?? null
    const weekEndStr = weekDays[weekDays.length - 1]?.dateStr ?? null

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
        })
      }
    }

    const lanes: WeekLane[] = []
    const hiddenByCol = Array(7).fill(0) as number[]

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
        // 새 lane을 만들 여유가 있으면 만들고 넣기
        if (lanes.length < MAX_LANES_PER_WEEK) {
          lanes.push([seg])
        } else {
          // lane 제한 때문에 숨겨진 bar → 해당 날짜 컬럼들에 +1씩
          const start = seg.startCol
          const end = seg.startCol + seg.span - 1
          for (let col = start; col <= end && col < 7; col++) {
            if (col >= 0 && col < hiddenByCol.length) {
              hiddenByCol[col] = (hiddenByCol[col] ?? 0) + 1
            }
          }
        }
      }
    }

    result.push({
      days: weekDays,
      lanes,
      hiddenByCol,
    })
  }

  return result
})
</script>

<template>
  <div class="w-full">
    <div class="grid grid-cols-7 text-center mb-2 text-sm font-gugi">
      <div class="text-pulsered">SUN</div>
      <div>MON</div>
      <div>TUE</div>
      <div>WED</div>
      <div>THD</div>
      <div>FRI</div>
      <div class="text-pulsedarkblue">SAT</div>
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
        <div class="space-y-1">
          <div
            v-for="(lane, li) in week.lanes"
            :key="li"
            class="grid grid-cols-7 gap-0 h-6 relative"
          >
            <div
              v-for="seg in lane"
              :key="seg.id"
              class="h-[16px] flex items-center text-[12px] bg-indigo-100 text-slate-700 rounded-[3px] px-2 overflow-hidden whitespace-nowrap text-ellipsis"
              :style="{ gridColumn: `${seg.startCol + 1} / span ${seg.span}` }"
            >
              {{ seg.title }}
            </div>
          </div>

          <!-- 날짜별 +n -->
          <div class="grid grid-cols-7 text-[10px] text-pulsegray">
            <div
              v-for="(cnt, ci) in week.hiddenByCol"
              :key="ci"
              class="h-3 flex items-center"
            >
              <span v-if="cnt > 0">+{{ cnt }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
