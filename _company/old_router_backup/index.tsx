// pages/index.tsx
import React from 'react';
import RiskCalculator from '../components/RiskCalculator';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
            <RiskCalculator />
        </div>
    );
};

export default Home;