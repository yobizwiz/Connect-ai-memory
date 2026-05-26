import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="App">
      <Component {...pageProps} />
    </div>
  );
}
export default MyApp;