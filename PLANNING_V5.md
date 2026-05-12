# 📡 Radio Aether — Planificación V5 (EVENT_HORIZON)

> Documento generado para mantener contexto entre sesiones de trabajo.  
> Autores: Romén Gilberto García Gómez (@PRORIX) · Marcos Hernández Oramas (@mahoramas)  
> Proyecto: TFG — IES Puerto de la Cruz · 2º DAM

---

## 🎯 Objetivo de la V5

Convertir Radio Aether en una experiencia impulsada por IA. La app deja de ser un buscador y pasa a entender al usuario: analiza su estado de ánimo, su contexto (hora, clima, ubicación) y sus preferencias para encontrar la emisora perfecta para cada momento.

---

## 🤖 Decisiones técnicas tomadas

- **Proveedor LLM:** Google Gemini Flash — tier gratuito (15 req/min, 1M tokens/día), sin tarjeta de crédito, suficiente para un TFG académico.
- **Integración backend:** Spring AI con el adaptador oficial de Gemini. Permite structured output (respuesta JSON mapeada directamente a objetos Java) sin parsing manual.
- **Clima:** OpenWeatherMap API — tier gratuito, sin tarjeta de crédito.
- **Seguridad:** Las API keys (Gemini + OpenWeatherMap) nunca salen del backend. El frontend móvil nunca las ve.
- **Respuesta del LLM:** JSON estricto mapeado a `MoodPlaylistResponse`. Latencia mínima gracias a structured output.

---

## 🏗️ Arquitectura

```
App Móvil (React Native)
    │  POST /api/ai/mood      → { text: "Me acaba de dejar mi novia" }
    │  POST /api/ai/contextual → { latitude, longitude, localTime }
    ▼
Spring Boot Backend
    ├── [Contextual only] WeatherService → OpenWeatherMap API
    ├── [Contextual only] UserPreferences → PostgreSQL
    ├── AiService → Gemini Flash (Spring AI structured output)
    │     └── Recibe MoodPlaylistResponse { title, description, tags, genres, mood }
    └── RadioService → Radio Browser API (búsqueda por tags/genres)
    │  Devuelve MoodPlaylist { title, description, stations[] }
    ▼
App Móvil — Nueva pantalla ✨ IA
    ├── Mood Tuner: caja de texto → playlist resultado
    └── Contextual: botón "Para este momento" → playlist resultado
```

---

## 📦 Esquema JSON que devuelve Gemini

Spring AI mapea la respuesta directamente a esta clase Java:

```json
{
  "playlistTitle": "Lágrimas en la Autopista",
  "playlistDescription": "Para cuando la noche y la lluvia se convierten en compañía.",
  "tags": ["sad", "acoustic", "indie", "melancholic"],
  "genres": ["indie", "acoustic"],
  "mood": "melancholic"
}
```

---

## 🗺️ Issues de la V5

### #1 — Add Spring AI + Gemini dependency and configuration
Add `spring-ai-google-gemini` to `pom.xml`. Add `GEMINI_API_KEY` to `.env.example`, `docker-compose.yml` and `application.properties` as an environment variable. No business logic yet, just the dependency and config wired up correctly.

### #2 — Create MoodPlaylistResponse DTO and AI Service skeleton
Create the `MoodPlaylistResponse` Java class with fields: `playlistTitle`, `playlistDescription`, `tags` (List), `genres` (List), `mood`. Create `AiService.java` with empty method stubs for `getMoodPlaylist` and `getContextualPlaylist`. Create `AiController.java` with the two endpoint signatures (`POST /api/ai/mood` and `POST /api/ai/contextual`) wired to the service stubs, returning 501 Not Implemented for now.

### #3 — Implement Mood Tuner endpoint
Implement `getMoodPlaylist(String text)` in `AiService`. Design and write the system prompt that instructs Gemini to analyze the user's text and return a strict JSON matching `MoodPlaylistResponse`. Use Spring AI structured output to map the response directly to the DTO. Use the returned `tags` and `genres` to query Radio Browser API and return a final `MoodPlaylist` object (title + description + list of stations) to the mobile app.

### #4 — Integrate OpenWeatherMap API
Add `OPENWEATHER_API_KEY` to the environment config. Create `WeatherService.java` that calls `https://api.openweathermap.org/data/2.5/weather` with the user's coordinates and returns a simple `WeatherContext` object (temperature, condition description, e.g. "rainy", "sunny"). OpenWeatherMap has a free tier — no credit card needed.

### #5 — Implement Contextual Sintonizer endpoint
Implement `getContextualPlaylist(latitude, longitude, localTime)` in `AiService`. Fetch weather via `WeatherService`. Load user preferences from the database. Build a context prompt combining: time of day, weather condition, user's favorite genres and location. Call Gemini and return the playlist the same way as the Mood Tuner.

### #6 — New AI screen in the mobile app (structure + Mood Tuner UI)
Add a new "✨" tab to the bottom navigation. Build the screen with two sections: a text input for Mood Tuner with a submit button, and a "For this moment" button for the Contextual Sintonizer. Add a thinking animation (pulsing dots or shimmer) while waiting for the API response. Wire up only the Mood Tuner call for now.

### #7 — Connect Contextual Sintonizer to the AI screen
Wire up the "For this moment" button to `POST /api/ai/contextual`, passing the device's GPS coordinates and local time. When the response arrives, display the playlist title, empathetic description and station cards in the same result UI as the Mood Tuner.

### #8 — Playlist result UI — title, description and station cards
Design and implement the result section that appears after the AI responds: a large creative title, the empathetic description paragraph, and a vertical list of station cards reusing the existing `StationCard` component. Each card should be playable directly from this screen.

### #9 — Update Angular landing page
Add a new section to the landing showcasing the completed app: screenshots or a screen recording of the AI features, a headline highlighting the AI experience, and updated feature cards mentioning Mood Tuner and Contextual Sintonizer.

---

## 🔑 Variables de entorno nuevas

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# OpenWeatherMap
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

Ambas son gratuitas:
- Gemini: https://aistudio.google.com/apikey
- OpenWeatherMap: https://openweathermap.org/api (plan Free, no requiere tarjeta)

---

## 📋 System Prompt diseñado para el Mood Tuner

```
You are a music expert AI for a radio streaming app. 
The user will describe how they feel or what they are doing.
Your job is to translate that into radio-friendly music tags.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "playlistTitle": "creative evocative title in the user's language",
  "playlistDescription": "2-3 sentence empathetic description in the user's language",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "genres": ["genre1", "genre2"],
  "mood": "one word mood descriptor"
}

Rules:
- Tags must be valid Radio Browser API search terms (e.g. lofi, jazz, rock, acoustic, ambient, sad, happy, focus, sleep, workout)
- Generate 3-5 tags maximum
- Generate 1-2 genres maximum
- The title must be creative and evocative, not generic
- The description must be empathetic and match the user's language
- Return ONLY the JSON, no extra text
```

---

## 📋 System Prompt diseñado para el Contextual Sintonizer

```
You are a music expert AI for a radio streaming app.
You will receive a context package about the user's current situation.
Your job is to find the perfect radio station for this exact moment.

Context package format:
- Time: {hour}:00 ({timeOfDay})
- Weather: {weatherCondition}, {temperature}°C
- Location: {country/region}
- User's favorite genres: {genres}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "playlistTitle": "creative title reflecting the moment in the user's language",
  "playlistDescription": "2-3 sentence description explaining why this fits the moment",
  "tags": ["tag1", "tag2", "tag3"],
  "genres": ["genre1", "genre2"],
  "mood": "one word mood descriptor"
}

Rules:
- Consider the time of day (morning energy, afternoon focus, evening relaxation, night vibes)
- Consider the weather (rainy = introspective, sunny = upbeat, etc.)
- Blend the user's preferences with the contextual situation
- Tags must be valid Radio Browser API search terms
- Return ONLY the JSON, no extra text
```

---

## 🗒️ Notas adicionales

- Spring Boot version actual: 4.0.2 — verificar compatibilidad de Spring AI antes de implementar
- La nueva tab "✨ IA" será la 5ª en el bottom navigator (actualmente hay 4 + NowPlaying)
- El `StationCard` existente en HomeScreen es reutilizable sin cambios para mostrar los resultados
- **IMPORTANTE:** commitear este archivo para que no se pierda al cambiar de rama
