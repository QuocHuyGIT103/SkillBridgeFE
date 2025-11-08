import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TutorProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we're at the base profile page, redirect to personal profile
    if (location.pathname === "/tutor/profile") {
      navigate("/tutor/profile/personal", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-secondary">Đang chuyển hướng...</p>
      </div>
    </div>
  );
};

export default TutorProfilePage;
