import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import usePostStore from "../../store/post.store";
import { useTutorPostStore } from "../../store/tutorPost.store";
import { useContactRequestStore } from "../../store/contactRequest.store";
import { toast } from "react-hot-toast";
import { useSubjectStore } from "../../store/subject.store";

const CreateTeachRequestPage: React.FC = () => {
  const { id: studentPostId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const { selectedPost, isLoading, getPostById } = usePostStore();
  const { myPosts, getMyTutorPosts, isLoading: loadingMyPosts } = useTutorPostStore();
  const { createTeachRequestFromTutor, isCreating } = useContactRequestStore();
  const { activeSubjects, getActiveSubjects } = useSubjectStore();

  // Get tutorPostId from location state (from AI recommendations)
  const tutorPostIdFromState = location?.state?.tutorPostId || location?.state?.selectedTutorPostId || "";
  const isFromAIRecommendations = location?.state?.fromAIRecommendations || false;
  
  const [tutorPostId, setTutorPostId] = useState<string>(tutorPostIdFromState);
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("Xin chào, tôi tin rằng mình phù hợp để dạy bạn. Hãy cùng trao đổi thêm nhé!");

  useEffect(() => {
    if (studentPostId) getPostById(studentPostId);
    getMyTutorPosts(1, 50);
    if (!activeSubjects || activeSubjects.length === 0) {
      getActiveSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentPostId]);

  // Set tutorPostId from state if available
  useEffect(() => {
    if (tutorPostIdFromState && !tutorPostId) {
      setTutorPostId(tutorPostIdFromState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorPostIdFromState]);

  // Build subject options - if no tutorPostId selected, show all subjects from all posts
  const subjectOptions = useMemo(() => {
    const postSubjectNames: string[] = ((selectedPost?.subjects || []) as any)
      .map((s: any) => (typeof s === "string" ? s : s?.name || ""))
      .filter(Boolean);

    // If tutorPostId is selected, use subjects from that post
    if (tutorPostId) {
      const myPost = myPosts?.find((p) => (p.id || p._id) === tutorPostId);
      const mySubjects = (myPost?.subjects || []).map((s: any) => {
        const id = typeof s === "string" ? s : s?._id || s?.id || "";
        const nameCandidate =
          typeof s === "string"
            ? activeSubjects?.find((as) => as._id === s)?.name
            : s?.name;
        const name = nameCandidate || id;
        return { id, name };
      });

      const filtered =
        postSubjectNames.length > 0
          ? mySubjects.filter((ms) => postSubjectNames.includes(ms.name))
          : mySubjects;

      // Auto-select first subject if available and not already set
      if (!subject && filtered.length > 0) {
        setSubject(filtered[0].id);
      }
      return filtered;
    } else {
      // No tutorPostId selected - show all subjects from all tutor posts
      const allSubjectsMap = new Map<string, { id: string; name: string }>();
      
      myPosts?.forEach((post) => {
        (post.subjects || []).forEach((s: any) => {
          const id = typeof s === "string" ? s : s?._id || s?.id || "";
          const nameCandidate =
            typeof s === "string"
              ? activeSubjects?.find((as) => as._id === s)?.name
              : s?.name;
          const name = nameCandidate || id;
          
          if (id && name && !allSubjectsMap.has(id)) {
            allSubjectsMap.set(id, { id, name });
          }
        });
      });

      // Filter by student post subjects if available
      const allSubjects = Array.from(allSubjectsMap.values());
      const filtered =
        postSubjectNames.length > 0
          ? allSubjects.filter((s) => postSubjectNames.includes(s.name))
          : allSubjects;

      // Auto-select first subject if available and not already set
      if (!subject && filtered.length > 0) {
        setSubject(filtered[0].id);
      }
      return filtered;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPost, tutorPostId, myPosts, activeSubjects]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject) {
      toast.error("Hãy chọn môn học.");
      return;
    }

    // If no tutorPostId selected, find the first post that has this subject
    let finalTutorPostId = tutorPostId;
    if (!finalTutorPostId) {
      const subjectName = activeSubjects?.find((s) => s._id === subject)?.name || "";
      const matchingPost = myPosts?.find((post) => {
        const postSubjects = (post.subjects || []).map((s: any) => {
          if (typeof s === "string") {
            return activeSubjects?.find((as) => as._id === s)?.name || s;
          }
          return s?.name || "";
        });
        return postSubjects.includes(subjectName);
      });

      if (matchingPost) {
        finalTutorPostId = matchingPost.id || matchingPost._id;
      } else {
        toast.error("Không tìm thấy bài đăng có môn học này. Vui lòng chọn bài đăng hoặc tạo bài đăng mới.");
        return;
      }
    }

    const myPost = myPosts?.find((p) => (p.id || p._id) === finalTutorPostId);
    if (!myPost) {
      toast.error("Không tìm thấy bài đăng của bạn.");
      return;
    }

    try {
      await createTeachRequestFromTutor({
        tutorPostId: finalTutorPostId,
        studentPostId: studentPostId!,
        // Send SUBJECT ID as backend expects IDs
        subject,
        message,
        learningMode:
          myPost?.teachingMode === "ONLINE"
            ? "ONLINE"
            : myPost?.teachingMode === "OFFLINE"
              ? "OFFLINE"
              : "FLEXIBLE",
        expectedPrice: myPost?.pricePerSession,
        sessionDuration: myPost?.sessionDuration || 60,
      });
      toast.success("Đã gửi đề nghị dạy");
      navigate("/tutor/contact-requests");
    } catch {
      // handled in store
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gửi đề nghị dạy</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bài đăng của bạn
                  {isFromAIRecommendations && tutorPostId && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">(Đã tự động chọn từ gợi ý AI)</span>
                  )}
                  {!isFromAIRecommendations && (
                    <span className="ml-2 text-xs text-gray-500 font-normal">(Tùy chọn - sẽ tự động chọn bài đăng có môn học đã chọn)</span>
                  )}
                </label>
                <select
                  value={tutorPostId}
                  onChange={(e) => {
                    setTutorPostId(e.target.value);
                    // Reset subject when tutor post changes
                    setSubject("");
                  }}
                  disabled={isFromAIRecommendations && !!tutorPostId}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    isFromAIRecommendations && tutorPostId ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">{loadingMyPosts ? "Đang tải..." : "— Chọn bài đăng (tùy chọn) —"}</option>
                  {myPosts?.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.title || "Bài đăng không tiêu đề"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Môn dạy
                  {isFromAIRecommendations && subject && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">(Đã tự động chọn môn phù hợp)</span>
                  )}
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isFromAIRecommendations && !!subject && subjectOptions.length === 1}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    isFromAIRecommendations && subject && subjectOptions.length === 1 ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">{loadingMyPosts ? "Đang tải..." : "— Chọn môn dạy —"}</option>
                  {subjectOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lời nhắn</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                {isCreating ? "Đang gửi..." : "Gửi đề nghị dạy"}
              </button>
            </form>
          </div>

          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="text-sm font-semibold text-gray-700 mb-2">Tóm tắt bài đăng của học viên</div>
              {isLoading || !selectedPost ? (
                <div className="text-gray-500 text-sm">Đang tải...</div>
              ) : (
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="font-bold text-gray-900">{selectedPost.title}</div>
                  <div className="text-gray-600 line-clamp-5">{selectedPost.content}</div>
                  {selectedPost.hourly_rate && (
                    <div>
                      Học phí mong muốn:{" "}
                      <strong>
                        {selectedPost.hourly_rate.min.toLocaleString("vi-VN")}đ -{" "}
                        {selectedPost.hourly_rate.max.toLocaleString("vi-VN")}đ
                      </strong>
                    </div>
                  )}
                  <div>Môn: {(selectedPost.subjects || []).join(", ")}</div>
                  <div>Lớp: {(selectedPost.grade_levels || []).join(", ")}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeachRequestPage;


