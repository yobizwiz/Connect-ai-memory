from typing import Optional
from jose import jwt, JWTError
from pydantic import BaseModel

SECRET_KEY = "YOUR_SUPER_SECRET_AUTH_KEY"  # TODO: 환경 변수로 대체 필수
ALGORITHM = "HS256"

class User(BaseModel):
    user_id: str
    role: str # e.g., 'admin', 'premium', 'basic'
    is_compliant: bool # 현재 계정이 규정 준수 상태인지 여부 (권한 체크용)

def create_access_token(data: dict, expires_delta: Optional[float] = None):
    """액세스 토큰을 생성하는 함수."""
    to_encode = data.copy()
    if expires_delta:
        import datetime
        from datetime import timedelta
        expire = datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_delta)
        to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str) -> Optional[User]:
    """JWT 토큰을 디코딩하고 사용자 정보를 가져오는 가드 함수."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        # 실제 환경에서는 DB에서 사용자 정보를 가져와야 함. 여기서는 스키마만 재현.
        print(f"✅ [Auth] User {user_id} authenticated successfully.")
        return User(user_id=user_id, role="premium", is_compliant=True) # 시뮬레이션으로 'premium' 반환
    except JWTError:
        print("❌ [Auth] Invalid or expired token.")
        return None