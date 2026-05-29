import os
from typing import Optional, Tuple

def sanitize_path(original_path: str) -> str:
    """
    경로 문자열에서 OS 독립적인 경로 구분자 충돌을 막기 위해 
    콜론(:) 문자를 하이픈(-)으로 대체합니다.
    """
    # 콜론 치환 로직
    sanitized = original_path.replace(':', '-')
    return sanitized

def ensure_directory_and_save(base_dir: str, filename: str, content: str) -> Optional[str]:
    """
    1. 경로를 정제하고 2. 해당 디렉토리가 존재하지 않으면 생성한 후 3. 파일을 저장합니다.
    Args:
        base_dir (str): 파일이 속할 기본 디렉토리 경로.
        filename (str): 저장될 파일 이름.
        content (str): 파일 내용.

    Returns:
        Optional[str]: 성공적으로 저장된 절대 경로, 실패 시 None.
    """
    try:
        # 1. 전체 경로 구성
        full_path = os.path.join(base_dir, filename)
        
        # 2. 경로 정제 (이것이 핵심 수정 로직입니다)
        sanitized_path = sanitize_path(full_path)
        
        # 디렉토리와 파일명에서 콜론을 치환하여 최종 경로를 재구성합니다.
        # 주의: os.path.dirname()은 이미 OS 네이티브 구분자를 사용하므로, 
        # 우리는 전체 문자열에서 : -> - 변환만 수행하고 이를 다시 os.path.join으로 결합하는 것이 안전합니다.

        sanitized_dir = sanitize_path(os.path.dirname(full_path))
        final_dir = os.path.join(base_dir, sanitized_dir) # base_dir가 이미 안정적이라고 가정
        final_file_name = sanitize_path(filename)

        # 최종 저장 경로를 다시 구성하고 콜론을 치환합니다.
        # 예시: sessions/2026:05:29T11:30:00/video.md -> sessions/2026-05-29T11-30-00/video.md
        final_full_path = os.path.join(sanitize_path(os.path.dirname(sanitized_dir)), sanitize_path(filename))

        # 3. 디렉토리 생성 (존재하지 않으면 강제 생성)
        os.makedirs(os.path.dirname(final_full_path), exist_ok=True)
        
        # 4. 파일 쓰기
        with open(final_full_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        return os.path.abspath(final_full_path)

    except Exception as e:
        print(f"파일 저장 실패: {e}")
        return None
# Test Code (Self-Verification Helper)
if __name__ == "__main__":
    test_paths = [
        ("sessions/2026:05:29T11:30:00/video_script.md", "Test 1: Time Stamp"),
        ("/User/Data:Set/ProjectA/config.json", "Test 2: Directory Path"),
        ("no-colon/file.txt", "Test 3: Clean Path")
    ]
    print("\n--- 테스트 실행 ---")
    for original, description in test_paths:
        saved_path = ensure_directory_and_save("temp_test_dir", original.split('/')[-1], f"Content for {description}")
        if saved_path:
            print(f"[SUCCESS] '{original}' -> Saved as: {saved_path}")
        else:
            print(f"[FAILURE] Failed to save path: {original}")

# 임시 테스트 디렉토리 정리 함수 (실행 후 삭제)
def cleanup():
    import shutil
    try:
        shutil.rmtree("temp_test_dir")
        print("\n[INFO] temp_test_dir을 성공적으로 삭제했습니다.")
    except OSError as e:
        print(f"[WARNING] 디렉토리 정리 실패: {e}")

# cleanup() # 테스트 후 주석 해제하여 실행 가능하게 함.
print("Path Sanitizer Module Loaded Successfully.")
<|"|>