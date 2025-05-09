import { useRef, useState, useCallback, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { API, Auth, Storage } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import "easymde/dist/easymde.min.css";
import { Upload, Image, Send, X, FileText } from 'lucide-react';
import { createPost } from "../src/graphql/mutations";

const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const initialState = { title: "", content: "" };

function CreatePost() {
  const [post, setPost] = useState(initialState);
  const { title, content } = post;
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageFileInput = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function onChange(e) {
    setPost((prevPost) => ({
      ...prevPost,
      [e.target.name]: e.target.value,
    }));
  }

  const onEditorChange = useCallback((value) => {
    setPost(prevPost => ({ ...prevPost, content: value }));
  }, []);

async function createNewPost() {
  if (!title || !content) {
    return;
  }

  try {
    setIsSubmitting(true);
    
    const contentCheck = await API.graphql({
      query: `mutation CheckContent($text: String!) {
        checkContent(text: $text) {
          clean
        }
      }`,
      variables: { text: content },
      authMode: 'API_KEY'
    });
     
    if (!contentCheck.data.checkContent.clean) {
      toast.error("İçerik politikalarımıza aykırı mesaj");
      setIsSubmitting(false);
      return;
    }
    
    const { username } = await Auth.currentAuthenticatedUser();
    const id = uuid();

    let newPost = {
      ...post,
      id,
      username,
    };

    if (image) {
      const filename = `${image.name}_${uuid()}`;
      newPost.coverImage = filename;
      await Storage.put(filename, image);
    }

    const result = await API.graphql({
      query: createPost,
      variables: { input: newPost },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    
    router.push(`/posts/${id}`);
    toast.success("Gönderi başarıyla yayınlandı!");
  } catch (error) {
    toast.error("Gönderi oluşturulurken bir hata oluştu!");
    setIsSubmitting(false);
  }
}

  async function uploadImage() {
    imageFileInput.current.click();
  }

  function handleChange(e) {
    const fileUploaded = e.target.files[0];
    if (!fileUploaded) return;
    setImage(fileUploaded);
  }

  function removeImage() {
    setImage(null);
    imageFileInput.current.value = "";
  }

  const editorOptions = useCallback({
    spellChecker: false,
    placeholder: "Gönderinizin içeriğini buraya yazın...",
    status: false,
    autofocus: true,
  }, []);

  return (
    <>
    <Head>
      <title>Yeni Gönderi | Mülakat 101</title>
    </Head>
    <div className="max-w-4xl mx-auto px-4 pt-4 mt-2">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 inline-block">
          Yeni Gönderi Oluştur
        </h1>
        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mt-2 md:ml-1"></div>
      </div>
      
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 text-gray-400 text-sm mb-12">
        <h3 className="font-semibold text-indigo-400 mb-2 flex items-center">
          <FileText size={16} className="mr-2" />
          Gönderi İpuçları
        </h3>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Markdown formatını kullanarak metninizi biçimlendirebilirsiniz</li>
          <li>Gönderinize yüksek kaliteli bir kapak görseli ekleyin</li>
          <li>Başlığın dikkat çekici olduğundan emin olun</li>
          <li>Yayınlamadan önce yazım hatalarını kontrol edin</li>
        </ul>
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
              placeholder="Gönderiniz için etkileyici bir başlık girin..."
              value={post.title}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-800 focus:border-indigo-500 bg-black/50 text-white text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {image && (
            <div className="mb-6 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-lg blur opacity-70"></div>
              <div className="relative rounded-lg overflow-hidden border-2 border-gray-800 group">
                <img 
                  src={URL.createObjectURL(image)} 
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
                  <span className="truncate">{image.name}</span>
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
              {isMounted && (
                <SimpleMdeReact
                  value={post.content}
                  onChange={onEditorChange}
                  className="markdown-dark-theme"
                  options={editorOptions}
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-8">
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
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-indigo-500/30 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={createNewPost}
              disabled={isSubmitting || !title || !content}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Send size={18} />
              )}
              <span>Gönderiyi Yayınla</span>
            </button>
          </div>
        </div>
      </div>

      <input 
        type="file"
        ref={imageFileInput}
        className="absolute w-0 h-0"
        onChange={handleChange}
        accept="image/*"
      />
    </div>
    </>
  );
}

export default withAuthenticator(CreatePost);