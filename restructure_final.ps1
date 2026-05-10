# Create base folders
if (-not (Test-Path backend)) { New-Item -ItemType Directory -Path backend }
if (-not (Test-Path frontend)) { New-Item -ItemType Directory -Path frontend }
if (-not (Test-Path mobile)) { New-Item -ItemType Directory -Path mobile }
if (-not (Test-Path web3)) { New-Item -ItemType Directory -Path web3 }
if (-not (Test-Path frontend/src)) { New-Item -ItemType Directory -Path frontend/src }

# Move Backend files
if (Test-Path KargoGuard.API) { Move-Item KargoGuard.API backend\KargoGuard.API }
if (Test-Path KargoGuard.AI) { Move-Item KargoGuard.AI backend\KargoGuard.AI }
if (Test-Path KargoGuard.sln) { Move-Item KargoGuard.sln backend\KargoGuard.sln }
if (Test-Path clear_db.py) { Move-Item clear_db.py backend\clear_db.py }

# Move Frontend files
if (Test-Path vite-project) { 
    Get-ChildItem vite-project | Move-Item -Destination frontend\
    Get-ChildItem vite-project -Force | Where-Object { $_.Name -match "^\." } | Move-Item -Destination frontend\
    Remove-Item vite-project -Recurse -Force
}
if (Test-Path CargoDashboard.jsx) { Move-Item CargoDashboard.jsx frontend\src\CargoDashboard.jsx }

# Remove duplicate frontend files from root
if (Test-Path package.json) { Remove-Item package.json }
if (Test-Path package-lock.json) { Remove-Item package-lock.json }
if (Test-Path postcss.config.js) { Remove-Item postcss.config.js }
if (Test-Path tailwind.config.js) { Remove-Item tailwind.config.js }

# Move Mobile files
if (Test-Path KargoGuard-Mobile) { 
    Get-ChildItem KargoGuard-Mobile | Move-Item -Destination mobile\
    Get-ChildItem KargoGuard-Mobile -Force | Where-Object { $_.Name -match "^\." -and $_.Name -ne ".git" } | Move-Item -Destination mobile\
    Remove-Item KargoGuard-Mobile -Recurse -Force
}
if (Test-Path MobileApp.js) { Move-Item MobileApp.js mobile\MobileApp.js }

# Move Web3 files
if (Test-Path KargoGuard.Web3) { 
    Get-ChildItem KargoGuard.Web3 | Move-Item -Destination web3\
    Get-ChildItem KargoGuard.Web3 -Force | Where-Object { $_.Name -match "^\." } | Move-Item -Destination web3\
    Remove-Item KargoGuard.Web3 -Recurse -Force
}

# Update .bat files
$bat1 = "Baslat-API-ve-Ngrok.bat"
if (Test-Path $bat1) {
    (Get-Content $bat1) -replace 'cd KargoGuard.API', 'cd backend\KargoGuard.API' | Set-Content $bat1
    (Get-Content $bat1) -replace 'cd c:\\Users\\[^\\]+\\Desktop\\KargoGuard\\KargoGuard.API', 'cd %~dp0backend\KargoGuard.API' | Set-Content $bat1
}

$bat2 = "Baslat_Full_Sistem.bat"
if (Test-Path $bat2) {
    (Get-Content $bat2) -replace 'cd KargoGuard.API', 'cd backend\KargoGuard.API' | Set-Content $bat2
    (Get-Content $bat2) -replace 'cd KargoGuard.AI', 'cd backend\KargoGuard.AI' | Set-Content $bat2
    (Get-Content $bat2) -replace 'cd vite-project', 'cd frontend' | Set-Content $bat2
    
    (Get-Content $bat2) -replace 'cd c:\\Users\\[^\\]+\\Desktop\\KargoGuard\\KargoGuard.API', 'cd %~dp0backend\KargoGuard.API' | Set-Content $bat2
    (Get-Content $bat2) -replace 'cd c:\\Users\\[^\\]+\\Desktop\\KargoGuard\\KargoGuard.AI', 'cd %~dp0backend\KargoGuard.AI' | Set-Content $bat2
    (Get-Content $bat2) -replace 'cd c:\\Users\\[^\\]+\\Desktop\\KargoGuard\\vite-project', 'cd %~dp0frontend' | Set-Content $bat2
}

# Update README and REHBER
$readme = "README.md"
if (Test-Path $readme) {
    (Get-Content $readme) -replace 'cd KargoGuard.API', 'cd backend/KargoGuard.API' | Set-Content $readme
    (Get-Content $readme) -replace 'cd KargoGuard.AI', 'cd backend/KargoGuard.AI' | Set-Content $readme
    (Get-Content $readme) -replace 'cd vite-project', 'cd frontend' | Set-Content $readme
}

$rehber = "PROJEYI_BASLATMA_REHBERI.txt"
if (Test-Path $rehber) {
    (Get-Content $rehber) -replace 'KargoGuard\\KargoGuard.API', 'KargoGuard\backend\KargoGuard.API' | Set-Content $rehber
    (Get-Content $rehber) -replace 'KargoGuard\\KargoGuard.AI', 'KargoGuard\backend\KargoGuard.AI' | Set-Content $rehber
    (Get-Content $rehber) -replace 'KargoGuard\\vite-project', 'KargoGuard\frontend' | Set-Content $rehber
}

# Stage all updates
git add -A
git commit -m "refactor: Professional monorepo structure with separated domains"
git push
