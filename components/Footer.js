import { Github } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-black via-gray-900 to-black border-t border-indigo-900/60 font-mono text-white py-6 shadow-lg shadow-indigo-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-75"></div>
              <div className="relative w-10 h-10 bg-black rounded-full flex items-center justify-center border border-indigo-600">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-lg font-bold">M</span>
              </div>
            </div>
          </div>
          
          <div className="w-24 h-0.5 mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded"></div>
          
          <a 
            href="https://github.com/miraygurbuz" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center space-x-2 py-2 px-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-indigo-600 transition-all duration-300 mb-4 group"
          >
            <Github className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-gray-400 group-hover:text-white text-sm transition-colors">github/miraygurbuz</span>
          </a>
          
          <p className="text-xs text-gray-500 mt-2">
            &copy; 2025 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Mülakat101</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;