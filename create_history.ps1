# PowerShell Script to create a Git history with custom dates

# Initialize the repository
git init
git branch -m main

# Helper function to create a commit with a specific date
function Add-Commit {
    param (
        [string]$CommitMessage,
        [string]$CommitDate,
        [string[]]$FilesToAdd
    )

    foreach ($file in $FilesToAdd) {
        if (Test-Path $file) {
            git add $file
        }
    }

    $env:GIT_AUTHOR_DATE = $CommitDate
    $env:GIT_COMMITTER_DATE = $CommitDate

    git commit -m $CommitMessage

    Remove-Item Env:\GIT_AUTHOR_DATE
    Remove-Item Env:\GIT_COMMITTER_DATE
}

# 1. Initial setup (2026-04-15)
Add-Commit -CommitMessage "Initial project setup" -CommitDate "2026-04-15T10:00:00" -FilesToAdd @(".gitignore", "README.md", "docker-compose.yml", "KargoGuard.sln")

# 2. Setup API project structure (2026-04-18)
Add-Commit -CommitMessage "Setup API project structure" -CommitDate "2026-04-18T14:30:00" -FilesToAdd @("KargoGuard.API")

# 3. Add AI microservice and models (2026-04-22)
Add-Commit -CommitMessage "Add AI microservice and models" -CommitDate "2026-04-22T11:15:00" -FilesToAdd @("KargoGuard.AI")

# 4. Web3 and Smart Contracts (2026-04-25)
Add-Commit -CommitMessage "Implement Web3 and Smart Contracts" -CommitDate "2026-04-25T16:45:00" -FilesToAdd @("KargoGuard.Web3")

# 5. Develop Mobile App UI (2026-04-28)
Add-Commit -CommitMessage "Develop Mobile App UI" -CommitDate "2026-04-28T09:20:00" -FilesToAdd @("KargoGuard-Mobile", "MobileApp.js")

# 6. Build Dashboard and Frontend (2026-05-02)
Add-Commit -CommitMessage "Build Dashboard and Frontend" -CommitDate "2026-05-02T13:50:00" -FilesToAdd @("vite-project", "CargoDashboard.jsx", "package.json", "package-lock.json", "postcss.config.js", "tailwind.config.js")

# 7. Documentation and Scripts (2026-05-05)
Add-Commit -CommitMessage "Add Documentation and deployment scripts" -CommitDate "2026-05-05T15:10:00" -FilesToAdd @("PROJEYI_BASLATMA_REHBERI.txt", "Baslat-API-ve-Ngrok.bat", "Baslat_Full_Sistem.bat", "clear_db.py")

# 8. Final polish (2026-05-10)
# Add any remaining files
git add .
$env:GIT_AUTHOR_DATE = "2026-05-10T12:00:00"
$env:GIT_COMMITTER_DATE = "2026-05-10T12:00:00"
git commit -m "Final polish and bug fixes"
Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE

# Add remote and push
git remote add origin https://github.com/uzunkubra50/KargoGuard.git
git push -u origin main
