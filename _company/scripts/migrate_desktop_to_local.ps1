# ============================================================
# OneDrive 바탕화면 → 로컬 바탕화면 마이그레이션 스크립트
# ============================================================
# 사용법: OneDrive 설정에서 바탕화면 백업을 끈 직후 실행하세요.
# 이 스크립트는 OneDrive\Desktop의 모든 파일/폴더를
# 새 로컬 Desktop으로 복사합니다. (원본은 삭제하지 않음)
# ============================================================

$OneDriveDesktop = "C:\Users\jinoh\OneDrive\Desktop"
$LocalDesktop    = [Environment]::GetFolderPath("Desktop")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OneDrive Desktop Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1) 현재 바탕화면 경로 확인
Write-Host "[1/4] 현재 바탕화면 경로 확인..." -ForegroundColor Yellow
Write-Host "  현재 Desktop 경로: $LocalDesktop"

if ($LocalDesktop -like "*OneDrive*") {
    Write-Host ""
    Write-Host "  [!] 아직 바탕화면이 OneDrive에 연결되어 있습니다!" -ForegroundColor Red
    Write-Host "  먼저 OneDrive 설정 > 동기화 및 백업 > 백업 관리에서" -ForegroundColor Red
    Write-Host "  '바탕 화면(Desktop)' 백업을 끄세요." -ForegroundColor Red
    Write-Host ""
    Read-Host "  엔터를 누르면 종료합니다"
    exit 1
}

# 2) OneDrive Desktop 폴더 존재 확인
Write-Host "[2/4] OneDrive Desktop 폴더 확인..." -ForegroundColor Yellow
if (-not (Test-Path $OneDriveDesktop)) {
    Write-Host "  [!] OneDrive Desktop 폴더를 찾을 수 없습니다: $OneDriveDesktop" -ForegroundColor Red
    Read-Host "  엔터를 누르면 종료합니다"
    exit 1
}

$items = Get-ChildItem $OneDriveDesktop -Force
$fileCount = ($items | Where-Object { -not $_.PSIsContainer }).Count
$folderCount = ($items | Where-Object { $_.PSIsContainer }).Count
Write-Host "  발견: 폴더 ${folderCount}개, 파일 ${fileCount}개" -ForegroundColor Green

# 3) 로컬 Desktop으로 복사
Write-Host "[3/4] 로컬 바탕화면으로 복사 중..." -ForegroundColor Yellow
Write-Host "  원본: $OneDriveDesktop"
Write-Host "  대상: $LocalDesktop"
Write-Host ""

$copied = 0
$skipped = 0
$errors = 0

foreach ($item in $items) {
    $destPath = Join-Path $LocalDesktop $item.Name
    
    if (Test-Path $destPath) {
        Write-Host "  [건너뜀] $($item.Name) (이미 존재)" -ForegroundColor DarkGray
        $skipped++
        continue
    }
    
    try {
        if ($item.PSIsContainer) {
            Copy-Item -Path $item.FullName -Destination $destPath -Recurse -Force
            Write-Host "  [복사] 폴더: $($item.Name)" -ForegroundColor Green
        } else {
            Copy-Item -Path $item.FullName -Destination $destPath -Force
            Write-Host "  [복사] 파일: $($item.Name)" -ForegroundColor Green
        }
        $copied++
    } catch {
        Write-Host "  [오류] $($item.Name): $_" -ForegroundColor Red
        $errors++
    }
}

# 4) 결과 요약
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  마이그레이션 완료!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  복사됨: $copied" -ForegroundColor Green
Write-Host "  건너뜀: $skipped" -ForegroundColor DarkGray
Write-Host "  오류:   $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "  새 바탕화면: $LocalDesktop" -ForegroundColor Green
Write-Host ""
Write-Host "  [참고] 원본 파일은 '$OneDriveDesktop'에 그대로 남아있습니다." -ForegroundColor Yellow
Write-Host "  모든 것이 정상 작동하는지 확인한 후, 원본을 삭제하셔도 됩니다." -ForegroundColor Yellow
Write-Host ""
Read-Host "  엔터를 누르면 종료합니다"
