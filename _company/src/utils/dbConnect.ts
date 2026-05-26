/**
 * MongoDB 연결을 시뮬레이션하는 mock dbConnect 유틸리티.
 * 실제 DB가 필요 없는 MVP 환경이므로 Promise.resolve()를 반환합니다.
 */
const connectDB = async (): Promise<void> => {
  return Promise.resolve();
};

export default connectDB;
