/**
 * @fileOverview Paywall 결제 프로세스의 단일 진실 출처(Single Source of Truth) 역할을 하는 State Machine Controller.
 * 모든 상태 전이는 이 클래스를 통해 이루어져야 하며, 직접적인 상태 변경은 허용되지 않습니다.
 */

export enum PaymentState {
    UNVISITED = 'UNVISITED', // 초기 진입 상태 (페이지 로딩)
    RISK_VIEWING = 'RISK_VIEWING', // 리스크 점수(Lmax)를 보고 보는 단계
    WARNING_ISSUED = 'WARNING_ISSUED', // 경고 임계치 초과 -> 결제 필요 알림
    PAYMENT_MODAL_OPEN = 'PAYMENT_MODAL_OPEN', // 결제 모달 창 활성화 (API 호출 대기)
    PROCESSING = 'PROCESSING', // 결제 처리 중 (로딩 스피너 표시)
    SUCCESS = 'SUCCESS', // 성공적으로 보고서 확보 및 구독 완료
    FAILED = 'FAILED', // 결제 실패 또는 시스템 오류 발생
}

export interface PaywallState {
    currentState: PaymentState;
    lastUpdated: Date;
    riskScoreLmax: number | null; // 현재 리스크 점수
    isPaymentRequired: boolean;   // 결제가 필수인지 여부 (true/false)
    transactionId?: string;      // 마지막 트랜잭션 ID
}

/**
 * Paywall 상태를 관리하고 유효한 전이 경로만 제공하는 서비스.
 */
export class PaywallStateController {
    private state: PaywallState = {
        currentState: PaymentState.UNVISITED,
        lastUpdated: new Date(),
        riskScoreLmax: null,
        isPaymentRequired: false,
    };

    public getCurrentState(): PaywallState {
        return this.state;
    }

    /**
     * 리스크 데이터를 기반으로 초기 상태를 설정합니다.
     * @param initialRiskScore - 계산된 Lmax 점수.
     */
    public initialize(initialRiskScore: number): void {
        if (typeof initialRiskScore !== 'number') {
            throw new Error('Lmax score must be a valid number for initialization.');
        }
        this.state = {
            currentState: PaymentState.RISK_VIEWING,
            lastUpdated: new Date(),
            riskScoreLmax: initialRiskScore,
            isPaymentRequired: initialRiskScore > 750 // 임계값 설정 예시
        };
    }

    /**
     * 상태 전이 로직 (State Transition Logic)
     * @param nextState - 목표 상태.
     * @param payload - 전이에 필요한 데이터 (예: paymentId, transactionId).
     * @returns 새로운 PaywallState 객체.
     */
    public transition(nextState: PaymentState, payload?: any): PaywallState {
        const validTransitions = this.getValidTransitions(this.state.currentState);

        if (!validTransitions.includes(nextState)) {
            // !!! 중요: 유효하지 않은 전이 시도는 보안 및 무결성 위반으로 간주하고 에러를 던집니다.
            throw new Error(`Invalid state transition attempted: Cannot move from ${this.state.currentState} to ${nextState}.`);
        }

        let newState = { ...this.state, currentState: nextState, lastUpdated: new Date() };
        
        // Payload에 따라 상태 데이터를 업데이트합니다. (예: 트랜잭션 ID 저장)
        if (payload && payload.transactionId) {
            newState.transactionId = payload.transactionId;
        }

        this.state = newState;
        console.log(`[STATE TRANSITION] State moved from ${validTransitions[0]} to ${nextState}`);
        return this.state;
    }

    /**
     * 현재 상태에서 유효한 다음 상태 목록을 반환합니다. (유한 상태 기계 정의)
     */
    private getValidTransitions(currentState: PaymentState): PaymentState[] {
        switch (currentState) {
            case PaymentState.UNVISITED:
                return [PaymentState.RISK_VIEWING];
            case PaymentState.RISK_VIEWING:
                // 리스크가 높으면 경고로, 아니면 결제 없이 다음 단계 진행 가능.
                return this.state.isPaymentRequired ? [PaymentState.WARNING_ISSUED] : [PaymentState.SUCCESS]; 
            case PaymentState.WARNING_ISSUED:
                return [PaymentState.PAYMENT_MODAL_OPEN, PaymentState.FAILED]; // 결제 시도 또는 취소/실패
            case PaymentState.PAYMENT_MODAL_OPEN:
                return [PaymentState.PROCESSING]; // 실제 API 호출 시작
            case PaymentState.PROCESSING:
                // 성공하거나 실패하여 최종 상태에 도달해야 함
                return [PaymentState.SUCCESS, PaymentState.FAILED]; 
            default:
                return [];
        }
    }

    /**
     * *******************************************************
     * TODO: 여기에 초기화된 현재 Paywall State를 반환하는 Getter 로직을 추가합니다.
     */
}