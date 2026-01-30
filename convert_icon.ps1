Add-Type -AssemblyName System.Drawing
$source = "logo-icon.png"
$dest = "logo-icon-real.png"

try {
    $img = [System.Drawing.Image]::FromFile($source)
    $img.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose()
    Write-Host "Success: Converted $source to $dest"
}
catch {
    Write-Error "Failed to convert image: $_"
    exit 1
}
