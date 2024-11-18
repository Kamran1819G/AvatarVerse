import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card,
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  ArrowLeft, 
  HelpCircle, 
  Users, 
  Plus, 
  Globe, 
  Loader2,
  X 
} from 'lucide-react';
import { useAppSelector } from '../hooks';
import CustomRoomTable from './CustomRoomTable';
import { CreateRoomForm } from './CreateRoomForm';
import phaserGame from '../PhaserGame';
import Bootstrap from '../scenes/Bootstrap';

const RoomSelectionDialog = () => {
  const [showCustomRoom, setShowCustomRoom] = useState(false);
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined);

  React.useEffect(() => {
    if (!lobbyJoined) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [lobbyJoined]);

  const handleConnect = async () => {
    if (lobbyJoined) {
      setConnecting(true);
      try {
        const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
        await bootstrap.network.joinOrCreatePublic();
        await bootstrap.launchGame();
      } catch (error) {
        console.error(error);
        setShowAlert(true);
      } finally {
        setConnecting(false);
      }
    } else {
      setShowAlert(true);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  const renderContent = () => {
    if (showCreateRoomForm) {
      return (
        <motion.div
          className="space-y-6"
          initial="enter"
          animate="center"
          exit="exit"
          variants={slideVariants}
          custom={1}
          transition={{ type: "tween", duration: 0.3 }}
        >
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowCreateRoomForm(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Create Custom Room</CardTitle>
            </div>
          </div>
          <CreateRoomForm />
        </motion.div>
      );
    }

    if (showCustomRoom) {
      return (
        <motion.div
          className="space-y-6"
          initial="enter"
          animate="center"
          exit="exit"
          variants={slideVariants}
          custom={1}
          transition={{ type: "tween", duration: 0.3 }}
        >
          <div className="flex items-center justify-between border-b pb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowCustomRoom(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <CardTitle>Custom Rooms</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Results update in real-time</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="min-h-[300px]">
            <CustomRoomTable />
          </div>
          <Button 
            className="w-full"
            onClick={() => setShowCreateRoomForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Room
          </Button>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="space-y-8"
        initial="enter"
        animate="center"
        exit="exit"
        variants={slideVariants}
        custom={-1}
        transition={{ type: "tween", duration: 0.3 }}
      >
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl">Welcome to AvatarVerse</CardTitle>
          <CardDescription className="text-base">Choose how you want to join</CardDescription>
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full h-16 text-lg relative group"
            onClick={handleConnect}
            disabled={connecting || !lobbyJoined}
          >
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
            <Globe className="h-5 w-5 mr-3" />
            {connecting ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </div>
            ) : (
              "Join Public Lobby"
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-16 text-lg relative group"
            onClick={() => lobbyJoined ? setShowCustomRoom(true) : setShowAlert(true)}
            disabled={connecting || !lobbyJoined}
          >
            <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
            <Users className="h-5 w-5 mr-3" />
            Create or Join Custom Room
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/10 backdrop-blur-sm flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 w-full max-w-md"
          >
            <Alert variant="destructive" className="flex items-center">
              <div className="flex-1">
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  Unable to connect to server. Please try again.
                </AlertDescription>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setShowAlert(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">
          <AnimatePresence mode="wait" initial={false}>
            {renderContent()}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AnimatePresence>
        {!lobbyJoined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 w-full max-w-md space-y-2"
          >
            <p className="text-center text-sm text-primary font-medium">
              Connecting to server...
            </p>
            <Progress value={progress} className="w-full h-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomSelectionDialog;