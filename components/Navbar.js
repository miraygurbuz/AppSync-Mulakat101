import Link from "next/link"
import {useRouter} from "next/router"
import React, { useState, useEffect } from "react"
import "../configureAmplify"
import { Menu, X, Pen, User, LogIn, ClipboardList, Home, LogOut } from "lucide-react"
import { Auth, Hub } from "aws-amplify"

const Navbar = () => {
    const [signedUser, setSignedUser] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState("");
    const router = useRouter();
    
    useEffect(() => {
        authListener();
        setCurrentPath(router.pathname);
    }, [router.pathname]);

    async function authListener() {
        Hub.listen("auth", (data) => {
            switch (data.payload.event) {
                case "signIn":
                    return setSignedUser(true)
                case "signOut":
                    return setSignedUser(false)
            }
        });
        
        try {
            await Auth.currentAuthenticatedUser();
            setSignedUser(true);
        } catch (err) { 
            setSignedUser(false);
        }
    }

    const handleSignOut = async () => {
        try {
            await Auth.signOut();
            router.push("/");
            setSignedUser(false);
        } catch (err) {
        }
    }

    const menuItems = signedUser
        ? [
            { title: "Gönderi Oluştur", url: "/create-post", icon: <Pen size={20} />, id: "create-post" },
            { title: "Profilim", url: "/profile", icon: <User size={20} />, id: "profile" },
            { title: "Gönderilerim", url: "/my-posts", icon: <ClipboardList size={20} />, id: "my-posts" },
            { title: "Çıkış Yap", url: "#", icon: <LogOut size={20} />, id: "logout", action: handleSignOut },
        ]
        : [
            { title: "Giriş", url: "/login", icon: <LogIn size={20} />, id: "auth" },
            { title: "Akış", url: "/dashboard", icon: <Home size={20} />, id:"home"}
        ];

    const isActive = (path) => {
        return currentPath === path;
    };

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-indigo-500/40 font-mono shadow-lg shadow-indigo-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-all duration-200 ease-in-out transform group-hover:scale-110"></div>
                            <div className="relative w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center border border-indigo-600 transition-all duration-200 ease-in-out group-hover:border-purple-500">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-lg font-bold transition-all duration-200 ease-in-out transform group-hover:scale-110">M</span>
                            </div>
                        </div>
                        <span className="text-white text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 transition-all duration-200 ease-in-out transform group-hover:translate-x-0.5">
                            Mülakat<span className="text-indigo-400 transition-colors duration-200 ease-in-out group-hover:text-purple-400">101</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex space-x-3">
                        {menuItems.map(({ title, url, icon, id, action }) =>
                            url !== "#" ? (
                                <Link
                                    key={id}
                                    href={url}
                                    className={`relative flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ease-in-out overflow-hidden transform hover:scale-105 hover:-translate-y-0.5 ${
                                        isActive(url) 
                                        ? "text-white bg-gray-800" 
                                        : "text-white hover:bg-gray-800/50"
                                    }`}
                                >
                                    {isActive(url) && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 animate-pulse"></div>
                                    )}
                                    
                                    {isActive(url) && (
                                        <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500 shadow-[0_0_8px_1px_rgba(79,70,229,0.8)] animate-glow"></div>
                                    )}
                                    
                                    {isActive(url) && (
                                        <div className="absolute right-3 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_5px_1px_rgba(129,140,248,0.8)] animate-pulse"></div>
                                    )}
                                    
                                    <span className={`mr-2 transition-all duration-200 ease-in-out transform ${isActive(url) ? "text-indigo-400 scale-110" : "hover:scale-110 hover:text-indigo-300"}`}>
                                        {icon}
                                    </span>
                                    <span className="relative z-10">{title}</span>
                                </Link>
                            ) : (
                                <button
                                    key={id}
                                    onClick={action}
                                    className="flex items-center text-sm font-medium px-4 py-2 rounded-lg text-white hover:bg-gray-800/50 transition-all duration-200 ease-in-out transform hover:scale-105 hover:-translate-y-0.5"
                                >
                                    <span className="mr-2 transition-transform duration-200 ease-in-out hover:scale-110">{icon}</span>
                                    {title}
                                </button>
                            )
                        )}
                    </div>

                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsOpen(!isOpen)} 
                            className="relative p-2 text-white focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 hover:rotate-3"
                            aria-label="Toggle menu"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out"></div>
                            <div className="relative">
                                {isOpen ? <X size={24} className="animate-spin-once" /> : <Menu size={24} className="animate-wiggle-once" />}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden animate-slideDown">
                    <div className="flex flex-col space-y-1 px-4 pb-4 pt-2 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-indigo-900/40">
                        {menuItems.map(({ title, url, icon, id, action }, index) => 
                            url !== "#" ? (
                                <Link
                                    key={id}
                                    href={url}
                                    className={`relative flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
                                        isActive(url)
                                        ? "text-white bg-gray-900" 
                                        : "text-white hover:bg-gray-900/70"
                                    } overflow-hidden transform hover:translate-x-1 animate-fadeIn`}
                                    style={{animationDelay: `${index * 50}ms`}}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {isActive(url) && (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-pulse"></div>
                                            <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500 shadow-[0_0_8px_1px_rgba(79,70,229,0.8)]"></div>
                                        </>
                                    )}
                                    
                                    <span className={`mr-3 relative z-10 transition-all duration-200 ease-in-out ${isActive(url) ? "text-indigo-400 scale-110" : "hover:scale-110"}`}>{icon}</span>
                                    <span className="relative z-10">{title}</span>
                                    
                                    {isActive(url) && (
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_5px_1px_rgba(99,102,241,0.8)] animate-pulse"></div>
                                    )}
                                </Link>
                            ) : (
                                <button
                                    key={id}
                                    onClick={() => {
                                        action();
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-900/70 transition-all duration-200 ease-in-out transform hover:translate-x-1 animate-fadeIn"
                                    style={{animationDelay: `${index * 50}ms`}}
                                >
                                    <span className="mr-3 transition-transform duration-200 ease-in-out hover:scale-110">{icon}</span>
                                    {title}
                                </button>
                            )
                        )}
                        
                        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-shimmer"></div>
                    </div>
                </div>
            )}
        </nav>
    );
}
export default Navbar;