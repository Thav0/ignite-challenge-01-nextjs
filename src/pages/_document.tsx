import Document, { Html, Main, Head, NextScript } from 'next/document';
import Header from '../components/Header';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Header />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
