import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <div className="App">{Component}</div >
}
export default MyApp;