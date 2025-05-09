import { useEffect, useState, useCallback } from "react";
import { API, Storage, Auth, Hub } from "aws-amplify";
import Head from "next/head";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown"
import "../../configureAmplify"
import { listPosts, getPost, commentsByPostID } from "../../src/graphql/queries"
import { Calendar, User, Clock, ArrowLeft, Copy, Share2, MessageCircle, Send } from "lucide-react"
import Link from "next/link"
import Moment from "moment"
import "moment/locale/tr"
import toast from 'react-hot-toast'
import { createComment } from "../../src/graphql/mutations"
import {v4 as uuid } from 'uuid'
import dynamic from 'next/dynamic'
import "easymde/dist/easymde.min.css"
import ReportButton from "../../components/reportbutton";
import Pagination from "../../components/Pager";

const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), {
    ssr: false,
})

const initialState = { message: ""}

Moment.locale("tr")

export default function Post({ post }) {
    const [signedInUser, setSignedInUser] = useState(false)
    const [coverImage, setCoverImage] = useState(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment ] = useState(initialState)
    const [showMe, setShowMe] = useState(false)
    const [comments, setComments] = useState([])
    const [loadingComments, setLoadingComments] = useState(true)
    const [isMounted, setIsMounted] = useState(false)
    
    const [currentPage, setCurrentPage] = useState(1)
    const [commentsPerPage] = useState(5)
    const [totalPages, setTotalPages] = useState(0)
    
    const { message } = comment
    
    useEffect(()=>{
        authListener();
    }, []);

    async function authListener() {
        Hub.listen("auth", (data) => {
            switch(data.payload.event){
                case "signIn":
                    return setSignedInUser(true);
                case "signOut":
                    return setSignedInUser(false);
            }
        });
        try{
            await Auth.currentAuthenticatedUser();
            setSignedInUser(true);
        }catch (error){}
    }

    useEffect(() => {
        setIsMounted(true)
    }, [])
    
    function toggle(){
        setShowMe(!showMe)
    }
    
    const editorOptions = {
        spellChecker: false,
        placeholder: "Yorumunuzu buraya yazın...",
        status: false,
        autofocus: true,
        toolbar: [
            "bold", 
            "italic", 
            "heading", 
            "|", 
            "quote", 
            "unordered-list", 
            "ordered-list", 
            "|", 
            "link", 
            "preview", 
            "fullscreen"
        ]
    };
    
    const router = useRouter()

    useEffect(() => {
        if (post) {
            updateCoverImage()
            fetchComments()
        }
    }, [post])
    
    useEffect(() => {
        setTotalPages(Math.max(1, Math.ceil(comments.length / commentsPerPage)))
    }, [comments, commentsPerPage])
    
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])
    
    async function updateCoverImage() {
        try {
            if (post.coverImage) {
                const imageKey = await Storage.get(post.coverImage)
                setCoverImage(imageKey)
            }
        } catch (error) {}
        finally {
            setLoading(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Paylaşım linki kopyalandı!');
        } catch (err) {
            toast.error('Link kopyalama başarısız oldu!');
        }
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: `${post.title} - Mülakat101`,
                url: window.location.href
            })
            .then(() => toast.success('Başarıyla paylaşıldı!'))
            .catch(() => toast.error('Paylaşım yapılamadı'));
        } else {
            handleCopyLink();
        }
    }

    async function fetchComments() {
        try {
            const commentData = await API.graphql({
                query: commentsByPostID,
                variables: { postID: post.id }
            })
            const sortedComments = commentData.data.commentsByPostID.items.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
            setComments(sortedComments)
        } catch (error) {
            console.error("Error fetching comments:", error)
        } finally {
            setLoadingComments(false)
        }
    }

    if (router.isFallback || loading) {
        return (
            <div className="min-h-screen flex justify-center items-center font-mono">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-spin mb-4"></div>
                    <p className="text-indigo-400 text-xl">İçerik Yükleniyor...</p>
                </div>
            </div>
        )
    }

    async function createTheComment(){
        if (!message) return
        const id = uuid();
        comment.id = id;
        try {
            await API.graphql({
                query: createComment,
                variables: {input: comment},
                authMode: "AMAZON_COGNITO_USER_POOLS"
            });
        } catch (error) {}
        toast.success("Yorumunuz eklendi!");
        setComment(initialState);
        setShowMe(false);
        fetchComments();
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
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    const getCurrentComments = () => {
        const indexOfLastComment = currentPage * commentsPerPage;
        const indexOfFirstComment = indexOfLastComment - commentsPerPage;
        return comments.slice(indexOfFirstComment, indexOfLastComment);
    };
    
    const currentComments = getCurrentComments();

    const formattedDate = Moment(post.createdAt).format("DD MMMM YYYY, HH:mm")

    return (
        <>
        <Head>
            <title>{post.title} | Mülakat101</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-b from-black via-black to-transparent text-white font-mono">
            <div className="relative">
                {coverImage ? (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black z-10"></div>
                        <div className="h-64 md:h-96 w-full overflow-hidden">
                            <img 
                                src={coverImage} 
                                className="w-full h-full object-cover object-center"
                                alt={`${post.title} gönderisinin kapak fotoğrafı`}
                            />
                        </div>
                    </>
                ) : (
                    <div className="h-48 md:h-64 w-full bg-gradient-to-r from-indigo-900/30 to-purple-900/30"></div>
                )}
                
                <div className="absolute top-4 left-4 z-20">
                    <Link href="/">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-black/80 border border-gray-800 rounded-lg text-gray-300 hover:border-indigo-500 hover:text-white transition-all duration-300">
                            <ArrowLeft size={16} />
                            <span>Anasayfa</span>
                        </button>
                    </Link>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-10 md:-mt-20 relative z-20">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 shadow-xl mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            {post.title}
                        </h1>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleShare}
                                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-indigo-500 hover:text-white transition-all duration-300"
                                title="Paylaş"
                            >       
                                <Share2 size={16} />
                                <span className="hidden sm:inline">Paylaş</span>
                            </button>
                            
                            <ReportButton postId={post.id} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 text-sm text-gray-400 mb-2">
                        <div className="flex items-center space-x-2">
                            <User size={16} className="text-indigo-500" />
                            <span className="inline-block px-2 py-1 bg-indigo-900/40 rounded-md border border-indigo-800 text-xs">
                                @{post.username}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar size={16} className="text-indigo-500" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock size={16} className="text-indigo-500" />
                            <span>{Math.ceil(post.content.length / 800)} dk okuma</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 shadow-xl mb-16">
                    {post.content ? (
                        <div className="prose prose-invert prose-indigo prose-headings:text-indigo-400 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 max-w-none">
                            <br/>
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">İçerik bulunamadı</div>
                    )}
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 shadow-xl mb-16" id="comments-section">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Yorumlar</h2>
                        {comments.length > 0 && (
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                {comments.length} yorum
                            </span>
                        )}
                    </div>
                    <div>
                    {signedInUser && (
                    <button
                    type="button"
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-indigo-500 hover:text-white transition-all duration-300"
                    onClick={toggle}
                    >
                        <MessageCircle size={16} />
                        <span>Yorum Ekle</span>
                    </button>)}
                    </div>
                    {showMe && (
                    <div className="mt-4">
                        <div className="mb-4">
                            {isMounted && (
                                <SimpleMdeReact
                                    value={comment.message}
                                    className="markdown-dark-theme"
                                    onChange={(value) => 
                                        setComment({...comment, message: value, postID: post.id})
                                    }
                                    options={editorOptions}
                                />
                            )}
                        </div>
                        <button
                            type="button"
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300"
                            onClick={createTheComment}
                        > 
                            <Send size={16} />
                            <span>Yorumu Gönder</span>
                        </button>
                    </div>
                    )}
                    <br/>
                    {loadingComments ? (
                        <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                        </div>
                    ) : comments.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {currentComments.map((comment) => (
                                    <div 
                                        key={comment.id} 
                                        className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <User size={16} className="text-indigo-500" />
                                                <span className="font-medium text-gray-300">@{comment.createdBy}</span>
                                            </div>
                                            <div className="text-xs bg-clip-text text-gray-400">
                                                {Moment(comment.createdAt).format("DD MMMM YYYY, HH:mm")}
                                            </div>
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown>{comment.message}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    className="mt-8"
                                />
                            )}
                        </>
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            Henüz yorum yok. İlk yorumu siz yapın!
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    )
}

export async function getStaticPaths() {
    try {
        const postData = await API.graphql({
            query: listPosts,
            authMode: "API_KEY"
        })
        const paths = postData.data.listPosts.items.map((post) => ({
            params: { id: post.id },
        }))
        return {
            paths,
            fallback: false,
        }
    } catch (error) {
        console.error("Error fetching posts for static paths:", error)
        return {
            paths: [],
            fallback: false,
        }
    }
}

export async function getStaticProps({ params }) {
    try {
        const { id } = params
        const postData = await API.graphql({
            query: getPost,
            variables: { id },
            authMode: "API_KEY"
        })
        return {
            props: {
                post: postData.data.getPost,
            },
        }
    } catch (error) {
        console.error("Error fetching post for static props:", error)
        return {
            notFound: true
        }
    }
}