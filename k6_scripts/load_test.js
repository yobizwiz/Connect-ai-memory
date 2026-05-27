import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 100, // Virtual Users: 동시 접속 사용자 수 (100명)
    duration: '30s', // 테스트 시간: 30초 동안 진행
    thresholds: {
        // 핵심 지표 검증: 99%의 요청이 500ms 이내에 응답해야 한다.
        'http_req_duration': ['p(99)<500'],
        // 에러율 검증: 성공률이 최소 95% 이상이어야 한다.
        'http_req_failed': ['rate<0.05'], 
    },
};

export default function () {
    const payload = JSON.stringify({
        user_id: `test_user_${Math.random()}`,
        data_payload: { compliance: Math.random() * 10, security: Math.random() * 5 },
        context: "Initial test data for yobizwiz."
    });

    // 엔드포인트 호출
    const res = http.post("http://localhost:8000/api/v1/calculate-risk", payload, {
        headers: { "Content-Type": "application/json" },
    });

    // 응답 확인 및 지연 시간 추가
    console.log(`Status: ${res.status}`);
    sleep(0); 
}