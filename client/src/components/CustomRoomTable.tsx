import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  Lock,
  Search,
  RefreshCw,
  X 
} from 'lucide-react';
import { useAppSelector } from '../hooks';
import phaserGame from '../PhaserGame';
import Bootstrap from '../scenes/Bootstrap';

interface RoomMetadata {
  name: string;
  description: string;
  hasPassword: boolean;
}

interface RoomAvailable {
  roomId: string;
  metadata: RoomMetadata;
  clients: number;
}

const CustomRoomTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomAvailable | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined);
  const availableRooms = useAppSelector((state) => state.room.availableRooms) as RoomAvailable[];

  const filteredRooms = availableRooms.filter(room => 
    room.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinRoom = async (roomId: string, password: string | null = null) => {
    if (!lobbyJoined) return;
    
    setIsJoining(true);
    try {
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
      await bootstrap.network.joinCustomById(roomId, password);
      await bootstrap.launchGame();
      setIsPasswordDialogOpen(false);
      setPassword('');
      setPasswordError(false);
    } catch (error) {
      console.error(error);
      if (password) setPasswordError(true);
    } finally {
      setIsJoining(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !selectedRoom) {
      setPasswordError(true);
      return;
    }
    handleJoinRoom(selectedRoom.roomId, password);
  };

  const resetPasswordDialog = () => {
    setIsPasswordDialogOpen(false);
    setPassword('');
    setPasswordError(false);
    setSelectedRoom(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSearchQuery('')}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset search</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card>
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px] text-center">Players</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-32">
                    <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>No rooms found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => (
                  <TableRow key={room.roomId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {room.metadata.name}
                        {room.metadata.hasPassword && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{room.metadata.description}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {room.clients}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isJoining || !lobbyJoined}
                        onClick={() => {
                          if (room.metadata.hasPassword) {
                            setSelectedRoom(room);
                            setIsPasswordDialogOpen(true);
                          } else {
                            handleJoinRoom(room.roomId);
                          }
                        }}
                      >
                        {isJoining ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Join"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      <Dialog 
        open={isPasswordDialogOpen} 
        onOpenChange={(open) => {
          if (!open) resetPasswordDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Room Password</DialogTitle>
            <DialogDescription>
              This room is password protected. Please enter the password to join.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4 py-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                className={passwordError ? "border-destructive" : ""}
              />
              {passwordError && (
                <p className="text-sm text-destructive">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetPasswordDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isJoining}>
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomRoomTable;