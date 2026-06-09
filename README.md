# OCCRE San Andrés — App Móvil

Aplicación móvil oficial de la **Oficina de Control, Circulación y Residencia (OCCRE)** de San Andrés Islas, Colombia.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | Ionic + Angular (modules, standalone: false) | Ionic 8 / Angular 20 |
| **Backend** | Node.js + Express | Express 4 |
| **Base de datos** | MySQL | 8+ |
| **Autenticación** | JWT (jsonwebtoken + bcryptjs) | — |
| **Traducciones** | Sistema i18n propio (TranslatePipe + TranslationService) | 6 idiomas |
| **Plugins móviles** | Capacitor (Browser, Share, Geolocation, LocalNotifications, Push, etc.) | Capacitor 8 |
| **Plataformas** | Android + iOS (Capacitor) | — |

---

## Estructura del proyecto

```
my-occre-app/
├── src/                              # Frontend Ionic/Angular
│   ├── app/
│   │   ├── core/services/            # Servicios específicos (tourism-card, appointments, etc.)
│   │   ├── features/                 # Módulos lazy-load
│   │   │   ├── auth/                 #   Login, register, recover-password
│   │   │   ├── home/                 #   Inicio (auth required)
│   │   │   ├── settings/             #   Configuración (es/en)
│   │   │   ├── tourism-card/         #   Tarjeta de Turismo (5 páginas públicas)
│   │   │   │   ├── tarjeta-turismo/  #     Formulario multi-paso
│   │   │   │   ├── pago-turismo/     #     Pago (2x2 grid métodos)
│   │   │   │   ├── recibo-turismo/   #     Recibo + recordatorios + ubicación
│   │   │   │   ├── consultar-tarjeta-turismo/  # Búsqueda
│   │   │   │   └── validar-tarjeta-turismo/    # Validación por código o QR
│   │   │   ├── procedures/           # Trámites
│   │   │   ├── requests/             # Solicitudes/radicados
│   │   │   ├── appointments/         # Citas
│   │   │   ├── announcements/        # Avisos
│   │   │   ├── notifications/        # Notificaciones
│   │   │   ├── profile/              # Perfil
│   │   │   ├── welcome/              # Pantalla de bienvenida
│   │   │   ├── help-contact/         # Ayuda y contacto
│   │   │   ├── legal/                # Legal
│   │   │   └── data-protection/      # Protección de datos
│   │   ├── guards/                   # AuthGuard, RoleGuard
│   │   ├── interceptors/             # Auth, Network, Cache interceptors
│   │   ├── services/                 # Servicios globales (auth, translation, etc.)
│   │   ├── pipes/                    # TranslatePipe (i18n)
│   │   └── shared/                   # SharedModule (componentes reutilizables)
│   ├── environments/                 # Config API URL (dev, tunnel, prod)
│   └── theme/                        # Variables SCSS globales
├── backend/                          # Backend Node.js/Express
│   ├── src/
│   │   ├── config/database.js        # Pool MySQL + ensureDatabase()
│   │   ├── controllers/              # Lógica de negocio (11 controladores)
│   │   ├── middleware/               # Auth JWT, validación, upload
│   │   ├── routes/                   # Rutas API (11 módulos)
│   │   ├── seeders/                  # Datos semilla (8 seeders)
│   │   └── server.js                 # Entry point + creación automática de tablas
│   └── .env                          # Variables de entorno
├── android/                          # Proyecto Android (Capacitor)
├── ios/                              # Proyecto iOS (Capacitor)
├── capacitor.config.ts               # Config Capacitor
├── ionic.config.json                 # Config Ionic
└── angular.json                      # Config Angular
```

---

## Comandos principales

### 🔥 Un solo comando (frontend + backend)

```bash
npm run dev            # frontend (localhost:8100) + backend (localhost:3000)
npm run dev:tunnel     # frontend con túnel + backend local
```

### 🖥️ Backend (Express)

```bash
cd backend
npm install            # solo la primera vez
npm start              # node src/server.js → http://localhost:3000
npm run dev            # node --watch (hot-reload)

# Puerto: 3000 (configurable en backend/.env)
```

### 🎨 Frontend (Ionic/Angular)

```bash
# Servidor de desarrollo
npm start              # ng serve → http://localhost:8100
npm run start:tunnel   # ng serve con API del túnel

# Build
npm run build          # genera en www/ (API → localhost)
npm run build:tunnel   # genera en www/ (API → túnel)

# Capacitor (Android/iOS)
ionic cap sync
ionic cap open android
ionic cap open ios
```

### 🗄️ Base de datos

```bash
# No necesitas crear la BD manualmente.
# El backend crea automáticamente la base de datos y todas las tablas al iniciar.
# Solo necesitas MySQL corriendo en localhost:3306.
mysql -u root -p      # verifica que MySQL esté funcionando
```

---

## API Endpoints

### Autenticación y Usuarios

| Ruta | Métodos | Auth | Descripción |
|------|---------|------|-------------|
| `/api/auth/*` | POST, GET, PUT | JWT | Login, register, perfil |
| `/api/notifications/*` | GET, POST, PUT, DELETE | JWT | Notificaciones del usuario |
| `/api/devices/*` | POST, DELETE | JWT | Tokens de dispositivos |

### Trámites y Solicitudes

| Ruta | Métodos | Auth | Descripción |
|------|---------|------|-------------|
| `/api/procedures/*` | GET | JWT | Tipos de trámite |
| `/api/requests/*` | GET, POST, PUT | JWT | Solicitudes/radicados |
| `/api/documents/*` | GET, POST, DELETE | JWT | Documentos adjuntos |
| `/api/certificates/*` | GET, POST | JWT | Certificados |

### Citas

| Ruta | Métodos | Auth | Descripción |
|------|---------|------|-------------|
| `/api/appointments/*` | GET, POST, PUT, DELETE | JWT | Citas presenciales |

### Administración

| Ruta | Métodos | Auth | Descripción |
|------|---------|------|-------------|
| `/api/admin/*` | GET | JWT + admin | Dashboard, reportes |
| `/api/announcements/*` | GET | JWT | Avisos |

### Tarjeta de Turismo (público — sin AuthGuard)

| Ruta | Método | Descripción |
|------|--------|-------------|
| `GET /api/tourism-card/tariff` | GET | Tarifa activa actual |
| `POST /api/tourism-card/quote` | POST | Cotizar monto a pagar |
| `POST /api/tourism-card/card` | POST | Crear solicitud de tarjeta |
| `POST /api/tourism-card/card/:code/payment/init` | POST | Inicializar pago |
| `GET /api/tourism-card/card/:code/payment/status` | GET | Estado del pago |
| `GET /api/tourism-card/card/:code/receipt` | GET | Datos del recibo |
| `GET /api/tourism-card/card/:code/verify` | GET | Validar tarjeta por código |
| `GET /api/tourism-card/card/verify/qr/:qr_token` | GET | Validar tarjeta por token QR |
| `POST /api/tourism-card/card/:code/share-location` | POST | Compartir ubicación voluntaria |
| `POST /api/tourism-card/search` | POST | Buscar tarjeta (código + documento) |
| `POST /api/tourism-card/payment/webhook` | POST | Webhook de pasarela de pago |
| `POST /api/tourism-card/expired/check` | POST | Marcar tarjetas vencidas |

### Health Check

| Ruta | Método | Descripción |
|------|--------|-------------|
| `GET /api/health` | GET | Health check del servidor |

---

## Sistema de Internacionalización (i18n)

- **6 idiomas**: español (`es`), inglés (`en`), francés (`fr`), portugués (`pt`), italiano (`it`), chino mandarín (`zh`)
- **Idioma por defecto**: `es`
- **Persistencia**: `localStorage` con clave `occre_lang`
- **Mecanismo**: `TranslationService` + `TranslatePipe` (impuro) — sin dependencias externas
- **Traducciones**: almacenadas en `translation.service.ts` como constante `TRANSLATIONS`, con bundles FR/PT/IT/ZH fusionados via `Object.assign`
- **Selectores de idioma**:
  - **Settings** (solo `es`/`en`): usuarios logueados
  - **Páginas de turismo** (los 6 idiomas): selector tipo dropdown con icono `language-outline`, esquina superior derecha, fondo neutro (`--app-surface`)

---

## Tarjeta de Turismo — Flujo Completo

1. **Formulario multi-paso** (`/tarjeta-turismo`): datos personales → viaje → hospedaje → confirmación → éxito
2. **Pago** (`/tarjeta-turismo/pago/:code`): grid 2x2 (Bancolombia, Nequi, Tarjeta, PSE)
3. **Recibo** (`/tarjeta-turismo/recibo/:code`): comprobante + recordatorios + ubicación voluntaria
4. **Consultar** (`/consultar-tarjeta-turismo`): buscar por código + documento
5. **Validar** (`/validar-tarjeta-turismo/:code` o `/validar-tarjeta-turismo/qr/:qr_token`): verificar estado

### Características del backend:

- **Código único**: `OCCRE-TT-{año}-{6 dígitos}` con verificación de unicidad en DB (loop `do...while`)
- **Recibo**: `RC-{año}-{6 dígitos secuencial}` generado en webhook
- **Referencia de pago**: `PAY-{code}` almacenada en la tarjeta
- **Token QR**: UUID v4 para validación vía endpoint dedicado
- **Máquina de estados**: `Pendiente → Pagado → Vencida`
- **Recordatorios automáticos**: al aprobar el pago, se crean filas en `tourist_return_reminders` según preferencias (email, SMS, push)
- **Expiración automática**: tarea programada cada hora que marca tarjetas como `Vencida` si `expires_at < NOW()`

---

## Diagrama de Base de Datos (Tablas de Turismo)

| Tabla | Propósito |
|-------|-----------|
| `tourist_cards` | Solicitudes de tarjeta de turismo (datos personales, viaje, hospedaje, pago) |
| `tourist_card_payments` | Intentos de pago por tarjeta |
| `tourist_card_receipts` | Recibos generados post-pago |
| `tourist_location_events` | Eventos de ubicación voluntaria |
| `tourist_location_consents` | Registro de consentimiento de ubicación |
| `tourist_return_reminders` | Recordatorios programados (email/SMS/push) |
| `tourist_device_tokens` | Tokens de dispositivo para push a visitantes |
| `tourism_tariffs` | Tarifas activas (con vigencia por fecha) |

---

## Variables de entorno clave

### Backend (`backend/.env`)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host MySQL | `localhost` |
| `DB_PORT` | Puerto MySQL | `3306` |
| `DB_USER` | Usuario MySQL | `root` |
| `DB_PASSWORD` | Contraseña MySQL | — |
| `DB_NAME` | Nombre de la BD | `occre_app` |
| `JWT_SECRET` | Secreto para firmar tokens | — |
| `FRONTEND_URL` | Origen CORS permitido | `*` (demo) |
| `PAYMENT_GATEWAY_URL` | URL de pasarela de pago | — |

### Frontend (`src/environments/environment*.ts`)

| Archivo | Uso | URL del API |
|---------|-----|-------------|
| `environment.ts` | `npm start` / `npm run dev` | `http://localhost:3000/api` |
| `environment.tunnel.ts` | `npm run start:tunnel` | `https://*.trycloudflare.com/api` |
| `environment.prod.ts` | `npm run build --prod` | `https://api.occre.gov.co/api` |

---

## Usuario admin por defecto

- **Email:** `owen@occre.app`
- **Contraseña:** `owen12345`

---

## Demo remota

Para compartir la app con personas externas sin publicar en producción, usa túneles Cloudflare o ngrok. Revisa `INSTRUCCIONES_DEMO_REMOTA.md` para el paso a paso completo.
