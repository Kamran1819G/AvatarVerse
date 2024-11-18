import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { closeWhiteboardDialog } from '../stores/WhiteboardStore';

const WhiteboardDialog = () => {
  const whiteboardUrl = useAppSelector((state) => state.whiteboard.whiteboardUrl);
  const dispatch = useAppDispatch();

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        dispatch(closeWhiteboardDialog());
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [dispatch]);

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      dispatch(closeWhiteboardDialog());
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 lg:p-6 overflow-hidden"
      onClick={handleBackdropClick}
    >
      <div className="w-full h-full max-w-[1400px] mx-auto animate-in fade-in zoom-in duration-200">
        <div className="relative w-full h-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-700">
            <h2 className="text-xl font-semibold text-black">Whiteboard</h2>
            <button
              onClick={() => dispatch(closeWhiteboardDialog())}
              className="p-2 hover:bg-red-700 rounded-lg transition-colors duration-200 group"
              aria-label="Close whiteboard"
            >
              <X 
                className="w-5 h-5  text-slate-400 group-hover:text-white transition-colors" 
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {whiteboardUrl ? (
              <div className="w-full h-full rounded-lg overflow-hidden bg-white shadow-inner">
                <iframe
                  title="Whiteboard Canvas"
                  src={whiteboardUrl}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-slate-400">No whiteboard URL provided</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardDialog;