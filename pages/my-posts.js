import { useEffect, useState } from "react";
import { API, Auth, Storage } from "aws-amplify";
import Head from "next/head";
import * as queries from "../src/graphql/queries";
import Link from "next/link";
import { Edit, Trash2, Eye, FileQuestion, Calendar, AlertCircle, Filter, Search } from 'lucide-react';
import Moment from "moment";
import "moment/locale/tr";
import ReactMarkdown from "react-markdown";
import { deletePost as deletePostMutation } from "../src/graphql/mutations";
import { withAuthenticator } from "@aws-amplify/ui-react";
import Loading from "../components/loading";
import Pagination from "../components/Pager";

Moment.locale("tr");

function MyPosts() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    
    useEffect(() => {
        fetchPosts();
    }, []);
    
    useEffect(() => {
        setCurrentPage(1);
        filterAndSortPosts();
    }, [searchTerm, sortOrder, posts]);

    useEffect(() => {
        setTotalPages(Math.max(1, Math.ceil(filteredPosts.length / postsPerPage)));
    }, [filteredPosts, postsPerPage]);
    
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    async function fetchPosts() {
        try {
            setLoading(true);
            const { username } = await Auth.currentAuthenticatedUser();
            const postData = await API.graphql({
                query: queries.postsByUsername,
                variables: { username }
            });
            
            const fetchedPosts = postData.data.postsByUsername.items;
            
            if (fetchedPosts.length > 0) {
                const postsWithImages = await Promise.all(
                    fetchedPosts.map(async (post) => {
                        if (post.coverImage) {
                            post.coverImageUrl = await Storage.get(post.coverImage);
                        }
                        return post;
                    })
                );
                setPosts(postsWithImages);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    }

    const filterAndSortPosts = () => {
        let filtered = [...posts];
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            filtered = posts.filter(post => 
                post.title.toLowerCase().includes(term) || 
                post.content.toLowerCase().includes(term)
            );
        }
        
        if (sortOrder === "newest") {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        
        setFilteredPosts(filtered);
    };

    async function deletePost(id) {
        try {
            await API.graphql({
                query: deletePostMutation,
                variables: { input: { id } },
                authMode: "AMAZON_COGNITO_USER_POOLS"
            });
            setDeleteConfirm(null);
            fetchPosts();
        } catch (error) {
            console.error("Hata:", error);
        }
    }

    function getPostPreview(content) {
        return <ReactMarkdown>{content.length > 100 ? content.substring(0, 100) + "..." : content}</ReactMarkdown>;
    }
    
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
    
    const goToPage = (pageNumber) => {
        if (pageNumber < 1) pageNumber = 1;
        if (pageNumber > totalPages) pageNumber = totalPages;
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const getCurrentPosts = () => {
        const indexOfLastPost = currentPage * postsPerPage;
        const indexOfFirstPost = indexOfLastPost - postsPerPage;
        return filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    };
    
    const currentPosts = getCurrentPosts();

    if (loading) {
        return <Loading />;
    }

    return (
        <>
        <Head>
            <title>Gönderilerim | Mülakat101</title>
        </Head>
        <div className="text-white min-h-screen p-4 md:p-8 font-mono">
            <div className="max-w-6xl mx-auto">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                        <div className="relative mb-8">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-75 blur"></div>
                            <div className="relative p-6 rounded-full">
                                <FileQuestion size={80} className="text-gray-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Burası bomboş...</h2>
                        <p className="text-gray-500 mt-4 max-w-md">Henüz hiç gönderi oluşturmadınız. İlk gönderinizi oluşturmak için aşağıdaki butona tıklayın.</p>
                        <Link 
                            href="/create-post"
                            className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all duration-300 flex items-center space-x-2"
                        >
                            <Edit size={18} />
                            <span>Yeni Gönderi Oluştur</span>
                        </Link>
                    </div>
                ) : (
                    <div>
                        <div className="mb-8 text-center md:text-left">
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 inline-block">
                                Gönderilerim
                            </h1>
                            <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mt-2 md:ml-1"></div>
                            <p className="text-gray-500 mt-4 md:ml-1">Toplam {posts.length} gönderi bulundu</p>
                        </div>
                        
                        <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Gönderi ara..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="flex items-center space-x-2">
                                        <Filter size={18} className="text-gray-500" />
                                        <select 
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value="newest">En yeni</option>
                                            <option value="oldest">En eski</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {searchTerm && (
                                <div className="mt-3 text-sm text-gray-400">
                                    {searchTerm} için {filteredPosts.length} sonuç bulundu
                                </div>
                            )}
                        </div>
                        
                        {filteredPosts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <AlertCircle size={48} className="text-gray-500 mb-4" />
                                <h3 className="text-xl font-medium text-gray-400">Aramanızla eşleşen gönderi bulunamadı</h3>
                                <p className="text-gray-500 mt-2">Farklı anahtar kelimeler deneyin veya filtreleri temizleyin</p>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-6">
                            {currentPosts.map((post, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-indigo-900/50 hover:shadow-indigo-900/20 transition-all duration-300"
                                >
                                    <div className="md:flex">
                                        {post.coverImageUrl && (
                                            <div className="md:w-1/4 md:flex-shrink-0 relative group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <img 
                                                    src={post.coverImageUrl} 
                                                    alt={post.title}
                                                    className="h-full w-full object-cover md:h-full"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className={`p-6 ${post.coverImageUrl ? 'md:w-3/4' : 'w-full'}`}>
                                            <Link href={`/posts/${post.id}`} className="block group">
                                                <h2 className="text-2xl font-bold text-gray-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
                                                    {post.title}
                                                </h2>
                                            </Link>
                                            
                                            <div className="flex flex-wrap items-center mt-3 space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <span className="inline-block px-2 py-1 bg-indigo-900/40 rounded-md border border-indigo-800 text-xs">
                                                        @{post.username}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar size={14} />
                                                    <span>{Moment(post.createdAt).format("DD MMM YYYY, HH:mm")}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 text-gray-400 prose-sm prose-invert line-clamp-2">
                                                {getPostPreview(post.content)}
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-3 mt-6">
                                                <Link
                                                    href={`/edit-post/${post.id}`}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 text-sm"
                                                >
                                                    <Edit size={16} /> <span>Düzenle</span>
                                                </Link>
                                                <Link
                                                    href={`/posts/${post.id}`}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 text-sm"
                                                >
                                                    <Eye size={16} /> <span>Görüntüle</span>
                                                </Link>
                                                {deleteConfirm === post.id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <button 
                                                            onClick={() => deletePost(post.id)}
                                                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 text-sm"
                                                        >
                                                            <span>Onayla</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="flex items-center space-x-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 text-sm"
                                                        >
                                                            <span>İptal</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setDeleteConfirm(post.id)}
                                                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 text-sm"
                                                    >
                                                        <Trash2 size={16} /> <span>Sil</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            className="mt-8"
                        />
                    </div>
                )}
            </div>
            
            {posts.length > 0 && (
                <div className="fixed bottom-8 right-8">
                    <Link 
                        href="/create-post"
                        className="flex items-center justify-center p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-indigo-600/30 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                    >
                        <Edit size={20} />
                    </Link>
                </div>
            )}
        </div>
        </>
    );
}

export default withAuthenticator(MyPosts);