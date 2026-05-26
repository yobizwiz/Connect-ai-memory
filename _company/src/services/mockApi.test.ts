import { submitQuizData } from './mockApi';
import { QuizState, DiagnosisResult } from '../types/quizTypes';

describe('MockApi: submitQuizData Integration Test', () => {

    test('should return High risk level when accumulatedScore is high', async () => {
        const state: QuizState = {
            currentQuestionIndex: 1,
            accumulatedScore: 30,
            selectedAnswers: { 'Q1': 'c' }
        };

        const result: DiagnosisResult = await submitQuizData(state);

        expect(result.riskLevel).toBe('High'); 
        expect(result.totalScore).toBe(30);
        expect(result.detailedFindings.length).toBeGreaterThan(0);
    });

    test('should return Low risk level when accumulatedScore is low', async () => {
        const state: QuizState = {
            currentQuestionIndex: 1,
            accumulatedScore: 5,
            selectedAnswers: { 'Q1': 'a' }
        };

        const result: DiagnosisResult = await submitQuizData(state);

        expect(result.riskLevel).toBe('Low');
        expect(result.totalScore).toBe(5); 
    });

    test('should return Medium risk level when accumulatedScore is medium', async () => {
        const state: QuizState = {
            currentQuestionIndex: 1,
            accumulatedScore: 15,
            selectedAnswers: { 'Q1': 'b' }
        };

        const result: DiagnosisResult = await submitQuizData(state);

        expect(result.riskLevel).toBe('Medium'); 
        expect(result.totalScore).toBe(15);
    });
});