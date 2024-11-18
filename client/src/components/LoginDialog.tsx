import * as React from 'react';
import type { FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, Camera, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { useAppSelector, useAppDispatch } from '../hooks';
import { setLoggedIn } from '../stores/UserStore';
import { getAvatarString, getColorByString } from '../util';
import phaserGame from '../PhaserGame';
import Game from '../scenes/Game';

import Adam from '../images/login/Adam_login.png';
import Ash from '../images/login/Ash_login.png';
import Lucy from '../images/login/Lucy_login.png';
import Nancy from '../images/login/Nancy_login.png';

interface Avatar {
  name: string;
  img: string;
}

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const avatars: Avatar[] = [
  { name: 'adam', img: Adam },
  { name: 'ash', img: Ash },
  { name: 'lucy', img: Lucy },
  { name: 'nancy', img: Nancy },
].sort(() => Math.random() - 0.5);

const LoginDialog: React.FC = () => {
  const [name, setName] = React.useState<string>('');
  const [avatarIndex, setAvatarIndex] = React.useState<number>(0);
  const [nameFieldEmpty, setNameFieldEmpty] = React.useState<boolean>(false);
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  
  const dispatch = useAppDispatch();
  const videoConnected = useAppSelector((state) => state.user.videoConnected);
  const roomJoined = useAppSelector((state) => state.room.roomJoined);
  const roomName = useAppSelector((state) => state.room.roomName);
  const roomDescription = useAppSelector((state) => state.room.roomDescription);
  const game = phaserGame.scene.keys.game as Game;

  React.useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on("select", () => {
      setAvatarIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name === '') {
      setNameFieldEmpty(true);
      return;
    }
    
    if (roomJoined) {
      console.log('Join! Name:', name, 'Avatar:', avatars[avatarIndex].name);
      game.registerKeys();
      game.myPlayer.setPlayerName(name);
      game.myPlayer.setPlayerTexture(avatars[avatarIndex].name);
      game.network.readyToConnect();
      dispatch(setLoggedIn(true));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl animate-in fade-in-50 duration-300">
        <CardHeader className="space-y-3 pb-4">
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 shrink-0" style={{ background: getColorByString(roomName) }}>
              <AvatarFallback>{getAvatarString(roomName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{roomName}</h2>
              <CardDescription className="flex items-center gap-2 text-base">
                <ArrowRight className="h-4 w-4 shrink-0" />
                {roomDescription}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Avatar Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select an avatar</h3>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <Carousel
                    className="w-full max-w-xs mx-auto"
                    setApi={setCarouselApi}
                    opts={{
                      align: "center",
                    }}
                  >
                    <CarouselContent>
                      {avatars.map((avatar) => (
                        <CarouselItem key={avatar.name}>
                          <div className="p-1">
                            <div className="flex items-center justify-center aspect-square">
                              <img 
                                src={avatar.img} 
                                alt={avatar.name} 
                                className="h-48 w-48 object-contain"
                              />
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="flex justify-center gap-2 mt-4">
                      <CarouselPrevious className="static transform-none" />
                      <CarouselNext className="static transform-none" />
                    </div>
                  </Carousel>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your details</h3>
                  <div className="space-y-4">
                    <div>
                      <Input
                        autoFocus
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setName(e.target.value);
                          setNameFieldEmpty(false);
                        }}
                        className={cn(
                          "transition-colors h-11",
                          nameFieldEmpty && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      {nameFieldEmpty && (
                        <p className="text-sm text-red-500 mt-1">Name is required</p>
                      )}
                    </div>

                    {!videoConnected ? (
                      <Alert variant="destructive" className="bg-yellow-500/15 border-yellow-500">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <AlertTitle>No webcam connected</AlertTitle>
                        <AlertDescription className="mt-2">
                          <p className="mb-2">Connect one for the best experience!</p>
                          <Button 
                            onClick={() => game.network.webRTC?.getUserMedia()}
                            className="text-base outline-2 outline-offset-2"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Connect Webcam
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-green-500/15 border-green-500">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <AlertTitle>Webcam connected!</AlertTitle>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button type="submit" className="px-12 text-base font-medium">
                Join Room
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginDialog;