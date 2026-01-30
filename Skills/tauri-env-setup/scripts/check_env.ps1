function Test-Command ($cmd) {
    try {
        $null = Get-Command $cmd -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

Write-Host "Checking Tauri/Rust Environment Requirements..." -ForegroundColor Cyan

# 1. Check Node.js
if (Test-Command "node") {
    $nodeVer = node -v
    Write-Host "[OK] Node.js is installed ($nodeVer)" -ForegroundColor Green
}
else {
    Write-Host "[MISSING] Node.js is not found." -ForegroundColor Red
}

# 2. Check Rust
if (Test-Command "rustc") {
    $rustVer = rustc --version
    Write-Host "[OK] Rust is installed ($rustVer)" -ForegroundColor Green
}
else {
    Write-Host "[MISSING] Rust is not found. Please install via rustup." -ForegroundColor Red
}

# 3. Check Cargo
if (Test-Command "cargo") {
    $cargoVer = cargo --version
    Write-Host "[OK] Cargo is installed ($cargoVer)" -ForegroundColor Green
}
else {
    Write-Host "[MISSING] Cargo is not found." -ForegroundColor Red
}

# 4. Check C++ Build Tools (Simple check for 'cl.exe' in path or VS location)
# This is tricky because it might not be in PATH unless run from DevCmd.
# We will check for the registry key or typical installation paths.
$vsInstalled = $false
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
    $output = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if ($output) {
        $vsInstalled = $true
        Write-Host "[OK] Visual Studio C++ Build Tools detected at: $output" -ForegroundColor Green
    }
}

if (-not $vsInstalled) {
    Write-Host "[WARNING] Visual Studio C++ Build Tools not detected via vswhere." -ForegroundColor Yellow
    Write-Host "          Ensure 'Desktop development with C++' is installed."
}

# 5. Check Tauri CLI (optional but good)
if (Test-Command "cargo-tauri") {
    Write-Host "[OK] Tauri CLI (cargo) is installed." -ForegroundColor Green
}
elseif (Test-Command "tauri") {
    Write-Host "[OK] Tauri CLI (global npm) is installed." -ForegroundColor Green
}
else {
    Write-Host "[INFO] Tauri CLI not found globally. You can use 'npx tauri' or 'cargo tauri' if installed locally." -ForegroundColor Gray
}

Write-Host "`nEnvironment Check Complete." -ForegroundColor Cyan
