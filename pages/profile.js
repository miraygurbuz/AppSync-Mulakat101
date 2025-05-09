import { withAuthenticator } from '@aws-amplify/ui-react';
import { Auth, API } from 'aws-amplify';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { postsByUsername } from '../src/graphql/queries';
import Moment from 'moment';
import { 
  Calendar, 
  Mail, 
  FileText, 
  Clock, 
  ArrowRight, 
  MessageSquare, 
  UserCircle,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Loading from '../components/loading';

const Renderer = ({ children }) => {
    const [hasMounted, setHasMounted] = useState(false);
    
    useEffect(() => {
        setHasMounted(true);
    }, []);
    
    if (!hasMounted) {
        return null;
    }
    
    return <>{children}</>;
};

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [postCount, setPostCount] = useState(0);
    const [latestPosts, setLatestPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registrationDate, setRegistrationDate] = useState('');
    
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (user && user.attributes && user.attributes.createdAt) {
            setRegistrationDate(Moment(user.attributes.createdAt).format("DD MMM YYYY"));
        } else {
            setRegistrationDate(Moment(new Date()).format("DD MMM YYYY"));
        }
    }, [user]);

    useEffect(() => {
        fetchPosts();
    }, []);

    async function checkUser() {
        try {
            setLoading(true);
            const user = await Auth.currentAuthenticatedUser();
            setUser(user);
            fetchPostCount(user.username);
            fetchPosts(user.username);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    async function fetchPostCount(username) {
        try {
            const postData = await API.graphql({
                query: postsByUsername,
                variables: { username },
                authMode: "AMAZON_COGNITO_USER_POOLS"
            });
            setPostCount(postData.data.postsByUsername.items.length);
        } catch (error) {
        }
    }

    async function fetchPosts() {
        try {
            setLoading(true);
            const { username } = await Auth.currentAuthenticatedUser();
            const postData = await API.graphql({
                query: postsByUsername,
                variables: { username }
            });
            const posts = postData.data.postsByUsername.items;
            const sortedPosts = posts.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            const latestPosts = sortedPosts.slice(0, 3);
            setLatestPosts(latestPosts);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    async function handlePasswordChange() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Lütfen tüm şifre alanlarını doldurun');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor');
            return;
        }

        try {
            setLoading(true);
            await Auth.changePassword(
                user,
                currentPassword,
                newPassword
            );
            toast.success('Şifreniz başarıyla değiştirildi');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsChangingPassword(false);
        } catch (error) {
            toast.error('Mevcut şifreniz yanlış');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Loading />;
    }

    if (!user) return null;

    return (
        <>
        <Head>
          <title>Profilim | Mülakat 101</title>
        </Head>
        <Renderer>
            <div className="text-white min-h-screen p-4 md:p-8 font-mono">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 inline-block">
                            Profilim
                        </h1>
                        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mt-2 md:ml-1"></div>
                    </div>

                    <div className="relative mb-8 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur"></div>
                        <div className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden p-6 shadow-xl">
                            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                                <div className="flex-shrink-0 mb-6 md:mb-0 flex justify-center">
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
                                        <div className="relative w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                                            <UserCircle className="h-12 w-12 text-indigo-400" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start mb-4">
                                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                            @{user.username}
                                        </h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center space-x-2 text-gray-400 group">
                                            <Mail size={16} className="text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                                            <span className="text-sm group-hover:text-white transition-colors">{user.attributes.email}</span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 text-gray-400 group">
                                            <Calendar size={16} className="text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                                            <span className="text-sm group-hover:text-white transition-colors">Kayıt: {registrationDate}</span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 text-gray-400 group">
                                            <FileText size={16} className="text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                                            <span className="text-sm group-hover:text-white transition-colors">Gönderi: {postCount}</span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 text-gray-400 group">
                                            <Lock size={16} className="text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                                            <button 
                                                onClick={() => setIsChangingPassword(!isChangingPassword)}
                                                className="text-sm group-hover:text-white transition-colors"
                                            >
                                                Şifremi değiştir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {isChangingPassword && (
                                <div className="mt-6 pt-6 border-t border-gray-800">
                                    <h3 className="text-lg font-medium mb-4 text-indigo-400">Şifre Değiştir</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Mevcut Şifre</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Yeni Şifre</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Yeni Şifre Tekrar</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        
                                        <div className="flex space-x-3 pt-2">
                                            <button
                                                onClick={handlePasswordChange}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm rounded hover:from-indigo-600 hover:to-purple-600 transition-all"
                                            >
                                                Şifreyi Güncelle
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    setIsChangingPassword(false);
                                                    setCurrentPassword('');
                                                    setNewPassword('');
                                                    setConfirmPassword('');
                                                }}
                                                className="px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded hover:bg-gray-700 transition-all"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mb-8">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-900/20 transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <FileText size={18} className="text-indigo-500 mr-2" />
                                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                        Son Gönderilerim
                                    </h3>
                                </div>
                            </div>
        
                            {latestPosts.length > 0 ? (
                                <>
                                    <div className="space-y-4">
                                        {latestPosts.map((post) => (
                                            <Link href={`/posts/${post.id}`} key={post.id}>
                                                <div className="group bg-black/30 border border-gray-800 rounded-lg p-4 hover:border-indigo-500 hover:bg-gray-900/50 transition-all duration-300">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-start">
                                                            <MessageSquare className="h-5 w-5 text-gray-600 mr-3 mt-1 group-hover:text-indigo-400 transition-colors" />
                                                            <div>
                                                                <h4 className="text-lg font-medium text-gray-300 group-hover:text-indigo-400 transition-colors">{post.title}</h4>
                                                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                                                    <Calendar size={12} className="inline mr-1" />
                                                                    <span className="mr-3">{Moment(post.createdAt).format("DD MMM YYYY")}</span>
                                                                    
                                                                    <Clock size={12} className="inline mr-1" />
                                                                    <span>{Moment(post.createdAt).format("HH:mm")}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:bg-indigo-400"></div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                
                                    <div className="mt-6 pt-4 border-t border-gray-800 text-center md:text-right">
                                        <Link href="/my-posts">
                                            <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200">
                                                Tüm Gönderilerim
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </button>
                                        </Link>
                                    </div>
                                </>
                                 ) : (
                                    <div className="text-center py-8 px-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                                            <FileText size={24} className="text-gray-600" />
                                        </div>
                                        <p className="text-gray-500 text-sm">Henüz gönderi paylaşmadınız.</p>
                                        <Link href="/create-post">
                                            <button className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                                                İlk Gönderini Oluştur
                                            </button>
                                        </Link>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </Renderer>
        </>
    );
}

const Profile = dynamic(() => Promise.resolve(withAuthenticator(ProfilePage)), {
    ssr: false
});

export default Profile;