import { useEffect, useState, useRef } from "react";
import { API, Storage } from "aws-amplify";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { updatePost } from "../../src/graphql/mutations";
import { getPost, listPosts } from "../../src/graphql/queries";
import { v4 as uuid } from "uuid";
import { FileText, Save, ArrowLeft, RefreshCw, Upload, X, Image } from 'lucide-react';
import Link from "next/link";
import { withAuthenticator } from '@aws-amplify/ui-react';

const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";

export async function getStaticPaths() {
  try {
    const postData = await API.graphql({
      query: listPosts,
      authMode: "API_KEY"
    });

    const posts = postData.data.listPosts.items;
    const paths = posts.map(post => ({ params: { id: post.id } }));

    return {
      paths,
      fallback: false
    };
  } catch (error) {
    console.error("Error fetching posts for static paths:", error);
    return {
      paths: [],
      fallback: false
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { id } = params;
    const postData = await API.graphql({
      query: getPost,
      variables: { id },
      authMode: "API_KEY"
    });

    return {
      props: {
        post: postData.data.getPost
      }
    };
  } catch (error) {
    console.error("Error fetching post for static props:", error);
    return {
      notFound: true
    };
  }
}

function EditPost({ post: initialPost }) {
  const [post, setPost] = useState(initialPost || null);
  const [isLoading, setIsLoading] = useState(!initialPost);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [localImage, setLocalImage] = useState(null);
  const fileInput = useRef(null);
  const originalPost = useRef(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (initialPost) {
      setPost(initialPost);
      originalPost.current = JSON.stringify(initialPost);
      if(initialPost.coverImage) {
        updateCoverImage(initialPost.coverImage);
      }
      setIsLoading(false);
    } else if (id) {
      fetchPost();
    }

    async function fetchPost() {
      try {
        setIsLoading(true);
        const postData = await API.graphql({
          query: getPost,
          variables: { id }
        });
        const fetchedPost = postData.data.getPost;
        setPost(fetchedPost);
        originalPost.current = JSON.stringify(fetchedPost);
        if(postData.data.getPost.coverImage){
          updateCoverImage(postData.data.getPost.coverImage);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [id, initialPost]);

  useEffect(() => {
    if (post && originalPost.current) {
      const currentPostString = JSON.stringify({ title: post.title, content: post.content });
      const { title, content } = JSON.parse(originalPost.current);
      const originalPostString = JSON.stringify({ title, content });
      
      const hasImageChange = coverImage && typeof coverImage === 'object';
      setHasChanges(currentPostString !== originalPostString || hasImageChange);
    }
  }, [post, coverImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-spin mb-4"></div>
          <p className="text-indigo-400 text-xl font-mono">Gönderi Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!post) return null;

  async function updateCoverImage(coverImage){
    const imageKey = await Storage.get(coverImage);
    setCoverImage(imageKey);
  }

  async function uploadImage(){
    fileInput.current.click();
  }

  function handleChange(e){
    const fileUpload = e.target.files[0];
    if (!fileUpload) return
    setCoverImage(fileUpload);
    setLocalImage(URL.createObjectURL(fileUpload));
    setHasChanges(true);
  }

  function removeImage() {
    setCoverImage(null);
    setLocalImage(null);
    fileInput.current.value = "";
  }

  function onChange(e) {
    setPost(() => ({ ...post, [e.target.name]: e.target.value }));
  }

  const { title, content } = post;

  async function updateCurrentPost() {
    if (!title || !content) return;
    
    try {
      setIsSaving(true);
      
      let postUpdated = {
        id,
        content,
        title
      };
      
      if (coverImage && typeof coverImage === 'object') {
        const fileName = `${uuid()}-${coverImage.name}`;
        const stored = await Storage.put(fileName, coverImage, {
          contentType: coverImage.type
        });
        
        postUpdated.coverImage = fileName;
      }
      
      await API.graphql({
        query: updatePost,
        variables: { input: postUpdated },
        authMode: "AMAZON_COGNITO_USER_POOLS"
      });
      
      router.push("/my-posts");
    } catch (error) {
      console.error("Error updating post:", error);
      setIsSaving(false);
    }
  }

  return (
    <>
    <Head>
        <title>{post.title} | Mülakat101</title>
    </Head>
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 inline-block">
          Gönderi Düzenle
        </h1>
        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mt-2 md:ml-1"></div>
        <p className="text-gray-500 mt-4 md:ml-1 text-sm">
          Düzenleniyor: <span className="text-indigo-400">{post.title}</span>
        </p>
      </div>

      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg blur"></div>
        <div className="relative bg-gray-900/80 border border-gray-800 rounded-lg p-6 shadow-xl mb-8">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
              <FileText size={16} className="mr-2 text-indigo-400" />
              BAŞLIK
            </label>
            <input
              id="title"
              onChange={onChange}
              name="title"
              placeholder="Gönderi başlığı"
              value={post.title}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-800 focus:border-indigo-500 bg-black/50 text-white text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          {(coverImage || localImage) && (
            <div className="mb-6 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-lg blur opacity-70"></div>
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-800 group">
                <img 
                  src={localImage || coverImage} 
                  alt="Cover preview"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={removeImage}
                    className="p-2 bg-red-600/80 rounded-full hover:bg-red-700 transition-colors"
                    aria-label="Remove image"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-black/70 text-gray-300 text-sm flex items-center">
                  <Image size={16} className="mr-2 text-indigo-400" alt=""/>
                  <span className="truncate">{typeof coverImage === 'object' ? coverImage.name : 'Yüklenen Görsel'}</span>
                </div>
              </div>
            </div>
          )}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
              <FileText size={16} className="mr-2 text-indigo-400" />
              İÇERİK
            </label>
            <div className="markdown-editor-container">
              <SimpleMdeReact
                value={post.content}
                onChange={(value) => setPost({ ...post, content: value })}
                className="markdown-dark-theme"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Link href="/my-posts">
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-medium border border-gray-700 hover:border-indigo-500 shadow-lg"
              >
                <ArrowLeft size={18} className="text-indigo-400" />
                <span>Geri Dön</span>
              </button>
            </Link>
            <input 
            type="file"
            ref={fileInput}
            className="absolute w-0 h-0"
            onChange={handleChange}
            accept="image/*"
            />
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-medium border border-gray-700 hover:border-indigo-500 shadow-lg"
              onClick={uploadImage}
            >
              <Upload size={18} className="text-indigo-400" />
              <span>Kapak Görseli</span>
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${hasChanges ? 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'from-gray-600 to-gray-700'} text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-indigo-500/30 ${isSaving || !hasChanges ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={updateCurrentPost}
              disabled={isSaving || !hasChanges || !title || !content}
            >
              {isSaving ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <div className={`flex items-center space-x-2 py-2 px-4 rounded-full ${hasChanges ? 'bg-indigo-900/80 text-indigo-300' : 'bg-gray-800/80 text-gray-400'} shadow-lg text-sm border border-gray-700`}>
          <div className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-indigo-400 animate-pulse' : 'bg-gray-500'}`}></div>
          <span>{hasChanges ? 'Kaydedilmemiş değişiklikler' : 'Tüm değişiklikler kaydedildi'}</span>
        </div>
      </div>
    </div>
    </>
  );
}

export default withAuthenticator(EditPost);