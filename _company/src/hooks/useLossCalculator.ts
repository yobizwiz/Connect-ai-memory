// Use Loss Calculator Hook: Handles all QLoss state logic (Time, Action, and Sales Triggers)
import { useState, useEffect, useCallback } from 'react';

interface LossState {
  currentQLoss: number; // Current calculated total risk exposure (Total Risk Exposure, $QLoss)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // Systemic risk level
  isTimerRunning: boolean;
}

const INITIAL_LOSS = 0;
const TIME_INTERVAL_MS = 1000; // 1 second interval for demonstration
const LOSS_PER_SECOND = 5; // $Loss per second

export const useLossCalculator = (initialQLoss: number): LossState => {
  const [lossState, setLossState] = useState<LossState>({
    currentQLoss: initialQLoss,
    riskLevel: 'LOW',
    isTimerRunning: true,
  });

  // Function to update QLoss based on time passing
  const calculateTimeLoss = useCallback(() => {
    setLossState(prevState => ({
      ...prevState,
      currentQLoss: Math.min(prevState.currentQLoss + LOSS_PER_SECOND * (TIME_INTERVAL_MS / 1000), 1000), // Max QLoss cap at $1000
      riskLevel: calculateRiskLevel(Math.floor((prevState.currentQLoss / 10) * 1)), // Scale loss to risk level
    }));
  }, []);

  // Function to simulate QLoss spike upon user action failure (e.g., form validation fail)
  const triggerActionFailureSpike = useCallback((spikeAmount: number) => {
    setLossState(prevState => ({
      ...prevState,
      currentQLoss: Math.min(prevState.currentQLoss + spikeAmount, 1000), // Spike amount added
      riskLevel: calculateRiskLevel(Math.floor(((prevState.currentQLoss + spikeAmount) / 10))),
    }));
  }, []);

  // State effect for the timer
  useEffect(() => {
    if (!lossState.isTimerRunning) return;

    const intervalId = setInterval(() => {
      calculateTimeLoss();
    }, TIME_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [calculateTimeLoss, lossState.isTimerRunning]);


  // Simple risk calculation logic based on QLoss (0 to 1000)
  const calculateRiskLevel = (scaledQLoss: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
    if (scaledQLoss < 20) return 'LOW';
    if (scaledQLoss < 50) return 'MEDIUM';
    if (scaledQLoss < 80) return 'HIGH';
    return 'CRITICAL'; // Above 80 -> Critical
  };

  // Initial calculation to set the correct state on mount
  useEffect(() => {
    setLossState(prev => ({
      ...prev,
      riskLevel: calculateRiskLevel(Math.floor((initialQLoss / 10) * 1)),
    }));
  }, [calculateTimeLoss]);

  return lossState;
};