Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 1024, 1024
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::DeepSkyBlue)
$brush = [System.Drawing.Brushes]::White
$font = New-Object System.Drawing.Font("Arial", 400)
$g.DrawString("IB", $font, $brush, 100, 200)
$bmp.Save("app-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Icon created."
