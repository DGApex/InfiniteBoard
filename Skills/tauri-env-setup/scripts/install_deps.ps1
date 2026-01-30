Write-Host "Attempting to install missing dependencies via Winget..." -ForegroundColor Cyan

# Check if Winget is available
if (-not (Get-Command "winget" -ErrorAction SilentlyContinue)) {
    Write-Error "Winget is not available on this system. Please install dependencies manually."
    exit 1
}

# Install Node.js if missing
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Node.js LTS..."
    winget install OpenJS.NodeJS.LTS -e --silent
}
else {
    Write-Host "Node.js is already installed." -ForegroundColor Gray
}

# Install Rust (Rustup) if missing
if (-not (Get-Command "rustup" -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Rustup..."
    winget install Rustlang.Rustup -e --silent
    Write-Host "IMPORTANT: You may need to restart your terminal/PC after Rust installation." -ForegroundColor Yellow
}
else {
    Write-Host "Rustup is already installed." -ForegroundColor Gray
}

# Install VS Build Tools if missing (This works but requires admin and is heavy)
# Checking via vswhere again would be ideal, but for now we just offer the command.
Write-Host "`nTo install Visual Studio Build Tools (C++) automatically, run:"
Write-Host "winget install Microsoft.VisualStudio.2022.BuildTools --override `"--passive --wait --add Microsoft.VisualStudio.Workload.VCTools;includeRecommended`"" -ForegroundColor Cyan

Write-Host "`nNOTE: After installing Rust or Node, please restart your terminal." -ForegroundColor Magenta
