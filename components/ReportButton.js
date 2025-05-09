import { useState } from 'react';
import { API } from 'aws-amplify';
import { AlertTriangle, X, Flag, Shield, Ban, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createReport } from '../src/graphql/mutations';

const ReportButton = ({ postId }) => {
    const [isReporting, setIsReporting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const reasons = [
        { value: 'Spam', icon: Ban, color: 'text-red-400', bgColor: 'bg-red-900/20', hoverColor: 'hover:bg-red-900/40' },
        { value: 'Uygunsuz İçerik', icon: AlertCircle, color: 'text-orange-400', bgColor: 'bg-orange-900/20', hoverColor: 'hover:bg-orange-900/40' },
        { value: 'Taciz', icon: Shield, color: 'text-purple-400', bgColor: 'bg-purple-900/20', hoverColor: 'hover:bg-purple-900/40' },
        { value: 'Diğer', icon: Flag, color: 'text-blue-400', bgColor: 'bg-blue-900/20', hoverColor: 'hover:bg-blue-900/40' }
    ];

    const handleReport = async (reason) => {
        setIsReporting(true);
        
        try {
             await API.graphql({
                query: createReport,
                variables: {
                    input: {
                        postID: postId,
                         reason: reason
                     }
                }
            });
            
            toast.success('Rapor başarıyla gönderildi!', {
                style: {
                    background: '#1F2937',
                    color: '#fff',
                    border: '1px solid #374151'
                }
            });
            setShowModal(false);
        } catch (error) {
            console.error('Hata:', error);
            toast.error('Rapor gönderilemedi!', {
                style: {
                    background: '#1F2937',
                    color: '#fff',
                    border: '1px solid #374151'
                }
            });
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-red-500 hover:text-red-400 transition-all duration-300"
                title="Raporla"
            >
                <AlertTriangle size={16} />
                <span className="hidden sm:inline">Raporla</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
                        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                                <AlertTriangle className="text-red-400" size={24} />
                                <span>İçeriği Raporla</span>
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-300 mb-6">
                                Bu içeriği neden raporlamak istiyorsunuz?
                            </p>
                            
                            <div className="space-y-3">
                                {reasons.map((reason, index) => {
                                    const Icon = reason.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleReport(reason.value)}
                                            disabled={isReporting}
                                            className={`w-full p-4 rounded-lg border border-gray-700 flex items-center space-x-4 transition-all duration-200 
                                                ${reason.bgColor} ${reason.hoverColor} 
                                                ${isReporting ? 'opacity-50 cursor-not-allowed' : 'hover:border-transparent'}`}
                                        >
                                            <Icon className={reason.color} size={24} />
                                            <span className="text-gray-300 font-medium">{reason.value}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 bg-gray-900 rounded-b-xl">
                            <p className="text-sm text-gray-400 text-center">
                                Raporlarınız gizli kalır ve ekibimiz tarafından incelenir.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportButton;