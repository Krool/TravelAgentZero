# Travel Agent Zero - Project Plan

## Vision
A retro-futuristic travel planning web application that helps users discover their perfect destinations through intelligent scoring, personalization, and AI-powered itinerary generation. Think "80s computer terminal meets modern travel concierge."

---

## 1. Core Concept & Theme

### Brand Identity: "Travel Agent Zero"
- **Aesthetic**: Retro-futuristic / synthwave / 8-bit terminal
- **Color Palette**:
  - Primary: Electric cyan (#00fff2)
  - Secondary: Hot magenta (#ff00ff)
  - Accent: Neon orange (#ff6b35)
  - Background: Deep space blue (#0a0a1a) with subtle grid lines
  - Text: Soft white (#e0e0e0) / Phosphor green (#00ff00) for highlights
- **Typography**:
  - Headers: "Press Start 2P" or "VT323" (pixel/terminal fonts)
  - Body: "IBM Plex Mono" or "Space Mono"
- **Visual Elements**:
  - Scanline overlay effects (subtle)
  - CRT screen glow/bloom on interactive elements
  - Pixel art icons for categories (airplane, palm tree, mountains, etc.)
  - Animated loading states with retro pixel animations

### Sound Design (8-bit, Low Volume)
- **UI Feedback Sounds**:
  - Button hover: Soft blip (100ms, sine wave)
  - Button click: Satisfying "pip" sound
  - Card selection: Coin collect sound (muted)
  - Filter change: Soft "whoosh" or tape rewind
  - Score calculation: Retro calculator beep sequence
  - Success: Achievement jingle (3-note arpeggio)
  - Error: Soft descending tone
- **Ambient**: Optional lo-fi synthwave background (toggleable)
- **Implementation**: Web Audio API + pre-generated samples
- **Master Volume**: Default 15%, user adjustable, remember preference

---

## 2. Technical Architecture

### Stack Recommendation
```
Frontend:     Next.js 14+ (App Router) + TypeScript
Styling:      Tailwind CSS + custom retro theme
State:        Zustand (lightweight) or React Context
Animation:    Framer Motion
Audio:        Howler.js or Tone.js
Charts:       Recharts or Chart.js (for score visualization)
Hosting:      GitHub Pages (static export) or Vercel
Data:         JSON files (converted from CSV) + localStorage
```

### Why GitHub Pages Compatible?
- Static site generation with Next.js export
- No server required for MVP
- Free hosting with custom domain support
- Future: Can upgrade to Vercel for API routes

### Project Structure
```
travel-agent-zero/
├── public/
│   ├── audio/               # 8-bit sound effects
│   ├── images/              # Pixel art assets
│   └── data/
│       ├── destinations.json
│       └── preferences.json
├── src/
│   ├── app/
│   │   ├── page.tsx         # Main dashboard
│   │   ├── destination/[id]/page.tsx
│   │   ├── compare/page.tsx
│   │   ├── itinerary/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── ui/              # Retro-themed UI components
│   │   ├── destinations/    # Destination cards, lists
│   │   ├── filters/         # Filter controls
│   │   ├── scoring/         # Score displays
│   │   └── audio/           # Sound manager
│   ├── hooks/
│   │   ├── useSound.ts
│   │   ├── useFilters.ts
│   │   └── useScoring.ts
│   ├── lib/
│   │   ├── scoring.ts       # Scoring algorithm
│   │   ├── prompts.ts       # LLM prompt generators
│   │   └── api.ts           # External API helpers
│   ├── data/
│   │   └── types.ts         # TypeScript interfaces
│   └── styles/
│       └── retro-theme.css  # Custom retro effects
├── scripts/
│   └── convert-csv.ts       # CSV to JSON converter
└── package.json
```

---

## 3. Data Model

### Destination Interface
```typescript
interface Destination {
  id: string;
  name: string;
  duration: number;
  itinerarySummary: string;
  considerations: string;

  // Logistics
  visaRequirements: string;
  countries: string[];
  climate: 'Hot' | 'Cold' | 'Temperate' | 'Mix';
  type: 'Urban' | 'Nature' | 'Mix';

  // Scores (0-10)
  easeWithChild: number;
  urgency: number;
  danger: number;
  cost: number;

  // Flight times from origins
  flightTimes: {
    SFO: number;
    ORD: number;
    [key: string]: number;  // Extensible for more origins
  };

  // Seasonal data (1 = good, 0 = not ideal)
  bestMonths: {
    jan: number; feb: number; mar: number; apr: number;
    may: number; jun: number; jul: number; aug: number;
    sep: number; oct: number; nov: number; dec: number;
  };

  // Personal tracking
  travelers: {
    [name: string]: {
      hasVisited: boolean;
      rating: number;
    };
  };
}

interface UserPreferences {
  travelMonth: string;
  kidsIncluded: boolean;
  costSensitivity: 'none' | 'a_little' | 'very';
  durationRange: { min: number; max: number };
  temperaturePreference: 'Hot' | 'Cold' | 'Temperate' | 'Any';
  typePreference: 'Urban' | 'Nature' | 'Mix' | 'Any';
  preferNewPlaces: boolean;
  visaFreeOnly: boolean;
  maxDanger: number;
  homeAirport: string;
  travelers: string[];  // Names of people traveling
}
```

---

## 4. Scoring Algorithm

### Weighted Score Calculation
```typescript
function calculateScore(dest: Destination, prefs: UserPreferences): number {
  const weights = {
    monthMatch: 25,      // Is it a good time to visit?
    newPlace: 20,        // Haven't been before
    personalRating: 15,  // User's own interest rating
    childFriendly: 15,   // If kids coming
    costMatch: 10,       // Within budget preference
    durationMatch: 10,   // Fits trip length
    flightTime: 5,       // Shorter = better
  };

  let score = 0;

  // Month matching (0 or 1 from data * weight)
  score += dest.bestMonths[prefs.travelMonth] * weights.monthMatch;

  // New place bonus
  const isNewToAll = prefs.travelers.every(
    t => !dest.travelers[t]?.hasVisited
  );
  score += isNewToAll ? weights.newPlace : 0;

  // Personal rating average
  const avgRating = average(
    prefs.travelers.map(t => dest.travelers[t]?.rating || 5)
  );
  score += (avgRating / 10) * weights.personalRating;

  // Child-friendliness (if applicable)
  if (prefs.kidsIncluded) {
    score += (dest.easeWithChild / 10) * weights.childFriendly;
  } else {
    score += weights.childFriendly; // Full points if no kids
  }

  // Cost matching
  const costScore = prefs.costSensitivity === 'none' ? 1 :
    prefs.costSensitivity === 'a_little' ? (10 - dest.cost) / 10 :
    (10 - dest.cost) / 5; // Very sensitive = penalize expensive more
  score += costScore * weights.costMatch;

  // Duration fit
  const inRange = dest.duration >= prefs.durationRange.min &&
                  dest.duration <= prefs.durationRange.max;
  score += inRange ? weights.durationMatch : 0;

  // Flight time (normalized, shorter = better)
  const flightTime = dest.flightTimes[prefs.homeAirport] || 10;
  score += ((20 - flightTime) / 20) * weights.flightTime;

  return score;
}
```

---

## 5. Feature Breakdown

### MVP Features (Phase 1)

#### 5.1 Dashboard / Home
- Retro "boot up" animation on first load
- Top 10 recommended destinations (sorted by score)
- Quick filter chips (month, kids, duration)
- Search bar with autocomplete
- "Mission briefing" style summary of current filters

#### 5.2 Filter Panel
- Collapsible sidebar with all preference controls
- Real-time score recalculation as filters change
- Preset buttons: "Weekend Getaway", "Family Adventure", "Solo Explorer"
- Save/load filter presets

#### 5.3 Destination Cards
- Pixel art or photo thumbnail
- Score displayed as "power bar" (retro gauge)
- Key stats: duration, cost, danger, child-friendliness
- "NEW" badge for unvisited destinations
- Quick actions: Compare, View Details, Generate Itinerary

#### 5.4 Destination Detail Page
- Full itinerary summary
- Important considerations
- Monthly visit calendar (visual heatmap)
- Flight times from different origins
- "Been there" toggle for each traveler
- Personal rating slider
- AI Itinerary generator button

#### 5.5 Comparison View
- Side-by-side comparison of 2-4 destinations
- Radar chart showing score breakdown
- Pros/cons list generated from data
- "Winner" highlight based on current preferences

#### 5.6 Settings Page
- Traveler profiles (add/remove people)
- Home airport selection
- Sound settings (volume, on/off)
- Theme toggle (dark/light retro modes)
- Data export/import

### Enhanced Features (Phase 2)

#### 5.7 AI Itinerary Generator
- Button to generate detailed day-by-day itinerary
- Outputs structured prompt for external LLM
- Copy prompt button for ChatGPT/Claude
- Eventually: Direct API integration

#### 5.8 Trip Planner Mode
- Calendar view for planning actual trips
- Drag-and-drop destinations onto calendar
- Budget calculator
- Packing list generator

#### 5.9 Discovery Mode
- "Random Destination" button
- "Surprise Me" based on preferences
- Achievement system (visited X continents, etc.)

#### 5.10 Social Features (Phase 3)
- Share destination lists with friends
- Compare "been there" maps
- Collaborative trip planning

---

## 6. API Integrations

### Flight Data APIs
| API | Purpose | Notes |
|-----|---------|-------|
| **Amadeus** | Flight prices, durations | Free tier available |
| **Skyscanner** | Price comparison | Requires partnership |
| **Google Flights** | Unofficial scraping | Not recommended |
| **Kiwi.com** | Budget flights | Good free tier |

### Weather APIs
| API | Purpose | Notes |
|-----|---------|-------|
| **OpenWeatherMap** | Current/forecast | Free tier |
| **Visual Crossing** | Historical data | Good for "best time" validation |
| **Weatherbit** | Climate normals | 50 calls/day free |

### Travel Information
| API | Purpose | Notes |
|-----|---------|-------|
| **REST Countries** | Country info, currencies | Free |
| **Visa Guide API** | Visa requirements | Various options |
| **Travel Advisories** | Safety info | Government APIs (free) |
| **Numbeo** | Cost of living | Limited free |

### Image/Media
| API | Purpose | Notes |
|-----|---------|-------|
| **Unsplash** | Destination photos | Free with attribution |
| **Pexels** | Backup images | Free |
| **Google Places** | Location photos | Requires API key |

### AI/LLM Integration
| Service | Purpose | Notes |
|---------|---------|-------|
| **OpenAI API** | Itinerary generation | Pay per use |
| **Claude API** | Itinerary generation | Pay per use |
| **Prompt Export** | Copy for external use | Free (user's own LLM) |

---

## 7. LLM Prompt Templates

### Itinerary Generation Prompt
```markdown
## Travel Itinerary Request

**Destination:** {{destination.name}}
**Countries:** {{destination.countries.join(', ')}}
**Duration:** {{destination.duration}} days
**Travel Month:** {{preferences.travelMonth}}
**Travelers:** {{preferences.travelers.length}} adults{{preferences.kidsIncluded ? ' + children' : ''}}
**Budget Level:** {{budgetLevel}} (1-10 scale: {{destination.cost}})
**Trip Style:** {{destination.type}} focused

### Context from Database:
{{destination.itinerarySummary}}

### Important Considerations:
{{destination.considerations}}

### Request:
Please generate a detailed day-by-day itinerary including:
1. Daily activities with approximate timing
2. Restaurant/food recommendations
3. Transportation between locations
4. Accommodation area suggestions
5. Budget estimates per day
6. Packing recommendations for the season
7. Any booking tips or things to reserve in advance

Format as a structured itinerary with clear day headings.
```

### Destination Research Prompt
```markdown
## Destination Analysis Request

I'm considering visiting **{{destination.name}}** in **{{month}}**.

Current data I have:
- Duration: {{duration}} days
- Climate: {{climate}}
- Style: {{type}}
- Ease with children: {{easeWithChild}}/10
- Danger level: {{danger}}/10
- Cost level: {{cost}}/10

Please provide:
1. Validation/correction of these ratings
2. Top 5 must-see attractions
3. Hidden gems locals recommend
4. Common tourist mistakes to avoid
5. Best neighborhoods to stay in
6. Local customs/etiquette tips
7. Realistic daily budget breakdown
```

### Comparison Prompt
```markdown
## Destination Comparison

Help me choose between these destinations for {{month}}:

{{#each destinations}}
### {{name}}
- Duration: {{duration}} days
- Type: {{type}} | Climate: {{climate}}
- Cost: {{cost}}/10 | Danger: {{danger}}/10
- Child-friendly: {{easeWithChild}}/10
{{/each}}

**My priorities:**
- Traveling with kids: {{kidsIncluded}}
- Budget sensitivity: {{costSensitivity}}
- Preferred style: {{typePreference}}

Please compare these destinations and recommend which best fits my needs, explaining the trade-offs.
```

---

## 8. UI Components Specification

### 8.1 RetroButton
```tsx
// Glowing button with scanline effect
<RetroButton
  variant="primary" | "secondary" | "ghost"
  size="sm" | "md" | "lg"
  sound="click" | "success" | "none"
  glow={true}
>
  INITIATE TRAVEL
</RetroButton>
```

### 8.2 ScoreGauge
```tsx
// Animated power bar showing score
<ScoreGauge
  value={85.5}
  max={100}
  label="COMPATIBILITY"
  showPercentage={true}
  animate={true}
/>
```

### 8.3 DestinationCard
```tsx
<DestinationCard
  destination={dest}
  score={calculatedScore}
  isNew={!visited}
  onCompare={() => {}}
  onViewDetails={() => {}}
  onGenerateItinerary={() => {}}
/>
```

### 8.4 FilterChip
```tsx
<FilterChip
  label="October"
  active={true}
  onToggle={() => {}}
  icon={<CalendarIcon />}
/>
```

### 8.5 MonthHeatmap
```tsx
// Visual calendar showing best months
<MonthHeatmap
  data={destination.bestMonths}
  selectedMonth={preferences.travelMonth}
/>
```

### 8.6 ComparisonRadar
```tsx
// Radar chart for multi-destination comparison
<ComparisonRadar
  destinations={[dest1, dest2, dest3]}
  metrics={['cost', 'safety', 'childFriendly', 'duration', 'rating']}
/>
```

---

## 9. Sound Implementation

### Sound Manager Hook
```typescript
// hooks/useSound.ts
import { Howl } from 'howler';

const sounds = {
  click: new Howl({ src: ['/audio/click.mp3'], volume: 0.15 }),
  hover: new Howl({ src: ['/audio/hover.mp3'], volume: 0.1 }),
  success: new Howl({ src: ['/audio/success.mp3'], volume: 0.15 }),
  error: new Howl({ src: ['/audio/error.mp3'], volume: 0.12 }),
  score: new Howl({ src: ['/audio/score.mp3'], volume: 0.15 }),
  select: new Howl({ src: ['/audio/select.mp3'], volume: 0.15 }),
};

export function useSound() {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.15);

  const play = (sound: keyof typeof sounds) => {
    if (enabled) {
      sounds[sound].volume(volume);
      sounds[sound].play();
    }
  };

  return { play, enabled, setEnabled, volume, setVolume };
}
```

### Sound Assets Needed
1. `click.mp3` - Short blip (50ms)
2. `hover.mp3` - Subtle tone (30ms)
3. `success.mp3` - 3-note ascending arpeggio (300ms)
4. `error.mp3` - Descending tone (200ms)
5. `score.mp3` - Calculator beep sequence (400ms)
6. `select.mp3` - Coin/pip sound (100ms)
7. `ambient.mp3` - Lo-fi synthwave loop (optional)

---

## 10. Page Layouts

### Home Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  ░▒▓ TRAVEL AGENT ZERO ▓▒░                    [⚙] [🔊] [?] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌────────────────────────────────────┐ │
│ │ MISSION CONTROL │  │ TOP DESTINATIONS                   │ │
│ │                 │  │ ┌──────────┐ ┌──────────┐ ┌──────┐ │ │
│ │ Month: [Oct ▼]  │  │ │ Seoul &  │ │ Istanbul │ │ Berl │ │ │
│ │ Kids:  [No  ▼]  │  │ │ Hong Kong│ │ Turkey   │ │ Germ │ │ │
│ │ Days:  [6-9   ] │  │ │ ████████ │ │ ███████  │ │ ████ │ │ │
│ │ Style: [Any ▼]  │  │ │ 87.5     │ │ 78.75    │ │ 78.7 │ │ │
│ │ Climate:[Any ▼] │  │ └──────────┘ └──────────┘ └──────┘ │ │
│ │ Max Danger: [6] │  │ ┌──────────┐ ┌──────────┐ ┌──────┐ │ │
│ │                 │  │ │ Budapest │ │ Portugal │ │ More │ │ │
│ │ [PRESETS ▼]     │  │ │ Hungary  │ │ & Azores │ │  ... │ │ │
│ │                 │  │ │ ███████  │ │ ██████   │ │ █████│ │ │
│ │ ☑ New places    │  │ │ 72.0     │ │ 70.0     │ │ 68.5 │ │ │
│ │ ☐ Visa-free     │  │ └──────────┘ └──────────┘ └──────┘ │ │
│ └─────────────────┘  └────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🎲 RANDOM] [📊 COMPARE] [🗺 ALL DESTINATIONS] [➕ ADD] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Destination Detail
```
┌─────────────────────────────────────────────────────────────┐
│  ← BACK                          TRAVEL AGENT ZERO          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    SEOUL & HONG KONG                    │ │
│ │                   South Korea, Hong Kong                │ │
│ │                        ⏱ 8 DAYS                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│ │ SCORE       │ │ COST        │ │ SAFETY      │ │ KIDS   │ │
│ │ ████████░░  │ │ █████░░░░░  │ │ ████████░░  │ │ ███████│ │
│ │ 87.5        │ │ 5/10        │ │ 8/10        │ │ 7/10   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ BEST TIME TO VISIT                                      │ │
│ │ J  F  M  A  M  J  J  A  S  O  N  D                      │ │
│ │ ░░ ░░ ██ ██ ██ ░░ ░░ ░░ ██ ██ ██ ░░                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ TRAVELERS           │ BEEN? │ RATING                    │ │
│ │ Kenny               │  ☐    │ ★★★★★★★★★★ 10            │ │
│ │ Sara                │  ☐    │ ★★★★★☆☆☆☆☆ 5             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🤖 GENERATE ITINERARY]  [📋 COPY PROMPT]  [➕ COMPARE] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Project setup (Next.js, Tailwind, TypeScript)
- [ ] CSV to JSON data converter
- [ ] Retro theme CSS/components
- [ ] Sound system implementation
- [ ] Basic dashboard with destination cards
- [ ] Filter sidebar
- [ ] Scoring algorithm
- [ ] Destination detail page
- [ ] localStorage for preferences

### Phase 2: Enhancement
- [ ] Comparison view with radar charts
- [ ] LLM prompt generator
- [ ] Advanced filtering (multi-select countries, etc.)
- [ ] Traveler profile management
- [ ] Data export/import
- [ ] PWA support (offline mode)

### Phase 3: Integration
- [ ] Flight price API integration
- [ ] Weather API integration
- [ ] Direct LLM API for itinerary generation
- [ ] Achievement/gamification system
- [ ] Trip calendar planner

### Phase 4: Social
- [ ] User accounts (optional)
- [ ] Share lists with friends
- [ ] Collaborative planning
- [ ] Community destination ratings

---

## 12. File Deliverables

After planning approval, I will create:

1. **`package.json`** - Dependencies and scripts
2. **`tailwind.config.ts`** - Custom retro theme
3. **`src/styles/retro.css`** - CRT effects, scanlines
4. **`src/lib/scoring.ts`** - Scoring algorithm
5. **`src/lib/prompts.ts`** - LLM prompt templates
6. **`src/hooks/useSound.ts`** - Sound manager
7. **`src/data/destinations.json`** - Converted from CSV
8. **`src/components/ui/*`** - Retro UI components
9. **`src/app/*`** - Page components
10. **`scripts/convert-csv.ts`** - Data converter

---

## 13. Confirmed Decisions

Based on user feedback:

1. **Travelers**: Fully configurable from the start
   - Easy to add/remove travelers
   - Each traveler tracks their own "been there" status
   - Kenny and Sara loaded as initial defaults from CSV data
   - New travelers start with all destinations as "not visited"

2. **Origin Airports**: Dropdown selection from major global hubs
   - Pre-populated flight time data for these cities:
   - **North America**: New York (JFK), Los Angeles (LAX), Chicago (ORD), San Francisco (SFO)
   - **Europe**: London (LHR), Paris (CDG), Frankfurt (FRA), Amsterdam (AMS)
   - **Asia**: Tokyo (NRT), Beijing (PEK), Singapore (SIN), Dubai (DXB), Hong Kong (HKG)
   - **Other**: Sydney (SYD), São Paulo (GRU)
   - Flight times will be estimated/pre-calculated (no live API to avoid costs)
   - Users select their "home airport" from dropdown

3. **Multi-User**: Yes, multiple travelers can be tracked
   - All data stored in localStorage (no accounts needed)
   - Each traveler has independent visited/rating data
   - Can filter by "new to selected travelers"

4. **Hosting**: GitHub Pages primary, Vercel if API routes needed later

5. **LLM Prompt Export**: Stretch goal (Phase 2)
   - Focus on core filtering/scoring/display first
   - Add prompt generation later

6. **Data Storage**: localStorage
   - Preferences persist across sessions
   - Traveler data persists
   - Export/import for backup

---

## 14. Origin Airport Strategy

### The Challenge
Getting real-time flight data is expensive and rate-limited. We need flight times to calculate scores but can't query APIs for every destination × airport combination.

### Solution: Pre-calculated Estimates
We'll create a static dataset of approximate flight times from each major hub to each destination. This data will be:
- Generated once (via LLM or manual research)
- Stored in the destinations JSON
- Updated periodically if needed

### Hub Selection Rationale
| Hub | Code | Why Included |
|-----|------|--------------|
| New York | JFK | US East Coast gateway |
| Los Angeles | LAX | US West Coast, Asia-Pacific connections |
| Chicago | ORD | US Central, existing data |
| San Francisco | SFO | Tech hub, existing data |
| London | LHR | European mega-hub |
| Paris | CDG | European hub, Africa connections |
| Frankfurt | FRA | European hub, global connections |
| Amsterdam | AMS | European hub |
| Tokyo | NRT | Asia-Pacific hub |
| Beijing | PEK | China hub |
| Singapore | SIN | Southeast Asia hub |
| Dubai | DXB | Middle East hub, global connections |
| Hong Kong | HKG | Asia financial hub |
| Sydney | SYD | Oceania hub |
| São Paulo | GRU | South America hub |

### Data Structure
```typescript
interface Destination {
  // ... other fields
  flightTimes: {
    JFK: number;  // hours
    LAX: number;
    ORD: number;
    SFO: number;
    LHR: number;
    CDG: number;
    FRA: number;
    AMS: number;
    NRT: number;
    PEK: number;
    SIN: number;
    DXB: number;
    HKG: number;
    SYD: number;
    GRU: number;
  };
}
```

---

## Ready to Build!

Plan is finalized. Starting Phase 1 implementation now.

*"Your mission, should you choose to accept it..."*
