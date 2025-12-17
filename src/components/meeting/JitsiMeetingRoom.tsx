import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classService } from '../../services/class.service';
import { toast } from 'react-hot-toast';

// Jitsi External API Types
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetingRoomProps {
  classId: string;
  sessionNumber: number;
  meetingLink: string;
  displayName: string;
  userRole: 'TUTOR' | 'STUDENT';
  onClose: () => void;
}

/**
 * Jitsi Meeting Room Component with Auto Tracking
 * 
 * Features:
 * - Embed Jitsi meeting using External API
 * - Auto track join/leave events
 * - Send tracking data to backend
 * - Works with Jitsi Public Mode (meet.jit.si)
 */
const JitsiMeetingRoom: React.FC<JitsiMeetingRoomProps> = ({
  classId,
  sessionNumber,
  meetingLink,
  displayName,
  userRole,
  onClose,
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);
  // Use ref to track if user has joined (for cleanup)
  const hasJoinedRef = useRef<boolean>(false);
  const hasLeftRef = useRef<boolean>(false);

  useEffect(() => {
    // Load Jitsi External API script
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initializeJitsi();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initializeJitsi();
      script.onerror = () => {
        toast.error('Không thể tải Jitsi. Vui lòng thử lại.');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    const initializeJitsi = () => {
      if (!jitsiContainerRef.current) return;

      try {
        // Extract room name from meeting link
        const roomName = extractRoomName(meetingLink);

        // Get domain (meet.jit.si or custom)
        const domain = extractDomain(meetingLink);

        // Initialize Jitsi External API
        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName: roomName,
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false, // Skip prejoin page
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'invite',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
              'mute-everyone',
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
          userInfo: {
            displayName: displayName,
            email: '', // Optional
          },
        });

        jitsiApiRef.current = api;

        // Event Listeners
        api.on('videoConferenceJoined', handleVideoConferenceJoined);
        api.on('videoConferenceLeft', handleVideoConferenceLeft);
        api.on('participantJoined', handleParticipantJoined);
        api.on('participantLeft', handleParticipantLeft);
        api.on('recordingStatusChanged', handleRecordingStatusChanged);
        api.on('readyToClose', handleReadyToClose);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Jitsi:', error);
        toast.error('Không thể khởi tạo phòng học. Vui lòng thử lại.');
        setIsLoading(false);
      }
    };

    loadJitsiScript();

    // Cleanup
    return () => {
      if (jitsiApiRef.current) {
        // Track leave before closing if joined but hasn't left yet
        if (hasJoinedRef.current && !hasLeftRef.current) {
          // Call leave API synchronously before dispose
          classService.trackLeaveSession(classId, sessionNumber)
            .catch(err => console.error('Cleanup trackLeave error:', err));
          hasLeftRef.current = true;
        }
        jitsiApiRef.current.dispose();
      }
    };
  }, [classId, sessionNumber]);

  /**
   * Event Handlers
   */
  const handleVideoConferenceJoined = async (event: any) => {
    console.log('Video conference joined:', event);
    const now = new Date();
    setJoinedAt(now);
    hasJoinedRef.current = true;
    hasLeftRef.current = false;

    // Track join in backend
    try {
      await classService.trackJoinSession(classId, sessionNumber);
      toast.success('Đã tham gia phòng học');
    } catch (error) {
      console.error('Error tracking join:', error);
    }
  };

  const handleVideoConferenceLeft = async (event: any) => {
    console.log('Video conference left:', event);
    await trackLeave();
  };

  const handleParticipantJoined = (event: any) => {
    console.log('Participant joined:', event);
    toast.success(`${event.displayName} đã tham gia`);
  };

  const handleParticipantLeft = (event: any) => {
    console.log('Participant left:', event);
  };

  const handleRecordingStatusChanged = (event: any) => {
    console.log('Recording status changed:', event);

    if (event.on) {
      toast.success('Đang ghi hình buổi học');
    } else {
      toast.info('Đã dừng ghi hình');
    }

    // Note: Public Jitsi doesn't provide recording URL
    // Recording is stored locally by Jitsi Recorder
  };

  const handleReadyToClose = () => {
    console.log('Ready to close');
    onClose();
  };

  /**
   * Track leave session
   */
  const trackLeave = async () => {
    // Prevent double tracking
    if (!hasJoinedRef.current || hasLeftRef.current) return;
    hasLeftRef.current = true;

    try {
      await classService.trackLeaveSession(classId, sessionNumber);

      if (joinedAt) {
        const duration = Math.floor((new Date().getTime() - joinedAt.getTime()) / 60000);
        toast.success(`Đã rời phòng học. Thời gian tham gia: ${duration} phút`);
      } else {
        toast.success('Đã rời phòng học');
      }
    } catch (error) {
      console.error('Error tracking leave:', error);
    }
  };

  /**
   * Extract room name from meeting link
   */
  const extractRoomName = (link: string): string => {
    try {
      const url = new URL(link);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      return pathSegments[pathSegments.length - 1];
    } catch {
      return 'default-room';
    }
  };

  /**
   * Extract domain from meeting link
   */
  const extractDomain = (link: string): string => {
    try {
      const url = new URL(link);
      return url.hostname;
    } catch {
      return 'meet.jit.si';
    }
  };

  /**
   * Manual end meeting
   */
  const handleEndMeeting = async () => {
    if (jitsiApiRef.current) {
      await trackLeave();
      jitsiApiRef.current.executeCommand('hangup');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900 bg-opacity-90 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-semibold">
            Phòng học Online - Buổi {sessionNumber}
          </h2>
          <span className="text-gray-400 text-sm">
            {userRole === 'TUTOR' ? 'Gia sư' : 'Học viên'}
          </span>
        </div>

        <button
          onClick={handleEndMeeting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Rời phòng học
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Đang tải phòng học...</p>
          </div>
        </div>
      )}

      {/* Jitsi Container */}
      <div
        ref={jitsiContainerRef}
        className="w-full h-full"
        style={{ marginTop: '56px' }} // Height of header
      />
    </div>
  );
};

export default JitsiMeetingRoom;
