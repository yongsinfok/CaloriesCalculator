# Feature Specification: Camera Food Capture & Analysis

**Feature Branch**: `001-camera-capture`
**Created**: 2025-11-09
**Status**: Draft
**Input**: User description: "Goals: User can get a calorie estimate within 10 seconds of taking a photo. The estimate must attempt to differentiate cooking methods (fried vs. steamed). User Stories (US) & Acceptance Criteria: US-1 (Camera): User wants to see a live camera feed. | AC: App requests permission and shows a <video> feed. US-2 (Capture): User wants to tap a button to capture the frame. | AC: The current frame is drawn onto a <canvas>. US-3 (Analyze): User wants to submit the photo. | AC: The canvas image is sent to the backend. A loading spinner is shown. US-4 (Result): User wants to see a list of food items and total calories. | AC: The frontend parses the JSON response and displays the results. US-5 (Security): The Google API key must never be visible in the frontend. | AC: API key is only referenced in the @api-agent-gemini module."

## Clarifications

### Session 2025-11-09

- Q: Error Handling Scope → A: Analysis retry only (network errors, AI failures)
- Q: Confidence Threshold Requirements → D: 90% confidence threshold (very conservative, high precision)
- Q: Multiple Food Items Handling → B: Up to 5 distinct food items with individual analysis
- Q: Cooking Method Coverage → C: Essential methods: fried, baked, grilled, steamed, raw
- Q: Loading Progress Granularity → B: Time estimate + partial results preview (5-second milestone)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Live Camera Feed (Priority: P1)

User opens the application and immediately sees a live camera feed to begin food identification.

**Why this priority**: Core functionality - without camera access, no photos can be captured for analysis

**Independent Test**: Can be fully tested by launching the app and verifying camera permissions are requested and live feed displays

**Acceptance Scenarios**:

1. **Given** User opens the app, **When** Camera permission is granted, **Then** Live video feed displays from device camera
2. **Given** User opens the app, **When** Camera permission is denied, **Then** App displays explanatory message with permission retry option
3. **Given** Camera feed is active, **When** Device camera is blocked/coversed, **Then** App displays camera unavailable state

---

### User Story 2 - Photo Capture (Priority: P1)

User taps a capture button to take a photo of their food for analysis.

**Why this priority**: Essential action - food items must be captured before they can be analyzed

**Independent Test**: Can be tested by tapping capture button and verifying frame is frozen on canvas element

**Acceptance Scenarios**:

1. **Given** Live camera feed is active, **When** User taps capture button, **Then** Current video frame is drawn onto canvas and video feed stops
2. **Given** Photo is captured, **When** User taps retake option, **Then** Canvas clears and live camera feed resumes
3. **Given** Photo is captured, **When** User proceeds to analysis, **Then** Canvas image is prepared for submission

---

### User Story 3 - Photo Analysis (Priority: P1)

User submits the captured photo for AI-powered food analysis and calorie estimation.

**Why this priority**: Core value proposition - without analysis, no calorie information is provided

**Independent Test**: Can be tested by submitting a photo and verifying loading indicator appears during processing

**Acceptance Scenarios**:

1. **Given** Photo is captured, **When** User submits for analysis, **Then** Loading spinner displays and canvas image is sent to backend
2. **Given** Analysis is in progress, **When** Processing takes longer than 5 seconds, **Then** Progress indicator displays time estimate with partial results preview
3. **Given** Network error occurs, **When** Analysis fails, **Then** Error message displays with retry option

---

### User Story 4 - Results Display (Priority: P1)

User sees the analysis results including identified food items, cooking methods, and total calorie estimates.

**Why this priority**: Primary deliverable - users need to see calorie information to achieve their goals

**Independent Test**: Can be tested by viewing the results screen and verifying all information displays correctly

**Acceptance Scenarios**:

1. **Given** Analysis completes successfully, **When** Results are received, **Then** List of food items displays with individual calorie counts
2. **Given** Results are displayed, **When** Food items are shown, **Then** Cooking method (essential methods: fried, baked, grilled, steamed, raw) is indicated for each item
3. **Given** Results are displayed, **When** Viewing summary, **Then** Total estimated calories for all items combined is prominently displayed
4. **Given** Multiple food items identified, **When** Results are shown, **Then** Confidence levels are displayed for each identification

---

### User Story 5 - Security Compliance (Priority: P1)

System maintains security by keeping API keys secure on the backend.

**Why this priority**: Critical security requirement - API key exposure would violate architecture principles

**Independent Test**: Can be tested by inspecting frontend code and network requests to verify no API key exposure

**Acceptance Scenarios**:

1. **Given** App is running, **When** Inspecting frontend code, **Then** Google AI API key is not present
2. **Given** Analysis request is sent, **When** Monitoring network traffic, **Then** API key is not transmitted from frontend
3. **Given** Backend processes analysis, **When** Checking server configuration, **Then** API key is only referenced in backend environment variables

---

### Edge Cases

- What happens when user captures photo with no food visible?
- How does system handle multiple food items in single photo? (Up to 5 distinct items with individual analysis)
- What happens when AI cannot identify food items with confidence?
- How does system handle poor lighting conditions in photos?
- What happens when backend AI service is unavailable?
- Focus: Analysis retry for network errors and AI failures only (MVP scope)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST request camera permissions when first accessed
- **FR-002**: System MUST display live camera feed in browser-compatible format
- **FR-003**: System MUST allow user to capture current camera frame to canvas
- **FR-004**: System MUST allow photo retaking before analysis
- **FR-005**: System MUST send captured image to backend for analysis
- **FR-006**: System MUST display loading indicator during AI processing (time estimate + partial results preview at 5-second milestone)
- **FR-007**: System MUST display food items with individual calorie estimates
- **FR-008**: System MUST display cooking method identification for each food item (essential methods: fried, baked, grilled, steamed, raw)
- **FR-009**: System MUST calculate and display total calorie count
- **FR-010**: System MUST display confidence levels for food identifications (90% minimum threshold for inclusion)
- **FR-011**: System MUST keep Google AI API key secure on backend only
- **FR-012**: System MUST handle network errors gracefully with retry options
- **FR-013**: System MUST provide user feedback when food cannot be identified

### Key Entities *(include if feature involves data)*

- **Food Item**: Represents individual food identified in photo with name, calorie count, cooking method (essential methods: fried, baked, grilled, steamed, raw), and confidence score (90% minimum threshold for identification)
- **Analysis Result**: Container for all identified food items (up to 5 distinct items) with total calorie summary and processing metadata
- **Captured Image**: Base64-encoded photo data sent from frontend to backend for analysis
- **Error State**: Failure condition with retry capability and user-friendly messaging

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete full photo capture and analysis workflow within 15 seconds total
- **SC-002**: 90% of clear food photos return at least one identified food item
- **SC-003**: Analysis completes within 10 seconds for 95% of requests
- **SC-004**: Zero occurrences of API key exposure in frontend code or network traffic
- **SC-005**: Users can successfully retry failed analysis attempts in under 3 seconds
- **SC-006**: Cooking method identification accuracy improves calorie estimates by at least 15% over basic recognition
