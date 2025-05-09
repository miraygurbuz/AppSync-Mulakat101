import { useEffect, useState } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';

function Login({ user }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const authenticatedUser = await Auth.currentAuthenticatedUser();
        setCurrentUser(authenticatedUser);
      } catch (error) {
        console.log('Kullanıcı bulunamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      checkUser();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (currentUser) {
      window.location.href = '/dashboard';
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-spin mb-4"></div>
          <p className="text-indigo-400 text-xl font-mono">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 font-mono">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Mülakat 101
          </h1>
          <div className="w-16 h-1 mx-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4"></div>
          <p className="text-gray-300">Devam etmek için lütfen giriş yapın</p>
        </div>
        
        <div className="text-center text-gray-400 text-sm">
          <p>Giriş işlemi devam ediyor...</p>
          <p>Zaten giriş yaptıysanız birazdan yönlendirileceksiniz.</p>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(Login);