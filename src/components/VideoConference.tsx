"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Monitor, MonitorOff, AlertCircle } from "lucide-react";
import Peer, { MediaConnection } from "peerjs";
import { io, Socket } from "socket.io-client";

interface VideoConferenceProps {
  roomId: string;
}

export default function VideoConference({ roomId }: VideoConferenceProps) {
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<{ [key: string]: MediaStream }>({});
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const callsRef = useRef<{ [key: string]: MediaConnection }>({});

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const init = async () => {
      try {
        // 1. Initialiser le flux média
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(currentStream);
        if (myVideoRef.current) myVideoRef.current.srcObject = currentStream;
        setError(null);

        // 2. Initialiser Socket.io pour la signalisation
        // On appelle l'API pour s'assurer que le serveur socket est démarré
        await fetch("/api/socket");
        const socket = io({
          path: "/api/socket",
          addTrailingSlash: false,
        });
        socketRef.current = socket;

        // 3. Initialiser PeerJS avec des serveurs STUN pour passer les firewalls
        const peer = new Peer("", {
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:stun2.l.google.com:19302" },
            ],
          },
        });
        peerRef.current = peer;

        peer.on("open", (userId) => {
          console.log("Connected to PeerJS with ID:", userId);
          socket.emit("join-room", roomId, userId);
        });

        // Recevoir un appel d'un nouveau venu
        peer.on("call", (call) => {
          console.log("Receiving call from:", call.peer);
          call.answer(currentStream!);
          
          call.on("stream", (remoteStream) => {
            setPeers((prev) => ({ ...prev, [call.peer]: remoteStream }));
          });

          call.on("close", () => {
            setPeers((prev) => {
              const newPeers = { ...prev };
              delete newPeers[call.peer];
              return newPeers;
            });
          });
          
          callsRef.current[call.peer] = call;
        });

        // Quand Socket.io nous dit qu'un nouvel utilisateur est là, on l'appelle
        socket.on("user-connected", (userId) => {
          if (userId === peer.id) return;
          console.log("User connected to room:", userId);
          
          // Appeler le nouvel utilisateur
          const call = peer.call(userId, currentStream!);
          
          call.on("stream", (remoteStream) => {
            setPeers((prev) => ({ ...prev, [userId]: remoteStream }));
          });

          call.on("close", () => {
            setPeers((prev) => {
              const newPeers = { ...prev };
              delete newPeers[userId];
              return newPeers;
            });
          });

          callsRef.current[userId] = call;
        });

        socket.on("user-disconnected", (userId) => {
          console.log("User disconnected:", userId);
          if (callsRef.current[userId]) {
            callsRef.current[userId].close();
            delete callsRef.current[userId];
          }
          setPeers((prev) => {
            const newPeers = { ...prev };
            delete newPeers[userId];
            return newPeers;
          });
        });

      } catch (err: any) {
        console.error("Failed to get local stream", err);
        if (err.name === 'NotAllowedError') {
          setError("Accès caméra/micro refusé. Veuillez autoriser l'accès dans votre navigateur.");
        } else if (err.name === 'NotFoundError') {
          setError("Aucune caméra ou micro trouvé sur cet appareil.");
        } else {
          setError("Erreur lors de l'accès à la caméra : " + err.message);
        }
      }
    };

    init();

    return () => {
      currentStream?.getTracks().forEach(track => track.stop());
      peerRef.current?.destroy();
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const toggleMic = () => {
    if (myStream) {
      myStream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      myStream.getVideoTracks()[0].enabled = !videoOn;
      setVideoOn(!videoOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        
        // Replace track for all active calls
        Object.values(callsRef.current).forEach(call => {
          const sender = call.peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });

        if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;
        
        videoTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (myStream && myVideoRef.current) {
      const videoTrack = myStream.getVideoTracks()[0];
      
      Object.values(callsRef.current).forEach(call => {
        const sender = call.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });

      myVideoRef.current.srcObject = myStream;
    }
    setIsScreenSharing(false);
  };

  return (
    <div className="flex flex-col h-full bg-surface-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
      <div className="flex-1 p-3 lg:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 auto-rows-fr overflow-y-auto custom-scrollbar">
        {/* My Video / Screen */}
        <div className={cn(
          "relative bg-surface-800 rounded-2xl overflow-hidden border transition-all duration-500 aspect-video group",
          isScreenSharing ? "sm:col-span-2 border-brand-primary ring-4 ring-brand-primary/10 shadow-2xl" : "border-white/5 shadow-lg"
        )}>
          {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-surface-950">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <video
              ref={myVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain bg-surface-950"
            />
          )}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-brand-primary text-white p-1.5 rounded-lg shadow-lg">
               {isScreenSharing ? <Monitor className="w-3 h-3" /> : <User className="w-3 h-3" />}
            </div>
          </div>
          <div className="absolute bottom-3 left-3 bg-surface-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[10px] font-bold tracking-tight">
            {isScreenSharing ? "VOTRE ÉCRAN" : "VOUS"}
          </div>
        </div>

        {/* Remote Videos */}
        {Object.entries(peers).map(([peerId, stream]) => (
          <div key={peerId} className="relative bg-surface-800 rounded-2xl overflow-hidden border border-white/5 shadow-lg aspect-video">
            <VideoPlayer stream={stream} />
            <div className="absolute bottom-3 left-3 bg-surface-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[10px] font-bold tracking-tight uppercase">
              Partenaire {peerId.slice(0, 4)}
            </div>
          </div>
        ))}

        {Object.keys(peers).length === 0 && (
          <div className="bg-surface-800/30 rounded-2xl flex flex-col items-center justify-center border border-white/5 border-dashed aspect-video sm:col-span-2">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">En attente de collègues</p>
          </div>
        )}
      </div>

      <div className="h-20 lg:h-24 bg-surface-900/50 backdrop-blur-xl border-t border-white/5 flex items-center justify-center space-x-4 lg:space-x-8 px-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMic}
            className={cn(
              "p-3.5 lg:p-4 rounded-2xl transition-all duration-200 active:scale-90 shadow-lg",
              micOn ? "bg-white/5 text-white hover:bg-white/10" : "bg-red-500 text-white shadow-red-500/20"
            )}
            title={micOn ? "Muet" : "Activer micro"}
          >
            {micOn ? <Mic className="w-5 h-5 lg:w-6 h-6" /> : <MicOff className="w-5 h-5 lg:w-6 h-6" />}
          </button>
          <button
            onClick={toggleVideo}
            className={cn(
              "p-3.5 lg:p-4 rounded-2xl transition-all duration-200 active:scale-90 shadow-lg",
              videoOn ? "bg-white/5 text-white hover:bg-white/10" : "bg-red-500 text-white shadow-red-500/20"
            )}
            title={videoOn ? "Couper caméra" : "Activer caméra"}
          >
            {videoOn ? <Video className="w-5 h-5 lg:w-6 h-6" /> : <VideoOff className="w-5 h-5 lg:w-6 h-6" />}
          </button>
        </div>

        <div className="w-px h-10 bg-white/10 mx-2" />

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleScreenShare}
            className={cn(
              "p-3.5 lg:p-4 rounded-2xl transition-all duration-200 active:scale-90 shadow-lg",
              isScreenSharing ? "bg-brand-primary text-white shadow-brand-primary/20" : "bg-white/5 text-white hover:bg-white/10"
            )}
            title={isScreenSharing ? "Arrêter partage" : "Partager écran"}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5 lg:w-6 h-6" /> : <Monitor className="w-5 h-5 lg:w-6 h-6" />}
          </button>
          <button 
            className="p-3.5 lg:p-4 rounded-2xl bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-200 active:scale-90 shadow-lg"
            title="Quitter"
          >
            <PhoneOff className="w-5 h-5 lg:w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add cn helper if not present or import it
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

function VideoPlayer({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />;
}
