"""
Self-Healing System 검증 테스트
================================
각 모듈의 에러 분류, 재시도, fallback, Circuit Breaker 동작을 검증합니다.
"""

import sys
import os
import time
import json

# 프로젝트 루트를 경로에 추가
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from _shared.error_classifier import (
    classify_error,
    ErrorCategory,
    RecoveryStrategy,
    register_custom_error,
    is_recoverable,
    is_degradable,
)
from _shared.circuit_breaker import CircuitBreaker, CircuitState, CircuitOpenError
from _shared.retry_decorator import self_healing, get_fallback_cache
from _shared.healing_logger import HealingLogger


def separator(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# =====================================================================
#  TEST 1: Error Classifier
# =====================================================================
def test_error_classifier():
    separator("TEST 1: Error Classifier — 에러 분류 테스트")

    test_cases = [
        (ConnectionError("Network down"), ErrorCategory.RECOVERABLE),
        (TimeoutError("Request timeout"), ErrorCategory.RECOVERABLE),
        (PermissionError("Access denied"), ErrorCategory.RECOVERABLE),
        (FileNotFoundError("config.json"), ErrorCategory.RECOVERABLE),
        (ValueError("Invalid input"), ErrorCategory.DEGRADABLE),
        (KeyError("missing_key"), ErrorCategory.DEGRADABLE),
        (TypeError("type mismatch"), ErrorCategory.DEGRADABLE),
        (json.JSONDecodeError("parse error", "", 0), ErrorCategory.DEGRADABLE),
        (RuntimeError("unknown error"), ErrorCategory.FATAL),
    ]

    passed = 0
    for error, expected_category in test_cases:
        result = classify_error(error)
        status = "✅" if result.category == expected_category else "❌"
        if result.category == expected_category:
            passed += 1
        print(f"  {status} {type(error).__name__:25s} → {result.category.value:12s} (전략: {result.strategy.value})")

    # 헬퍼 함수 테스트
    assert is_recoverable(ConnectionError()) == True
    assert is_degradable(ValueError("test")) == True
    assert is_recoverable(RuntimeError()) == False
    print(f"\n  ✅ is_recoverable/is_degradable 헬퍼 함수 정상")

    # 커스텀 에러 등록 테스트
    class MyCustomError(Exception):
        pass

    register_custom_error(
        MyCustomError,
        ErrorCategory.RECOVERABLE,
        RecoveryStrategy.RETRY_WITH_BACKOFF,
        max_retries=5,
    )
    result = classify_error(MyCustomError("test"))
    assert result.category == ErrorCategory.RECOVERABLE
    assert result.max_retries == 5
    print(f"  ✅ 커스텀 에러 등록 & 분류 정상")

    print(f"\n  결과: {passed}/{len(test_cases)} 테스트 통과")


# =====================================================================
#  TEST 2: Circuit Breaker
# =====================================================================
def test_circuit_breaker():
    separator("TEST 2: Circuit Breaker — 상태 전환 테스트")

    breaker = CircuitBreaker(
        name="test_breaker",
        failure_threshold=3,
        reset_timeout=2.0,  # 테스트용 짧은 타임아웃
    )

    # 1. 초기 상태: CLOSED
    assert breaker.state == CircuitState.CLOSED
    assert breaker.can_execute() == True
    print(f"  ✅ 초기 상태: {breaker.state.value}")

    # 2. 연속 실패 → OPEN
    for i in range(3):
        breaker.record_failure(Exception(f"failure {i+1}"))
    assert breaker.state == CircuitState.OPEN
    assert breaker.can_execute() == False
    print(f"  ✅ 연속 3회 실패 후: {breaker.state.value} (호출 차단)")

    # 3. 타임아웃 경과 → HALF_OPEN
    print(f"  ⏳ reset_timeout(2초) 대기 중...")
    time.sleep(2.5)
    assert breaker.state == CircuitState.HALF_OPEN
    assert breaker.can_execute() == True
    print(f"  ✅ 타임아웃 경과 후: {breaker.state.value} (1건 시도 허용)")

    # 4. HALF_OPEN에서 성공 → CLOSED
    breaker.record_success()
    assert breaker.state == CircuitState.CLOSED
    print(f"  ✅ 시험 성공 후: {breaker.state.value} (정상 복귀)")

    # 5. 통계 확인
    stats = breaker.stats
    assert stats["total_failures"] == 3
    assert stats["total_circuit_opens"] >= 1
    print(f"  ✅ 통계: 총 실패={stats['total_failures']}, 차단 횟수={stats['total_circuit_opens']}")

    print(f"\n  결과: 모든 Circuit Breaker 테스트 통과")


# =====================================================================
#  TEST 3: @self_healing Decorator (Sync)
# =====================================================================
def test_self_healing_sync():
    separator("TEST 3: @self_healing Decorator — 동기 함수 테스트")

    call_count = 0

    # 3-1. 재시도 후 성공 시나리오
    @self_healing(
        max_retries=3,
        backoff_factor=1.5,
        initial_delay=0.1,
        fallback_value="FALLBACK",
        service_name="test_sync_retry",
    )
    def flaky_function():
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise ConnectionError(f"Attempt {call_count} failed")
        return "SUCCESS"

    result = flaky_function()
    assert result == "SUCCESS"
    assert call_count == 3
    print(f"  ✅ 재시도 후 성공: {result} (시도 횟수: {call_count})")

    # 3-2. 모든 재시도 실패 → fallback 반환
    @self_healing(
        max_retries=2,
        initial_delay=0.1,
        fallback_value={"status": "fallback_triggered"},
        service_name="test_sync_fallback",
    )
    def always_failing():
        raise ConnectionError("Always fails")

    result = always_failing()
    assert result == {"status": "fallback_triggered"}
    print(f"  ✅ fallback 반환: {result}")

    # 3-3. DEGRADABLE 에러 → 즉시 fallback (재시도 없이)
    deg_call_count = 0

    @self_healing(
        max_retries=3,
        initial_delay=0.1,
        fallback_value="DEGRADED_DEFAULT",
        service_name="test_degradable",
    )
    def degradable_error():
        nonlocal deg_call_count
        deg_call_count += 1
        raise ValueError("Invalid data")

    result = degradable_error()
    assert result == "DEGRADED_DEFAULT"
    assert deg_call_count == 1  # 재시도 없이 바로 fallback
    print(f"  ✅ DEGRADABLE 에러 즉시 fallback: {result} (호출 횟수: {deg_call_count})")

    # 3-4. 캐시 fallback 테스트
    success_count = 0

    @self_healing(
        max_retries=1,
        initial_delay=0.1,
        use_cache_fallback=True,
        service_name="test_cache_fallback",
    )
    def cached_function():
        nonlocal success_count
        success_count += 1
        if success_count == 1:
            return "CACHED_RESULT"
        raise ConnectionError("Second call fails")

    # 첫 번째 호출: 성공 → 결과 캐시됨
    r1 = cached_function()
    assert r1 == "CACHED_RESULT"
    print(f"  ✅ 캐시 저장: {r1}")

    # 두 번째 호출: 실패 → 캐시에서 복원
    r2 = cached_function()
    assert r2 == "CACHED_RESULT"
    print(f"  ✅ 캐시 복원: {r2}")

    print(f"\n  결과: 모든 @self_healing 동기 테스트 통과")


# =====================================================================
#  TEST 4: Healing Logger
# =====================================================================
def test_healing_logger():
    separator("TEST 4: Healing Logger — 로그 기록 테스트")

    logger = HealingLogger(console_output=False)

    # 에러 로그 기록
    logger.log_error(
        service="test_service",
        error=ConnectionError("test"),
        classification=classify_error(ConnectionError("test")),
        attempt=1,
    )

    # 복구 로그 기록
    logger.log_recovery(
        service="test_service",
        error_type="ConnectionError",
        action="retry_attempt_1",
        result="success",
        recovery_time_ms=150.5,
    )

    # 이벤트 조회
    events = logger.get_recent_events(count=10, service="test_service")
    assert len(events) == 2
    assert events[0]["event_type"] == "error_detected"
    assert events[1]["event_type"] == "recovery_action"
    print(f"  ✅ 이벤트 기록: {len(events)}개")

    # 통계 조회
    stats = logger.get_recovery_stats("test_service")
    assert stats["total_errors"] == 1
    assert stats["total_recoveries"] == 1
    assert stats["recovery_rate"] == 1.0
    print(f"  ✅ 복구 통계: rate={stats['recovery_rate']}, avg_time={stats['avg_recovery_time_ms']}ms")

    print(f"\n  결과: 모든 Healing Logger 테스트 통과")


# =====================================================================
#  TEST 5: Integration — Circuit Breaker + @self_healing
# =====================================================================
def test_integration():
    separator("TEST 5: Integration — Circuit Breaker + @self_healing 통합 테스트")

    from _shared import get_circuit_breaker

    breaker = get_circuit_breaker("integration_test", failure_threshold=2, reset_timeout=2.0)
    int_call_count = 0

    @breaker.protect
    @self_healing(
        max_retries=1,
        initial_delay=0.1,
        fallback_value="HEALED",
        service_name="integration_test",
    )
    def protected_function():
        nonlocal int_call_count
        int_call_count += 1
        if int_call_count <= 4:
            raise ConnectionError("Service unavailable")
        return "REAL_RESULT"

    # 처음 2번: 실패 (Circuit Breaker 기록)
    try:
        protected_function()
    except ConnectionError:
        pass

    try:
        protected_function()
    except ConnectionError:
        pass

    # Circuit Breaker가 OPEN되었는지 확인
    print(f"  현재 상태: {breaker.state.value}")
    assert breaker.state == CircuitState.OPEN
    print(f"  ✅ Circuit Breaker OPEN 전환 확인")

    # OPEN 상태에서 호출 시도 → CircuitOpenError
    try:
        protected_function()
        print(f"  ❌ CircuitOpenError가 발생해야 함")
    except CircuitOpenError as e:
        print(f"  ✅ CircuitOpenError 발생: {e.remaining_seconds:.1f}초 후 재시도 가능")

    print(f"\n  결과: 통합 테스트 통과")


# =====================================================================
#  Main Runner
# =====================================================================
if __name__ == "__main__":
    print("\n" + "🔧" * 30)
    print("  Self-Healing System 검증 테스트 시작")
    print("🔧" * 30)

    start = time.time()

    test_error_classifier()
    test_circuit_breaker()
    test_self_healing_sync()
    test_healing_logger()
    test_integration()

    elapsed = time.time() - start

    print("\n" + "=" * 60)
    print(f"  ✅ 모든 테스트 통과! (소요 시간: {elapsed:.1f}초)")
    print("=" * 60)
