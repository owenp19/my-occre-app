# Demo Remota Temporal

Compartir la app OCCRE con personas externas mediante URL pública temporal usando Cloudflare Tunnel o ngrok.

> ⚠️ **IMPORTANTE:** El backend de este proyecto es **Node.js/Express** (NO Laravel).  
> Los comandos están adaptados al stack real.

---

## Atajo: Script automático

```powershell
.\demo.ps1
```

Esto abre las 4 terminales y te guía paso a paso. Si ya sabes las URLs:

```powershell
.\demo.ps1 -BackendUrl https://xxx.trycloudflare.com -FrontendUrl https://yyy.trycloudflare.com
```

---

## Manual: Requisitos previos

| Herramienta | Windows | macOS / Linux |
|-------------|---------|---------------|
| **Node.js** | `winget install OpenJS.NodeJS.LTS` | `brew install node` |
| **MySQL** | XAMPP / MySQL Installer | `brew install mysql` |
| **Ionic CLI** | `npm install -g @ionic/cli` | `npm install -g @ionic/cli` |
| **Cloudflared** | [Descargar .exe](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) | `brew install cloudflare/cloudflare/cloudflared` |
| **Ngrok** (alternativa) | [Descargar .exe](https://ngrok.com/download) | `brew install ngrok` o `snap install ngrok` |

---

## Paso a paso

Debes abrir **4 terminales** que deben permanecer abiertas todo el tiempo que dure la demo.

---

### Terminal 1 — Backend (Express)

```bash
cd C:\Users\owen\Documents\my-occre-app\backend

# Asegúrate que MySQL esté corriendo (XAMPP, MySQL Workbench, etc.)

# Crear la base de datos (solo la primera vez)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS occre_app;"

# Iniciar el backend
npm start
```

- Puerto: `3000`
- URL local: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`
- Las tablas se crean automáticamente al iniciar
- Debe mostrar: `[Server] API corriendo en http://localhost:3000`

---

### Terminal 2 — Túnel público para el backend

Elige **una** opción:

#### Opción A: Cloudflare Tunnel (recomendado)

```bash
cloudflared tunnel --url http://localhost:3000
```

Genera una URL como: `https://backend-xxxx.trycloudflare.com`

Anótala: **URL_BACKEND_PUBLICA = ______________________**

#### Opción B: Ngrok (alternativa)

```bash
ngrok http 3000
```

Genera una URL como: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

Anótala: **URL_BACKEND_PUBLICA = ______________________**

---

### Terminal 3 — Frontend (Ionic)

Antes de iniciar, edita la URL del backend en el archivo:

**`src/environments/environment.ts`**

```typescript
export const environment = {
  production: false,
  // CAMBIA esta URL por la URL pública del túnel de Cloudflare/ngrok
  apiUrl: 'https://URL_BACKEND_PUBLICA/api'
  //                ↑ reemplaza con la URL que anotaste arriba
};
```

Luego inicia Ionic:

```bash
cd C:\Users\owen\Documents\my-occre-app

npx ionic serve
```

- Puerto: `8100`
- URL local: `http://localhost:8100`
- La app se abrirá automáticamente en el navegador

---

### Terminal 4 — Túnel público para el frontend

Elige **una** opción:

#### Opción A: Cloudflare Tunnel (recomendado)

```bash
cloudflared tunnel --url http://localhost:8100
```

Genera una URL como: `https://frontend-xxxx.trycloudflare.com`

Anótala: **URL_FRONTEND_PUBLICA = ______________________**

#### Opción B: Ngrok (alternativa)

```bash
ngrok http 8100
```

Genera una URL como: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

Anótala: **URL_FRONTEND_PUBLICA = ______________________**

---

## Resumen de terminales

| Terminal | Proceso | Comando | Puerto local |
|----------|---------|---------|-------------|
| **1** | Backend Express | `cd backend && npm start` | `localhost:3000` |
| **2** | Túnel del backend | `cloudflared tunnel --url http://localhost:3000` | — |
| **3** | Frontend Ionic | `npx ionic serve` | `localhost:8100` |
| **4** | Túnel del frontend | `cloudflared tunnel --url http://localhost:8100` | — |

> ⚠️ **Las 4 terminales deben permanecer abiertas** mientras la persona externa prueba la app.  
> Si cierras alguna, la demo se interrumpe.

---

## Enviar al tester externo

Envía este mensaje al tester:

> **App OCCRE — Demo temporal**
>
> Abre este enlace desde tu navegador (celular o computador):
> **URL_FRONTEND_PUBLICA**
>
> Usuario admin: `owen@occre.app`
> Contraseña: `owen12345`
>
> También puedes registrar un usuario nuevo desde la app.

---

## Verificación de funcionamiento

1. Abre la `URL_FRONTEND_PUBLICA` desde el navegador del tester
2. La app debe cargar completamente
3. Prueba:
   - Login con `owen@occre.app` / `owen12345`
   - Registrar un usuario nuevo
   - Navegar entre pantallas (Home, Perfil, Notificaciones)
   - Probar funcionalidades (si aplica)
4. En `Terminal 1`, revisa los logs del backend en busca de errores
5. En el navegador, abre **F12 → Consola** para detectar errores CORS, 404, 500

---

## Solución de problemas comunes

### Error CORS
- Verifica que `FRONTEND_URL` en `backend/.env` esté en `*`
- Después de cambiar, reinicia el backend (Ctrl+C y `npm start`)

### Error 404 en API
- Confirma que la URL en `environment.ts` termina en `/api`
- Ejemplo correcto: `https://backend-xxx.trycloudflare.com/api`

### Error 502 / Bad Gateway
- Cloudflare/ngrok no puede alcanzar tu servidor local
- Verifica que el backend/frontend esté corriendo
- Verifica que el puerto coincida

### MySQL connection refused
- Asegúrate que MySQL esté corriendo
- Verifica credenciales en `backend/.env` (DB_HOST, DB_USER, DB_PASSWORD)

### Token JWT inválido
- Cierra sesión y vuelve a iniciar
- Si persiste, limpia los datos de la app en el navegador

---

## Para volver a levantar la demo en otro momento

1. Abre las **4 terminales** nuevamente
2. En **Terminal 1** (backend): `cd backend && npm start`
3. En **Terminal 2** (túnel backend): `cloudflared tunnel --url http://localhost:3000`
   - Anota la nueva URL del backend
4. Edita `src/environments/environment.ts`:
   - Cambia `apiUrl` por la nueva URL del backend
5. En **Terminal 3** (frontend): `npx ionic serve`
6. En **Terminal 4** (túnel frontend): `cloudflared tunnel --url http://localhost:8100`
   - Anota la nueva URL del frontend
7. Envía la URL del frontend al tester
8. ¡Listo!

> ⚠️ **Cada vez que levantas los túneles, las URLs cambian** (a menos que tengas una cuenta paga de Cloudflare/ngrok).

---

## Archivos modificados para la demo

| Archivo | Cambio |
|---------|--------|
| `src/environments/environment.ts` | `apiUrl` apunta a la URL pública del túnel del backend |
| `backend/.env` | `FRONTEND_URL=*` para permitir cualquier origen CORS |
| `backend/src/server.js` | CORS adaptado para soportar `*` como origen |

---

## Seguridad (modo demo)

| Aspecto | Configuración demo | Recomendación producción |
|---------|-------------------|-------------------------|
| **CORS** | `FRONTEND_URL=*` | Lista blanca de dominios específicos |
| **JWT** | Secreto en `.env` | Usar variable de entorno del servidor |
| **MySQL** | root sin contraseña | Usuario con permisos restringidos |
| **Túnel** | Cloudflare/ngrok gratis | Hosting con SSL propio |

> ⚠️ No uses esta configuración demo en producción. Es solo para pruebas temporales.
