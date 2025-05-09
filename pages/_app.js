import '../styles/globals.css';
import Head from 'next/head';
import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';
import { Amplify } from 'aws-amplify';
import awsconfig from '../src/aws-exports';
import { Toaster } from 'react-hot-toast';
import { useI18n } from '../hooks/useI18n.js';

Amplify.configure(awsconfig);

function MyApp({ Component, pageProps }) {
  useI18n('tr');
  return (
    <>
      <Head>
        <title>Mülakat101 - Mülakat Soruları</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      
      <div className="font-mono flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        <Navbar />
        
        <main className="flex-grow relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 via-gray-800 to-purple-900/10 w-full h-full"></div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
            }}
          />
          <div className="relative z-10">
            <Component {...pageProps} />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

export default MyApp;
