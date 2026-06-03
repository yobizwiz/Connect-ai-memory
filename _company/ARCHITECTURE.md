# ⚠️ 모든 에이전트 필독 — 프로젝트 아키텍처 (2026-06-03 확정)

> **이 파일을 덮어쓰지 마세요. 읽기만 하세요.**

## 절대 규칙
1. `backend/`, `services/`, `src/`, `yobizwiz_backend/` 폴더의 파일을 수정하지 마세요. **DEPRECATED** 입니다.
2. 새 파일을 만들지 마세요. 기존 파일만 수정하세요.
3. `random()`, `random.uniform()`, 하드코딩된 숫자로 계산하지 마세요.
4. **이 파일(ARCHITECTURE.md)을 수정하거나 덮어쓰지 마세요.**

## 현재 소스 오브 트루스 (Source of Truth)

### 핵심 엔진 (절대 임의 수정 금지)
| 파일 | 역할 | 수정 시 사용자 승인 필수 |
|---|---|---|
| `core/engine.py` | TRE 점수 계산, Lmax 산출, 유사 사례 매칭 | ⚠️ YES |
| `core/schemas.py` | 모든 입출력 데이터 구조 (Pydantic) | ⚠️ YES |
| `core/api.py` | FastAPI 엔드포인트 4개 | ⚠️ YES |
| `core/checklist.py` | 20문항 체크리스트 + 채점 엔진 | ⚠️ YES |

### 데이터 (추가는 가능, 기존 삭제 금지)
| 파일 | 역할 | 에이전트가 할 수 있는 것 |
|---|---|---|
| `core/data/regulatory_fines.py` | 미국 벌금 사례 44건 | ✅ 새 사례 추가 (기존 형식 따를 것) |
| `core/data/breach_costs.py` | IBM 2024 유출 비용 | ✅ 새 연도 데이터 추가 |
| `core/data/industry_benchmarks.py` | 산업별 벤치마크 | ✅ 새 산업 추가 |

### 프론트엔드
| 파일 | 역할 | 에이전트가 할 수 있는 것 |
|---|---|---|
| `frontend/index.html` | 메인 UI | ✅ UI 개선 (구조 유지) |
| `frontend/style.css` | 스타일 | ✅ 디자인 개선 |
| `frontend/app.js` | 전체 로직 | ⚠️ 로직 변경 시 승인 필요 |

### KnowledgeBase (자유롭게 수정 가능)
| 폴더 | 에이전트가 할 수 있는 것 |
|---|---|
| `KnowledgeBase/*.json` | ✅ 데이터 추가/수정 (JSON 유효성 필수) |
| `KnowledgeBase/*.md` | ✅ 문서 작성/수정 |

### 테스트
| 파일 | 에이전트가 할 수 있는 것 |
|---|---|
| `tests/test_*.py` | ✅ 새 테스트 추가 (기존 테스트 삭제/수정 금지) |

### 인프라
| 파일 | 역할 |
|---|---|
| `_shared/auto_healer.py` | 자동 에러 감지/수정 스크립트 |
| `_shared/circuit_breaker.py` | 장애 차단기 |
| `_shared/retry_decorator.py` | 재시도 데코레이터 |

## 작업 후 검증 (필수)
모든 파일 수정 후 반드시 실행:
```bash
cd c:\Users\jinoh\Desktop\Connect AI\_company
python _shared/auto_healer.py --fix
```
에러가 0건일 때만 작업 완료로 간주합니다.

## DEPRECATED — 사용하지 마세요
다음 폴더/파일은 더 이상 사용하지 않습니다. 수정하지 마세요:
- `backend/` → `core/`로 대체됨
- `services/` → `core/`로 대체됨
- `src/api/` → `core/api.py`로 대체됨
- `src/services/` → `core/engine.py`로 대체됨
- `yobizwiz_backend/` → `core/api.py`로 대체됨
- `lmax_calculator.py` → `core/engine.py`로 대체됨

## 아키텍처 다이어그램
```
사용자 브라우저
    ↓
frontend/ (HTML/CSS/JS) — 체크리스트 입력 + 결과 표시
    ↓
core/api.py (FastAPI) — 엔드포인트 라우팅
    ↓
core/engine.py — TRE 점수 계산 + Lmax 산출
core/checklist.py — 체크리스트 채점
    ↓
core/data/ — 실제 벌금 사례 + IBM 통계 + 산업 벤치마크
```