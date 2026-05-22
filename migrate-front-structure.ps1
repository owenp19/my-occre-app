# migrate-front-structure.ps1
# Migración segura para proyecto Angular/Ionic frontend OCCRE.
# Crea estructura core/shared/features.
# Mueve solamente home, login, register y welcome.
# No crea archivos de backend.
# Las carpetas técnicas quedan vacías.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Get-Location
$AppRoot = Join-Path $ProjectRoot "src\app"

# Cambia esto a $true si quieres que Git conserve carpetas vacías.
# Si lo dejas en $false, las carpetas quedan realmente vacías.
$CreateGitKeep = $false

if (!(Test-Path (Join-Path $ProjectRoot "package.json"))) {
    throw "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
}

if (!(Test-Path $AppRoot)) {
    throw "No se encontró src/app. Verifica que estés en la raíz correcta."
}

$TimeStamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $ProjectRoot ".migration-backup\$TimeStamp"
$BackupApp = Join-Path $BackupRoot "app-before-migration"

Write-Host ""
Write-Host "Creando backup de src/app..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
Copy-Item -Path $AppRoot -Destination $BackupApp -Recurse -Force
Write-Host "Backup creado en: $BackupApp" -ForegroundColor Green

function New-SafeDirectory {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (!(Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host "Carpeta creada: $Path" -ForegroundColor Green
    }
}

function Move-ExistingFolder {
    param (
        [Parameter(Mandatory = $true)]
        [string]$SourceRelative,

        [Parameter(Mandatory = $true)]
        [string]$TargetRelative
    )

    $Source = Join-Path $AppRoot $SourceRelative
    $Target = Join-Path $AppRoot $TargetRelative

    if (!(Test-Path $Source)) {
        Write-Host "No existe src/app/$SourceRelative. Se omite." -ForegroundColor DarkGray
        return
    }

    New-SafeDirectory -Path $Target

    Write-Host ""
    Write-Host "Moviendo src/app/$SourceRelative -> src/app/$TargetRelative" -ForegroundColor Yellow

    $Items = Get-ChildItem -LiteralPath $Source -Force

    foreach ($Item in $Items) {
        $Destination = Join-Path $Target $Item.Name

        if (Test-Path $Destination) {
            $BackupName = "$($Item.Name).backup-$TimeStamp"
            $BackupPath = Join-Path $Target $BackupName

            Write-Host "Conflicto detectado: $Destination" -ForegroundColor DarkYellow
            Write-Host "El archivo existente se conserva como: $BackupName" -ForegroundColor DarkYellow

            Move-Item -LiteralPath $Destination -Destination $BackupPath -Force
        }

        Move-Item -LiteralPath $Item.FullName -Destination $Destination -Force
    }

    $Remaining = Get-ChildItem -LiteralPath $Source -Force -ErrorAction SilentlyContinue

    if ($null -eq $Remaining -or $Remaining.Count -eq 0) {
        Remove-Item -LiteralPath $Source -Force
    }
}

function Write-Utf8NoBom {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

function Update-ProjectReferences {
    Write-Host ""
    Write-Host "Actualizando rutas internas..." -ForegroundColor Cyan

    $Replacements = @(
        @{
            From = "./login/"
            To   = "./features/auth/login/"
        },
        @{
            From = "./register/"
            To   = "./features/auth/register/"
        },
        @{
            From = "./home/"
            To   = "./features/home/"
        },
        @{
            From = "./welcome/"
            To   = "./features/welcome/"
        },

        @{
            From = "./login/login.module"
            To   = "./features/auth/login/login.module"
        },
        @{
            From = "./register/register.module"
            To   = "./features/auth/register/register.module"
        },
        @{
            From = "./home/home.module"
            To   = "./features/home/home.module"
        },
        @{
            From = "./welcome/welcome.module"
            To   = "./features/welcome/welcome.module"
        },

        @{
            From = "./login/login-routing.module"
            To   = "./features/auth/login/login-routing.module"
        },
        @{
            From = "./register/register-routing.module"
            To   = "./features/auth/register/register-routing.module"
        },
        @{
            From = "./home/home-routing.module"
            To   = "./features/home/home-routing.module"
        },
        @{
            From = "./welcome/welcome-routing.module"
            To   = "./features/welcome/welcome-routing.module"
        }
    )

    $Files = Get-ChildItem -Path $AppRoot -Recurse -File |
        Where-Object {
            $_.Extension -in ".ts", ".html", ".scss", ".css", ".json"
        }

    foreach ($File in $Files) {
        $OriginalContent = Get-Content -LiteralPath $File.FullName -Raw
        $NewContent = $OriginalContent

        foreach ($Replacement in $Replacements) {
            $NewContent = $NewContent.Replace($Replacement.From, $Replacement.To)
        }

        if ($NewContent -ne $OriginalContent) {
            Write-Utf8NoBom -Path $File.FullName -Content $NewContent
            Write-Host "Actualizado: $($File.FullName)" -ForegroundColor Green
        }
    }
}

function Add-GitKeepIfNeeded {
    param (
        [string[]]$Folders
    )

    if (-not $CreateGitKeep) {
        return
    }

    foreach ($Folder in $Folders) {
        $FullPath = Join-Path $AppRoot $Folder

        if (Test-Path $FullPath) {
            $Items = Get-ChildItem -LiteralPath $FullPath -Force

            if ($Items.Count -eq 0) {
                New-Item -ItemType File -Path (Join-Path $FullPath ".gitkeep") -Force | Out-Null
            }
        }
    }
}

function Show-OldReferences {
    Write-Host ""
    Write-Host "Revisando si quedaron rutas viejas..." -ForegroundColor Cyan

    $Patterns = @(
        "./login/",
        "./register/",
        "./home/",
        "./welcome/",
        "./login/login.module",
        "./register/register.module",
        "./home/home.module",
        "./welcome/welcome.module"
    )

    $Files = Get-ChildItem -Path $AppRoot -Recurse -File |
        Where-Object {
            $_.Extension -in ".ts", ".html", ".scss", ".css", ".json"
        }

    $Found = $false

    foreach ($File in $Files) {
        $Content = Get-Content -LiteralPath $File.FullName -Raw

        foreach ($Pattern in $Patterns) {
            if ($Content.Contains($Pattern)) {
                $Found = $true
                Write-Host "Pendiente: '$Pattern' en $($File.FullName)" -ForegroundColor Red
            }
        }
    }

    if (-not $Found) {
        Write-Host "No se encontraron rutas viejas comunes." -ForegroundColor Green
    }
}

# 1. Crear estructura general del frontend

$Folders = @(
    "core",
    "core\models",
    "core\services",
    "core\data",
    "core\guards",
    "core\interceptors",

    "shared",
    "shared\components",
    "shared\pipes",
    "shared\directives",

    "features",

    "features\auth",
    "features\auth\login",
    "features\auth\register",

    "features\welcome",
    "features\home",

    "features\procedures",
    "features\procedure-detail",
    "features\request-wizard",
    "features\document-checklist",
    "features\document-upload",
    "features\summary-submit",
    "features\status-query",
    "features\notifications",
    "features\help-contact",
    "features\administration"
)

Write-Host ""
Write-Host "Creando estructura de carpetas frontend..." -ForegroundColor Cyan

foreach ($Folder in $Folders) {
    New-SafeDirectory -Path (Join-Path $AppRoot $Folder)
}

# 2. Mover únicamente lo que ya existe en tu proyecto

Move-ExistingFolder -SourceRelative "login" -TargetRelative "features\auth\login"
Move-ExistingFolder -SourceRelative "register" -TargetRelative "features\auth\register"
Move-ExistingFolder -SourceRelative "home" -TargetRelative "features\home"
Move-ExistingFolder -SourceRelative "welcome" -TargetRelative "features\welcome"

# 3. Actualizar imports/rutas

Update-ProjectReferences

# 4. Opcional: .gitkeep para Git

Add-GitKeepIfNeeded -Folders $Folders

# 5. Verificar rutas viejas

Show-OldReferences

Write-Host ""
Write-Host "Migración finalizada." -ForegroundColor Green
Write-Host "Backup creado en:" -ForegroundColor Cyan
Write-Host $BackupApp
Write-Host ""
Write-Host "Ahora ejecuta:" -ForegroundColor Yellow
Write-Host "ionic serve"
Write-Host ""