import React, { useState, useEffect } from 'react';

// 스트림으로 받을 데이터의 타입 정의 (엄격하게)
interface DataChunk {
  title: string;
  content: string;
}

/**
 * 비동기 스트리밍 데이터를 시뮬레이션하고 UI에 순차적으로 렌더링하는 컴포넌트.
 */
const StreamingDataComponent: React.FC = () => {
  const [chunks, setChunks] = useState<DataChunk[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    // 💡 실제 API 호출 대신, 데이터를 청크 단위로 분할하여 시간차를 두고 업데이트하는 스트리밍 시뮬레이션.
    let chunkIndex = 0;
    const intervalId = setInterval(() => {
      if (chunkIndex < 4) { // 총 4개의 데이터 청크 가정
        setTimeout(() => {
          setChunks(prev => [...prev, {
            title: `[청크 ${chunkIndex + 1}]`,
            content: `실시간으로 분석되는 구조적 공백 리스크 정보입니다. 이 부분은 API 호출 지연 시간을 시뮬레이션합니다. (${Math.random().toFixed(2)}%)`
          }]);
          chunkIndex++;
        }, 500); // 각 청크 사이에 반반초 간격 두기 (시각적 효과)

      } else {
        clearInterval(intervalId); // 모든 청크 처리 완료 시 스트리밍 중지
        setIsStreaming(false);
        console.log("✅ Streaming Data Processing Complete.");
      }
    }, 1000);
    
    return () => clearInterval(intervalId); // 클린업 함수 필수!
  }, []);

  return (
    <div className="p-8 bg-white border rounded-lg shadow-inner">
      <h3 className='text-xl font-semibold mb-4 text-blue-700'>
        {isStreaming ? '📡 데이터 스트리밍 중... 잠시만 기다려 주십시오.' : '✅ 데이터 분석 완료: 구조적 공백 리스크 보고서'}
      </h3>

      <div className="space-y-6 mt-6">
        {chunks.map((chunk, index) => (
          <div key={index} className="p-4 border-l-4 border-blue-200 bg-gray-50 shadow-sm transition duration-300 hover:bg-blue-50">
            <h4 className="text-lg font-bold text-blue-800">{chunk.title}</h4>
            <p className="text-gray-700 mt-1">{chunk.content}</p>
          </div>
        ))}
      </div>

      {!isStreaming && (
         <div className='mt-6 p-3 bg-green-100 text-green-800 rounded'>
            최종적으로 계산된 리스크 지표가 UI에 렌더링됩니다.
         </div>
      )}
    </div>
  );
};

export default StreamingDataComponent;