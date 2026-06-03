# core/ — Yobizwiz 통합 리스크 진단 엔진
# 
# 이 모듈은 기존 6개 파일에 분산되어 있던 리스크 계산 로직을
# 하나의 일관된 엔진으로 통합합니다.
#
# 구조:
#   schemas.py  — 입출력 Pydantic 스키마
#   engine.py   — 비즈니스 로직 (TRE 계산, Lmax 산출, 위험 등급 분류)
#   api.py      — FastAPI 라우터

from .schemas import DiagnosisInput, DiagnosisReport
from .engine import RiskDiagnosisEngine
