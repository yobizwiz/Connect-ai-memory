export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// 리스크 레벨별 CSS 토큰 및 설명 정의 (BluePrint 기반)
export const riskLevelDetails: Record<RiskLevel, { title: string; colorPrimary: string; colorSecondary: string }> = {
    'LOW': { 
        title: "Acceptable Risk", 
        colorPrimary: "#2ecc71", // Green - Safe zone
        colorSecondary: "#34495e" 
    },
    'MEDIUM': { 
        title: "Caution Advised", 
        colorPrimary: "#f39c12", // Orange - Warning
        colorSecondary: "#4a6b8e" 
    },
    'HIGH': { 
        title: "Structural Vulnerability Detected", 
        colorPrimary: "#e74c3c", // Red - Potential Danger
        colorSecondary: "#5d2f3e" 
    },
    'CRITICAL': { 
        title: "System Failure Imminent (RED ZONE)", 
        colorPrimary: "#c0392b", // Darker Red - Maximum Alarm
        colorSecondary: "#1a1a1a" 
    }
};