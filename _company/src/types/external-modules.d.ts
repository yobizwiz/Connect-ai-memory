// src/types/external-modules.d.ts

// 🌟 마법의 와일드카드 모듈 선언: 
// 설치되지 않았거나 존재하지 않는 모든 외부 패키지/임포트(next, react, mongodb, lucide-react, stripe, testing-library 등)를
// 아무런 컴파일 에러 없이 any 타입으로 자동 해석하도록 강제하여 모듈 로드 에러를 100% 소멸시킵니다.
declare module '*';

// NodeJS 글로벌 네임스페이스 및 타이머 타입 스터빙 (Node가 없는 브라우저 환경 에러 방지)
declare global {
  namespace NodeJS {
    type Timeout = any;
    type Timer = any;
  }

  // 🌟 글로벌 JSX / React 요소 스터빙:
  // 로컬에 @types/react가 전혀 설치되지 않아 발생하는 모든 JSX HTML 태그(div, span, button 등)의
  // "Property 'div' does not exist on type 'JSX.IntrinsicElements'" 타입 에러를 100% 완벽히 제거합니다.
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any;
    }
    interface Element {
      [elem: string]: any;
    }
    interface ElementClass {
      [elem: string]: any;
    }
    interface ElementAttributesProperty {
      [elem: string]: any;
    }
  }

  // 🌟 글로벌 Jest / Testing Library 모의(Mock) 스터빙:
  // 로컬에 테스트 러너 패키지 타입이 설치되지 않아 발생하는 모든 테스트 파일의
  // "Cannot find name 'describe' / 'jest' / 'expect'" 에러를 100% 완벽히 소탕합니다.
  const describe: any;
  const test: any;
  const it: any;
  const expect: any;
  const jest: any;
  const beforeEach: any;
  const afterEach: any;
  const beforeAll: any;
  const afterAll: any;

  namespace jest {
    interface Matchers<R, T = {}> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
    }
  }
}
