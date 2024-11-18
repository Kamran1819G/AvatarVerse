import React, { useState } from 'react';
import { X, Share, StopCircle, Maximize2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Peer from 'peerjs';

import { useAppSelector, useAppDispatch } from '@/hooks';
import { closeComputerDialog } from '@/stores/ComputerStore';

interface PeerStreamData {
  stream: MediaStream;
  call: Peer.MediaConnection;
}

interface VideoContainerProps {
  playerName: string;
  stream: MediaStream;
  isMain: boolean;
  onSelect: () => void;
}

const VideoContainer: React.FC<VideoContainerProps> = ({ 
  playerName, 
  stream, 
  isMain, 
  onSelect 
}) => {
  return (
    <div 
      onClick={onSelect}
      className={`relative overflow-hidden rounded-lg bg-black shadow-lg transition-transform hover:scale-[1.02] ${
        isMain ? 'h-full' : 'h-48'
      }`}
    >
      <video 
        className="absolute inset-0 h-full w-full object-contain"
        autoPlay 
        muted={playerName === "You"}
        ref={(video) => {
          if (video) video.srcObject = stream;
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <span className={`font-medium text-white ${isMain ? 'text-lg' : 'text-sm'}`}>
            {playerName}
          </span>
          {playerName === "You" && (
            <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">
              Your Screen
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface StreamInfo {
  id: string;
  stream: MediaStream;
  playerName: string;
}

const ComputerDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const playerNameMap = useAppSelector((state) => state.user.playerNameMap);
  const shareScreenManager = useAppSelector((state) => state.computer.shareScreenManager);
  const myStream = useAppSelector((state) => state.computer.myStream);
  const peerStreams = useAppSelector((state) => 
    state.computer.peerStreams as Map<string, PeerStreamData>
  );
  const [mainStreamId, setMainStreamId] = useState<string | null>(null);

  const handleClose = () => {
    if (shareScreenManager?.myStream) {
      shareScreenManager.stopScreenShare();
    }
    dispatch(closeComputerDialog());
  };

  const handleScreenShare = () => {
    if (shareScreenManager?.myStream) {
      shareScreenManager.stopScreenShare();
    } else {
      shareScreenManager?.startScreenShare();
    }
  };

  const isSharing = Boolean(shareScreenManager?.myStream);

  // Get all available streams
  const allStreams: StreamInfo[] = [];
  if (myStream) {
    allStreams.push({ id: 'self', stream: myStream, playerName: 'You' });
  }
  peerStreams.forEach((peerData: PeerStreamData, id: string) => {
    allStreams.push({ 
      id, 
      stream: peerData.stream,
      playerName: playerNameMap.get(id) || 'Unknown User'
    });
  });

  // Set first stream as main if none selected
  if (mainStreamId === null && allStreams.length > 0) {
    setMainStreamId(allStreams[0].id);
  }

  const mainStream = allStreams.find(s => s.id === mainStreamId);
  const secondaryStreams = allStreams.filter(s => s.id !== mainStreamId);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-4 md:inset-6 lg:inset-8">
        <div className="h-full w-full rounded-xl bg-zinc-900 p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Screen Sharing Session
            </h2>
            <Button
              className="text-zinc-400 hover:text-white"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Toolbar */}
          <div className="mb-6">
            <Button
              onClick={handleScreenShare}
              className="gap-2"
            >
              {isSharing ? (
                <>
                  <StopCircle className="h-4 w-4" />
                  Stop Sharing
                </>
              ) : (
                <>
                  <Share className="h-4 w-4" />
                  Share Screen
                </>
              )}
            </Button>
          </div>

          {/* No active streams message */}
          {allStreams.length === 0 && (
            <Alert className="mb-6">
              <AlertDescription>
                No active screen shares. Start sharing your screen or wait for others to share theirs.
              </AlertDescription>
            </Alert>
          )}

          {/* Video Layout */}
          {allStreams.length > 0 && (
            <div className="grid h-[calc(100%-8rem)] grid-cols-[1fr,320px] gap-4">
              {/* Main Video */}
              {mainStream && (
                <div className="h-full">
                  <VideoContainer 
                    stream={mainStream.stream}
                    playerName={mainStream.playerName}
                    isMain={true}
                    onSelect={() => {}}
                  />
                </div>
              )}
              
              {/* Secondary Videos Column */}
              <div className="flex flex-col gap-4 overflow-y-auto">
                {secondaryStreams.map((streamData) => (
                  <VideoContainer
                    key={streamData.id}
                    stream={streamData.stream}
                    playerName={streamData.playerName}
                    isMain={false}
                    onSelect={() => setMainStreamId(streamData.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComputerDialog;