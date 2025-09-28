/**
 * Test utilities for UUID validation
 * This file can be used to test UUID functionality in development
 */

import { validateUUID, validateId } from "./validation";

// Test UUIDs (valid and invalid)
export const testUUIDs = {
  valid: [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
  ],
  invalid: [
    "550e8400-e29b-41d4-a716-44665544000", // Too short
    "550e8400-e29b-41d4-a716-4466554400000", // Too long
    "550e8400-e29b-41d4-a716-44665544000g", // Invalid character
    "550e8400-e29b-41d4-a716", // Missing parts
    "550e8400-e29b-41d4-a716-446655440000-extra", // Extra parts
    "not-a-uuid", // Not a UUID
    "", // Empty string
    "12345678-1234-1234-1234-123456789012", // Valid format but not v4
  ],
};

// Test function to validate UUID functionality
export const testUUIDValidation = () => {
  console.log("🧪 Testing UUID Validation...");

  // Test valid UUIDs
  console.log("\n✅ Testing valid UUIDs:");
  testUUIDs.valid.forEach((uuid, index) => {
    const isValid = validateUUID(uuid);
    const errors = validateId(uuid, "Test ID");
    console.log(
      `${index + 1}. ${uuid}: ${isValid ? "✅ Valid" : "❌ Invalid"}`
    );
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.map((e) => e.message).join(", ")}`);
    }
  });

  // Test invalid UUIDs
  console.log("\n❌ Testing invalid UUIDs:");
  testUUIDs.invalid.forEach((uuid, index) => {
    const isValid = validateUUID(uuid);
    const errors = validateId(uuid, "Test ID");
    console.log(
      `${index + 1}. "${uuid}": ${
        isValid ? "❌ Should be invalid" : "✅ Correctly invalid"
      }`
    );
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.map((e) => e.message).join(", ")}`);
    }
  });

  console.log("\n🎉 UUID validation test completed!");
};

// Generate a random UUID v4 for testing
export const generateTestUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Test data for API calls
export const testApiData = {
  verificationRequest: {
    educationId: generateTestUUID(),
    certificateIds: [generateTestUUID(), generateTestUUID()],
    achievementIds: [generateTestUUID()],
  },
  processVerificationRequest: {
    decisions: [
      {
        detailId: generateTestUUID(),
        status: "VERIFIED" as const,
      },
      {
        detailId: generateTestUUID(),
        status: "REJECTED" as const,
        rejectionReason: "Thông tin không đầy đủ",
      },
    ],
    adminNote: "Test admin note",
  },
};

// Export for use in development
if (typeof window !== "undefined") {
  (window as any).testUUIDValidation = testUUIDValidation;
  (window as any).generateTestUUID = generateTestUUID;
  (window as any).testApiData = testApiData;
}

