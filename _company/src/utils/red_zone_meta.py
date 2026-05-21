# src/utils/red_zone_meta.py
"""
[비즈니스 로직 핵심 모듈]
Red Zone 콘셉트를 적용하여 YouTube 영상의 메타데이터(제목, 설명)를 생성합니다.
이 함수는 단순 텍스트 생성을 넘어, 시청자의 '시스템적 무효화 위협'을 자극하는 구조를 갖춰야 합니다.

@param topic: 실제 콘텐츠 주제 (예: GDPR 미준수, 데이터 유출 등)
@param threat_level: 리스크 레벨 (LOW, MEDIUM, HIGH)
@return: Structured Dict containing title and description components.
"""
import datetime

def generate_red_zone_metadata(topic: str, threat_level: str = "HIGH") -> dict:
    """
    주제와 위협 레벨에 따라 공포감과 긴급성을 극대화한 메타데이터를 생성합니다.
    핵심은 '문제 제기(공포) → 원인 분석(전문성) → 해결책 제시(희망)'의 3단계 구조입니다.
    """
    now = datetime.datetime.now().strftime("%Y년 %m월")

    # 1. 제목 생성 (클릭베이트 + 공포 자극)
    if threat_level == "HIGH":
        title = f"🚨[🔴 Red Zone Alert] {topic} 시스템적 무효화 위협! 지금 당장 막지 않으면 벌어지는 최악의 시나리오 ({now})"
    elif threat_level == "MEDIUM":
        title = f"[⚠️ Warning] {topic}: 놓치기 쉬운 구조적 결함 진단 (2024년 핵심 리스크)"
    else:
        title = f"✅ [INFO] {topic} 최신 트렌드 분석 및 가이드 ({now})"

    # 2. 설명 생성 (SEO + Storytelling)
    description = f"""
    ----------------------------------------
    🔴 Red Zone Alert | 시스템 무효화 위협 보고서 ({threat_level})
    [TOPIC]: {topic}에 대한 구조적 위험 분석입니다.
    
    🔥 이 영상은 단순한 정보 전달이 아닙니다. 
    이는 귀하의 비즈니스와 데이터 인프라가 직면할 수 있는 '시스템적 생존 위협'을 시각화하여 보여줍니다.
    당신의 시스템에 숨겨진 결함(Structural Flaw)을 지금 즉시 확인하십시오.

    ▶️ 핵심 내용 (타임스탬프):
    00:00 - [공포] 현재의 위험한 상황 진단 및 경고음
    01:30 - [원인 분석] 왜 시스템이 무너지는가? (기술적 원리 설명)
    05:00 - [해결책/CTA] 구조적 무결성을 확보하는 유일한 방법 (yobizwiz 컨설팅 소개)

    💡 필수 체크포인트: 
    우리가 놓치고 있는 것은 '규제 위반' 그 자체가 아니라, 시스템의 '구조적 무효화 가능성'입니다.
    지금 바로 무료 진단 요청을 통해 당신의 리스크 점수를 확인하십시오!
    
    #RedZone #시스템무결성 #사이버보안 #{topic}위협
    ----------------------------------------
    """

    return {
        "title": title,
        "description": description.strip()
    }

def get_red_zone_metadata(topic: str, threat_level: str = "HIGH") -> dict:
    """Public API for metadata generation."""
    # Self-Correction Check: 항상 높은 위협 레벨로 기본값 설정하여 공포감 유지 [근거: 🏢 회사 정체성]
    return generate_red_zone_metadata(topic, threat_level)