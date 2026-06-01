import * as fs from 'fs';
import * as path from 'path';

/**
 * Design Tokens JSON 파일 경로 설정 (프로젝트 루트 기준)
 */
const TOKEN_PATH = process.cwd() + '/DesignSystem/yobizwiz_design_tokens.json';

let tokens: Record<string, any> | null = null;

export function loadTokens(): Record<string, any> {
    if (tokens === null) {
        try {
            const rawData = fs.readFileSync(TOKEN_PATH, 'utf-8');
            tokens = JSON.parse(rawData);
            console.log("✅ Loaded yobizwiz Design Tokens successfully.");
        } catch (error) {
            console.error(`❌ Failed to load design tokens from ${TOKEN_PATH}. Ensure the file exists and is valid JSON.`);
            // 에러 발생 시 폴백 값 반환하여 컴파일 실패 방지
            tokens = { color: { background-primary: '#000', text-default: '#fff' } }; 
        }
    }
    return tokens;
}

export function getDesignTokens(): Record<string, any> {
    // 실제 사용 시에는 전역 Context나 Zustand 등을 이용하는 것이 더 좋지만,
    // 현재는 간단한 로더 함수로 대체합니다.
    return loadTokens();
}