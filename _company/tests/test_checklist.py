"""Phase 3 체크리스트 엔진 검증 테스트."""
import sys, os, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.checklist import CHECKLIST_QUESTIONS, score_checklist, ComplianceCategory

def separator(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# =====================================================================
# TEST 1: 체크리스트 문항 검증
# =====================================================================
def test_questions():
    separator("TEST 1: 체크리스트 문항 검증")
    
    assert len(CHECKLIST_QUESTIONS) == 20, f"20문항이어야 함, 현재: {len(CHECKLIST_QUESTIONS)}"
    print(f"  ✅ 문항 수: {len(CHECKLIST_QUESTIONS)}개")
    
    # 모든 문항에 ID가 있는지
    ids = [q.id for q in CHECKLIST_QUESTIONS]
    assert len(ids) == len(set(ids)), "중복 ID 존재"
    print(f"  ✅ ID 고유성 확인")
    
    # 모든 카테고리 포함되는지
    categories = set(q.category for q in CHECKLIST_QUESTIONS)
    assert len(categories) >= 8, f"최소 8개 카테고리 필요, 현재: {len(categories)}"
    print(f"  ✅ 카테고리 {len(categories)}개:")
    for cat in sorted(categories, key=lambda c: c.value):
        count = sum(1 for q in CHECKLIST_QUESTIONS if q.category == cat)
        print(f"     - {cat.value}: {count}문항")
    
    # 모든 문항에 개선 가이드가 있는지
    for q in CHECKLIST_QUESTIONS:
        assert q.remediation_summary, f"{q.id}: remediation_summary 없음"
        assert q.remediation_detail, f"{q.id}: remediation_detail 없음"
        assert len(q.remediation_detail) > 200, f"{q.id}: 상세 가이드가 너무 짧음"
        assert q.estimated_fix_days > 0, f"{q.id}: fix_days가 0"
        assert q.estimated_fix_cost_usd > 0, f"{q.id}: fix_cost가 0"
    print(f"  ✅ 모든 문항에 개선 가이드 존재 (summary + detail)")
    
    print(f"\n  결과: 문항 검증 통과 ✅")


# =====================================================================
# TEST 2: 최악 시나리오 (전부 미충족)
# =====================================================================
def test_worst_case():
    separator("TEST 2: 최악 시나리오 — 전부 미충족")
    
    # 모든 문항 False
    answers = {q.id: False for q in CHECKLIST_QUESTIONS}
    result = score_checklist(answers)
    
    assert result.passed == 0
    assert result.failed == 20
    assert result.compliance_score == 0.0
    assert result.grade == "F"
    assert len(result.gaps) == 20
    
    print(f"  ✅ 점수: {result.compliance_score}/100 (등급: {result.grade})")
    print(f"  ✅ 갭: {result.failed}개")
    print(f"  ✅ 예상 수정 비용: ${result.total_estimated_fix_cost_usd:,.0f}")
    print(f"  ✅ 예상 수정 기간: {result.total_estimated_fix_days}일 (병렬 수행 시)")
    
    # 무료 가이드 1개만 있는지
    free_guides = [g for g in result.gaps if g.is_free_guide]
    assert len(free_guides) == 1, f"무료 가이드 1개여야 함, 현재: {len(free_guides)}"
    print(f"  ✅ 무료 가이드: 1개 ('{free_guides[0].question_id}')")
    print(f"     → {free_guides[0].question[:60]}...")
    
    print(f"\n  결과: 최악 시나리오 검증 통과 ✅")


# =====================================================================
# TEST 3: 최선 시나리오 (전부 충족)
# =====================================================================
def test_best_case():
    separator("TEST 3: 최선 시나리오 — 전부 충족")
    
    answers = {q.id: True for q in CHECKLIST_QUESTIONS}
    result = score_checklist(answers)
    
    assert result.passed == 20
    assert result.failed == 0
    assert result.compliance_score == 100.0
    assert result.grade == "A"
    assert len(result.gaps) == 0
    
    print(f"  ✅ 점수: {result.compliance_score}/100 (등급: {result.grade})")
    print(f"  ✅ 갭: {result.failed}개")
    print(f"  ✅ 수정 비용: $0")
    
    print(f"\n  결과: 최선 시나리오 검증 통과 ✅")


# =====================================================================
# TEST 4: 현실적 시나리오 (일부 충족)
# =====================================================================
def test_realistic():
    separator("TEST 4: 현실적 시나리오 — 스타트업 (12/20 충족)")
    
    # 전형적 스타트업: 기본은 하지만 감사, 체계적 정책은 없음
    answers = {
        "DP-01": False,  # 데이터 인벤토리 없음
        "DP-02": True,   # 프라이버시 정책 있음
        "DP-03": False,  # DSR 처리 불가
        "AC-01": True,   # MFA 있음
        "AC-02": False,  # 최소 권한 미적용
        "IR-01": False,  # 사고 대응 계획 없음
        "IR-02": False,  # 72시간 탐지 불가
        "ET-01": False,  # 보안 교육 없음
        "ET-02": True,   # 사용 정책 있음
        "DM-01": False,  # 보관 정책 없음
        "DM-02": True,   # 최소 수집은 함
        "TP-01": False,  # DPA 없음
        "TP-02": False,  # 벤더 평가 없음
        "EN-01": True,   # 암호화 있음
        "EN-02": True,   # 패스워드 관리 함
        "AU-01": True,   # 감사 로그 있음
        "AU-02": False,  # 리스크 평가 없음
        "CM-01": True,   # 동의 관리 있음
        "CM-02": True,   # COPPA 해당없음 처리
        "BC-01": True,   # 백업 있음
    }
    
    result = score_checklist(answers)
    
    assert 40 < result.compliance_score < 80, f"점수가 예상 범위 밖: {result.compliance_score}"
    assert result.grade in ("C", "D"), f"등급이 C or D여야 함: {result.grade}"
    
    print(f"  ✅ 점수: {result.compliance_score}/100 (등급: {result.grade})")
    print(f"  ✅ 충족: {result.passed}개 / 미충족: {result.failed}개")
    print(f"  ✅ 예상 수정 비용: ${result.total_estimated_fix_cost_usd:,.0f}")
    
    # 갭이 심각도 순으로 정렬되어 있는지
    severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    for i in range(len(result.gaps) - 1):
        assert severity_order[result.gaps[i].severity] <= severity_order[result.gaps[i+1].severity], \
            "갭이 심각도 순으로 정렬되지 않음"
    print(f"  ✅ 갭 심각도 순 정렬 확인")
    
    # 무료 가이드
    free_guides = [g for g in result.gaps if g.is_free_guide]
    assert len(free_guides) == 1
    print(f"  ✅ 무료 가이드: '{free_guides[0].question_id}' ({free_guides[0].estimated_fix_days}일, ${free_guides[0].estimated_fix_cost_usd:,.0f})")
    
    # 카테고리별 점수
    print(f"\n  📊 카테고리별 점수:")
    for cat, stats in result.category_scores.items():
        if stats["total"] > 0:
            print(f"     - {cat}: {stats['score']}% ({stats['passed']}/{stats['total']})")
    
    print(f"\n  결과: 현실적 시나리오 검증 통과 ✅")


# =====================================================================
# TEST 5: 무료/유료 콘텐츠 분리
# =====================================================================
def test_free_paid_split():
    separator("TEST 5: 무료/유료 콘텐츠 분리")
    
    answers = {q.id: False for q in CHECKLIST_QUESTIONS}
    result = score_checklist(answers)
    
    free = [g for g in result.gaps if g.is_free_guide]
    paid = [g for g in result.gaps if not g.is_free_guide]
    
    assert len(free) == 1, "무료 1개만 있어야 함"
    assert len(paid) == 19, "유료 19개여야 함"
    
    # 무료 가이드는 가장 쉬운 것 (fix_days 최소)
    min_days = min(g.estimated_fix_days for g in result.gaps)
    assert free[0].estimated_fix_days == min_days, "무료 가이드가 가장 쉬운 항목이 아님"
    
    print(f"  ✅ 무료 가이드: 1개 ({free[0].question_id}, {free[0].estimated_fix_days}일)")
    print(f"  ✅ 유료 가이드: {len(paid)}개")
    print(f"  ✅ 무료 = 가장 쉬운 항목 ({min_days}일) 확인")
    
    print(f"\n  결과: 무료/유료 분리 검증 통과 ✅")


# =====================================================================
# Main Runner
# =====================================================================
if __name__ == "__main__":
    print("\n" + "🔧" * 30)
    print("  Phase 3: 체크리스트 엔진 검증 테스트")
    print("🔧" * 30)

    start = time.time()

    test_questions()
    test_worst_case()
    test_best_case()
    test_realistic()
    test_free_paid_split()

    elapsed = time.time() - start

    print("\n" + "=" * 60)
    print(f"  ✅ 모든 테스트 통과! (소요 시간: {elapsed:.1f}초)")
    print("=" * 60)
