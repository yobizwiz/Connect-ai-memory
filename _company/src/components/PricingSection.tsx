import React from 'react';

const PriceCard = ({ title, description, price, isRecommended, colorClass }) => (
    <div className={`flex-1 p-8 rounded-xl shadow-2xl border-t-4 ${colorClass} transition duration-300 transform hover:scale-[1.02] bg-gray-800/70`}>
        {isRecommended && (
            <span className="inline-block mb-4 px-4 py-1 text-sm font-bold uppercase rounded-full bg-red-600 shadow-lg">
                ⭐ 강력 추천: Silver Tier
            </span>
        )}
        <h3 className="text-3xl font-extrabold mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{description}</p>
        <div className="flex items-baseline mb-8">
            <span className="text-7xl font-black text-white">${price.toFixed(0)}</span>
            <span className="text-3xl ml-2 text-gray-400">/월</span>
        </div>
        <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition duration-150">
            통제력 확보 시작하기
        </button>
    </div>
);

const PricingSection = () => {
    return (
        <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-center text-4xl font-extrabold mb-12 text-white">3단계 통제력 확보 플랜</h2>
            <p className="text-center text-xl text-gray-400 mb-16 max-w-3xl mx-auto">
                가장 필수적인 '프로세스 무결성 강제 통제(Silver Tier)'를 통해 구조적 생존 리스크를 차단하세요. [근거: 🏢 회사 정체성]
            </p>

            <div className="grid grid-cols-3 gap-8">
                {/* Bronze Tier */}
                <PriceCard 
                    title="Bronze (경고 감지)"
                    description="기본 법규 위반 스캔 및 리스크 보고서 제공. 최소한의 통제력만 확보."
                    price={49}
                    isRecommended={false}
                    colorClass="border-red-800/30"
                />
                 {/* Silver Tier (핵심) */}
                <PriceCard 
                    title="Silver (통제 시스템)"
                    description="실시간 프로세스 무결성 감지, Failure Flow 분석 및 자동 보정 루프 제공. **(필수)**"
                    price={299}
                    isRecommended={true}
                    colorClass="border-blue-600/70 scale-[1.05]" // 강조 효과
                />
                 {/* Gold Tier */}
                <PriceCard 
                    title="Gold (완전 생존)"
                    description="Silver 기능 포함 + 글로벌 규제 자동 대응 및 전담 아키텍트 상주. 완벽한 시스템적 보험."
                    price={999}
                    isRecommended={false}
                    colorClass="border-blue-800/30"
                />
            </div>
        </div>
    );
};

export default PricingSection;