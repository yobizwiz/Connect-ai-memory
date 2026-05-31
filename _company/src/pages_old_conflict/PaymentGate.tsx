import React, { useState, useEffect, useCallback, useRef, FC, ChangeEvent } from 'react';
import Head from 'next/head';
import '../styles/RedFlash.css';

// --- Type Definitions ---
interface PaymentData {
    riskScore: number;
    reportData: any;
    transactionId?: string;
}

interface DiagnosisResponse {
    q_loss_amount: number;
    risk_level: 'LOW' | 'HIGH' | 'CRITICAL';
    recommendation: string;
}

const PaymentGate: FC<{ initialData?: PaymentData }> = ({ initialData }) => {
    // --- [1] Telemetry Sliders States ---
    const [complianceGap, setComplianceGap] = useState<number>(30);
    const [dataFlowGap, setDataFlowGap] = useState<number>(3);
    const [manualReviewFactor, setManualReviewFactor] = useState<number>(0.8);

    // --- [2] Live Telemetry Computations ---
    const [qLossAmount, setQLossAmount] = useState<number>(15000000);
    const [riskLevel, setRiskLevel] = useState<'LOW' | 'HIGH' | 'CRITICAL'>('LOW');
    const [isBackendLive, setIsBackendLive] = useState<boolean>(false);

    // --- [3] Gateway Interface States ---
    const [isGatewayVisible, setIsGatewayVisible] = useState<boolean>(false);
    const [cardholderName, setCardholderName] = useState<string>('');
    const [cardNumber, setCardNumber] = useState<string>('');
    const [cardExpiry, setCardExpiry] = useState<string>('');
    const [cardCvc, setCardCvc] = useState<string>('');
    const [isRiskAccepted, setIsRiskAccepted] = useState<boolean>(false);
    
    const [checkoutStatus, setCheckoutStatus] = useState<'FORM' | 'TERMINAL' | 'SUCCESS' | 'DECLINED'>('FORM');
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [progressBarWidth, setProgressBarWidth] = useState<number>(0);
    const [isScreenFlashing, setIsScreenFlashing] = useState<boolean>(false);

    // --- [4] Web Audio warning engine references ---
    const audioCtxRef = useRef<AudioContext | null>(null);
    const ambientOscRef = useRef<OscillatorNode | null>(null);
    const ambientGainRef = useRef<GainNode | null>(null);
    const alarmOsc1Ref = useRef<OscillatorNode | null>(null);
    const alarmOsc2Ref = useRef<OscillatorNode | null>(null);
    const alarmGainRef = useRef<GainNode | null>(null);
    const alarmIntervalRef = useRef<number | null>(null);
    const [isAudioEngineActive, setIsAudioEngineActive] = useState<boolean>(false);

    // --- Cleanup audio context on unmount ---
    useEffect(() => {
        return () => {
            if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
            if (ambientOscRef.current) {
                try { ambientOscRef.current.stop(); } catch (e) {}
            }
            if (alarmOsc1Ref.current) {
                try { alarmOsc1Ref.current.stop(); } catch (e) {}
            }
            if (alarmOsc2Ref.current) {
                try { alarmOsc2Ref.current.stop(); } catch (e) {}
            }
            if (audioCtxRef.current) {
                try { audioCtxRef.current.close(); } catch (e) {}
            }
        };
    }, []);

    // --- Helper formatting ---
    const formatUSD = (val: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    // --- [5] Web Audio Engine Controls ---
    const initAudio = () => {
        if (typeof window === 'undefined' || audioCtxRef.current) return;

        try {
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtxClass();
            audioCtxRef.current = ctx;

            // 1. Ambient low frequency rumble (55Hz sawtooth)
            const ambOsc = ctx.createOscillator();
            ambOsc.type = 'sawtooth';
            ambOsc.frequency.setValueAtTime(55, ctx.currentTime);

            const lpFilter = ctx.createBiquadFilter();
            lpFilter.type = 'lowpass';
            lpFilter.frequency.setValueAtTime(120, ctx.currentTime);

            const ambGain = ctx.createGain();
            ambGain.gain.setValueAtTime(0.08, ctx.currentTime);

            ambOsc.connect(lpFilter);
            lpFilter.connect(ambGain);
            ambGain.connect(ctx.destination);
            ambOsc.start();

            ambientOscRef.current = ambOsc;
            ambientGainRef.current = ambGain;

            // 2. High-tension sirens
            const alOsc1 = ctx.createOscillator();
            alOsc1.type = 'sine';
            alOsc1.frequency.setValueAtTime(440, ctx.currentTime);

            const alOsc2 = ctx.createOscillator();
            alOsc2.type = 'sawtooth';
            alOsc2.frequency.setValueAtTime(660, ctx.currentTime);

            const alGain = ctx.createGain();
            alGain.gain.setValueAtTime(0.0, ctx.currentTime);

            alOsc1.connect(alGain);
            alOsc2.connect(alGain);
            alGain.connect(ctx.destination);

            alOsc1.start();
            alOsc2.start();

            alarmOsc1Ref.current = alOsc1;
            alarmOsc2Ref.current = alOsc2;
            alarmGainRef.current = alGain;

            setIsAudioEngineActive(true);

            // Initial audio warning beeps
            playWarningBeep(600, 0.3);
        } catch (e) {
            console.error("Audio Engine failed to initialize", e);
        }
    };

    const playWarningBeep = (freq: number, duration: number) => {
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state === 'suspended') return;

        try {
            const beepOsc = ctx.createOscillator();
            const beepGain = ctx.createGain();

            beepOsc.type = 'sine';
            beepOsc.frequency.setValueAtTime(freq, ctx.currentTime);

            beepGain.gain.setValueAtTime(0.05, ctx.currentTime);
            beepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            beepOsc.connect(beepGain);
            beepGain.connect(ctx.destination);
            beepOsc.start();
            beepOsc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Failed to play warning beep", e);
        }
    };

    const setAlarmActive = (isActive: boolean, doubleSpeed = false) => {
        const ctx = audioCtxRef.current;
        if (!ctx || !ambientGainRef.current || !alarmGainRef.current) return;

        if (isActive) {
            ambientGainRef.current.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1);

            if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
            alarmGainRef.current.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.5);

            let toggle = false;
            const intervalTime = doubleSpeed ? 200 : 400;

            alarmIntervalRef.current = window.setInterval(() => {
                const innerCtx = audioCtxRef.current;
                if (!innerCtx || !alarmOsc1Ref.current || !alarmOsc2Ref.current) return;
                toggle = !toggle;

                if (toggle) {
                    alarmOsc1Ref.current.frequency.linearRampToValueAtTime(doubleSpeed ? 780 : 580, innerCtx.currentTime + 0.1);
                    alarmOsc2Ref.current.frequency.linearRampToValueAtTime(doubleSpeed ? 1180 : 880, innerCtx.currentTime + 0.1);
                } else {
                    alarmOsc1Ref.current.frequency.linearRampToValueAtTime(doubleSpeed ? 480 : 380, innerCtx.currentTime + 0.1);
                    alarmOsc2Ref.current.frequency.linearRampToValueAtTime(doubleSpeed ? 580 : 480, innerCtx.currentTime + 0.1);
                }
                playWarningBeep(1200, 0.05);
            }, intervalTime);
        } else {
            ambientGainRef.current.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1);
            alarmGainRef.current.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.5);
            if (alarmIntervalRef.current) {
                clearInterval(alarmIntervalRef.current);
                alarmIntervalRef.current = null;
            }
        }
    };

    const toggleAudio = () => {
        if (!audioCtxRef.current) {
            initAudio();
        } else {
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
                setIsAudioEngineActive(true);
                playWarningBeep(600, 0.2);
            } else if (audioCtxRef.current.state === 'running') {
                audioCtxRef.current.suspend();
                setIsAudioEngineActive(false);
            }
        }
    };

    // --- [6] Real-time Telemetry Simulation (FastAPI Call with Offline Fallback) ---
    const runDiagnostics = useCallback(async (gap: number, flow: number, factor: number) => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/v1/diagnose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    compliance_gap: gap,
                    data_flow_gap: flow,
                    manual_review_factor: factor
                })
            });
            const data: DiagnosisResponse = await res.json();
            setQLossAmount(data.q_loss_amount);
            setRiskLevel(data.risk_level);
            setIsBackendLive(true);
        } catch (err) {
            // Local fallback math engine if FastAPI server is offline
            const riskScore = (gap * 0.4) + (flow * 12) + (factor * 8);
            let qLoss = Math.floor(riskScore * 850000);
            if (qLoss < 15000000) qLoss = 15000000;

            let computedRisk: 'LOW' | 'HIGH' | 'CRITICAL' = "LOW";
            if (gap >= 75 || flow >= 8) {
                computedRisk = "CRITICAL";
            } else if (gap >= 40 || flow >= 4) {
                computedRisk = "HIGH";
            }

            setQLossAmount(qLoss);
            setRiskLevel(computedRisk);
            setIsBackendLive(false);
        }
    }, []);

    // Trigger simulation calculations on inputs change
    useEffect(() => {
        runDiagnostics(complianceGap, dataFlowGap, manualReviewFactor);
    }, [complianceGap, dataFlowGap, manualReviewFactor, runDiagnostics]);

    // Handle warning sirens trigger based on risk score levels
    useEffect(() => {
        if (isAudioEngineActive && audioCtxRef.current?.state === 'running') {
            if (riskLevel === 'CRITICAL') {
                setAlarmActive(true, isRiskAccepted);
            } else {
                setAlarmActive(false);
            }
        }
    }, [riskLevel, isAudioEngineActive, isRiskAccepted]);

    // Trigger local beep noises on slider interaction
    const handleGapSlider = (e: ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setComplianceGap(val);
        playWarningBeep(400 + val * 3, 0.05);
    };

    const handleFlowSlider = (e: ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setDataFlowGap(val);
        playWarningBeep(500 + val * 30, 0.05);
    };

    const handleFactorSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        const val = parseFloat(e.target.value);
        setManualReviewFactor(val);
        playWarningBeep(300, 0.15);
    };

    // --- [7] Confirmation Trigger Action (Checkbox Toggle) ---
    const handleRiskCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsRiskAccepted(checked);

        // Visual Crimson Flash Trigger
        setIsScreenFlashing(true);
        setTimeout(() => setIsScreenFlashing(false), 400);

        if (isAudioEngineActive) {
            if (checked) {
                // Pitch shift double speed siren
                if (riskLevel === 'CRITICAL') {
                    setAlarmActive(true, true);
                } else {
                    playWarningBeep(880, 0.3);
                }
            } else {
                if (riskLevel === 'CRITICAL') {
                    setAlarmActive(true, false);
                } else {
                    playWarningBeep(330, 0.15);
                }
            }
        }
    };

    // Card format function
    const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let matches = val.match(/\d{4,16}/g);
        let match = matches && matches[0] || '';
        let parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length > 0) {
            setCardNumber(parts.join(' '));
        } else {
            setCardNumber(val);
        }
    };

    // --- [8] Cyber compilation progress terminal logs execution ---
    const printLog = async (msg: string, logsArray: string[], delay = 350): Promise<string[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedLogs = [...logsArray, msg];
                setTerminalLogs(updatedLogs);
                
                if (isAudioEngineActive) {
                    if (msg.startsWith('[ERR]')) {
                        playWarningBeep(330, 0.15);
                    } else if (msg.startsWith('[SYS]')) {
                        playWarningBeep(980, 0.03);
                    } else {
                        playWarningBeep(1150, 0.02);
                    }
                }
                resolve(updatedLogs);
            }, delay);
        });
    };

    const handleSecurePaymentSubmit = async () => {
        if (!cardholderName || !cardNumber || !cardExpiry || !cardCvc) {
            alert("🔒 Please fill in all credit card details to authorize structural integrity coverage.");
            return;
        }

        setCheckoutStatus('TERMINAL');
        setProgressBarWidth(0);

        let currentLogs: string[] = [];

        // Step-by-step sequential Hacker terminal printing
        currentLogs = await printLog("Initializing security tunnel via PayPal TLS 1.3...", currentLogs, 400);
        setProgressBarWidth(10);

        currentLogs = await printLog(`Connected secure endpoint: tx_${Math.floor(Math.random() * 900000 + 100000)}_yobizwiz`, currentLogs, 300);
        setProgressBarWidth(25);

        currentLogs = await printLog("Decoding audit risk metadata payload...", currentLogs, 400);
        setProgressBarWidth(40);

        currentLogs = await printLog(`Metadata: SeverityLevel=${riskLevel}, QLossFactor=${complianceGap}%`, currentLogs, 250);
        setProgressBarWidth(55);

        currentLogs = await printLog("Contacting bank gateway verification system...", currentLogs, 500);
        setProgressBarWidth(70);

        const isFailurePath = cardNumber.replace(/\s+/g, '').startsWith('0000');

        if (isFailurePath) {
            currentLogs = await printLog("[SYS] Handshake authorized with bank system.", currentLogs, 600);
            setProgressBarWidth(80);

            currentLogs = await printLog("Routing standard coverage allocation values...", currentLogs, 300);
            currentLogs = await printLog("[ERR] PayPal processing alert: CARD_DECLINED_INSUFFICIENT_ASSETS", currentLogs, 800);
            setProgressBarWidth(90);

            currentLogs = await printLog("[ERR] Compliance defense funding validation failed.", currentLogs, 450);
            currentLogs = await printLog("[ERR] Legal defense shield deployment aborted.", currentLogs, 300);
            setProgressBarWidth(100);

            currentLogs = await printLog("System integrity shutdown completed with exit code: 403.", currentLogs, 500);

            if (isAudioEngineActive) {
                playWarningBeep(220, 0.6);
            }

            setTimeout(() => {
                setCheckoutStatus('DECLINED');
            }, 800);
        } else {
            currentLogs = await printLog("[SYS] Handshake authorized with bank system.", currentLogs, 600);
            setProgressBarWidth(80);

            currentLogs = await printLog("Routing compliance defense shield funds... OK", currentLogs, 350);
            currentLogs = await printLog("Generating 2048-bit RSA Legal Audit Security Keys...", currentLogs, 500);
            setProgressBarWidth(90);

            currentLogs = await printLog("Injecting live auditing middleware proxy... SUCCESS", currentLogs, 400);
            currentLogs = await printLog("Compiling defensive architecture compliance assets...", currentLogs, 600);
            setProgressBarWidth(95);

            currentLogs = await printLog("Generating secure verification seal: SE-93820-AUDIT", currentLogs, 300);
            currentLogs = await printLog("Uploading proof logs to legal vault...", currentLogs, 500);
            setProgressBarWidth(100);

            currentLogs = await printLog("[SYS] PayPal payment transaction confirmed successfully.", currentLogs, 400);
            currentLogs = await printLog("System operational. Structural Shield Active.", currentLogs, 500);

            if (isAudioEngineActive) {
                playWarningBeep(523.25, 0.15); // C5
                setTimeout(() => playWarningBeep(659.25, 0.15), 100); // E5
                setTimeout(() => playWarningBeep(783.99, 0.3), 200); // G5
            }

            setTimeout(() => {
                setCheckoutStatus('SUCCESS');
                if (isAudioEngineActive) {
                    setAlarmActive(false);
                }
            }, 800);
        }
    };

    const handleResetCheckout = () => {
        setCheckoutStatus('FORM');
        setCardholderName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
        setIsRiskAccepted(false);
        setTerminalLogs([]);
        setProgressBarWidth(0);

        if (isAudioEngineActive && riskLevel === 'CRITICAL') {
            setAlarmActive(true, false);
        }
        playWarningBeep(600, 0.15);
    };

    const triggerCheckoutVisible = () => {
        setIsGatewayVisible(true);
        // Page Scroll to gateway
        setTimeout(() => {
            const el = document.getElementById('gateway-portal');
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        // Flash and beeps
        setIsScreenFlashing(true);
        setTimeout(() => setIsScreenFlashing(false), 400);
        playWarningBeep(880, 0.25);
        setTimeout(() => playWarningBeep(1320, 0.15), 150);
    };

    // --- [9] AQRS Critical Failure Matrix Scenarios Checks (T-01, T-02, T-03) ---
    const isT01Active = complianceGap >= 90 && manualReviewFactor === 3.0;
    const isT02Active = complianceGap >= 70 && complianceGap < 90 && dataFlowGap >= 7;
    const isT03Active = dataFlowGap === 10 && complianceGap >= 80;

    return (
        <div className="min-h-screen bg-[#0A0A0C] text-[#EAEAEA] py-4 px-2 md:px-8 font-inter relative overflow-hidden">
            <Head>
                <title>[🚨 필수] 컴플라이언스 게이트웨이 구축 설계 - Yobizwiz Audit</title>
                <meta name="description" content="Structural Integrity Check - Your Financial & Legal Vulnerability Assessment." />
            </Head>

            {/* Screen Flash Overlay */}
            <div className={`red-flash-overlay ${isScreenFlashing ? 'red-flash-active' : ''}`} />

            {/* Floating Audio Controller */}
            <div className="max-w-6xl mx-auto mb-6 relative z-10">
                <div className="glass-card rounded-lg p-3 px-6 flex items-center justify-between border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
                    <div className="flex items-center space-x-3">
                        <span className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                            isAudioEngineActive 
                                ? (riskLevel === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.7)]') 
                                : 'bg-gray-600 animate-pulse'
                        }`} />
                        <p className="text-xs md:text-sm font-mono-data text-gray-400">
                            STATUS: <span className={
                                isAudioEngineActive 
                                    ? (isBackendLive ? 'text-green-400 font-bold' : 'text-yellow-500 font-bold') 
                                    : 'text-gray-400'
                            }>
                                {!isAudioEngineActive 
                                    ? "AUDIO ENGINE INACTIVE" 
                                    : (isBackendLive ? "LIVE BACKEND API CONNECTED" : "OFFLINE LOCAL SIMULATOR OPERATIONAL")}
                            </span>
                        </p>
                    </div>
                    <button 
                        onClick={toggleAudio} 
                        className={`text-xs font-mono-data border rounded px-4 py-1.5 transition-all shadow-[0_0_8px_rgba(0,0,0,0.5)] ${
                            isAudioEngineActive 
                                ? 'border-green-600/50 bg-green-950/30 text-green-400 hover:bg-green-950/50' 
                                : 'border-gray-700 bg-gray-900/80 text-gray-300 hover:bg-gray-800'
                        }`}
                    >
                        {isAudioEngineActive ? "🔇 MUTE SYSTEM AUDIO DIAGNOSTIC" : "🔊 ACTIVATE SYSTEM AUDIO DIAGNOSTIC"}
                    </button>
                </div>
            </div>

            {/* Header Fold */}
            <header className="text-center max-w-6xl mx-auto mb-10 mt-6 relative z-10">
                <div className="inline-block px-3 py-1 mb-3 text-xs tracking-widest font-mono-data border border-red-600/50 bg-red-950/20 text-red-500 rounded-full font-bold uppercase animate-pulse">
                    [⚠️ CRITICAL AUDIT REQUIRED]
                </div>
                <h1 className="text-3xl md:text-6xl font-outfit font-extrabold tracking-tight mb-4 uppercase">
                    컴플라이언스 게이트웨이 구축 설계 <span className="text-red-600 select-none">| Yobizwiz</span>
                </h1>
                <p className="text-sm md:text-lg text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                    경고: 현재의 미인증 레거시 프로세스는 법적 무효화 리스크에 직면해 있습니다.<br />
                    귀사의 시스템적 취약점을 진단하고 구조적 안전 장치를 구축하십시오.
                </p>
            </header>

            {/* Main Interactive Telemetry Board */}
            <main className="max-w-6xl mx-auto relative z-10 px-2 space-y-10">
                
                {/* SECTION 1: Interactive Loss Simulator */}
                <section className="glass-card rounded-2xl p-6 md:p-10 relative overflow-hidden bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center space-x-3 mb-8 border-b border-slate-800/80 pb-5">
                        <span className="text-2xl">📊</span>
                        <h2 className="text-xl md:text-2xl font-outfit font-bold uppercase text-blue-500 tracking-wider">
                            실시간 잠재적 재정 손실액 ($QLoss$) 시뮬레이터
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Sliders Control Panel */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="compliance-gap" className="text-sm font-medium text-gray-400">1. 내부 프로세스 컴플라이언스 결함도 (0-100)</label>
                                    <span className={`font-mono-data font-bold px-2 py-0.5 rounded text-sm ${
                                        complianceGap >= 75 ? 'text-red-500 bg-red-950/25 animate-pulse' : 'text-blue-400 bg-blue-950/20'
                                    }`}>
                                        {complianceGap}%
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    id="compliance-gap" 
                                    min="0" 
                                    max="100" 
                                    value={complianceGap} 
                                    onChange={handleGapSlider}
                                    className={`w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer ${
                                        complianceGap >= 75 ? 'red-thumb' : ''
                                    }`} 
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="data-flow-gap" className="text-sm font-medium text-gray-400">2. 데이터 흐름 추적 누락 구간 (0-10건)</label>
                                    <span className={`font-mono-data font-bold px-2 py-0.5 rounded text-sm ${
                                        dataFlowGap >= 7 ? 'text-red-500 bg-red-950/25 animate-pulse' : 'text-blue-400 bg-blue-950/20'
                                    }`}>
                                        {dataFlowGap} 건
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    id="data-flow-gap" 
                                    min="0" 
                                    max="10" 
                                    value={dataFlowGap} 
                                    onChange={handleFlowSlider}
                                    className={`w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer ${
                                        dataFlowGap >= 7 ? 'red-thumb' : ''
                                    }`} 
                                />
                            </div>

                            <div>
                                <label htmlFor="manual-review-gap" className="block text-sm font-medium text-gray-400 mb-2">3. 수동 감사 및 검토 의존도 (가중치)</label>
                                <select 
                                    id="manual-review-gap" 
                                    value={manualReviewFactor}
                                    onChange={handleFactorSelect}
                                    className="w-full p-3 bg-[#0c0d12] border border-slate-800 rounded-lg text-white font-mono-data focus:border-blue-500 focus:outline-none transition cursor-pointer"
                                >
                                    <option value="0.8">낮음 (자동화 아키텍처 수립)</option>
                                    <option value="1.5">중간 (하이브리드 수동 감사 분기)</option>
                                    <option value="3.0">높음 (전체 프로세스 수동 의존)</option>
                                </select>
                            </div>
                        </div>

                        {/* Real-time calculated status card */}
                        <div className="bg-black/50 rounded-xl border border-slate-800/80 p-6 flex flex-col justify-between relative min-h-[220px]">
                            <div>
                                <h3 className="text-[10px] uppercase tracking-widest font-mono-data text-gray-500 mb-1">[REAL-TIME TELEMETRY]</h3>
                                <p className="text-sm font-bold text-gray-300">ESTIMATED $QLOSS$ POTENTIAL</p>
                            </div>
                            
                            <div className="my-6">
                                <div className={`text-4xl md:text-5xl font-mono-data font-bold tracking-tight transition-all duration-300 ${
                                    riskLevel === 'CRITICAL' ? 'text-red-500' : riskLevel === 'HIGH' ? 'text-yellow-500' : 'text-blue-400'
                                }`}>
                                    {formatUSD(qLossAmount)}
                                </div>
                                <p className="text-[10px] text-gray-500 font-mono-data mt-1">MINIMUM FINANCIAL IMPACT</p>
                            </div>

                            <div className={`px-3 py-1.5 rounded border text-xs font-mono-data font-bold text-center uppercase tracking-wider transition-all duration-300 ${
                                riskLevel === 'CRITICAL' 
                                    ? 'bg-red-950/30 border-red-700 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' 
                                    : riskLevel === 'HIGH' 
                                        ? 'bg-yellow-950/20 border-yellow-700 text-yellow-500' 
                                        : 'bg-green-950/20 border-green-800 text-green-400'
                            }`}>
                                {riskLevel === 'CRITICAL' ? '[🚨 CRITICAL THREAT LEVEL]' : riskLevel === 'HIGH' ? '[⚠️ MEDIUM AUDIT WARNING]' : '[🟢 SAFE ARCHITECTURE]'}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Action Trigger Bar */}
                    <div className={`flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border gap-4 mt-8 transition-all duration-300 ${
                        riskLevel === 'CRITICAL' 
                            ? 'bg-red-950/15 border-red-900/60' 
                            : 'bg-slate-900/50 border-slate-800'
                    }`}>
                        <div className="text-center md:text-left">
                            <h4 className="font-bold text-white text-md mb-1 font-outfit uppercase">컴플라이언스 취약성에 따른 구조 진단</h4>
                            <p className="text-xs text-gray-400">데이터 손실 및 법적 리스크 방지 장치 구축을 검증하십시오.</p>
                        </div>
                        <button 
                            onClick={triggerCheckoutVisible}
                            className={`px-8 py-3 rounded text-sm tracking-wider font-bold uppercase transition-all duration-300 shadow-md ${
                                riskLevel === 'CRITICAL'
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/50 animate-pulse'
                                    : riskLevel === 'HIGH'
                                        ? 'bg-yellow-600 hover:bg-yellow-700 text-black shadow-yellow-950/50'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/40'
                            }`}
                        >
                            {riskLevel === 'CRITICAL' ? "[위험] 필수 게이트웨이 승인 대기" : riskLevel === 'HIGH' ? "[경고] 컴플라이언스 보강 검토" : "[진단 완료] 무료 요약 리포트"}
                        </button>
                    </div>
                </section>

                {/* SECTION 2: Competitive Comparison Matrix */}
                <section className="glass-card rounded-2xl p-6 md:p-10 relative overflow-hidden bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center space-x-3 mb-6 border-b border-slate-800/80 pb-5">
                        <span className="text-2xl">⚔️</span>
                        <h2 className="text-xl md:text-2xl font-outfit font-bold uppercase text-yellow-500 tracking-wider">
                            경쟁사 규제 준수 & 재정 리스크(Penalties) 1:1 비교 매트릭스
                        </h2>
                    </div>
                    
                    <p className="text-xs text-gray-400 leading-relaxed mb-6 font-light">
                        글로벌 규제 가이드라인(GDPR, CCPA, EU AI Act)에 기반하여 경쟁 3사와 귀사의 실시간 리스크 및 노출 과징금($QLoss) 규모를 직접 대조해 보십시오.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono-data text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-gray-400 text-[10px] uppercase tracking-wider">
                                    <th className="py-4 px-4">분석 대상 (Entity)</th>
                                    <th className="py-4 px-4 text-center">보안 무결성 등급</th>
                                    <th className="py-4 px-4 text-center">GDPR 위험 지수</th>
                                    <th className="py-4 px-4 text-center">CCPA 위험 지수</th>
                                    <th className="py-4 px-4 text-center">EU AI Act 리스크</th>
                                    <th className="py-4 px-4 text-right text-red-500 font-bold">잠재적 패널티 ($QLoss)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {/* Your Organization - Dynamically linked to sliders! */}
                                <tr className={`transition-all duration-300 border-l-4 ${
                                    riskLevel === 'CRITICAL' 
                                        ? 'bg-red-950/20 border-red-600' 
                                        : riskLevel === 'HIGH' 
                                            ? 'bg-yellow-950/15 border-yellow-600' 
                                            : 'bg-blue-950/15 border-blue-600'
                                }`}>
                                    <td className="py-4 px-4 font-bold text-white">⭐ 귀사 (Your Org)</td>
                                    <td className={`py-4 px-4 text-center font-bold transition duration-300 ${
                                        riskLevel === 'CRITICAL' ? 'text-red-500 animate-pulse' : riskLevel === 'HIGH' ? 'text-yellow-500' : 'text-blue-400'
                                    }`}>
                                        {riskLevel === 'CRITICAL' ? "F (즉각 붕괴 위기)" : riskLevel === 'HIGH' ? "C- (무인증 방치)" : "B (안정권 진입)"}
                                    </td>
                                    <td className="py-4 px-4 text-center text-gray-300">{Math.min(100, Math.floor(complianceGap * 0.8))}%</td>
                                    <td className="py-4 px-4 text-center text-gray-300">{Math.min(100, Math.floor(dataFlowGap * 10))}%</td>
                                    <td className="py-4 px-4 text-center text-gray-300">{Math.min(100, Math.floor(manualReviewFactor * 30))}%</td>
                                    <td className={`py-4 px-4 text-right font-bold text-sm transition duration-300 ${
                                        riskLevel === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-yellow-400'
                                    }`}>
                                        {formatUSD(qLossAmount)}
                                    </td>
                                </tr>

                                {/* Competitor A */}
                                <tr className="hover:bg-white/5 transition">
                                    <td className="py-4 px-4 text-gray-400">경쟁사 A (핀테크 레거시)</td>
                                    <td className="py-4 px-4 text-center text-yellow-500 font-bold">C- (위험 노출)</td>
                                    <td className="py-4 px-4 text-center text-gray-400">68%</td>
                                    <td className="py-4 px-4 text-center text-gray-400">45%</td>
                                    <td className="py-4 px-4 text-center text-gray-400">40%</td>
                                    <td className="py-4 px-4 text-right text-red-400/80">$35,000,000</td>
                                </tr>

                                {/* Competitor B */}
                                <tr className="hover:bg-white/5 transition">
                                    <td className="py-4 px-4 text-gray-400">경쟁사 B (B2B 의료 솔루션)</td>
                                    <td className="py-4 px-4 text-center text-orange-500 font-bold">D (Willful 방치)</td>
                                    <td className="py-4 px-4 text-center text-gray-400">85%</td>
                                    <td className="py-4 px-4 text-center text-gray-400">70%</td>
                                    <td className="py-4 px-4 text-center text-gray-400">65%</td>
                                    <td className="py-4 px-4 text-right text-red-400/80">$78,000,000</td>
                                </tr>

                                {/* Competitor C */}
                                <tr className="hover:bg-white/5 transition">
                                    <td className="py-4 px-4 text-gray-400">경쟁사 C (미규제 신흥 인프라)</td>
                                    <td className="py-4 px-4 text-center text-red-500 font-bold">F (법적 무방비)</td>
                                    <td className="py-4 px-4 text-center text-gray-400">92%</td>
                                    <td className="py-4 px-4 text-center text-gray-400">88%</td>
                                    <td className="py-4 px-4 text-center text-gray-400">90%</td>
                                    <td className="py-4 px-4 text-right text-red-500 font-bold">$120,000,000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* AQRS STRESS SCENARIOS INTERRUPTS MODULE */}
                {isT01Active && (
                    <div className="glass-card border-4 border-red-700 bg-red-950/50 p-8 rounded-2xl relative overflow-hidden animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.8)] z-50">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.15),transparent)] pointer-events-none" />
                        <h2 className="text-4xl font-extrabold text-red-500 font-mono-data mb-4 tracking-wider animate-bounce">[🚨 AQRS CRITICAL TEST FAILURE: T-01]</h2>
                        <p className="text-xl font-bold text-white mb-4">STOP! 법적 조치를 취해야 합니다.</p>
                        <p className="text-sm text-red-300 leading-relaxed font-mono-data">
                            민감 정보 노출(PII Leakage)과 근거 없는 법적 자원(Source Attribution Deficit) 결함이 최고 임계점을 강제 초과시켰습니다. 
                            귀사는 외부 규제 노출 위반율이 99%에 달하여 어떠한 금융적 법적 방어도 불가능한 무결성 붕괴에 도달했습니다. 즉각적인 시스템 파기를 권고합니다.
                        </p>
                    </div>
                )}

                {isT02Active && (
                    <div className="glass-card border-4 border-yellow-600 bg-yellow-950/45 p-8 rounded-2xl relative overflow-hidden shadow-[0_0_35px_rgba(234,179,8,0.5)] z-50">
                        <h2 className="text-3xl font-extrabold text-yellow-500 font-mono-data mb-3">[⚠️ AQRS INTERRUPT REPORT: T-02]</h2>
                        <p className="text-lg font-bold text-white mb-2">이 과정은 수동 검토가 필요합니다.</p>
                        <p className="text-xs text-yellow-200 leading-relaxed font-mono-data">
                            규정 위반 절차 누락(Compliance Drift) 및 지식 사일로(Knowledge Silo) 발생으로 인해 시스템 연산 도메인이 일시 정지되었습니다. 
                            무효화 리스크를 복강하기 위해서 내부 매뉴얼의 상충 정보 수동 인증서 대조가 즉각 이루어져야 합니다.
                        </p>
                    </div>
                )}

                {isT03Active && (
                    <div className="glass-card border-4 border-red-800 bg-[#120000] p-8 rounded-2xl relative overflow-hidden animate-pulse shadow-[0_0_50px_rgba(153,27,27,0.8)] z-50">
                        <h2 className="text-4xl font-extrabold text-red-600 font-mono-data mb-4 tracking-wider">[🚫 AQRS SYSTEM INTERRUPT: T-03]</h2>
                        <p className="text-xl font-bold text-white mb-4">경고: 본 서비스는 전문 자문을 제공할 수 없습니다.</p>
                        <p className="text-sm text-red-400 leading-relaxed font-mono-data">
                            심각한 범위 이탈(Scope Violation) 및 전문 금융 분야 월권 침범이 탐지되어 전면 인터셉트가 강제 가동되었습니다. 
                            본 진단기는 일반적인 IT 보안 범위 밖의 독점적인 전문 컴플라이언스 보강용이며, 실질적인 법률 분쟁의 소송 대리가 아님을 강력히 고지합니다.
                        </p>
                    </div>
                )}

                {/* SECTION 3: The 3-Stage Checkout Funnel */}
                <section 
                    id="gateway-portal" 
                    className={`transition-all duration-700 space-y-8 ${isGatewayVisible ? 'opacity-100 block' : 'opacity-0 hidden'}`}
                >
                    
                    {/* STAGE 1: Warning Banner (The Shock) */}
                    <div className="glass-card border-l-4 border-red-600 bg-red-950/20 scanlines rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(192,57,43,0.3)]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                                    <span className="text-xs font-mono-data font-bold text-red-500 tracking-widest uppercase">
                                        [SYSTEM BREACH WARNING - CRITICAL STATE]
                                    </span>
                                </div>
                                <h2 className="glitch-text text-2xl md:text-3xl font-outfit font-extrabold uppercase text-red-500 tracking-wider">
                                    법적 무효화 리스크 임계치 도달
                                </h2>
                                <p className="text-xs md:text-sm text-red-300 font-mono-data leading-relaxed max-w-3xl">
                                    ⚠️ 귀사의 현재 설계 프로세스는 법적 무효화 리스크 등급 <span className="bg-red-950 font-bold px-1.5 py-0.5 rounded text-white">[CRITICAL]</span> 에 도달했습니다. 이 취약점은 소송 시 방어가 불가한 중대한 구조적 공백(Structural Gap)을 유발합니다.
                                </p>
                            </div>
                            <div className="text-left md:text-right bg-red-950/20 border border-red-900/60 rounded px-4 py-3 min-w-[200px]">
                                <span className="text-[10px] font-mono-data text-red-400 block">[CRITICAL IMPACT]</span>
                                <span className="text-2xl md:text-3xl font-mono-data font-bold text-red-500 block">
                                    {formatUSD(qLossAmount * 1.5)}+
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        
                        {/* STAGE 2: Before/After Comparison Flowchart (The Mandate) */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="glass-card rounded-2xl p-6 md:p-8 border-slate-800 bg-slate-900/40">
                                <h3 className="text-lg font-outfit font-bold uppercase tracking-wider text-blue-400 mb-3">
                                    구조적 방어벽 매칭 진단
                                </h3>
                                <p className="text-xs text-gray-400 leading-relaxed mb-6 font-light">
                                    단순한 기능성 구매가 아닙니다. 본 진단은 법적 패배 리스크를 완전 차단하기 위한 <strong>구조 무결성 보강 비용(Asset Insurance Cost)</strong>의 성격을 띱니다. 무효화 리스크로부터 보호받기 위한 시스템 아키텍처 비교표입니다.
                                </p>

                                <div className="space-y-4">
                                    {/* Before: Defenseless State */}
                                    <div className="bg-black/50 border border-red-950/60 rounded-xl p-4 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-mono-data text-red-500 font-bold bg-red-950/30 px-2 py-0.5 border border-red-900/80 rounded">
                                                ❌ 리스크 무방비 상태 (DEFENSELESS)
                                            </span>
                                            <span className="text-xs text-red-400 font-mono-data">Security Gap: 87%</span>
                                        </div>
                                        <div className="h-2 rounded bg-gray-900 w-full relative mb-4">
                                            <div className="absolute top-0 left-0 h-full flow-line rounded" style={{ width: '87%' }} />
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed font-light">
                                            수동 처리 의존 및 백엔드 무결성 증명 로그 상실. 외부 법무 감사 및 컴플라이언스 공백에 노출된 상태.
                                        </p>
                                    </div>

                                    {/* After: Protected State */}
                                    <div className="bg-black/50 border border-blue-950/60 rounded-xl p-4 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-mono-data text-blue-400 font-bold bg-blue-950/30 px-2 py-0.5 border border-blue-900/80 rounded">
                                                🛡️ yobizwiz 무결성 보강 상태 (PROTECTED)
                                            </span>
                                            <span className="text-xs text-blue-300 font-mono-data">Defensive Rating: Perfect</span>
                                        </div>
                                        <div className="h-2 rounded bg-gray-900 w-full relative mb-4">
                                            <div className="absolute top-0 left-0 h-full flow-line-secure rounded animate-pulse" style={{ width: '100%' }} />
                                        </div>
                                        <p className="text-[11px] text-gray-300 leading-relaxed font-bold">
                                            구조 무결성 인증서 발행 및 암호화 증적 보관. 자동 위협 차단 프로토콜이 가동된 법적 방어벽 확보 상태.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 border-l-4 border-red-600 bg-red-950/10 p-4 rounded text-center">
                                    <span className="text-xs md:text-sm font-bold text-red-400 font-outfit uppercase tracking-widest block mb-1">
                                        [중요 규정 고지]
                                    </span>
                                    <p className="text-xs text-gray-300 italic font-medium">
                                        "이것은 옵션이 아닙니다. 구조적 필수 보강입니다."
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* STAGE 3: Secure Gate Checkout Forms (The Gate) */}
                        <div className="lg:col-span-2">
                            <div className={`glass-card rounded-2xl p-6 md:p-8 sticky top-4 border transition-all duration-300 ${
                                checkoutStatus === 'SUCCESS' 
                                    ? 'border-green-600/80 shadow-[0_0_25px_rgba(34,197,94,0.3)]' 
                                    : checkoutStatus === 'DECLINED' 
                                        ? 'border-red-600 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse'
                                        : 'border-slate-800 shadow-xl'
                            }`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className={`text-xs font-mono-data font-bold tracking-wider uppercase ${
                                        checkoutStatus === 'SUCCESS' ? 'text-green-400' : 'text-red-500'
                                    }`}>
                                        💳 SECURE TRANS-GATEWAY
                                    </h3>
                                    <span className="text-[10px] text-gray-500 font-mono-data">PAYPAL GATEWAY V3.0</span>
                                </div>

                                <div className="mb-5 bg-black/60 rounded-lg p-3 border border-slate-800 text-center">
                                    <p className="text-[9px] font-mono-data text-gray-500 uppercase mb-1">총 청구액 (Total Insurance Fee)</p>
                                    <p className="text-3xl font-mono-data font-bold text-yellow-400">
                                        {complianceGap >= 75 || dataFlowGap >= 8 
                                            ? "$1,499.00" 
                                            : complianceGap >= 40 || dataFlowGap >= 4 
                                                ? "$799.00" 
                                                : "$499.00"}
                                    </p>
                                </div>

                                {/* Form Input Block */}
                                {checkoutStatus === 'FORM' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-mono-data uppercase text-gray-400 mb-1">카드가입자명 (Cardholder Name)</label>
                                            <input 
                                                type="text" 
                                                placeholder="HONG GILDONG" 
                                                value={cardholderName}
                                                onChange={(e) => setCardholderName(e.target.value)}
                                                className="w-full p-2.5 bg-[#0c0d12] border border-slate-800 rounded font-mono-data text-xs text-white focus:border-red-500 focus:outline-none transition" 
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-mono-data uppercase text-gray-400 mb-1">신용카드 번호 (Credit Card Number)</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    maxLength={19} 
                                                    placeholder="4242 4242 4242 4242" 
                                                    value={cardNumber}
                                                    onChange={handleCardNumberChange}
                                                    className="w-full p-2.5 bg-[#0c0d12] border border-slate-800 rounded font-mono-data text-xs text-white focus:border-red-500 focus:outline-none transition" 
                                                />
                                                <span className="absolute right-2.5 top-2.5 text-[9px] text-gray-600 font-mono-data">VISA</span>
                                            </div>
                                            <span className="text-[9px] font-mono-data text-gray-500 mt-1.5 block leading-relaxed">
                                                💡 가이드: <span className="text-green-500 font-bold">'4242'</span> 승인 시뮬레이션, <span className="text-red-500 font-bold">'0000'</span> 한도 초과 오류 재현
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-mono-data uppercase text-gray-400 mb-1">만료일 (MM/YY)</label>
                                                <input 
                                                    type="text" 
                                                    maxLength={5} 
                                                    placeholder="12/29" 
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(e.target.value)}
                                                    className="w-full p-2.5 bg-[#0c0d12] border border-slate-800 rounded font-mono-data text-xs text-white text-center focus:border-red-500 focus:outline-none transition" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-mono-data uppercase text-gray-400 mb-1">보안 코드 (CVC)</label>
                                                <input 
                                                    type="password" 
                                                    maxLength={3} 
                                                    placeholder="***" 
                                                    value={cardCvc}
                                                    onChange={(e) => setCardCvc(e.target.value)}
                                                    className="w-full p-2.5 bg-[#0c0d12] border border-slate-800 rounded font-mono-data text-xs text-white text-center focus:border-red-500 focus:outline-none transition" 
                                                />
                                            </div>
                                        </div>

                                        {/* Confirmation Checkbox with sudden screen flash effects */}
                                        <div className="p-3 bg-red-950/10 border border-red-900/40 rounded-lg flex items-start space-x-3 mt-4">
                                            <input 
                                                type="checkbox" 
                                                id="risk-checkbox" 
                                                checked={isRiskAccepted}
                                                onChange={handleRiskCheckbox}
                                                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-opacity-25 mt-0.5 cursor-pointer"
                                            />
                                            <label htmlFor="risk-checkbox" className="text-[10px] text-red-300/80 font-mono-data leading-relaxed cursor-pointer select-none">
                                                본 컴플라이언스 리스크는 고객이 완전 인지하고 동의합니다. (리스크 수용 동의)
                                            </label>
                                        </div>

                                        {/* Execution Button */}
                                        <button 
                                            onClick={handleSecurePaymentSubmit}
                                            disabled={!isRiskAccepted}
                                            className={`w-full py-4 text-xs md:text-sm tracking-wider font-extrabold text-white rounded uppercase mt-4 transition-all duration-300 ${
                                                isRiskAccepted 
                                                    ? 'bg-red-700 hover:bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] transform hover:scale-[1.02] cursor-pointer' 
                                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50'
                                            }`}
                                        >
                                            구조 무결성 확보 및 리스크 방어벽 구축 승인
                                        </button>
                                    </div>
                                )}

                                {/* Logging progress terminal compiler */}
                                {checkoutStatus === 'TERMINAL' && (
                                    <div className="space-y-4">
                                        <div className="bg-black/90 rounded-xl border border-slate-800 p-4 font-mono-data text-[10px] leading-relaxed text-green-400 h-64 overflow-y-auto scrollbar-thin">
                                            {terminalLogs.map((log, i) => (
                                                <div key={i} className={`mb-1 ${
                                                    log.startsWith('[ERR]') 
                                                        ? 'text-red-500 font-bold animate-pulse' 
                                                        : log.startsWith('[SYS]') 
                                                            ? 'text-blue-400' 
                                                            : ''
                                                }`}>
                                                    {log}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-full h-1 bg-gray-900 rounded overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 transition-all duration-300" 
                                                style={{ width: `${progressBarWidth}%` }} 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Success path secure receipt */}
                                {checkoutStatus === 'SUCCESS' && (
                                    <div className="text-center space-y-5 py-4">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border-2 border-green-500 text-green-500 font-extrabold text-2xl bg-green-950/20">
                                            ✓
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-lg font-outfit font-extrabold uppercase text-green-400">구조 무결성 보강 완료</h4>
                                            <p className="text-[10px] text-gray-400 font-mono-data mt-2 leading-relaxed">
                                                🛡️ 축하합니다! 귀사의 컴플라이언스 안전 구조가 성공적으로 확립되었습니다.<br />
                                                <strong>인증코드: SE-93820-AUDIT</strong><br />
                                                무결성 보증서 및 가이드라인 상세 내역서가 기입하신 이메일로 5분 이내에 자동 전달됩니다.
                                            </p>
                                        </div>

                                        <button 
                                            onClick={handleResetCheckout} 
                                            className="w-full py-3 bg-slate-900 border border-slate-800 text-[10px] font-mono-data hover:bg-slate-800 rounded uppercase transition"
                                        >
                                            리턴 및 시스템 상태 재조회
                                        </button>
                                    </div>
                                )}

                                {/* Decline path failed receipt */}
                                {checkoutStatus === 'DECLINED' && (
                                    <div className="text-center space-y-5 py-4">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border-2 border-red-500 text-red-500 font-extrabold text-2xl bg-red-950/20 animate-bounce">
                                            ✖
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-lg font-outfit font-extrabold uppercase text-red-500">보강 승인 실패 (DECK DECLINED)</h4>
                                            <p className="text-[10px] text-gray-400 font-mono-data mt-2 leading-relaxed">
                                                ⚠️ 계좌 리소스 한도 초과 또는 보안 규정 위반으로 트랜잭션이 최종 거절되었습니다.<br />
                                                현재 상태로는 <strong>$QLoss$ 무효화 리스크 노출 상태</strong>가 유지됩니다. 다시 승인 요청을 진행하십시오.
                                            </p>
                                        </div>

                                        <button 
                                            onClick={handleResetCheckout} 
                                            className="w-full py-3 bg-red-950/20 border border-red-900/60 text-[10px] font-mono-data hover:bg-red-950/40 text-red-300 rounded uppercase transition font-bold"
                                        >
                                            재승인 요청 및 결제 정보 입력
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>

                </section>

            </main>
        </div>
    );
};

export default PaymentGate;