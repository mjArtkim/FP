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
const toDateStr = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const MAX_LANES_PER_WEEK = 2

const calendarDays = computed<WeekDay[]>(() => {
  const [y, m] = props.month.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1)
  const lastDate = new Date(y, m, 0).getDate()
  const startWeekday = firstDay.getDay() 
  const days: WeekDay[] = []

  for (let i = 0; i < startWeekday; i++) {
    days.push({ day: null, dateStr: null })
  }

  for (let d = 1; d <= lastDate; d++) {
    days.push({
      day: d,
      dateStr: toDateStr(y, m, d),
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
  const result: Week[] = []

  for (let i = 0; i < days.length; i += 7) {
    const weekDays = days.slice(i, i + 7)

    const weekStartStr = weekDays[0].dateStr
    const weekEndStr = weekDays[6].dateStr

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
            hiddenByCol[col] += 1
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
    <div class="grid grid-cols-7 text-center font-semibold mb-2 text-xs">
      <div class="text-red-500">일</div>
      <div>월</div>
      <div>화</div>
      <div>수</div>
      <div>목</div>
      <div>금</div>
      <div class="text-blue-500">토</div>
    </div>

    <!-- 주 단위 렌더링 -->
    <div class="space-y-4">
      <div
        v-for="(week, wi) in weeks"
        :key="wi"
        class="border-t border-gray-200 pt-2 pb-1"
      >
        <!-- 날짜 줄 -->
        <div class="grid grid-cols-7 text-center text-xs mb-1">
          <div
            v-for="(day, di) in week.days"
            :key="di"
            class="h-6"
          >
            <span
              v-if="day.day"
              class="text-[11px] font-semibold"
              :class="{
                'text-red-500': di === 0,
                'text-blue-500': di === 6,
              }"
            >
              {{ day.day }}
            </span>
          </div>
        </div>

        <!-- 이벤트 bar 줄들 (lane 단위) -->
        <div class="space-y-1">
          <div
            v-for="(lane, li) in week.lanes"
            :key="li"
            class="grid grid-cols-7 gap-0 h-6 relative"
          >
            <div
              v-for="seg in lane"
              :key="seg.id"
              class="h-6 flex items-center text-[11px] bg-indigo-100 text-slate-700 rounded-full px-2 overflow-hidden whitespace-nowrap text-ellipsis"
              :style="{ gridColumn: `${seg.startCol + 1} / span ${seg.span}` }"
            >
              {{ seg.title }}
            </div>
          </div>

          <!-- 날짜별 +n (해당 칸에 숨겨진 bar 수) -->
          <div class="grid grid-cols-7 text-[10px] text-gray-500">
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
