import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

interface WhiteboardState {
  whiteboardDialogOpen: boolean
  whiteboardId: null | string
  whiteboardUrl: null | string
  urls: Map<string, string>
  // New fields for Excalidraw-specific features
  viewMode: boolean
  isCollaborating: boolean
}

const initialState: WhiteboardState = {
  whiteboardDialogOpen: false,
  whiteboardId: null,
  whiteboardUrl: null,
  urls: new Map(),
  viewMode: false,
  isCollaborating: false,
}

export const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    openWhiteboardDialog: (state, action: PayloadAction<string>) => {
      state.whiteboardDialogOpen = true
      state.whiteboardId = action.payload
      const url = state.urls.get(action.payload)
      if (url) state.whiteboardUrl = url
      state.isCollaborating = true
      const game = phaserGame.scene.keys.game as Game
      game.disableKeys()
    },
    closeWhiteboardDialog: (state) => {
      const game = phaserGame.scene.keys.game as Game
      game.enableKeys()
      game.network.disconnectFromWhiteboard(state.whiteboardId!)
      state.whiteboardDialogOpen = false
      state.whiteboardId = null
      state.whiteboardUrl = null
      state.isCollaborating = false
    },
    setWhiteboardUrls: (state, action: PayloadAction<{ 
      whiteboardId: string; 
      roomId: string;
      isReadOnly?: boolean 
    }>) => {
      // Construct Excalidraw URL with room ID and optional parameters
      const baseUrl = 'https://excalidraw.com/'
      const roomParam = `#room=${action.payload.roomId}`
      const viewModeParam = action.payload.isReadOnly ? '&viewMode=true' : ''
      
      const excalidrawUrl = `${baseUrl}${roomParam}${viewModeParam}`
      
      state.urls.set(action.payload.whiteboardId, excalidrawUrl)
    },
    setViewMode: (state, action: PayloadAction<boolean>) => {
      state.viewMode = action.payload
      if (state.whiteboardUrl) {
        // Update URL with new view mode
        const currentUrl = new URL(state.whiteboardUrl)
        if (action.payload) {
          currentUrl.searchParams.set('viewMode', 'true')
        } else {
          currentUrl.searchParams.delete('viewMode')
        }
        state.whiteboardUrl = currentUrl.toString()
      }
    },
  },
})

export const { 
  openWhiteboardDialog, 
  closeWhiteboardDialog, 
  setWhiteboardUrls,
  setViewMode 
} = whiteboardSlice.actions

export default whiteboardSlice.reducer