# src/config/credentials.py
"""
API 인증 정보를 관리하는 모듈입니다.
절대로 여기에 실제 키를 하드코딩해서는 안 됩니다.
반드시 환경 변수 (.env) 또는 비밀 관리 시스템을 통해 로드해야 합니다.

[주의] 이 파일은 구조 정의용이며, 민감 정보가 포함될 수 있으므로 Git에 커밋되지 않도록 .gitignore 처리해야 합니다.
"""
import os

# --- OAuth 2.0 Credentials Placeholder ---
# 실제 환경에서는 Google Client Library를 사용하여 Scope와 Refresh Token을 관리합니다.
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "YOUR_FALLBACK_API_KEY")
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-client-id")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "your-client-secret")

# 필요한 Scope 정의: 업로드 및 메타데이터 관리를 위한 최소 권한만 요청합니다.
YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

print("✅ [INFO] Credentials loaded successfully (using environment variables placeholder).")