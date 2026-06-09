param(
  [string]$BackendUrl,
  [string]$FrontendUrl
)

$root = "C:\Users\owen\Documents\my-occre-app"
$envFile = "$root\src\environments\environment.ts"

function Write-Step($n, $msg) { Write-Host "[$n/4] $msg" -ForegroundColor Yellow }
function Write-OK($msg) { Write-Host "  OK $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  !! $msg" -ForegroundColor Magenta }

Clear-Host
Write-Host @"

 ============================================
   OCCRE — DEMO REMOTA
   Comparte la app con un link publico
 ============================================

"@ -ForegroundColor Cyan

# Verificar cloudflared o ngrok
$tunnel = $null
if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
  $tunnel = "cloudflared"
} elseif (Get-Command ngrok -ErrorAction SilentlyContinue) {
  $tunnel = "ngrok"
}

if (-not $tunnel) {
  Write-Warn "No encontre cloudflared ni ngrok."
  Write-Warn "Instala cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
  Write-Warn "O ngrok: https://ngrok.com/download"
  $r = Read-Host "Continuar de todas formas? (s/N)"
  if ($r -ne 's') { exit }
} else {
  Write-OK "Usando $tunnel"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ABRIENDO 4 TERMINALES" -ForegroundColor Cyan
Write-Host "  NO CIERRES NINGUNA VENTANA" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Terminal 1 - Backend
Write-Step 1 "Backend Express"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; Write-Host '=== BACKEND EXPRESS (puerto 3000) ===' -ForegroundColor Green; npm start"

Start-Sleep -Seconds 2

# Terminal 2 - Tunel backend
Write-Step 2 "Tunel publico del backend"
if ($tunnel -eq "cloudflared") {
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== TUNEL BACKEND (Cloudflare) ===' -ForegroundColor Green; Write-Host 'Espera la URL...' -ForegroundColor Yellow; cloudflared tunnel --url http://localhost:3000"
} else {
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== TUNEL BACKEND (ngrok) ===' -ForegroundColor Green; ngrok http 3000"
}

Write-Host ""
Write-Host "  Espera a que aparezca la URL en la Terminal 2 (Tunel Backend)" -ForegroundColor Yellow
Write-Host "  La URL se ve como: https://xxxx.trycloudflare.com" -ForegroundColor Yellow
Start-Sleep -Seconds 8
if (-not $BackendUrl) {
  $BackendUrl = Read-Host "  Pega la URL publica del backend (ENTER si no aparece aun)"
}
if (-not $BackendUrl) {
  $BackendUrl = Read-Host "  Pega la URL (ej: https://xxxx.trycloudflare.com)"
}

# Terminal 3 - Actualizar environment.ts
Write-Step 3 "Configurando environment.ts"
$newApiUrl = "$BackendUrl/api"
$content = Get-Content $envFile -Raw
$newContent = $content -replace "(apiUrl:\s*')https?://[^']*(')", "`$1$newApiUrl`$2"
Set-Content $envFile -Value $newContent
Write-OK "apiUrl = $newApiUrl"

# Terminal 4 - Ionic
Write-Step 4 "Frontend Ionic"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; Write-Host '=== FRONTEND IONIC (puerto 8100) ===' -ForegroundColor Green; npx ionic serve"

Start-Sleep -Seconds 3

# Terminal 5 (extra) - Tunel frontend
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  INICIANDO TUNEL DEL FRONTEND" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

if ($tunnel -eq "cloudflared") {
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== TUNEL FRONTEND (Cloudflare) ===' -ForegroundColor Green; Write-Host 'Espera la URL...' -ForegroundColor Yellow; cloudflared tunnel --url http://localhost:8100"
} else {
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== TUNEL FRONTEND (ngrok) ===' -ForegroundColor Green; ngrok http 8100"
}

Start-Sleep -Seconds 8
if (-not $FrontendUrl) {
  $FrontendUrl = Read-Host "  Pega la URL publica del frontend (ENTER si no aparece aun)"
}
if (-not $FrontendUrl) {
  $FrontendUrl = Read-Host "  Pega la URL (ej: https://xxxx.trycloudflare.com)"
}

# Resumen final
Clear-Host
Write-Host @"

 ============================================
         DEMO REMOTA INICIADA
 ============================================

"@ -ForegroundColor Cyan

Write-Host "  Envia ESTO al tester:" -ForegroundColor Green
Write-Host "  " -NoNewline
Write-Host "App OCCRE - Demo temporal" -ForegroundColor White
Write-Host "  Abre: " -NoNewline
Write-Host "$FrontendUrl" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "  Admin: owen@occre.app / owen12345" -ForegroundColor White
Write-Host ""
Write-Host "  Terminales abiertas:" -ForegroundColor Cyan
Write-Host "  1 - Backend Express  (localhost:3000)" -ForegroundColor Gray
Write-Host "  2 - Tunel del backend  ->  $BackendUrl" -ForegroundColor Gray
Write-Host "  3 - Frontend Ionic  (localhost:8100)" -ForegroundColor Gray
Write-Host "  4 - Tunel del frontend ->  $FrontendUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "  AVISO: NO cierres ninguna terminal mientras dure la demo" -ForegroundColor Red
Write-Host "  AVISO: Las URLs cambian cada vez que reinicias" -ForegroundColor Yellow
Write-Host "  Guia completa en DEMO_REMOTA.md" -ForegroundColor Cyan
Write-Host ""

Read-Host "  Presiona ENTER para cerrar este panel (las terminales seguiran abiertas)"

Write-Host "`nBackend URL: $BackendUrl" -ForegroundColor Green
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Green
