import React, { useState } from "react";
import TutorPostDetail from "../components/tutorPost/TutorPostDetail";
import ContactRequestForm from "../components/student/ContactRequestForm";
import { useAuthStore } from "../store/auth.store";
import { useTutorPostStore } from "../store/tutorPost.store";
import { motion, AnimatePresence } from "framer-motion";

const TutorPostDetailPage: React.FC = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { currentPost } = useTutorPostStore();

  const handleContactSuccess = () => {
    setShowContactForm(false);
    // Show success message or redirect
  };

  // Check if current user can send contact request
  const canSendRequest = Boolean(
    isAuthenticated &&
      user?.role === "STUDENT" &&
      currentPost &&
      user?.id !== currentPost.tutorId?._id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TutorPostDetail
        onContactClick={() => setShowContactForm(true)}
        canSendRequest={canSendRequest}
      />

      {/* Contact Request Modal */}
      <AnimatePresence>
        {/* ✅ FIX 2: Thêm điều kiện `currentPost.id` để xử lý lỗi mới */}
        {showContactForm && currentPost && (currentPost._id || currentPost.id) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <ContactRequestForm
                tutorPost={currentPost}
                onSuccess={handleContactSuccess}
                onCancel={() => setShowContactForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorPostDetailPage;