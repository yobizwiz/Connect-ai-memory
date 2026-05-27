import os
import shutil
from pathlib import Path
import logging
from datetime import datetime

# --- Configuration ---
# 🚨 사용자의 회사 폴더 절대 경로로 수정 필요! (가정: ~/Documents/Company_Backup)
TARGET_DIR = Path("~/Documents/Company_Backup").expanduser()
SOURCE_DIRS = [Path("~/Desktop").expanduser(), Path("~/Downloads").expanduser()]

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def classify_file(filepath: Path) -> str:
    """파일 확장자를 기반으로 적절한 카테고리 폴더 이름을 반환합니다."""
    extension = filepath.suffix.lower()
    
    # 문서 (Documents)
    if extension in ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.ppt', '.pptx', '.txt']:
        return "01_Documents"
    # 이미지 (Images)
    elif extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']:
        return "02_Images"
    # 영상 및 오디오 (Media/Video)
    elif extension in ['.mp4', '.mov', '.avi', '.mkv', '.mp3', '.wav']:
        return "03_Media_Videos_Audio"
    # 압축 파일 (Archives)
    elif extension in ['.zip', '.rar', '.7z', '.tar', '.gz']:
        return "04_Archives"
    # 코드 및 데이터 (Code/Data)
    elif extension in ['.py', '.js', '.ts', '.json', '.csv', '.sql']:
        return "05_Code_Data"
    # 기타 파일
    else:
        return "99_Others"

def process_directory(source_dir: Path, target_base_dir: Path):
    """단일 소스 디렉토리의 내용을 순회하며 분류하고 이동시킵니다."""
    logging.info(f"\n>>> [{source_dir}] 디렉토리를 처리하기 시작합니다...")
    
    processed_count = 0
    skipped_count = 0

    for item in source_dir.iterdir():
        # 디렉토리 자체는 건너뛰기 (필요하다면 재귀 로직 추가 필요)
        if item.is_dir() and not any(item.name == "node_modules" for item in os.listdir(item)):
            logging.warning(f"⚠️ [{source_dir}] 내의 하위 디렉토리 '{item.name}'은 건너뜁니다. (재귀 로직 필요)")
            continue

        try:
            # 1. 파일 분류 및 대상 카테고리 결정
            category = classify_file(item)
            
            # 최종 목적지 경로 설정 (TARGET_DIR / Category)
            destination_dir = target_base_dir / category
            
            # 2. 대상 디렉토리 생성 확인
            os.makedirs(destination_dir, exist_ok=True)
            
            # 3. 파일 이동 시도
            source_path = item
            dest_path = destination_dir / source_path.name

            # 충돌 방지 (동일 이름의 파일이 이미 존재할 경우 타임스탬프 추가 등 복잡한 로직 필요하나, 일단 단순 이동으로 시작)
            if dest_path.exists():
                logging.warning(f"    [SKIP] {source_path.name} 파일이 이미 대상 폴더에 존재합니다. 덮어쓰지 않습니다.")
                skipped_count += 1
                continue

            shutil.move(str(source_path), str(dest_path))
            logging.info(f"    [MOVE OK] '{source_path.name}' -> /{category}/")
            processed_count += 1

        except PermissionError:
            logging.error(f"    [FAIL] 권한 문제로 '{item.name}' 접근 불가 (Permission Denied). 이 파일은 건너뜁니다.")
            skipped_count += 1
        except FileNotFoundError as e:
             logging.error(f"    [FAIL] 파일을 찾을 수 없습니다: {e}")
             skipped_count += 1
        except Exception as e:
            logging.critical(f"    [CRITICAL FAIL] '{item.name}' 처리 중 예상치 못한 오류 발생: {type(e).__name__} - {e}")
            skipped_count += 1

    logging.info("-" * 40)
    logging.info(f"✅ [{source_dir}] 처리 완료. 성공 건수: {processed_count}, 실패/건너뜀 건수: {skipped_count}")


def main():
    """메인 실행 함수."""
    # 대상 디렉토리 생성 확인 및 강제 생성
    if not TARGET_DIR.exists():
        os.makedirs(TARGET_DIR)
        logging.warning(f"🚀 백업 목표 폴더를 생성했습니다: {TARGET_DIR}")

    for source in SOURCE_DIRS:
        # 소스 디렉토리 존재 여부 체크 (Desktop이나 Downloads가 없을 수 있음)
        if not Path(source).exists():
            logging.error(f"🛑 소스 경로를 찾을 수 없습니다: {source}. 이 경로는 건너뜁니다.")
            continue
        process_directory(Path(source), TARGET_DIR)

    logging.info("\n==============================================")
    logging.info("✨ 모든 백업 작업이 완료되었습니다. 로그를 확인하세요!")
    logging.info("==============================================")


if __name__ == "__main__":
    main()