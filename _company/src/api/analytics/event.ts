// src/api/analytics/event.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb'; // 가정: MongoDB 사용 및 ID 타입 명시
import connectDB from '@/utils/dbConnect'; // 데이터베이스 연결 유틸리티 (가정)

// 이 구조체는 클라이언트에서 전송하는 이벤트의 스키마를 정의합니다.
interface AnalyticsEventPayload {
    sessionId: string;       // 세션 식별자 (UTM 등에서 추출 가능)
    userId: string | null;    // 로그인된 사용자 ID
    timestamp: number;        // 이벤트 발생 시간 (Unix time)
    threatLevel: 'LOW' | 'MEDIUM' | 'CRITICAL'; // 현재 게이지 레벨
    stageEntered: string;    // 진입한 단계 이름 (예: Initial Assessment, Risk Escalation)
    ctaClicked?: boolean;     // CTA 버튼 클릭 여부 (True/False)
}

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const eventData: AnalyticsEventPayload | null = req.body;

    // 1. 필수 유효성 검사 (Validation)
    if (!eventData || !eventData.sessionId || !eventData.stageEntered || !['LOW', 'MEDIUM', 'CRITICAL'].includes(eventData.threatLevel)) {
        console.error("Invalid event payload received:", req.body);
        return res.status(400).json({ message: "Missing required fields in the event payload." });
    }

    try {
        // 2. 데이터베이스 연결 및 로직 실행 (DB Interaction)
        await connectDB(); // DB 연결 시도

        // 실제로는 이 곳에서 MongoDB나 다른 적합한 NoSQL/Analytics DB에 기록합니다.
        // 예: await EventModel.create({ 
        //     sessionId: eventData.sessionId, 
        //     ...eventData 
        // });
        console.log(`✅ [Event Log Success] User ${eventData.userId || 'Anon'} logged stage '${eventData.stageEntered}' at level ${eventData.threatLevel}.`);

        return res.status(200).json({ success: true, message: "Analytics event logged successfully." });
    } catch (error) {
        console.error("Failed to log analytics event:", error);
        // 500 에러를 반환하되, 클라이언트에 치명적인 영향을 주지 않도록 처리합니다.
        return res.status(500).json({ success: false, message: "Internal server error during logging." });
    }
};

export default handler;