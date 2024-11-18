import React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Share, 
  HelpCircle, 
  X, 
  Github, 
  Twitter, 
  Sun, 
  Moon, 
  Gamepad2, 
  Gamepad,
  Lightbulb,
  ArrowRight,
  LucideIcon
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { BackgroundMode } from '../../../types/BackgroundMode';
import { setShowJoystick, toggleBackgroundMode } from '../stores/UserStore';

interface ButtonWithTooltipProps {
  tooltip: string;
  onClick?: () => void;
  icon: LucideIcon;
  href?: string;
}

interface InfoCardProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const HelperButtonGroup = () => {
  const [showControlGuide, setShowControlGuide] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const showJoystick = useAppSelector((state) => state.user.showJoystick);
  const backgroundMode = useAppSelector((state) => state.user.backgroundMode);
  const roomJoined = useAppSelector((state) => state.room.roomJoined);
  const roomId = useAppSelector((state) => state.room.roomId);
  const roomName = useAppSelector((state) => state.room.roomName);
  const roomDescription = useAppSelector((state) => state.room.roomDescription);
  const dispatch = useAppDispatch();

  const getAvatarString = (name: string | undefined): string => name?.charAt(0).toUpperCase() || '?';
  
  const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({ tooltip, onClick, icon: Icon, href }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? (
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all"
              asChild
            >
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Icon className="w-5 h-5" />
              </a>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all"
              onClick={onClick}
            >
              <Icon className="w-5 h-5" />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const InfoCard: React.FC<InfoCardProps> = ({ title, onClose, children }) => (
    <Card className="w-80 absolute bottom-16 right-0 mb-2 animate-in fade-in slide-in-from-bottom-2">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <div className="fixed bottom-4 right-4 flex gap-4 items-end">
      <div className="flex flex-col gap-4">
        {roomJoined && (
          <ButtonWithTooltip
            tooltip={showJoystick ? 'Disable virtual joystick' : 'Enable virtual joystick'}
            onClick={() => dispatch(setShowJoystick(!showJoystick))}
            icon={showJoystick ? Gamepad : Gamepad2}
          />
        )}
        
        {showRoomInfo && (
          <InfoCard title="Room Information" onClose={() => setShowRoomInfo(false)}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{getAvatarString(roomName)}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{roomName}</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>ID: {roomId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>Description: {roomDescription}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm bg-muted p-3 rounded-lg">
                <Lightbulb className="w-4 h-4 mt-0.5" />
                <span>Shareable link coming up 😄</span>
              </div>
            </div>
          </InfoCard>
        )}

        {showControlGuide && (
          <InfoCard title="Controls" onClose={() => setShowControlGuide(false)}>
            <div className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">W, A, S, D</kbd>
                  <span>or arrow keys to move</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">E</kbd>
                  <span>to sit down (when facing a chair)</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">R</kbd>
                  <span>to use computer for screen sharing</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
                  <span>to open chat</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd>
                  <span>to close chat</span>
                </li>
              </ul>
              <div className="flex items-start gap-2 text-sm bg-muted p-3 rounded-lg">
                <Lightbulb className="w-4 h-4 mt-0.5" />
                <span>Video connection will start when you're close to someone</span>
              </div>
            </div>
          </InfoCard>
        )}
      </div>

      <div className="flex gap-2">
        {roomJoined && (
          <>
            <ButtonWithTooltip
              tooltip="Room Info"
              onClick={() => {
                setShowRoomInfo(!showRoomInfo);
                setShowControlGuide(false);
              }}
              icon={Share}
            />
            <ButtonWithTooltip
              tooltip="Control Guide"
              onClick={() => {
                setShowControlGuide(!showControlGuide);
                setShowRoomInfo(false);
              }}
              icon={HelpCircle}
            />
          </>
        )}
        <ButtonWithTooltip
          tooltip="Visit My GitHub"
          href="https://github.com/Kamran1819G/AvatarVerse"
          icon={Github}
        />
        <ButtonWithTooltip
          tooltip="Follow Me on Twitter"
          href="https://twitter.com/Kamran1819G"
          icon={Twitter}
        />
        <ButtonWithTooltip
          tooltip="Switch Background Theme"
          onClick={() => dispatch(toggleBackgroundMode())}
          icon={backgroundMode === BackgroundMode.DAY ? Moon : Sun}
        />
      </div>
    </div>
  );
};

export default HelperButtonGroup;