import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import JitsiMeetingRoom from '../../components/meeting/JitsiMeetingRoom';
import { classService } from '../../services/class.service';
import { toast } from 'react-hot-toast';

/**
 * Tutor Online Meeting Page
 * Embeds Jitsi meeting with auto tracking
 */
const TutorOnlineMeetingPage: React.FC = () => {
  const { classId, sessionNumber } = useParams<{
    classId: string;
    sessionNumber: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState<{
    meetingLink: string;
    displayName: string;
  } | null>(null);

  useEffect(() => {
    fetchMeetingInfo();
  }, [classId, sessionNumber]);

  const fetchMeetingInfo = async () => {
    try {
      if (!classId || !sessionNumber) {
        toast.error('Thông tin lớp học không hợp lệ');
        return;
      }

      // Check if can join
      const canJoinResponse = await classService.canJoinSession(
        classId,
        parseInt(sessionNumber)
      );

      if (!canJoinResponse.canJoin) {
        toast.error(canJoinResponse.reason || 'Không thể tham gia lớp học');
        window.history.back();
        return;
      }

      // Get class details for display name
      const classResponse = await classService.getClassById(classId);
      const tutorName = classResponse.data?.tutorId?.full_name || 'Gia sư';

      setMeetingInfo({
        meetingLink: canJoinResponse.meetingLink || '',
        displayName: `${tutorName} (Gia sư)`,
      });

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching meeting info:', error);
      toast.error(error.response?.data?.message || 'Không thể tải thông tin lớp học');
      setLoading(false);
    }
  };

  const handleCloseMeeting = () => {
    // Navigate back to schedule/class detail
    window.location.href = `/tutor/schedule`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Đang tải phòng học...</p>
        </div>
      </div>
    );
  }

  if (!meetingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Không thể tải thông tin phòng học</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <JitsiMeetingRoom
      classId={classId!}
      sessionNumber={parseInt(sessionNumber!)}
      meetingLink={meetingInfo.meetingLink}
      displayName={meetingInfo.displayName}
      userRole="TUTOR"
      onClose={handleCloseMeeting}
    />
  );
};

export default TutorOnlineMeetingPage;
