/**
 * Test script to verify ID migration from _id to id
 * This file can be used to test the migration in development
 */

import { validateUUID } from "./validation";

// Test data with new id field structure
export const testDataWithId = {
  education: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    tutorId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    level: "HIGH_SCHOOL",
    school: "THPT Test",
    major: "Test Major",
    status: "DRAFT",
    createdAt: "2025-09-27T10:00:00.000Z",
    updatedAt: "2025-09-27T10:00:00.000Z",
  },
  certificate: {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    tutorId: "550e8400-e29b-41d4-a716-446655440000",
    name: "TOEIC Test",
    issuingOrganization: "ETS",
    issueDate: "2025-09-01T00:00:00.000Z",
    status: "DRAFT",
    createdAt: "2025-09-27T10:00:00.000Z",
    updatedAt: "2025-09-27T10:00:00.000Z",
  },
  achievement: {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    tutorId: "550e8400-e29b-41d4-a716-446655440000",
    name: "Test Achievement",
    level: "GOLD",
    achievedDate: "2025-09-01T00:00:00.000Z",
    awardingOrganization: "Test Org",
    type: "COMPETITION",
    field: "Mathematics",
    status: "DRAFT",
    createdAt: "2025-09-27T10:00:00.000Z",
    updatedAt: "2025-09-27T10:00:00.000Z",
  },
  verificationRequest: {
    id: "a1b2c3d4-e5f6-4789-a012-345678901234",
    tutorId: "550e8400-e29b-41d4-a716-446655440000",
    status: "PENDING",
    submittedAt: "2025-09-27T10:00:00.000Z",
    createdAt: "2025-09-27T10:00:00.000Z",
    updatedAt: "2025-09-27T10:00:00.000Z",
    details: [
      {
        id: "b2c3d4e5-f6g7-4890-b123-456789012345",
        requestId: "a1b2c3d4-e5f6-4789-a012-345678901234",
        targetType: "EDUCATION",
        targetId: "550e8400-e29b-41d4-a716-446655440000",
        requestType: "NEW",
        status: "PENDING",
        createdAt: "2025-09-27T10:00:00.000Z",
        updatedAt: "2025-09-27T10:00:00.000Z",
      },
    ],
  },
};

/**
 * Test function to validate ID migration
 */
export const testIdMigration = () => {
  console.log("🧪 Testing ID Migration...");

  const tests = [
    {
      name: "Education ID",
      data: testDataWithId.education,
      expectedFields: ["id", "tutorId"],
    },
    {
      name: "Certificate ID",
      data: testDataWithId.certificate,
      expectedFields: ["id", "tutorId"],
    },
    {
      name: "Achievement ID",
      data: testDataWithId.achievement,
      expectedFields: ["id", "tutorId"],
    },
    {
      name: "VerificationRequest ID",
      data: testDataWithId.verificationRequest,
      expectedFields: ["id", "tutorId"],
    },
    {
      name: "VerificationDetail ID",
      data: testDataWithId.verificationRequest.details[0],
      expectedFields: ["id", "requestId", "targetId"],
    },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  tests.forEach((test, index) => {
    console.log(`\n${index + 1}. Testing ${test.name}:`);

    // Check if expected fields exist
    const hasExpectedFields = test.expectedFields.every((field) =>
      test.data.hasOwnProperty(field)
    );

    // Check if old _id field doesn't exist
    const hasOldIdField = test.data.hasOwnProperty("_id");

    // Validate UUID format for ID fields
    const validUUIDs = test.expectedFields.every((field) => {
      const value = (test.data as any)[field];
      return typeof value === "string" && validateUUID(value);
    });

    const testPassed = hasExpectedFields && !hasOldIdField && validUUIDs;

    console.log(`   ✅ Has expected fields: ${hasExpectedFields}`);
    console.log(`   ✅ No old _id field: ${!hasOldIdField}`);
    console.log(`   ✅ Valid UUID format: ${validUUIDs}`);
    console.log(`   ${testPassed ? "✅ PASSED" : "❌ FAILED"}`);

    if (testPassed) passedTests++;
  });

  console.log(
    `\n🎉 Migration Test Results: ${passedTests}/${totalTests} tests passed`
  );

  if (passedTests === totalTests) {
    console.log("✅ All tests passed! ID migration is successful.");
  } else {
    console.log("❌ Some tests failed. Please check the migration.");
  }

  return passedTests === totalTests;
};

/**
 * Test API request format with new ID structure
 */
export const testApiRequestFormat = () => {
  console.log("\n🌐 Testing API Request Format...");

  const testRequests = {
    createVerificationRequest: {
      educationId: testDataWithId.education.id,
      certificateIds: [testDataWithId.certificate.id],
      achievementIds: [testDataWithId.achievement.id],
    },
    processVerificationRequest: {
      decisions: [
        {
          detailId: testDataWithId.verificationRequest.details[0].id,
          status: "VERIFIED" as const,
        },
      ],
      adminNote: "Test admin note",
    },
  };

  console.log("✅ Create Verification Request Format:");
  console.log(JSON.stringify(testRequests.createVerificationRequest, null, 2));

  console.log("\n✅ Process Verification Request Format:");
  console.log(JSON.stringify(testRequests.processVerificationRequest, null, 2));

  return testRequests;
};

// Export for use in development
if (typeof window !== "undefined") {
  (window as any).testIdMigration = testIdMigration;
  (window as any).testApiRequestFormat = testApiRequestFormat;
  (window as any).testDataWithId = testDataWithId;
}

