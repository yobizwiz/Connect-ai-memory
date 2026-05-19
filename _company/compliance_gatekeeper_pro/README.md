# Compliance Gatekeeper Pro MVP Boilerplate
## ⚙️ 아키텍처 개요
본 프로젝트는 고가치 B2B 컴플라이언스 솔루션의 MVP 백엔드 구조를 제공합니다. 핵심은 **'워크플로우 강제와 위험 제거'** 입니다.

### 🎯 데이터 플로우 (Data Flow)
1.  클라이언트 요청: 사용자가 분석할 법규/문서 입력 및 API 호출 시도.
2.  Authentication Layer: JWT 토큰을 검증하여 사용자 신원을 확인합니다. (`auth_service`)
3.  Business Logic Layer: 입력된 파라미터로 규제 검색을 수행하고, 구조적 위험 여부를 판단합니다. (`regulatory_service`)
4.  Monetization/Gatekeeping Layer: 보고서 생성 전 결제 게이트웨이 연동 로직(예: 구독 확인 또는 사용량 기반 지불)을 거칩니다. (`billing_service`)
5.  Response: 최종적으로 구조적 위험 진단과 함께 API 응답을 반환합니다.

### 📁 모듈 구성 (Structure)
- `src/main.py`: FastAPI의 메인 엔트리 포인트 및 라우팅 정의.
- `src/services/auth_service.py`: 사용자 인증 및 권한 관리 로직.
- `src/services/regulatory_service.py`: 외부 규제 DB API 호출 및 데이터 가공 로직 (핵심).
- `src/services/billing_service.py`: 결제 게이트웨이 연동 시뮬레이션 (Stripe Webhook, 구독 상태 확인 등).

### 🚀 실행 방법 (Setup)
1. 의존성 설치: `pip install -r requirements.txt`
2. 서버 실행: `uvicorn src.main:app --reload`