import { useState, useEffect } from "react";
import Head from 'next/head';
import { API, Storage } from "aws-amplify";
import { listPosts } from "../src/graphql/queries";
import { 
  ArrowRight, 
  Calendar, 
  User, 
  Clock, 
  BookOpen,
  Eye,
  Code,
  MessageCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import Link from "next/link";
import Moment from "moment";
import "moment/locale/tr";
import Loading from "../components/loading";
import dynamic from "next/dynamic";
import Pagination from "../components/Pager";
import { listComments } from "../src/graphql/queries";

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

Moment.locale("tr");

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);
  const [previewMode, setPreviewMode] = useState("rendered");
  
  const [recentComments, setRecentComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [postTitles, setPostTitles] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPosts();
    fetchRecentComments();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const postData = await API.graphql({
        query: listPosts,
      });
  
      const { items } = postData.data.listPosts;
  
      const postWithImages = await Promise.all(
        items.map(async (post) => {
          if (post.coverImage) {
            post.coverImage = await Storage.get(post.coverImage);
          }
          return post;
        })
      );
  
      const sortedPosts = postWithImages.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  
      setPosts(sortedPosts);
      setTotalPages(Math.ceil(sortedPosts.length / postsPerPage));
      
      const titleMap = {};
      items.forEach(post => {
        titleMap[post.id] = post.title;
      });
      setPostTitles(titleMap);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchRecentComments() {
    try {
      setLoadingComments(true);
      const commentData = await API.graphql({
        query: listComments,
        variables: { 
          limit: 10,
          sortDirection: "DESC",
          fetchPolicy: 'cache-and-network'
        }
      });
      
      const items = commentData.data.listComments.items;
      
      const sortedComments = items.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setRecentComments(sortedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  }
  
  const togglePostExpand = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      setPreviewMode("rendered");
    }
  };
  
  const togglePreviewMode = () => {
    setPreviewMode(previewMode === "rendered" ? "raw" : "rendered");
  };
  
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  
  const goToPage = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
    setExpandedPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (action) => {
    switch(action) {
      case 'first':
        goToPage(1);
        break;
      case 'prev':
        goToPage(currentPage - 1);
        break;
      case 'next':
        goToPage(currentPage + 1);
        break;
      case 'last':
        goToPage(totalPages);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Akış | Mülakat 101</title>
      </Head>
      <div className="min-h-screen text-white p-4 md:p-8 font-mono">
        <div className="max-w-7xl mx-auto flex gap-8">
          <div className="flex-1">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 inline-block">
                Son Gönderiler
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mt-2 md:ml-1"></div>
            </div>          
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPosts.map((post, index) => (
                <article
                  key={index}
                  className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500 shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-black/60 opacity-50 group-hover:opacity-70 transition-opacity z-0"></div>
                  
                  <div className="relative z-10 p-6">
                    <div className="flex justify-center mb-6">
                      {post.coverImage ? (
                        <div className="relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-70 group-hover:opacity-100 transition"></div>
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-28 h-28 object-cover rounded-full relative border-2 border-black"
                          />
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <span className="text-3xl font-bold">{post.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/posts/${post.id}`} className="block">
                      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2 group-hover:from-indigo-300 group-hover:to-pink-300 transition-all">
                        {post.title}
                      </h2>
                    </Link>
                    
                    <div className="flex items-center space-x-2 mb-3 text-xs text-gray-400">
                      <span className="inline-flex items-center px-2 py-1 bg-indigo-900/40 rounded-md border border-indigo-800">
                        <User size={12} className="mr-1" />
                        @{post.username}
                      </span>
                      <span>•</span>
                      <time className="font-light tracking-wider inline-flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {Moment(post.createdAt).format("DD MMM")}
                        <Clock size={12} className="ml-2 mr-1" />
                        {Moment(post.createdAt).format("HH:mm")}
                      </time>
                    </div>
                    
                    <div className="text-gray-300 text-sm mb-5">
                      {expandedPost === post.id ? (
                        <div className="relative bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="absolute top-2 right-2 flex">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                togglePreviewMode();
                              }}
                              className="p-1.5 bg-gray-700 hover:bg-indigo-600 rounded-md text-xs text-white transition-colors flex items-center gap-1"
                            >
                              {previewMode === "rendered" ? (
                                <>
                                  <Code size={14} />
                                  <span>Kaynak</span>
                                </>
                              ) : (
                                <>
                                  <Eye size={14} />
                                  <span>Önizleme</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          <div className="pt-8">
                            {previewMode === "rendered" ? (
                              <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{post.content}</ReactMarkdown>
                              </div>
                            ) : (
                              <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto text-xs font-mono text-gray-300">
                                {post.content}
                              </pre>
                            )}
                          </div>
                          
                          <div className="mt-4 text-center">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                togglePostExpand(post.id);
                              }}
                              className="text-xs text-indigo-400 hover:text-indigo-300"
                            >
                              Kapat
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="line-clamp-3">{post.content.substring(0, 120)}...</p>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              togglePostExpand(post.id);
                            }}
                            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center"
                          >
                            <Eye size={12} className="mr-1" />
                            İçeriği Önizle
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-gray-800">
                      <Link
                        href={`/posts/${post.id}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 transform group-hover:translate-x-1"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Görüntüle
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </article>
              ))}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-12"
            />
          </div>

            <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>
                
                <div className="pl-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                      Son Yorumlar
                    </h2>
                    <button 
                      onClick={fetchRecentComments}
                      className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                      disabled={loadingComments}
                    >
                      <RefreshCw 
                        size={16} 
                        className={`text-gray-400 ${loadingComments ? 'animate-spin' : ''}`} 
                      />
                    </button>
                  </div>
                  
                  {loadingComments ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-800/50 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-800/50 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentComments.map((comment) => (
                        <Link 
                          href={`/posts/${comment.postID}`}
                          key={comment.id}
                          className="block group"
                        >
                          <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4 hover:border-indigo-500/50 hover:bg-gray-900/70 transition-all">
                            <div className="flex items-start gap-2 mb-2">
                              <MessageCircle size={16} className="text-indigo-400 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-300 flex items-center gap-1">
                                  <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">@{comment.createdBy}</span>
                                  <span className="text-gray-400">yorum yaptı:</span>
                                </p>
                                <p className="text-sm text-gray-400 truncate">
                                  {comment.message.substring(0, 50)}...
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <BookOpen size={12} className="mr-1" />
                                    <span className="truncate max-w-[150px]">
                                      {postTitles[comment.postID] || 'Yükleniyor...'}
                                    </span>
                                  </div>
                                  <span className="text-gray-600">•</span>
                                  <span className="text-xs text-gray-500">
                                    {Moment(comment.createdAt).fromNow()}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight 
                                size={14} 
                                className="text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" 
                              />
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      {recentComments.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          Henüz yorum yapılmamış
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}