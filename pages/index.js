import { useEffect, useState } from 'react';
import { Auth, API, Storage } from 'aws-amplify';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRight, BookOpen, Users, ChevronRight, Calendar, User, Eye } from 'lucide-react';
import { listPosts } from "../src/graphql/queries";
import Moment from "moment";
import "moment/locale/tr";
import Loading from '../components/loading';

Moment.locale("tr");

function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    checkAuthState();
    fetchRecentPosts();
  }, [checkAuthState, fetchRecentPosts]);
  
  async function checkAuthState() {
    try {
      await Auth.currentAuthenticatedUser();
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }

  async function fetchRecentPosts() {
    try {
      setIsLoading(true);
  
      const postData = await API.graphql({
        query: listPosts
      });
  
      const items = postData.data.listPosts.items;
      const sorted = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recent = sorted.slice(0, 3);
      const recentWithImages = await Promise.all(
        recent.map(async (post) => {
          if (post.coverImage) {
            const imageUrl = await Storage.get(post.coverImage);
            return { ...post, coverImageUrl: imageUrl };
          }
          return post;
        })
      );
  
      setRecentPosts(recentWithImages);
  
    } catch (error) {
      console.error("hata:", error);
    } finally {
      setIsLoading(false);
    }
  }
    
  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-mono">
      <section className="relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 md:w-64 md:h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-pink-500/20 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-all duration-200 ease-in-out"></div>
                <div className="relative w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center border border-indigo-600">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-3xl font-bold">M</span>
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-tight">
              Mülakat101
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Deneyimlerinizi paylaşarak topluluğa katkı sağlayın.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 ease-in-out shadow-lg flex items-center justify-center gap-2 group">
                  <BookOpen className="h-5 w-5" />
                  <span>Topluluğu Keşfet</span>
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" size={16} />
                </button>
              </Link>
              <Link href="/login">
                <button className="w-full sm:w-auto px-6 py-3 bg-gray-800/80 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 ease-in-out shadow-lg flex items-center justify-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Aramıza Katıl</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Platformun Özellikleri
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto"></div>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-all">
                <BookOpen className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-100">Mülakat Soruları</h3>
              <p className="text-sm sm:text-base text-gray-400">
                Çeşitli şirketlerden gerçek mülakat sorularını görün ve kendi deneyimlediğiniz soruları paylaşın.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all">
                <Users className="text-purple-400" size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-100">Topluluk</h3>
              <p className="text-sm sm:text-base text-gray-400">
                Mülakat deneyimlerinizi paylaşın ve birbirinize destek olun.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-all">
                <Eye className="text-pink-400" size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-100">Gerçek Deneyimler</h3>
              <p className="text-sm sm:text-base text-gray-400">
                Gerçek kişilerin paylaştığı mülakat deneyimlerini okuyun ve kendi deneyimlerinizi paylaşın.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Son Paylaşılanlar
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {recentPosts.length > 0 ? (
              recentPosts.map((post, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300 group"
                >
                  <div className="p-6">
                    <div className="flex justify-center mb-4">
                      {post.coverImageUrl ? (
                        <div className="relative h-20 w-20">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-70 group-hover:opacity-100 transition-all duration-200 ease-in-out"></div>
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="h-20 w-20 object-cover rounded-full relative border-2 border-gray-800"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">{post.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/posts/${post.id}`}>
                      <h3 className="text-lg font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:from-indigo-300 group-hover:to-purple-300 transition-all duration-200 ease-in-out">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                      <span className="inline-flex items-center">
                        <User size={12} className="mr-1" />
                        @{post.username}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {Moment(post.createdAt).format("DD MMM")}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {post.content.substring(0, 80)}...
                    </p>
                    
                    <Link href={`/posts/${post.id}`} className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-all duration-200 ease-in-out">
                      <span>Devamını Oku</span>
                      <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <p className="text-gray-500">Henüz gönderi bulunmuyor.</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/dashboard">
              <button className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 ease-in-out text-sm flex items-center mx-auto">
                <span>Tüm Gönderileri Gör</span>
                <ArrowRight size={16} className="ml-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Aramıza Katılın
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6">
              Deneyimlerinizi paylaşarak topluluğa katkı sağlayın.
            </p>
            <Link href="/login">
              <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 ease-in-out shadow-lg flex items-center justify-center mx-auto space-x-2">
                <span>Hesap Oluştur</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;