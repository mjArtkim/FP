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
- 30-second track previews (`preview_url` only)

---

### 3️⃣ Why This Architecture?

- Decoupled data sources (festival ↔ artist)
- Vendor lock-in avoided via MBID
- Easy future expansion (Songstats, Last.fm, etc.)
- Optimised for read-heavy, UI-driven usage

---

### 4️⃣ API Usage Policy

```txt
This project uses the Spotify Web API for non-commercial,
educational and portfolio purposes only.
No audio content is stored or redistributed.

``` 
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