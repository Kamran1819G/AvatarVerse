import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppSelector } from '../hooks';
import phaserGame from '../PhaserGame';
import Bootstrap from '../scenes/Bootstrap';

export const CreateRoomForm = () => {
  const [values, setValues] = useState({
    name: '',
    description: '',
    password: '',
    autoDispose: true,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined);

  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
    };

    if (!values.name.trim()) {
      newErrors.name = 'Room name is required';
    } else if (values.name.length < 3) {
      newErrors.name = 'Room name must be at least 3 characters';
    }

    if (!values.description.trim()) {
      newErrors.description = 'Room description is required';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.description;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!validateForm()) return;
    if (!lobbyJoined) {
      setFormError('Unable to create room: Not connected to lobby');
      return;
    }

    setIsLoading(true);
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;

    try {
      await bootstrap.network.createCustom(values);
      await bootstrap.launchGame();
    } catch (error) {
      console.error(error);
      setFormError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">
          Room Name
        </label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => {
            setValues({ ...values, name: e.target.value });
            if (errors.name) validateForm();
          }}
          placeholder="Enter room name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(e) => {
            setValues({ ...values, description: e.target.value });
            if (errors.description) validateForm();
          }}
          placeholder="Describe the purpose of this room"
          className={errors.description ? 'border-red-500' : ''}
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password (Optional)
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            placeholder="Set a room password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Room...
          </>
        ) : (
          'Create Room'
        )}
      </Button>
    </form>
  );
};