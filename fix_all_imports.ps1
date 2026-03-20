# Fix all import paths in user/src/pages/*.jsx files
$files = Get-ChildItem -Path "d:\SEM-6\Team Project\user\src\pages" -Filter "*.jsx" -Recurse

Write-Host "Processing $($files.Count) files..."

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    # Replace ../../../context/ with ../context/
    if ($content -match 'from "\.\./\.\./\.\./context/') {
        $newContent = $content -replace 'from "\.\./\.\./\.\./context/', 'from "../context/'
        $changed = $true
    }
    
    # Replace ../../context/ with ../context/
    if ($content -match 'from "\.\./\.\./context/') {
        $newContent = $content -replace 'from "\.\./\.\./context/', 'from "../context/'
        $changed = $true
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "Done!"
