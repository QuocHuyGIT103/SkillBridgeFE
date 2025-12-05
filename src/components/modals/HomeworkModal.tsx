import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  PaperClipIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  UserCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { attendanceService } from "../../services/attendance.service";
import { uploadService, aiService } from "../../services";
import toast from "react-hot-toast";
import type { WeeklySession, AIEvaluationResult } from "../../types/attendance";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ExerciseLibraryService from "../../services/exerciseLibrary.service";
import type {
  ExerciseTemplate,
  Rubric,
} from "../../services/exerciseLibrary.service";
import { useNavigate } from "react-router-dom";

interface HomeworkModalProps {
  session: WeeklySession;
  userRole: "TUTOR" | "STUDENT";
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = "view" | "assign" | "submit" | "grade";

const HomeworkModal: React.FC<HomeworkModalProps> = ({
  session,
  userRole,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const assignments = session.homework.assignments || [];

  // Allow submission for:
  // 1. Assignments without submission (pending)
  // 2. Assignments with submission but not graded yet (can resubmit)
  // 3. Assignments graded with score < 5 (failed, can retry)
  const canSubmitAssignments = assignments.filter((assignment) => {
    if (!assignment.submission) return true; // Never submitted
    if (!assignment.grade) return true; // Submitted but not graded - allow resubmit
    if (assignment.grade.score < 5) return true; // Failed - allow retry
    return false; // Passed - no need to resubmit
  });

  // For backward compatibility
  const pendingSubmissionAssignments = canSubmitAssignments;

  const pendingGradeAssignments = assignments.filter(
    (assignment) => assignment.submission && !assignment.grade
  );

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (userRole === "TUTOR") {
      if (!session.homework.hasAssignment) return "assign";
      if (pendingGradeAssignments.length > 0) return "grade";
      return "view";
    }
    if (
      session.homework.hasAssignment &&
      pendingSubmissionAssignments.length > 0
    )
      return "submit";
    return "view";
  });

  const [loading, setLoading] = useState(false);
  const [selectedSubmitAssignmentId, setSelectedSubmitAssignmentId] = useState(
    pendingSubmissionAssignments[0]?.id || assignments[0]?.id || ""
  );
  const [selectedGradeAssignmentId, setSelectedGradeAssignmentId] = useState(
    pendingGradeAssignments[0]?.id ||
      assignments.find((assignment) => assignment.submission)?.id ||
      assignments[0]?.id ||
      ""
  );

  // Assignment Form State
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    deadline: "",
    fileUrl: "",
    templateId: "" as string | undefined,
    rubricId: "" as string | undefined,
  });
  const [availableTemplates, setAvailableTemplates] = useState<
    ExerciseTemplate[]
  >([]);
  const [availableRubrics, setAvailableRubrics] = useState<Rubric[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // Submission Form State
  const [submissionData, setSubmissionData] = useState({
    fileUrl: "",
    notes: "",
    textAnswer: "",
    audioUrl: "",
  });

  // Grading Form State
  const [gradeData, setGradeData] = useState({
    score: 0,
    feedback: "",
  });

  const [uploadingFile, setUploadingFile] = useState(false);
  const [aiEvaluatingAssignmentId, setAiEvaluatingAssignmentId] = useState<
    string | null
  >(null);
  const [transcribingAudio, setTranscribingAudio] = useState(false);

  const selectedGradeAssignment = assignments.find(
    (assignment) => assignment.id === selectedGradeAssignmentId
  );

  const calculateAiScoreOn10 = (evaluation?: AIEvaluationResult | null) => {
    if (!evaluation || !evaluation.maxScore) return null;
    const normalized = (evaluation.totalScore / evaluation.maxScore) * 10;
    return Math.round(normalized * 10) / 10;
  };

  const handleApplyAiScore = () => {
    if (!selectedGradeAssignment?.aiEvaluation) return;
    const normalized = calculateAiScoreOn10(
      selectedGradeAssignment.aiEvaluation
    );
    if (normalized == null) return;
    setGradeData((prev) => ({ ...prev, score: normalized }));
    toast.success("Đã áp dụng điểm AI vào form chấm");
  };

  const loadExerciseLibrary = async () => {
    try {
      setLoadingLibrary(true);
      const [templatesRes, rubricsRes] = await Promise.all([
        ExerciseLibraryService.listTemplates({ mineOnly: true }),
        ExerciseLibraryService.listRubrics(),
      ]);

      // axiosClient đã unwrap nên data chính là mảng dữ liệu
      const templates = templatesRes.data || [];
      const rubrics = rubricsRes.data || [];

      setAvailableTemplates(templates);
      setAvailableRubrics(rubrics);

      return { templates, rubrics };
    } catch (error) {
      console.error("Failed to load exercise library", error);
      return { templates: [], rubrics: [] };
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleOpenTemplatePicker = async () => {
    if (!availableTemplates.length || !availableRubrics.length) {
      setShowTemplatePicker(true);
      const result = await loadExerciseLibrary();
      if (!result.templates.length) {
        setShowTemplatePicker(false);
        toast.error("Kho bài tập của bạn đang rỗng. Hãy thêm bài tập mới!");
        navigate("/tutor/exercise-bank");
      }
      return;
    }

    setShowTemplatePicker(true);
  };

  const handleSelectTemplate = (template: ExerciseTemplate) => {
    setAssignmentData((prev) => ({
      ...prev,
      title: template.title,
      description: template.content?.prompt || template.description || "",
      templateId: template.id,
      rubricId: template.rubricId || prev.rubricId,
      // Copy file attachment from template if available
      fileUrl:
        template.content?.attachmentUrl ||
        template.content?.resources?.[0] ||
        prev.fileUrl,
    }));
    setShowTemplatePicker(false);
  };

  const transcribeAudioToText = async (audioUrl: string) => {
    if (!audioUrl) return;
    setTranscribingAudio(true);
    try {
      const response = await aiService.transcribeAudio(audioUrl);
      const transcript =
        response.data?.transcript || response.data?.data?.transcript || "";
      if (transcript) {
        setSubmissionData((prev) => ({ ...prev, textAnswer: transcript }));
        toast.success(
          "Đã chuyển audio thành văn bản, vui lòng kiểm tra lại trước khi nộp."
        );
      } else {
        toast.error("Không thể nhận dạng được nội dung audio.");
      }
    } catch (error: any) {
      console.error("Transcribe audio failed:", error);
      const msg = error.response?.data?.message || error.message;
      if (
        typeof msg === "string" &&
        msg.includes("Định dạng audio không được hỗ trợ")
      ) {
        toast.error(
          "Định dạng audio không được hỗ trợ. Vui lòng chọn file mp3, m4a, wav, ogg, webm..."
        );
      } else {
        toast.error(msg || "Không thể chuyển audio thành văn bản");
      }
    } finally {
      setTranscribingAudio(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "assignment" | "submissionFile" | "submissionAudio"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Nếu là audio thì kiểm tra định dạng trước khi upload
    if (target === "submissionAudio") {
      const allowedExt = [
        "flac",
        "m4a",
        "mp3",
        "mp4",
        "mpeg",
        "mpga",
        "oga",
        "ogg",
        "wav",
        "webm",
      ];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExt.includes(ext)) {
        toast.error(
          "Định dạng audio không được hỗ trợ. Vui lòng chọn file mp3, m4a, wav, ogg, webm..."
        );
        return;
      }
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn! Giới hạn 10MB");
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadService.uploadFile(formData);
      const fileUrl = response.data.url;

      if (target === "assignment") {
        setAssignmentData((prev) => ({ ...prev, fileUrl }));
      } else if (target === "submissionFile") {
        setSubmissionData((prev) => ({ ...prev, fileUrl }));
      } else if (target === "submissionAudio") {
        setSubmissionData((prev) => ({
          ...prev,
          audioUrl: fileUrl,
          fileUrl: prev.fileUrl || fileUrl,
        }));
        await transcribeAudioToText(fileUrl);
      }

      toast.success("Tải file lên thành công!");
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error("Tải file lên thất bại");
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle Assign Homework
  const handleAssignHomework = async () => {
    if (!assignmentData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài tập");
      return;
    }
    if (!assignmentData.description.trim()) {
      toast.error("Vui lòng nhập mô tả bài tập");
      return;
    }
    if (!assignmentData.deadline) {
      toast.error("Vui lòng chọn hạn nộp");
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceService.assignHomework(
        session.classId,
        session.sessionNumber,
        {
          title: assignmentData.title,
          description: assignmentData.description,
          deadline: assignmentData.deadline,
          fileUrl: assignmentData.fileUrl || undefined,
          templateId: assignmentData.templateId || undefined,
          rubricId: assignmentData.rubricId || undefined,
        }
      );

      toast.success(response.message || "Giao bài tập thành công!");

      // Refresh parent data to get updated session info
      await onSuccess();

      // Reset form state (for lần mở tiếp theo)
      setAssignmentData({
        title: "",
        description: "",
        deadline: "",
        fileUrl: "",
        templateId: undefined,
        rubricId: undefined,
      });

      // Đảm bảo lần mở tiếp theo sẽ vào tab xem bài tập
      setActiveTab("view");

      // Đóng modal và quay lại trang lịch/bài tập
      onClose();
    } catch (error: any) {
      console.error("Assign homework failed:", error);
      toast.error(error.response?.data?.message || "Giao bài tập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateWithAI = async (assignmentId: string) => {
    setAiEvaluatingAssignmentId(assignmentId);
    try {
      const response = await attendanceService.evaluateHomeworkAI(
        session.classId,
        session.sessionNumber,
        assignmentId
      );
      toast.success(response.message || "Đã chấm AI cho bài viết!");
      await onSuccess();
    } catch (error: any) {
      console.error("AI evaluation failed:", error);
      toast.error(error.response?.data?.message || "Không thể chấm điểm AI");
    } finally {
      setAiEvaluatingAssignmentId(null);
    }
  };

  // Handle Submit Homework
  const handleSubmitHomework = async () => {
    if (!selectedSubmitAssignmentId) {
      toast.error("Vui lòng chọn bài tập cần nộp");
      return;
    }
    if (!submissionData.fileUrl) {
      toast.error("Vui lòng tải lên file bài làm");
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceService.submitHomework(
        session.classId,
        session.sessionNumber,
        {
          assignmentId: selectedSubmitAssignmentId,
          fileUrl: submissionData.fileUrl,
          notes: submissionData.notes || undefined,
          textAnswer: submissionData.textAnswer || undefined,
          audioUrl: submissionData.audioUrl || undefined,
        }
      );

      toast.success(response.message || "Nộp bài tập thành công!");

      // Refresh parent data to get updated submission info
      await onSuccess();

      // Reset form state (cho lần mở tiếp theo)
      setSubmissionData({
        fileUrl: "",
        notes: "",
        textAnswer: "",
        audioUrl: "",
      });

      // Đảm bảo lần mở tiếp theo sẽ vào tab xem bài tập
      setActiveTab("view");

      // Đóng modal và quay lại trang lịch/bài tập
      onClose();
    } catch (error: any) {
      console.error("Submit homework failed:", error);
      toast.error(error.response?.data?.message || "Nộp bài tập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Handle Grade Homework
  const handleGradeHomework = async () => {
    if (!selectedGradeAssignmentId) {
      toast.error("Vui lòng chọn bài tập cần chấm");
      return;
    }
    if (gradeData.score < 0 || gradeData.score > 10) {
      toast.error("Điểm số phải từ 0 đến 10");
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceService.gradeHomework(
        session.classId,
        session.sessionNumber,
        {
          assignmentId: selectedGradeAssignmentId,
          score: gradeData.score,
          feedback: gradeData.feedback || undefined,
        }
      );

      toast.success(response.message || "Chấm điểm thành công!");

      // Refresh parent data to get updated grade info
      await onSuccess();

      // Reset form state (cho lần mở tiếp theo)
      setGradeData({
        score: 0,
        feedback: "",
      });

      // Đảm bảo lần mở tiếp theo sẽ vào tab xem bài tập
      setActiveTab("view");

      // Đóng modal và quay lại trang lịch/bài tập
      onClose();
    } catch (error: any) {
      console.error("Grade homework failed:", error);
      toast.error(error.response?.data?.message || "Chấm điểm thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Determine available tabs
  const getTabs = (): { id: TabType; label: string; icon: any }[] => {
    if (userRole === "TUTOR") {
      return [
        { id: "view", label: "Xem chi tiết", icon: DocumentTextIcon },
        { id: "assign", label: "Giao bài tập", icon: CloudArrowUpIcon },
        ...(pendingGradeAssignments.length > 0
          ? [{ id: "grade" as TabType, label: "Chấm điểm", icon: StarIcon }]
          : []),
      ];
    } else {
      return [
        { id: "view", label: "Xem bài tập", icon: DocumentTextIcon },
        ...(session.homework.hasAssignment &&
        pendingSubmissionAssignments.length > 0
          ? [
              {
                id: "submit" as TabType,
                label: "Nộp bài",
                icon: CloudArrowUpIcon,
              },
            ]
          : []),
      ];
    }
  };

  const tabs = getTabs();
  const hasSubmitTab = tabs.some((tab) => tab.id === "submit");
  const canGradeAssignments = tabs.some((tab) => tab.id === "grade");

  const handleOpenSubmitTab = (assignmentId?: string) => {
    if (!assignmentId || !hasSubmitTab) return;
    setSelectedSubmitAssignmentId(assignmentId);
    setActiveTab("submit");
  };

  const handleOpenGradeTab = (assignmentId?: string) => {
    if (!assignmentId || !canGradeAssignments) return;
    setSelectedGradeAssignmentId(assignmentId);
    setActiveTab("grade");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Quản lý bài tập</h2>
              <p className="text-sm text-purple-100 mt-1">
                {session.className} • Buổi {session.sessionNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Session Info */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>
                {format(new Date(session.scheduledDate), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>{session.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-white text-purple-600 border-t-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* View Tab */}
            {activeTab === "view" && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {!session.homework.hasAssignment ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Chưa có bài tập nào được giao
                    </p>
                    {userRole === "TUTOR" && (
                      <button
                        onClick={() => setActiveTab("assign")}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Giao bài tập ngay
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment, index) => {
                      const deadlineLabel = assignment.deadline
                        ? format(
                            new Date(assignment.deadline),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )
                        : "N/A";
                      const aiEvaluation = assignment.aiEvaluation;
                      const aiPercent =
                        aiEvaluation && aiEvaluation.maxScore
                          ? Math.round(
                              (aiEvaluation.totalScore /
                                aiEvaluation.maxScore) *
                                100
                            )
                          : null;
                      const aiScoreOn10 = calculateAiScoreOn10(aiEvaluation);
                      return (
                        <div
                          key={assignment.id || `assignment-${index}`}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Bài tập #{index + 1}
                              </p>
                              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                                {assignment.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {assignment.isLegacy && (
                                <span className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full bg-gray-100 text-gray-600">
                                  Legacy
                                </span>
                              )}
                              <span
                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  assignment.status === "graded"
                                    ? "bg-blue-100 text-blue-700"
                                    : assignment.status === "submitted"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {assignment.status === "graded"
                                  ? "Đã chấm"
                                  : assignment.status === "submitted"
                                  ? "Học viên đã nộp"
                                  : "Chưa nộp"}
                              </span>
                              {assignment.isLate && (
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                  ⏰ Nộp trễ
                                </span>
                              )}
                            </div>
                          </div>

                          {assignment.description && (
                            <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                              {assignment.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-4">
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              <span>Hạn nộp: {deadlineLabel}</span>
                            </div>
                            {assignment.fileUrl && (
                              <a
                                href={assignment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-purple-600 hover:text-purple-700"
                              >
                                <PaperClipIcon className="w-4 h-4 mr-1" />
                                Tài liệu đính kèm
                              </a>
                            )}
                          </div>

                          {/* AI Grading Button - for TUTOR */}
                          {userRole === "TUTOR" && assignment.submission && (
                            <div className="mt-4">
                              {assignment.rubricId &&
                              assignment.submission?.textAnswer ? (
                                // Has rubric + textAnswer => can use AI
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() =>
                                      handleEvaluateWithAI(assignment.id)
                                    }
                                    disabled={
                                      aiEvaluatingAssignmentId === assignment.id
                                    }
                                    className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {aiEvaluatingAssignmentId ===
                                    assignment.id ? (
                                      <>
                                        <span className="mr-2 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Đang chấm AI...
                                      </>
                                    ) : (
                                      <>
                                        <SparklesIcon className="w-4 h-4 mr-1" />
                                        {aiEvaluation
                                          ? "Chấm lại bằng AI"
                                          : "Chấm bằng AI (beta)"}
                                      </>
                                    )}
                                  </button>
                                  {!aiEvaluation && (
                                    <span className="text-xs text-gray-500">
                                      AI dựa trên rubric để đề xuất điểm tham
                                      khảo.
                                    </span>
                                  )}
                                </div>
                              ) : (
                                // Missing rubric or textAnswer => show why AI is not available
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">
                                      💡 Không thể chấm AI vì:
                                    </span>
                                    {!assignment.rubricId && (
                                      <span className="block mt-1">
                                        • Bài tập chưa được gán rubric tiêu chí
                                        chấm điểm
                                      </span>
                                    )}
                                    {assignment.rubricId &&
                                      !assignment.submission?.textAnswer && (
                                        <span className="block mt-1">
                                          • Học viên chưa nhập nội dung text
                                          (chỉ upload file)
                                        </span>
                                      )}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {aiEvaluation && (
                            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4" />
                                    AI đánh giá theo rubric
                                  </p>
                                  <p className="text-xs text-purple-600">
                                    Tổng: {aiEvaluation.totalScore}/
                                    {aiEvaluation.maxScore} điểm
                                    {aiPercent !== null
                                      ? ` (${aiPercent}%)`
                                      : ""}
                                  </p>
                                </div>
                                {aiScoreOn10 !== null && (
                                  <div className="text-right">
                                    <p className="text-[11px] uppercase tracking-wide text-purple-500">
                                      Quy đổi tham khảo
                                    </p>
                                    <p className="text-2xl font-bold text-purple-700">
                                      {aiScoreOn10}/10
                                    </p>
                                  </div>
                                )}
                              </div>

                              {aiEvaluation.criteria?.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {aiEvaluation.criteria.map(
                                    (criterion, idx) => {
                                      const percent =
                                        criterion.maxScore > 0
                                          ? Math.round(
                                              (criterion.score /
                                                criterion.maxScore) *
                                                100
                                            )
                                          : 0;
                                      return (
                                        <div
                                          key={`${criterion.label}-${idx}`}
                                          className="bg-white rounded-md p-3 shadow-sm"
                                        >
                                          <div className="flex justify-between text-sm font-medium text-gray-800">
                                            <span>{criterion.label}</span>
                                            <span>
                                              {criterion.score}/
                                              {criterion.maxScore} điểm
                                            </span>
                                          </div>
                                          <div className="mt-2 h-2 bg-purple-100 rounded-full overflow-hidden">
                                            <div
                                              className="h-2 bg-purple-500"
                                              style={{
                                                width: `${Math.min(
                                                  100,
                                                  Math.max(0, percent)
                                                )}%`,
                                              }}
                                            />
                                          </div>
                                          {criterion.feedback && (
                                            <p className="mt-2 text-xs text-gray-600">
                                              {criterion.feedback}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}

                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {aiEvaluation.strengths &&
                                  aiEvaluation.strengths.length > 0 && (
                                    <div>
                                      <p className="font-semibold text-green-700 mb-2">
                                        Điểm mạnh
                                      </p>
                                      <ul className="space-y-1 text-green-900 text-sm list-disc list-inside">
                                        {aiEvaluation.strengths
                                          .slice(0, 3)
                                          .map((item, idx) => (
                                            <li key={`strength-${idx}`}>
                                              {item}
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  )}
                                {aiEvaluation.improvements &&
                                  aiEvaluation.improvements.length > 0 && (
                                    <div>
                                      <p className="font-semibold text-orange-700 mb-2">
                                        Đề xuất cải thiện
                                      </p>
                                      <ul className="space-y-1 text-orange-900 text-sm list-disc list-inside">
                                        {aiEvaluation.improvements
                                          .slice(0, 3)
                                          .map((item, idx) => (
                                            <li key={`improve-${idx}`}>
                                              {item}
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  )}
                              </div>

                              {aiEvaluation.summary && (
                                <p className="mt-4 text-sm text-gray-700">
                                  <span className="font-semibold text-gray-800">
                                    Tổng kết:
                                  </span>{" "}
                                  {aiEvaluation.summary}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            {userRole === "STUDENT" &&
                              (assignment.submission ? (
                                <>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    ✓ Bạn đã nộp bài này
                                  </span>
                                  <a
                                    href={assignment.submission.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-2 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                                  >
                                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                                    Xem bài nộp
                                  </a>
                                </>
                              ) : canSubmitAssignments ? (
                                <button
                                  onClick={() =>
                                    handleOpenSubmitTab(assignment.id)
                                  }
                                  className="inline-flex items-center px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
                                >
                                  <CloudArrowUpIcon className="w-4 h-4 mr-1" />
                                  Nộp bài này
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-100">
                                  Chưa nộp
                                </span>
                              ))}

                            {userRole === "TUTOR" &&
                              (assignment.submission ? (
                                <>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                    Học viên đã nộp
                                  </span>
                                  <a
                                    href={assignment.submission.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-2 rounded-lg border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors"
                                  >
                                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                                    Xem bài nộp
                                  </a>
                                  {!assignment.grade && canGradeAssignments && (
                                    <button
                                      onClick={() =>
                                        handleOpenGradeTab(assignment.id)
                                      }
                                      className="inline-flex items-center px-3 py-2 rounded-lg border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                                    >
                                      <StarIcon className="w-4 h-4 mr-1" />
                                      Chấm bài này
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                  Học viên chưa nộp
                                </span>
                              ))}
                          </div>

                          <div className="mt-4 space-y-3">
                            {assignment.submission ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                                <div className="flex items-center text-green-700 font-medium">
                                  <UserCircleIcon className="w-5 h-5 mr-2" />
                                  Bài nộp của học viên
                                </div>
                                <div className="mt-2 space-y-2">
                                  <a
                                    href={assignment.submission.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-green-600 hover:text-green-700"
                                  >
                                    <PaperClipIcon className="w-4 h-4 mr-1" />
                                    Xem bài làm
                                  </a>
                                  {assignment.submission.notes && (
                                    <div>
                                      <span className="font-medium text-gray-700">
                                        Ghi chú:
                                      </span>
                                      <p className="text-gray-900 mt-1">
                                        {assignment.submission.notes}
                                      </p>
                                    </div>
                                  )}
                                  {assignment.submission.textAnswer && (
                                    <div>
                                      <span className="font-medium text-gray-700">
                                        Bài viết:
                                      </span>
                                      <p className="mt-1 text-gray-700 whitespace-pre-line bg-white border border-green-100 rounded-md p-3">
                                        {assignment.submission.textAnswer}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center text-gray-600">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    <span>
                                      Nộp lúc:{" "}
                                      {assignment.submission.submittedAt
                                        ? format(
                                            new Date(
                                              assignment.submission.submittedAt
                                            ),
                                            "dd/MM/yyyy HH:mm",
                                            { locale: vi }
                                          )
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                                <p>Chưa có bài nộp</p>
                              </div>
                            )}

                            {assignment.grade && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                                <div className="flex items-center text-blue-700 font-medium">
                                  <AcademicCapIcon className="w-5 h-5 mr-2" />
                                  Điểm số
                                </div>
                                <div className="mt-2">
                                  <p className="text-2xl font-bold text-blue-600">
                                    {assignment.grade.score}/10
                                  </p>
                                  {assignment.grade.feedback && (
                                    <p className="text-gray-800 mt-2 whitespace-pre-line">
                                      {assignment.grade.feedback}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Assign Tab (Tutor only) */}
            {activeTab === "assign" && userRole === "TUTOR" && (
              <motion.div
                key="assign"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề bài tập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignmentData.title}
                    onChange={(e) =>
                      setAssignmentData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="VD: Bài tập ôn tập chương 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={assignmentData.description}
                    onChange={(e) =>
                      setAssignmentData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Mô tả yêu cầu, hướng dẫn làm bài..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn nộp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={assignmentData.deadline}
                    onChange={(e) =>
                      setAssignmentData((prev) => ({
                        ...prev,
                        deadline: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tài liệu đính kèm (tùy chọn)
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, "assignment")}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                      <div className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 cursor-pointer transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-purple-600">
                        <CloudArrowUpIcon className="w-5 h-5" />
                        <span>
                          {uploadingFile ? "Đang tải..." : "Chọn file"}
                        </span>
                      </div>
                    </label>
                  </div>
                  {assignmentData.fileUrl && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      <a
                        href={assignmentData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        File đã tải lên
                      </a>
                    </div>
                  )}
                </div>

                {/* Chọn từ kho bài tập & rubric */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kho bài tập & rubric
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      type="button"
                      onClick={handleOpenTemplatePicker}
                      className="inline-flex items-center px-3 py-2 border border-purple-500 text-purple-600 text-sm font-medium rounded-lg hover:bg-purple-50"
                    >
                      <DocumentTextIcon className="w-4 h-4 mr-1" />
                      Chọn từ kho bài tập
                    </button>
                    {assignmentData.templateId && (
                      <span className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Đã chọn template
                      </span>
                    )}
                    {assignmentData.rubricId && (
                      <span className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Đã gắn rubric
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Bạn có thể chọn bài tập mẫu để tự động điền tiêu đề và đề
                    bài, đồng thời gắn sẵn rubric chấm điểm.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAssignHomework}
                    disabled={loading || uploadingFile}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang giao...</span>
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-5 h-5" />
                        <span>Giao bài tập</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Submit Tab (Student only) */}
            {activeTab === "submit" && userRole === "STUDENT" && (
              <motion.div
                key="submit"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Hãy kiểm tra kỹ bài làm trước khi
                    nộp. Nếu bạn đã nộp trước đó, bài nộp mới sẽ thay thế bài
                    cũ.
                  </p>
                </div>

                {/* AI Grading Hint - show when selected assignment has rubric */}
                {(() => {
                  const selectedAssignment = canSubmitAssignments.find(
                    (a) => a.id === selectedSubmitAssignmentId
                  );
                  return selectedAssignment?.rubricId ? (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <SparklesIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-800">
                            Bài tập này có hỗ trợ chấm điểm AI!
                          </p>
                          <p className="text-xs text-purple-700 mt-1">
                            Để AI có thể chấm điểm tự động theo rubric, vui lòng
                            nhập nội dung bài làm vào ô
                            <strong> "Bài viết dạng text"</strong> bên dưới
                            (ngoài việc upload file).
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn bài tập cần nộp <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSubmitAssignmentId}
                    onChange={(e) =>
                      setSelectedSubmitAssignmentId(e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {canSubmitAssignments.map((assignment, index) => {
                      const status = !assignment.submission
                        ? ""
                        : assignment.grade
                        ? ` (Nộp lại - Điểm cũ: ${assignment.grade.score}/10)`
                        : " (Nộp lại - Chờ chấm)";
                      return (
                        <option
                          key={assignment.id || `pending-${index}`}
                          value={assignment.id}
                        >
                          {assignment.title || `Bài tập ${index + 1}`}
                          {status}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File bài làm <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, "submissionFile")}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                      <div className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 cursor-pointer transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-purple-600">
                        <CloudArrowUpIcon className="w-5 h-5" />
                        <span>
                          {uploadingFile ? "Đang tải..." : "Chọn file bài làm"}
                        </span>
                      </div>
                    </label>
                  </div>
                  {submissionData.fileUrl && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      <a
                        href={submissionData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        File đã tải lên
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bài nói (audio){" "}
                    <span className="text-xs text-gray-500">
                      (tùy chọn, cho speaking)
                    </span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileUpload(e, "submissionAudio")}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                      <div className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 cursor-pointer transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-purple-600">
                        <CloudArrowUpIcon className="w-5 h-5" />
                        <span>
                          {uploadingFile ? "Đang tải..." : "Chọn file audio"}
                        </span>
                      </div>
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Hệ thống sẽ dùng dịch vụ Speech-to-Text để chuyển giọng nói
                    thành văn bản (sử dụng cho AI chấm điểm).
                  </p>
                  {transcribingAudio && (
                    <p className="mt-1 text-xs text-purple-600">
                      Đang chuyển đổi audio thành văn bản, vui lòng đợi...
                    </p>
                  )}
                  {submissionData.audioUrl && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      <a
                        href={submissionData.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        File audio đã tải lên
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bài viết dạng text (khuyến khích, để AI chấm chính xác hơn)
                  </label>
                  <textarea
                    value={submissionData.textAnswer}
                    onChange={(e) =>
                      setSubmissionData((prev) => ({
                        ...prev,
                        textAnswer: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập nội dung bài viết tại đây..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    AI sẽ dùng nội dung này cùng với rubric để chấm điểm tự
                    động.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={submissionData.notes}
                    onChange={(e) =>
                      setSubmissionData({
                        ...submissionData,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ghi chú hoặc thắc mắc về bài làm..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitHomework}
                    disabled={
                      loading ||
                      uploadingFile ||
                      transcribingAudio ||
                      !submissionData.fileUrl ||
                      !selectedSubmitAssignmentId
                    }
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang nộp...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Nộp bài</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Grade Tab (Tutor only) */}
            {activeTab === "grade" && userRole === "TUTOR" && (
              <motion.div
                key="grade"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn bài tập cần chấm{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedGradeAssignmentId}
                    onChange={(e) =>
                      setSelectedGradeAssignmentId(e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {pendingGradeAssignments.map((assignment, index) => (
                      <option
                        key={assignment.id || `grade-${index}`}
                        value={assignment.id}
                      >
                        {assignment.title || `Bài tập ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGradeAssignment?.aiEvaluation && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-indigo-700 font-semibold flex items-center gap-2">
                          <SparklesIcon className="w-4 h-4" />
                          Gợi ý từ AI
                        </p>
                        <p className="text-indigo-600 mt-1">
                          {selectedGradeAssignment.aiEvaluation.totalScore}/
                          {selectedGradeAssignment.aiEvaluation.maxScore} điểm
                          theo rubric
                        </p>
                      </div>
                      {calculateAiScoreOn10(
                        selectedGradeAssignment.aiEvaluation
                      ) !== null && (
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wide text-indigo-500">
                            Quy đổi tham khảo
                          </p>
                          <p className="text-2xl font-bold text-indigo-700">
                            {calculateAiScoreOn10(
                              selectedGradeAssignment.aiEvaluation
                            )}
                            /10
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleApplyAiScore}
                        className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        <SparklesIcon className="w-4 h-4 mr-1" />
                        Dùng điểm AI
                      </button>
                      {selectedGradeAssignment.aiEvaluation.summary && (
                        <p className="text-indigo-700 text-sm">
                          {selectedGradeAssignment.aiEvaluation.summary}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm số (0-10) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={gradeData.score}
                    onChange={(e) =>
                      setGradeData({
                        ...gradeData,
                        score: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-2xl font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét (tùy chọn)
                  </label>
                  <textarea
                    value={gradeData.feedback}
                    onChange={(e) =>
                      setGradeData({ ...gradeData, feedback: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhận xét về bài làm của học viên..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleGradeHomework}
                    disabled={loading || !selectedGradeAssignmentId}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <StarIcon className="w-5 h-5" />
                        <span>Lưu điểm</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Template Picker Modal */}
      <AnimatePresence>
        {showTemplatePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
            onClick={() => setShowTemplatePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col m-4"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Chọn bài tập từ kho</h3>
                  <button
                    onClick={() => setShowTemplatePicker(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loadingLibrary ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : availableTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Kho bài tập của bạn đang trống
                    </p>
                    <button
                      onClick={() => {
                        setShowTemplatePicker(false);
                        navigate("/tutor/exercise-bank");
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Thêm bài tập mới
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {availableTemplates.map((template) => {
                      const rubric = availableRubrics.find(
                        (r) => r.id === template.rubricId
                      );
                      return (
                        <div
                          key={template.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {template.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {template.description ||
                                  template.content?.prompt ||
                                  "Không có mô tả"}
                              </p>
                              <div className="flex flex-wrap gap-2 items-center">
                                {template.subjectId && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                    {template.subjectId}
                                  </span>
                                )}
                                {template.difficulty && (
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                                      template.difficulty === "EASY"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : template.difficulty === "MEDIUM"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                                  >
                                    {template.difficulty === "EASY"
                                      ? "Dễ"
                                      : template.difficulty === "MEDIUM"
                                      ? "Trung bình"
                                      : "Khó"}
                                  </span>
                                )}
                                {rubric && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">
                                    <SparklesIcon className="w-3 h-3 mr-1" />
                                    {rubric.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTemplate(template);
                              }}
                              className="ml-4 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Chọn
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Tìm thấy {availableTemplates.length} bài tập trong kho
                  </p>
                  <button
                    onClick={() => setShowTemplatePicker(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HomeworkModal;
