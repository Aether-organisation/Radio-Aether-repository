# Radio Aether

![Version](https://img.shields.io/badge/Version-v4.0.0--ORBIT-646cff?style=for-the-badge)
![Project Status](https://img.shields.io/badge/Status-En%20Desarrollo-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-Academic-lightgrey?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Java_Spring_Angular_React_Native-orange?style=for-the-badge)

> Proyecto Académico · IES Puerto de la Cruz · 2º DAM

---

## 📖 ¿Qué es Radio Aether?

Radio Aether es una plataforma de streaming de radio en línea compuesta por una **aplicación móvil** (Android/iOS), un **backend REST** y, a partir de esta versión, una **web pública** y un sistema de gestión empresarial con **Odoo**. Permite descubrir emisoras de todo el mundo, recibir recomendaciones personalizadas por géneros y ubicación, y guardar favoritos.

---

## 🏗️ Arquitectura del Sistema (v4 - ORBIT)

```
Cliente móvil (Expo)          Cliente web (Angular)
        │                             │
        └──────────┬──────────────────┘
                   │ HTTPS
                   ▼
             [ Nginx + SSL ]          ← Reverse proxy / SSL termination
                   │
        ┌──────────┼──────────────┐
        ▼          ▼              ▼
   [ Backend ]  [ Angular ]   [ Odoo ]
   Spring Boot   (estático)   ERP :8069
     :8080                        │
        │                         │ webhook
        └──────────────────────────┘
                   │
             [ SQLite DB ]
```

Todo el sistema (excepto el cliente móvil) corre dentro de **Docker Compose**, con Nginx como único punto de entrada en HTTPS.

---

## ✅ Funcionalidades implementadas

### 🔐 Seguridad y Autenticación
- JWT stateless con Spring Security
- BCrypt para hashing de contraseñas
- RBAC: roles `USER`, `ADMIN`, `B2B`
- Tokens almacenados en Secure Storage del dispositivo (Keychain/Keystore)

### 📱 Aplicación Móvil (React Native + Expo)
- Registro e inicio de sesión
- Encuesta inicial de géneros musicales (redirige automáticamente si no está completada)
- **Home:** emisoras cercanas por geolocalización + recomendaciones personalizadas por géneros
- **Búsqueda:** por nombre, país o género (Radio Browser API)
- **Biblioteca:** lista de emisoras favoritas
- **Perfil:** foto, nombre, cambio de contraseña
- MiniPlayer persistente + PlayerScreen en pantalla completa
- Streaming de audio con `expo-av`

### 🌍 Integración con Radio Browser API
- +30.000 emisoras de todo el mundo
- Geolocalización con fórmula de Haversine para encontrar las más cercanas
- Caché en memoria al arrancar el servidor para minimizar llamadas externas

### 📴 Modo Offline *(nuevo en v4)*
- Base de datos local en el dispositivo con `expo-sqlite`
- Favoritos y últimas emisoras vistas disponibles sin conexión
- La app detecta si hay red y cambia entre datos locales y remotos automáticamente

### ⭐ Emisoras Destacadas *(nuevo en v4)*
- Las emisoras pueden solicitar aparecer en la sección "Destacadas" de la app
- Gestión de solicitudes a través del módulo Odoo personalizado
- Aprobación manual por el administrador en el panel de Odoo
- Webhook Odoo → Spring Boot para activar el destacado automáticamente
- Las emisoras destacadas expiran tras un tiempo predefinido (`@Scheduled`)

### 🌐 Web Pública Angular *(nuevo en v4)*
- Landing page de la plataforma
- Formulario de solicitud para que emisoras pidan ser destacadas
- Servida como contenido estático por Nginx

### 🐳 Infraestructura Docker *(nuevo en v4)*
- Todo el backend, web y Odoo corren en contenedores con un único `docker-compose up`
- Nginx como reverse proxy con SSL (HTTPS) 
- Certificados SSL gestionados con `mkcert`

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
|---|---|---|
| **Backend** | Java 17 + Spring Boot 4 | API REST, seguridad y lógica de negocio |
| **Frontend móvil** | React Native 0.81 + Expo 54 | App híbrida Android/iOS |
| **Frontend web** | Angular | Landing page y formulario de solicitud |
| **Base de datos backend** | PostgreSQL | Persistencia del servidor en Docker |
| **Base de datos móvil** | SQLite (`expo-sqlite`) | Almacenamiento local en el dispositivo para modo offline |
| **ERP** | Odoo | Gestión de solicitudes de emisoras destacadas |
| **Proxy / SSL** | Nginx | Reverse proxy, SSL termination, servido de estáticos |
| **Contenedores** | Docker + Docker Compose | Orquestación de todos los servicios |
| **Seguridad** | Spring Security + JWT | Protección de endpoints y cifrado |
| **API externa** | Radio Browser API | Catálogo global de emisoras |

---

## ⚙️ Instrucciones de Ejecución

### Con Docker (backend + web + Odoo)

Necesitas **Docker** y **Docker Compose** instalados.

```bash
docker-compose up --build
```

Los servicios estarán disponibles en:
- `https://localhost` → Web Angular
- `https://localhost/api` → Backend Spring Boot
- `https://localhost:8069` → Panel de Odoo

### App Móvil (Expo)

El frontend móvil se levanta de forma independiente. Necesitas **Node.js** y la app **Expo Go** en tu móvil.

```bash
cd frontend/aether-mobile
npm install
npx expo start
```

Escanea el código QR con tu móvil. Asegúrate de que el móvil y el PC están en la **misma red WiFi**.

> **Nota:** Si usas un móvil físico, edita `src/api/axios.ts` y cambia `localhost` por la IP local de tu PC (ej: `192.168.1.X`).

---

## 📁 Estructura del Repositorio

```
Radio-Aether-repository/
├── backend/
│   └── RadioAether/          # Spring Boot
├── frontend/
│   └── aether-mobile/        # React Native + Expo
├── web/                      # Angular (v4)
├── odoo/                     # Módulo Odoo personalizado (v4)
├── nginx/                    # Configuración Nginx + SSL (v4)
├── docker-compose.yml        # Orquestación (v4)
├── PLANNING_V4.md            # Documento de planificación v4
└── README.md
```

---

## 🗺️ Historial de versiones

| Versión | Nombre | Descripción |
|---|---|---|
| v1 | Genesis | Auth JWT, RBAC, cliente móvil base, SQLite |
| v2 | — | Mejoras de base de datos y persistencia |
| v3 | — | Geolocalización, Radio Browser API, favoritos, búsqueda, encuesta, perfil |
| **v4** | **ORBIT** | **Web Angular, Odoo, Destacados, Docker, Nginx + SSL** |

---

## 👥 Autores

Desarrollado con ❤️ y ☕ por:

- **Romén Gilberto García Gómez** — [@PRORIX](https://github.com/PRORIX)
- **Marcos Hernández Oramas** — [@mahoramas](https://github.com/mahoramas)

---

> *Proyecto Académico · IES Puerto de la Cruz · 2º DAM*
