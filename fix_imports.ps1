# Fix import paths in user/src/pages/*.jsx files
$files = Get-ChildItem -Path "d:\SEM-6\Team Project\user\src\pages" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace 'from "\.\./\.\./context/', 'from "../context/'
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Fixed: $($file.FullName)"
    }
}
