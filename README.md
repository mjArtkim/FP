# 🎶 FESTIVAL PULSE
> Data-driven interactive dashboard visualising global music festivals and artist lineups  
> *(Personal · Non-commercial Portfolio Project)*

---

## ✨ Project Overview

**Festival Pulse** is a personal, non-commercial project that visualises global music festivals and artist lineups through a **data-driven, interactive dashboard**.

The project focuses on **UI/UX design**, **front-end architecture**, and **API-based data integration**,  
showcasing how large-scale cultural data can be transformed into **meaningful user experiences**.

### Key Goals
- Structuring complex festival and lineup data
- Enriching artist information using public music APIs
- Designing an intuitive, visually driven dashboard experience
- Demonstrating real-world front-end and data-handling skills

---

## 🧩 Features

- 📅 **Festival Data Visualisation**  
  Festival name, date range, location, and imagery

- 🎧 **Artist & Lineup Integration**  
  Artist metadata connected to festival lineups  
  (genre, popularity, profile information)

- 🔗 **External Music Platform Linking**  
  Direct links to Spotify artist pages

- 🎨 **UI/UX-Focused Design**  
  Clean, modern dashboard layout  
  Scalable component-based architecture

- ⚙️ **Data Enrichment Pipeline**  
  Artist data enrichment using MusicBrainz & Spotify APIs

---

## 🛠 Tech Stack

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Tailwind CSS

### Data & APIs
- Spotify Web API
- MusicBrainz API

### Tooling
- Vite
- Git & GitHub

### Design
- Adobe Suite (UI/UX & Visual Design)

---

## 📊 Data Sources & API Usage

This project uses publicly available APIs for **non-commercial, educational, and portfolio purposes only**.

### Spotify Web API
- Artist information
- Track previews (30-second previews only)
- External links to Spotify

### MusicBrainz API
- Artist identifiers (MBID)
- Artist metadata for data enrichment

> ⚠️ This project does **not** stream full music tracks,  
> store audio files, or compete with Spotify services.

---

## ⚖️ Legal & Usage Disclaimer

This project is a **personal, non-commercial portfolio project**.  
It is **not affiliated with or endorsed by Spotify**.

All music-related data and previews are provided by Spotify  
via the Spotify Web API and are used in accordance with  
Spotify’s Developer Terms of Service.

No audio content is hosted or distributed by this project.

---

## 🚀 Project Purpose

Festival Pulse was created as a **portfolio project** to showcase:

- API-driven front-end development in a real-world context
- Scalable data modelling for large datasets
- UI/UX problem-solving for complex cultural data
- Clean, maintainable component-based architecture

---

## 📌 Future Improvements

- Interactive festival map view
- Advanced artist filtering (genre, popularity, region)
- Calendar-based festival exploration
- Performance optimisation for larger datasets

---

## 👩‍💻 Author

**Minji Kim**  
Creative Designer / UI·UX Designer / Front-End Developer  

- Portfolio: *https://www.ideartm.com*  
- GitHub: *https://github.com/mjArtkim*

---

## 📦 API Architecture (Engineer-Focused)

### Data Flow Overview

```txt
Festivals.json
 └─ festival → lineup (artist names)
      └─ artists.json
           ├─ MusicBrainz API (MBID)
           └─ Spotify Web API (artist metadata)
```
--- 

### 1️⃣ Festival Data
```txt
  Festival data is stored locally as structured JSON:
  {
    "id": 1,
    "title": "Festival Name",
    "start": "2025-12-03",
    "end": "2025-12-22",
    "country": "Korea",
    "city": "Amsterdam",
    "lineup": ["Martin Garrix", "Hardwell", "Third Party"]
  }
```

### 2️⃣ Artist Enrichment Pipeline

**Step 1: MusicBrainz**

- Used to retrieve MBID (MusicBrainz Identifier)
- Acts as a stable, vendor-neutral artist ID

**Step 2: Spotify Web API**

- Artist profile image
- Genres
- Popularity score
- External Spotify artist link
---

### 3️⃣ Why This Architecture?

- Decoupled data sources (festival ↔ artist)
- Vendor lock-in avoided via MBID
- Easy future expansion (Songstats, Last.fm, etc.)
- Optimised for read-heavy, UI-driven usage

---


## 🎨 Design Concept & UX Intent

### Design Goal

> “Turn large-scale festival and artist data into an experience  
> that feels curated, not overwhelming.”

---

### UX Principles

### 🎯 1. Data First, Visual Second
- Information hierarchy prioritised over decoration
- Clear separation between festival-level and artist-level views

---

### 🧭 2. Progressive Disclosure
- High-level overview first
- Details revealed through interaction
- Prevents cognitive overload

---

### 🧩 3. Component-Driven UI
- Reusable UI components
- Scalable layout for future features
- Consistent spacing, typography, and interaction rules

---

### 🌙 4. Festival-Oriented Mood
- Dark UI with high-contrast accents
- Inspired by nightlife, stages, and LED visuals
- Dashboard-style layout rather than “fan app” aesthetics

---

### Target User
- Festival enthusiasts
- EDM / electronic music fans
- Data-driven music explorers
- Recruiters reviewing real-world front-end & UX skills 😉




# 🎶 FESTIVAL PULSE
> Festival Pulse는 전 세계 음악 페스티벌과 아티스트 라인업 데이터를 데이터 기반 인터랙티브 대시보드로 시각화한 개인·비상업 프로젝트입니다. 본 프로젝트는 UI/UX 디자인, 프론트엔드 아키텍처, API 기반 데이터 통합에 초점을 맞추어, 대규모 문화 데이터를 어떻게 의미 있는 사용자 경험으로 전환할 수 있는지를 보여줍니다.
> *(Personal · Non-commercial Portfolio Project)*

---

## ✨ Project Overview

**Festival Pulse** 는 페스티벌, 아티스트, 음악 데이터를
체계적으로 구조화하고, 보강(enrichment)하며, 직관적으로 표현하는 방법을 탐구하기 위해 제작되었습니다.
이 프로젝트는 상업 목적이 아닌 포트폴리오 및 학습용 애플리케이션으로 설계되었습니다.

### Key Goals
- 복잡한 페스티벌 및 라인업 데이터 구조화
- 공개 음악 API를 활용한 아티스트 정보 보강
- 직관적이고 시각 중심적인 대시보드 UX 설계
- 실제 서비스 수준의 프론트엔드 및 데이터 처리 역량 시연

---

## 🧩 Features

- 📅 **페스티벌 데이터 시각화**  
  페스티벌 이름, 기간, 위치, 대표 이미지 제공

- 🎧 **아티스트 & 라인업 연동**  
  페스티벌 라인업과 연결된 아티스트 메타데이터 
  (장르, 인기도, 아티스트 프로필 정보)

- 🔗 **외부 음악 플랫폼 연동**  
  Spotify 아티스트 페이지로의 직접 연결

- 🎨 **UI/UX 중심 설계**  
  깔끔하고 현대적인 대시보드 레이아웃
  확장 가능한 컴포넌트 기반 구조

- ⚙️ **데이터 보강 파이프라인**  
  MusicBrainz 및 Spotify API를 활용한 아티스트 데이터 보강

---

## 🛠 Tech Stack

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Tailwind CSS

### Data & APIs
- Spotify Web API
- MusicBrainz API

### Tooling
- Vite
- Git & GitHub

### Design
- Adobe Suite (UI/UX & Visual Design)

---

## 📊 Data Sources & API Usage

본 프로젝트는 비상업적·교육·포트폴리오 목적에 한해
공개 API를 사용합니다.

### Spotify Web API
- 아티스트 정보
- 트랙 미리듣기 (30초 프리뷰만 사용)
- Spotify 외부 링크 제공

### MusicBrainz API
- 아티스트 식별자(MBID)
- 데이터 보강을 위한 아티스트 메타데이터

> ⚠️ 본 프로젝트는 전체 음원을 스트리밍하거나, 오디오 파일을 저장·배포하지 않으며 Spotify 서비스와 경쟁하지 않습니다.

---

## ⚖️ Legal & Usage Disclaimer

본 프로젝트는 개인 포트폴리오용 비상업 프로젝트입니다.
Spotify와의 제휴 또는 공식적인 관계는 없습니다.
모든 음악 관련 데이터 및 미리듣기 콘텐츠는
Spotify Web API를 통해 제공되며,
Spotify 개발자 이용약관을 준수하여 사용됩니다.
본 프로젝트는 어떠한 오디오 콘텐츠도 직접 호스팅하거나 배포하지 않습니다.

---

## 🚀 Project Purpose

Festival Pulse는 다음 역량을 보여주기 위해 제작되었습니다:

- API 기반 프론트엔드 개발 역량
- 확장 가능한 데이터 모델링
- 실제 대규모 데이터셋을 고려한 UI/UX 문제 해결
- 유지보수 가능한 컴포넌트 아키텍처 설계

---

## 📌 Future Improvements

- 인터랙티브 페스티벌 지도 뷰
- 아티스트 고급 필터링 (장르, 인기도, 지역)
- 캘린더 기반 페스티벌 탐색
- 대규모 데이터셋을 고려한 성능 최적화

---

## 👩‍💻 Author

**Minji Kim**  
Creative Designer / UI·UX Designer / Front-End Developer  

- Portfolio: *https://www.ideartm.com*  
- GitHub: *https://github.com/mjArtkim*

---

## 📦 API Architecture (Engineer-Focused)

### Data Flow Overview

```txt
Festivals.json
 └─ festival → lineup (artist names)
      └─ artists.json
           ├─ MusicBrainz API (MBID)
           └─ Spotify Web API (artist metadata)
```
--- 

### 1️⃣ Festival Data
```txt
  페스티벌 데이터는 구조화된 JSON 형태로 로컬에 저장됩니다:
  {
    "id": 1,
    "title": "Festival Name",
    "start": "2025-12-03",
    "end": "2025-12-22",
    "country": "Korea",
    "city": "Amsterdam",
    "lineup": ["Martin Garrix", "Hardwell", "Third Party"]
  }
```

### 2️⃣ Artist Enrichment Pipeline

**Step 1: MusicBrainz**

- MBID(MusicBrainz 고유 식별자) 조회
- 플랫폼에 종속되지 않는 안정적인 아티스트 ID 역할

**Step 2: Spotify Web API**

- 아티스트 프로필 이미지
- 장르 정보
- 인기도 지표
- Spotify 아티스트 외부 링크

---

### 3️⃣ Why This Architecture?

- 페스티벌 데이터와 아티스트 데이터 분리
- MBID 기반으로 특정 플랫폼 종속성 최소화
- Songstats, Last.fm 등 외부 API 확장 용이
- UI 중심의 읽기 위주(read-heavy) 구조에 최적화

---


## 🎨 Design Concept & UX Intent

### Design Goal

> “대규모 페스티벌과 아티스트 데이터를 부담스럽지 않고 ‘큐레이션된 경험’처럼 느껴지도록 만드는 것”

---

### UX Principles

### 🎯 1. 데이터 우선, 비주얼은 그 다음
- 장식보다 정보 위계 구조를 우선
- 페스티벌 단위 뷰와 아티스트 단위 뷰 명확히 분리

---

### 🧭 2. 점진적 정보 공개
- 전체 개요 → 상세 정보 순으로 노출
- 인터랙션을 통해 세부 정보 확인
- 인지 과부하 방지

---

### 🧩 3. Component-Driven UI
- 재사용 가능한 UI 컴포넌트 설계
- 향후 기능 확장을 고려한 레이아웃
- 일관된 여백, 타이포그래피, 인터랙션 규칙 유지

---

### 🌙 4. Festival-Oriented Mood
- 다크 UI 기반 + 높은 대비의 포인트 컬러
- 나이트라이프, 무대, LED 비주얼에서 영감
- ‘팬 앱’이 아닌 대시보드형 경험 지향

---

### Target User
- 음악 페스티벌을 즐기는 사용자
- EDM / 일렉트로닉 음악 팬
- 데이터 기반 음악 탐색 사용자
- 실제 프론트엔드 & UX 역량을 검토하는 채용 담당자 😉
