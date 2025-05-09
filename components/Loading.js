const Loading = ({ text = "Yükleniyor..." }) => {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-spin mb-4"></div>
          <p className="text-indigo-400 text-xl font-mono">{text}</p>
        </div>
      </div>
    );
  };
  
  export default Loading;