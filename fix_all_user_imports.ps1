# Fix all import issues in user/src/pages/
$basePath = "d:\SEM-6\Team Project\user\src\pages"

Get-ChildItem -Path $basePath -Filter "*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $modified = $false
    
    # Fix ../../../context/AuthContext -> ../context/AuthContext
    if ($content -match 'from "\.\./\.\./\.\./context/AuthContext"') {
        $content = $content -replace 'from "\.\./\.\./\.\./context/AuthContext"', 'from "../context/AuthContext"'
        $modified = $true
    }
    
    # Fix ../../../context/ChatContext -> ../context/ChatContext
    if ($content -match 'from "\.\./\.\./\.\./context/ChatContext"') {
        $content = $content -replace 'from "\.\./\.\./\.\./context/ChatContext"', 'from "../context/ChatContext"'
        $modified = $true
    }
    
    # Fix ../../app/core/services/ScreenRecorder -> This file doesn't exist, need to handle differently
    
    if ($modified) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($_.Name)"
    }
}

Write-Host "`nAll imports fixed!"
