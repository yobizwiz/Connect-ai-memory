// 진단 시스템 전역 타입 정의
export interface DiagnosticQuestion {
    id: string;
    title: string; // 질문 제목
    description: string; // 상세 설명 (위험 요소)
    riskWeight: number; // 이 질문의 리스크 기여도 가중치
    minScore?: number; // 최소 점수 요구사항
}

export interface FormData {
    [key: string]: number | null; // Q ID를 키로, 답변 점수를 값으로 저장
}

export type FunnelState = 'INITIAL' | 'ANSWERING' | 'CALCULATING' | 'FUNNELING_PAYWALL';

export interface DiagnosisContextType {
    formData: FormData;
    lTotalMaxScore: number; // 최종 계산된 최대 위험 노출도 점수
    funnelState: FunnelState;
    updateAnswer: (id: string, score: number) => void;
    calculateAndSetLTotalMax: () => void;
    handleSubmit: () => Promise<boolean>; // 결제 모달 진입 여부 반환
}