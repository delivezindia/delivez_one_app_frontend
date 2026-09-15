Add-Type -AssemblyName System.Drawing
$imagePath = Join-Path (Get-Location) "reference_home.jpeg"
$bmp = New-Object System.Drawing.Bitmap($imagePath)

function CropAndSave($x, $y, $w, $h, $name) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $cropped = $bmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $dest = Join-Path (Get-Location) "public\assets\images\$name.jpg"
    $cropped.Save($dest, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $cropped.Dispose()
    Write-Output "Saved $dest ($w x $h)"
}

# 6 Service Card Images
CropAndSave 464 151 254 76 "service_courier"
CropAndSave 737 151 245 76 "service_confidential"
CropAndSave 464 332 254 76 "service_return"
CropAndSave 737 332 245 76 "service_forgot"
CropAndSave 464 514 254 76 "service_airport"
CropAndSave 737 514 245 76 "service_special"

# Rider Hero Banner with bottom pill (approx X: 0 to 435, Y: 460 to 980)
CropAndSave 6 470 424 495 "rider_hero_landing"

$bmp.Dispose()
Write-Output "All image assets generated successfully."
