import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import useCertificateStore from "../../store/certificate.store";
import type { CreateCertificateFormData } from "../../services/certificate.service";
import VerificationStatus from "./VerificationStatus";
import ImageUploader from "./ImageUploader";

const CertificatesSection: React.FC = () => {
  const {
    certificates,
    isSubmitting,
    createCertificate,
    updateCertificate,
    deleteCertificate,
  } = useCertificateStore();

  const [editingCertificate, setEditingCertificate] = useState<string | null>(
    null
  );
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [certificateForm, setCertificateForm] =
    useState<CreateCertificateFormData>({
      name: "",
      description: "",
      issued_by: "",
    });

  const handleCertificateAdd = async () => {
    if (
      certificateForm.name &&
      certificateForm.description &&
      certificateForm.issued_by
    ) {
      try {
        await createCertificate(certificateForm);
        setCertificateForm({
          name: "",
          description: "",
          issued_by: "",
        });
        setShowCertificateForm(false);
      } catch (error) {
        console.error("Error creating certificate:", error);
      }
    }
  };

  const handleCertificateEdit = (id: string) => {
    const certificate = certificates.find((c) => c._id === id);
    if (certificate) {
      setCertificateForm({
        name: certificate.name,
        description: certificate.description,
        issued_by: certificate.issued_by,
        issue_date: certificate.issue_date,
        expiry_date: certificate.expiry_date,
      });
      setEditingCertificate(id);
      setShowCertificateForm(true);
    }
  };

  const handleCertificateUpdate = async () => {
    if (
      editingCertificate &&
      certificateForm.name &&
      certificateForm.description &&
      certificateForm.issued_by
    ) {
      try {
        await updateCertificate(editingCertificate, certificateForm);
        setCertificateForm({
          name: "",
          description: "",
          issued_by: "",
        });
        setEditingCertificate(null);
        setShowCertificateForm(false);
      } catch (error) {
        console.error("Error updating certificate:", error);
      }
    }
  };

  const handleCertificateDelete = async (id: string) => {
    try {
      await deleteCertificate(id);
    } catch (error) {
      console.error("Error deleting certificate:", error);
    }
  };

  const handleImageUpload = (file: File) => {
    setCertificateForm((prev) => ({ ...prev, certificate_image: file }));
  };

  const resetForm = () => {
    setCertificateForm({
      name: "",
      description: "",
      issued_by: "",
    });
    setEditingCertificate(null);
    setShowCertificateForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Chứng chỉ ({certificates.length})
            </h2>
          </div>
          <button
            onClick={() => setShowCertificateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Thêm chứng chỉ</span>
          </button>
        </div>
      </div>

      {/* Certificate List */}
      <div className="space-y-4 mb-6">
        {certificates.map((certificate) => (
          <div key={certificate._id} className="bg-accent/10 rounded-lg p-4">
            {/* Verification Status */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Trạng thái xác thực:
                </span>
                <VerificationStatus isVerified={certificate.is_verified} />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Information Section */}
              <div className="flex-1">
                {/* Certificate Details */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Tên chứng chỉ:
                      </span>
                      <h3 className="text-lg font-semibold text-primary mt-1">
                        {certificate.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleCertificateEdit(certificate._id)}
                      className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCertificateDelete(certificate._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Mô tả:
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {certificate.description}
                  </p>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Được cấp bởi:
                  </span>
                  <p className="text-base mt-1">{certificate.issued_by}</p>
                </div>
              </div>

              {/* Image Section */}
              {certificate.certificate_image_url && (
                <div className="flex-shrink-0 lg:w-80">
                  <img
                    src={certificate.certificate_image_url}
                    alt={certificate.name}
                    className="w-full h-48 lg:h-64 object-cover rounded-lg border-2 border-accent/30"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Form */}
      {(showCertificateForm || editingCertificate) && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {editingCertificate ? "Chỉnh sửa chứng chỉ" : "Thêm chứng chỉ mới"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên chứng chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={certificateForm.name || ""}
              onChange={(e) =>
                setCertificateForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="VD: TOEIC 800, Google Cloud Certified..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={certificateForm.description || ""}
              onChange={(e) =>
                setCertificateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Mô tả nội dung, phạm vi và ý nghĩa của chứng chỉ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tổ chức cấp chứng chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={certificateForm.issued_by || ""}
              onChange={(e) =>
                setCertificateForm((prev) => ({
                  ...prev,
                  issued_by: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="VD: ETS, Google, Microsoft, Đại học ABC..."
            />
          </div>

          {/* Image Upload */}
          <ImageUploader
            label="Ảnh chứng chỉ"
            currentImage={certificateForm.certificate_image}
            onImageUpload={handleImageUpload}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={
                editingCertificate
                  ? handleCertificateUpdate
                  : handleCertificateAdd
              }
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                  {editingCertificate ? "Đang cập nhật..." : "Đang thêm..."}
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 inline mr-2" />
                  {editingCertificate ? "Cập nhật" : "Thêm"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CertificatesSection;
