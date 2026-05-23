import json
from datetime import date
import pandas as pd

# 상수 정의: 경고 임계치 (Red Zone Alert Threshold)
RED_ZONE_THRESHOLD = 0.5  # Red Zone Trigger Rate가 50%를 넘으면 경고 발생 가정

def calculate_trigger_rate(data):
    """주어진 데이터를 기반으로 Red Zone Trigger Rate (%)를 계산합니다."""
    if not data or 'red_zone_triggers' is None or 'total_leads' is None:
        return 0.0, 0
    
    # (Red Zone Triggers / Total Leads) * 100
    rate = (data['red_zone_triggers'] / data['total_leads']) * 100
    return round(rate, 2), data['red_zone_triggers']

def monitor_funnel_health(file_path="funnel_monitor/mock_data.json"):
    """
    통합된 퍼널 데이터를 로드하고, KPI를 계산하며, 경고 상태를 반환합니다.
    [근거: CEO 지시] KPI인 'Red Zone Trigger Rate (%) 변화 추이'를 시각적으로 즉시 알림(Alert)할 수 있도록 구현해야 합니다.
    """
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("🚨 ERROR: mock_data.json 파일을 찾을 수 없습니다.")
        return {"overall_rate": 0, "alert": "DATA MISSING"}

    all_sources = data['sources']
    all_rates = []
    
    # 모든 소스의 데이터를 통합하여 데이터프레임 생성
    source_data = {}
    for source_name, records in all_sources.items():
        source_records = []
        for record in records:
            rate, _ = calculate_trigger_rate(record)
            source_records.append({
                'Date': record['date'],
                'Source': source_name,
                'Total Leads': record['total_leads'],
                'Red Zone Triggers': record['red_zone_triggers'],
                'Trigger Rate (%)': rate
            })
        source_data[source_name] = pd.DataFrame(source_records)

    # 전체 통합 데이터프레임 생성
    df_combined = pd.concat(source_data.values())
    
    if df_combined.empty:
        return {"overall_rate": 0, "alert": "NO DATA"}

    # 최종 KPI 계산 및 분석
    latest_day_rates = df_combined.groupby('Date')['Trigger Rate (%)'].mean().reset_index()
    print("\n--- [🔍 퍼널 건강 모니터링 결과] ---")
    print(f"✅ 데이터 분석 기준일: {latest_day_rates['Date'].iloc[-1]}")

    # 1. 전체 평균 Red Zone Trigger Rate (최신 데이터 기준)
    overall_rate = df_combined['Trigger Rate (%)'].mean()
    print(f"📊 종합 평균 Red Zone Trigger Rate: {round(overall_rate, 2)}%")

    # 2. 추세 분석 및 경고 발생 여부 확인
    latest_rate = df_combined[df_combined['Date'] == latest_day_rates['Date'].iloc[-1]]['Trigger Rate (%)'].mean()
    previous_rate = df_combined[df_combined['Date'] == latest_day_rates['Date'].iloc[-2]]['Trigger Rate (%)'].mean() if len(latest_day_rates) >= 2 else None

    alert_message = ""
    if previous_rate is not None:
        change_percent = ((latest_rate - previous_rate) / previous_rate) * 100
        
        if latest_rate > RED_ZONE_THRESHOLD and change_percent >= 10: # 🚨 임계치 초과 + 상승폭 10% 이상 시 경고
            alert_message = f"🔥 CRITICAL ALERT! Red Zone Trigger Rate가 {round(change_percent, 1)}% 급증했습니다. 즉각적인 전략 재검토가 필요합니다."
        elif latest_rate > RED_ZONE_THRESHOLD:
             alert_message = "⚠️ WARNING: Red Zone Trigger Rate가 임계치를 상회했습니다. 주의 깊은 모니터링이 필요합니다."
        else:
            alert_message = f"✅ HEALTHY: 지표 변화 안정적입니다. (전주 대비 {round(change_percent, 1)}% 변동)"

    # 결과 리턴 구조화
    monitoring_result = {
        "overall_rate": round(overall_rate, 2),
        "latest_day_rates": latest_rate,
        "previous_day_rates": previous_rate,
        "alert_message": alert_message,
        "data_summary": df_combined.to_dict('records') # 시각화를 위해 데이터 전체를 포함
    }

    return monitoring_result


if __name__ == '__main__':
    # 실행 및 테스트
    result = monitor_funnel_health()
    print("\n==============================================")
    print("🚀 시스템 분석 완료. 결과 구조화:")
    print(json.dumps(result, indent=2))
    print("==============================================\n")