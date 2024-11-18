import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

import { getColorByString } from '../util'
import { useAppDispatch, useAppSelector } from '../hooks'
import { MessageType, setFocused, setShowChat } from '../stores/ChatStore'

const Backdrop = styled.div`
  position: fixed;
  bottom: 60px;
  left: 0;
  height: 400px;
  width: 500px;
  max-height: 50%;
  max-width: 100%;
  transition: all 0.3s ease-in-out;
`

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
`

const FabWrapper = styled.div`
  margin-top: auto;
  .MuiFab-root {
    box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.25);
    transition: all 0.2s ease-in-out;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.23);
    }
  }
`

const ChatHeader = styled.div`
  position: relative;
  height: 45px;
  background: linear-gradient(90deg, #1a1a1a 0%, #2c2c2c 100%);
  border-radius: 12px 12px 0px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    color: #fff;
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  .close {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s;
    
    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
  }
`

const ChatBox = styled(Box)`
  height: 100%;
  width: 100%;
  overflow: auto;
  background: #1e1e1e;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1e1e1e;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 4px;
    
    &:hover {
      background: #505050;
    }
  }
`

const MessageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 8px 12px;
  transition: background 0.2s;

  p {
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    overflow-wrap: break-word;
    max-width: 100%;
  }

  .author {
    font-weight: 600;
    margin-right: 8px;
  }

  span {
    color: rgba(255, 255, 255, 0.9);
  }

  .notification {
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
  }

  .timestamp {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    
    .timestamp {
      opacity: 1;
    }
  }
`

const InputWrapper = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #2d2d2d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0px 0px 12px 12px;
  padding: 8px;
`

const InputTextField = styled(InputBase)`
  flex: 1;
  input {
    padding: 10px 14px;
    font-size: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    color: #fff;
    transition: all 0.2s;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    &:focus {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 54px;
  right: 16px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  
  .emoji-mart {
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`

const StyledIconButton = styled(IconButton)`
  color: rgba(255, 255, 255, 0.7);
  margin: 0 4px;
  transition: all 0.2s;
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`

const dateFormatter = new Intl.DateTimeFormat('en', {
  timeStyle: 'short',
  dateStyle: 'short',
})

const Message = ({ chatMessage, messageType }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  return (
    <MessageWrapper
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
    >
      <Tooltip
        open={tooltipOpen}
        title={dateFormatter.format(chatMessage.createdAt)}
        placement="right"
        arrow
      >
        {messageType === MessageType.REGULAR_MESSAGE ? (
          <p>
            <span className="author" style={{ color: getColorByString(chatMessage.author) }}>
              {chatMessage.author}
            </span>
            <span>{chatMessage.content}</span>
          </p>
        ) : (
          <p className="notification">
            {chatMessage.author} {chatMessage.content}
          </p>
        )}
      </Tooltip>
      <span className="timestamp">{new Date(chatMessage.createdAt).toLocaleTimeString()}</span>
    </MessageWrapper>
  )
}

export default function Chat() {
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [readyToSubmit, setReadyToSubmit] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatMessages = useAppSelector((state) => state.chat.chatMessages)
  const focused = useAppSelector((state) => state.chat.focused)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const dispatch = useAppDispatch()
  const game = phaserGame.scene.keys.game as Game

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      inputRef.current?.blur()
      dispatch(setShowChat(false))
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmitMessage()
    }
  }

  const handleSubmitMessage = () => {
    if (!readyToSubmit || !inputValue.trim()) return
    
    inputRef.current?.blur()
    const val = inputValue.trim()
    setInputValue('')
    if (val) {
      game.network.addChatMessage(val)
      game.myPlayer.updateDialogBubble(val)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!readyToSubmit) {
      setReadyToSubmit(true)
      return
    }
    handleSubmitMessage()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (focused) {
      inputRef.current?.focus()
    }
  }, [focused])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, showChat])

  return (
    <Backdrop>
      <Wrapper>
        {showChat ? (
          <>
            <ChatHeader>
              <h3>Chat</h3>
              <IconButton
                aria-label="close chat"
                className="close"
                onClick={() => dispatch(setShowChat(false))}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </ChatHeader>
            <ChatBox>
              {chatMessages.map(({ messageType, chatMessage }, index) => (
                <Message chatMessage={chatMessage} messageType={messageType} key={index} />
              ))}
              <div ref={messagesEndRef} />
              {showEmojiPicker && (
                <EmojiPickerWrapper>
                  <Picker
                    theme="dark"
                    showSkinTones={false}
                    showPreview={false}
                    onSelect={(emoji) => {
                      setInputValue(inputValue + emoji.native)
                      setShowEmojiPicker(false)
                      dispatch(setFocused(true))
                    }}
                    exclude={['recent', 'flags']}
                  />
                </EmojiPickerWrapper>
              )}
            </ChatBox>
            <InputWrapper onSubmit={handleSubmit}>
              <InputTextField
                inputRef={inputRef}
                autoFocus={focused}
                fullWidth
                placeholder="Type a message..."
                value={inputValue}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onFocus={() => {
                  if (!focused) {
                    dispatch(setFocused(true))
                    setReadyToSubmit(true)
                  }
                }}
                onBlur={() => {
                  dispatch(setFocused(false))
                  setReadyToSubmit(false)
                }}
              />
              <StyledIconButton 
                aria-label="emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <InsertEmoticonIcon />
              </StyledIconButton>
              <StyledIconButton
                aria-label="send"
                onClick={handleSubmitMessage}
                disabled={!inputValue.trim()}
              >
                <SendIcon />
              </StyledIconButton>
            </InputWrapper>
          </>
        ) : (
          <FabWrapper>
            <Fab
              color="secondary"
              aria-label="open chat"
              onClick={() => {
                dispatch(setShowChat(true))
                dispatch(setFocused(true))
              }}
            >
              <ChatBubbleOutlineIcon />
            </Fab>
          </FabWrapper>
        )}
      </Wrapper>
    </Backdrop>
  )
}