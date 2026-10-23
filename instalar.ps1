# Instalador del estudio (Windows). Uso, desde la carpeta del estudio:
#   powershell -ExecutionPolicy Bypass -File instalar.ps1
# Requisitos previos: Node 20+ (https://nodejs.org), Python 3.11 (https://python.org) y ffmpeg en el PATH
# (winget install Gyan.FFmpeg). No hace falta GPU: todo corre en CPU.

$ErrorActionPreference = "Stop"
$raiz = $PSScriptRoot

function Paso($texto) { Write-Host ""; Write-Host "== $texto" -ForegroundColor Cyan }
function Falta($programa, $como) { Write-Host "Falta $programa. $como" -ForegroundColor Red; exit 1 }

Paso "Comprobando requisitos"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Falta "Node.js" "Instálalo desde https://nodejs.org (versión LTS)." }
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { Falta "ffmpeg" "Instálalo con: winget install Gyan.FFmpeg (y abre una terminal nueva)." }
$python = $null
if (Get-Command py -ErrorAction SilentlyContinue) {
    py -3.11 --version *> $null
    if ($LASTEXITCODE -eq 0) { $python = "py -3.11" }
}
if (-not $python) { Falta "Python 3.11" "Instálalo desde https://python.org (marca 'Add to PATH')." }
Write-Host "Node $(node --version) · $(& py -3.11 --version) · ffmpeg OK"

Paso "Instalando Remotion (studio/)"
Push-Location "$raiz\studio"
npm ci --no-audit --no-fund
Pop-Location

Paso "Creando el entorno de Python (.venv) e instalando Whisper (unos minutos, ~2 GB)"
if (-not (Test-Path "$raiz\.venv")) { py -3.11 -m venv "$raiz\.venv" }
$pip = "$raiz\.venv\Scripts\python.exe"
& $pip -m pip install --upgrade pip
& $pip -m pip install torch==2.14.1 torchaudio --index-url https://download.pytorch.org/whl/cpu
& $pip -m pip install -r "$raiz\pipeline\requirements.txt"

Paso "Preparando el video de demostración"
Push-Location $raiz
& $pip pipeline/procesar_audio.py proyectos/demo --sin-verificar
Pop-Location

Paso "Listo"
Write-Host "1. Abre Claude Code en esta carpeta y escribe /configurar para la entrevista inicial."
Write-Host "2. Para ver el demo: cd studio; npm run studio  ->  http://localhost:3000, composición 'Demo'."
