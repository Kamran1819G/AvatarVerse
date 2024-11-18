import Peer from 'peerjs'
import Network from '../services/Network'
import store from '../stores'
import { setVideoConnected } from '../stores/UserStore'
import { Video, VideoOff, Mic, MicOff, LucideIcon } from 'lucide-react'
import React from 'react'
import { createRoot } from 'react-dom/client'

export default class WebRTC {
  private myPeer: Peer
  private peers = new Map<string, { call: Peer.MediaConnection; video: HTMLVideoElement }>()
  private onCalledPeers = new Map<string, { call: Peer.MediaConnection; video: HTMLVideoElement }>()
  private videoGrid = document.querySelector('.video-grid')
  private buttonGrid = document.querySelector('.button-grid')
  private myVideo = document.createElement('video')
  private myStream?: MediaStream
  private network: Network

  constructor(userId: string, network: Network) {
    const sanitizedId = this.replaceInvalidId(userId)
    this.myPeer = new Peer(sanitizedId)
    this.network = network
    console.log('userId:', userId)
    console.log('sanitizedId:', sanitizedId)
    this.myPeer.on('error', (err) => {
      console.log(err.type)
      console.error(err)
    })

    // mute your own video stream (you don't want to hear yourself)
    this.myVideo.muted = true

     // config peerJS
    this.initialize()
  }

  // PeerJS throws invalid_id error if it contains some characters such as that colyseus generates.
  // https://peerjs.com/docs.html#peer-id
  private replaceInvalidId(userId: string) {
    return userId.replace(/[^0-9a-z]/gi, 'G')
  }

  initialize() {
    this.myPeer.on('call', (call) => {
      if (!this.onCalledPeers.has(call.peer)) {
        call.answer(this.myStream)
        const video = document.createElement('video')
        this.onCalledPeers.set(call.peer, { call, video })

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream)
        })
      }
      // on close is triggered manually with deleteOnCalledVideoStream()
    })
  }

  // check if permission has been granted before
  checkPreviousPermission() {
    const permissionName = 'microphone' as PermissionName
    navigator.permissions?.query({ name: permissionName }).then((result) => {
      if (result.state === 'granted') this.getUserMedia(false)
    })
  }

  getUserMedia(alertOnError = true) {
    // ask the browser to get user media
    navigator.mediaDevices
      ?.getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.myStream = stream
        this.addVideoStream(this.myVideo, this.myStream)
        this.setUpButtons()
        store.dispatch(setVideoConnected(true))
        this.network.videoConnected()
      })
      .catch((error) => {
        if (alertOnError) window.alert('No webcam or microphone found, or permission is blocked')
      })
  }

  // method to call a peer
  connectToNewUser(userId: string) {
    if (this.myStream) {
      const sanitizedId = this.replaceInvalidId(userId)
      if (!this.peers.has(sanitizedId)) {
        console.log('calling', sanitizedId)
        const call = this.myPeer.call(sanitizedId, this.myStream)
        const video = document.createElement('video')
        this.peers.set(sanitizedId, { call, video })

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream)
        })
      }
    }
  }

  // on close is triggered manually with deleteVideoStream()
  addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    video.srcObject = stream
    video.playsInline = true
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    if (this.videoGrid) this.videoGrid.append(video)
  }

  // method to remove video stream (when we are the host of the call)
  deleteVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    if (this.peers.has(sanitizedId)) {
      const peer = this.peers.get(sanitizedId)
      peer?.call.close()
      peer?.video.remove()
      this.peers.delete(sanitizedId)
    }
  }

  // method to remove video stream (when we are the guest of the call)
  deleteOnCalledVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    if (this.onCalledPeers.has(sanitizedId)) {
      const onCalledPeer = this.onCalledPeers.get(sanitizedId)
      onCalledPeer?.call.close()
      onCalledPeer?.video.remove()
      this.onCalledPeers.delete(sanitizedId)
    }
  }

  private createIconButton(
    ActiveIcon: LucideIcon,
    InactiveIcon: LucideIcon,
    onClick: () => void
  ) {
    const button = document.createElement('button')
    button.className = 'p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none'
    
    const iconContainer = document.createElement('div')
    iconContainer.className = 'w-6 h-6'
    button.appendChild(iconContainer)
    
    const root = createRoot(iconContainer)
    let isActive = true

    const updateIcon = () => {
      const IconComponent = isActive ? ActiveIcon : InactiveIcon
      root.render(React.createElement(IconComponent, { 
        size: 24,
        color: isActive ? '#000000' : '#666666'
      }))
    }

    button.addEventListener('click', () => {
      onClick()
      isActive = !isActive
      updateIcon()
    })

    updateIcon()
    return button
  }

  // method to set up mute/unmute and video on/off buttons
  setUpButtons() {
    if (!this.buttonGrid) return;

    let isCameraOn = true;

    const audioButton = this.createIconButton(
        Mic,
        MicOff,
        () => {
            if (this.myStream) {
                const audioTrack = this.myStream.getAudioTracks()[0];
                audioTrack.enabled = !audioTrack.enabled;
            }
        }
    );

    const videoButton = this.createIconButton(
        Video,
        VideoOff,
        async () => {
            if (this.myStream) {
                const videoTrack = this.myStream.getVideoTracks()[0];

                if (isCameraOn) {
                    videoTrack.stop(); // Stop the video track to release the camera
                    this.myStream.removeTrack(videoTrack);
                    isCameraOn = false;
                } else {
                    try {
                        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                        const newVideoTrack = newStream.getVideoTracks()[0];
                        this.myStream.addTrack(newVideoTrack);
                        this.addVideoStream(this.myVideo, this.myStream);
                        isCameraOn = true;
                    } catch (error) {
                        console.error("Failed to access camera:", error);
                        window.alert("Could not access camera");
                    }
                }
            }
        }
    );

    this.buttonGrid.append(audioButton);
    this.buttonGrid.append(videoButton);
}
}