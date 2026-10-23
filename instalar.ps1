# Instalador del estudio (Windows). Uso, desde la carpeta del estudio:
#   powershell -ExecutionPolicy Bypass -File instalar.ps1
# Requisitos previos: Node 20+ (https://nodejs.org) y ffmpeg en el PATH (winget install Gyan.FFmpeg).
# Python 3.11 lo busca (py, python3.11, uv o python) y, si no está, se ofrece a instalarlo.
# No hace falta GPU: todo corre en CPU.

# "Continue": los programas externos (npm, pip, py) escriben avisos en stderr que no son errores.
# Cada paso comprueba su código de salida con Revisar.
$ErrorActionPreference = "Continue"
$raiz = $PSScriptRoot

function Paso($texto) { Write-Host ""; Write-Host "== $texto" -ForegroundColor Cyan }
function Falta($programa, $como) { Write-Host "Falta $programa. $como" -ForegroundColor Red; exit 1 }
function Revisar($que, $codigo = $LASTEXITCODE) {
    if ($codigo -ne 0) { Write-Host "Falló: $que (código $codigo). Revisa el mensaje de arriba." -ForegroundColor Red; exit 1 }
}

# Devuelve la ruta del python.exe 3.11 que responde a este comando, o $null.
function Probar-Python([string]$exe, [string[]]$argumentos = @()) {
    if (-not (Get-Command $exe -ErrorAction SilentlyContinue)) { return $null }
    try {
        $ruta = & $exe @argumentos -c "import sys; print(sys.executable if sys.version_info[:2] == (3, 11) else '')" 2>$null
        if ($LASTEXITCODE -eq 0 -and $ruta -and (Test-Path $ruta.Trim())) { return $ruta.Trim() }
    } catch {}
    return $null
}

function Buscar-Python311 {
    # 1. Lanzador py (clásico o el nuevo Python install manager).
    $p = Probar-Python "py" @("-3.11"); if ($p) { return $p }
    # 2. python3.11 en el PATH (lo instalan uv y algunos gestores).
    $p = Probar-Python "python3.11"; if ($p) { return $p }
    # 3. uv.
    if (Get-Command uv -ErrorAction SilentlyContinue) {
        $ruta = & uv python find 3.11 2>$null
        if ($LASTEXITCODE -eq 0 -and $ruta) { $p = Probar-Python $ruta.Trim(); if ($p) { return $p } }
    }
    # 4. python a secas, si resulta ser 3.11.
    $p = Probar-Python "python"; if ($p) { return $p }
    return $null
}

Paso "Comprobando requisitos"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Falta "Node.js" "Instálalo desde https://nodejs.org (versión LTS) y abre una terminal nueva." }
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { Falta "ffmpeg" "Instálalo con: winget install Gyan.FFmpeg (y abre una terminal nueva)." }

$python = Buscar-Python311
if (-not $python) {
    Write-Host "No encuentro Python 3.11 (el estudio usa versiones de Whisper probadas en 3.11)." -ForegroundColor Yellow
    $respuesta = Read-Host "¿Lo instalo ahora? (S/n)"
    if ($respuesta -match '^[nN]') { Falta "Python 3.11" "Instálalo desde https://python.org (marca 'Add to PATH') y vuelve a ejecutar este instalador." }
    if (Get-Command uv -ErrorAction SilentlyContinue) {
        & uv python install 3.11
    } elseif ((Get-Command py -ErrorAction SilentlyContinue) -and ((& py help 2>&1 | Out-String) -match 'install')) {
        # Python install manager (el py nuevo de python.org y de la Microsoft Store).
        & py install 3.11
    } elseif (Get-Command winget -ErrorAction SilentlyContinue) {
        & winget install --id Python.Python.3.11 -e --source winget --accept-package-agreements --accept-source-agreements
    } else {
        Falta "Python 3.11" "Instálalo desde https://python.org (marca 'Add to PATH')."
    }
    Revisar "instalar Python 3.11"
    $python = Buscar-Python311
    if (-not $python) { Falta "Python 3.11" "Se instaló, pero esta terminal aún no lo ve: ciérrala, abre una nueva y vuelve a ejecutar el instalador." }
}
Write-Host "Node $(node --version) · Python 3.11 ($python) · ffmpeg OK"

Paso "Instalando Remotion (studio/)"
Push-Location "$raiz\studio"
npm ci --no-audit --no-fund
$codigo = $LASTEXITCODE
Pop-Location
Revisar "npm ci" $codigo

Paso "Creando el entorno de Python (.venv) e instalando Whisper (unos minutos, ~2 GB)"
$venv = "$raiz\.venv\Scripts\python.exe"
if (-not (Test-Path $venv)) { & $python -m venv "$raiz\.venv"; Revisar "crear .venv" }
& $venv -m pip install --upgrade pip; Revisar "actualizar pip"
& $venv -m pip install torch==2.14.1 torchaudio --index-url https://download.pytorch.org/whl/cpu; Revisar "instalar torch"
& $venv -m pip install -r "$raiz\pipeline\requirements.txt"; Revisar "instalar requirements.txt"

Paso "Preparando el video de demostración"
Push-Location $raiz
& $venv pipeline/procesar_audio.py proyectos/demo --sin-verificar
$codigo = $LASTEXITCODE
Pop-Location
Revisar "procesar el audio del demo" $codigo

Paso "Listo"
Write-Host "1. Abre Claude Code en esta carpeta y escribe /configurar para la entrevista inicial."
Write-Host "2. Para ver el demo: cd studio; npm run studio  ->  http://localhost:3000, composición 'Demo'."
