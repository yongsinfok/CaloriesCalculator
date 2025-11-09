# Tasks: Camera Food Capture & Analysis

**Input**: Design documents from `/specs/001-camera-capture/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize JavaScript project with dependencies in package.json
- [ ] T003 [P] Create frontend directory structure (frontend/, frontend/icons/)
- [ ] T004 [P] Create API directory structure (api/, api/common/)
- [ ] T005 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Set up Vercel configuration in vercel.json
- [ ] T007 Create environment configuration template (.env.local.example)
- [ ] T008 [P] Initialize frontend styles in frontend/styles.css
- [ ] T009 [P] Create service worker template in frontend/service-worker.js
- [ ] T010 Create PWA manifest template in frontend/manifest.json

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Live Camera Feed (Priority: P1) 🎯 MVP

**Goal**: User can see a live camera feed after granting permission

**Independent Test**: Launch the app and verify camera permissions are requested and live feed displays

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create main HTML structure in frontend/index.html
- [ ] T012 [US1] Implement camera module with getUserMedia in frontend/camera.js
- [ ] T013 [US1] Create main app controller in frontend/app.js
- [ ] T014 [US1] Add camera permission request handling in frontend/camera.js
- [ ] T015 [US1] Implement camera error handling and retry functionality in frontend/camera.js
- [ ] T016 [US1] Add video element styling in frontend/styles.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Photo Capture (Priority: P1)

**Goal**: User can tap button to capture current camera frame to canvas

**Independent Test**: Tap capture button and verify frame is frozen on canvas element

### Implementation for User Story 2

- [ ] T017 [P] [US2] Add capture button to frontend/index.html
- [ ] T018 [US2] Implement photo capture functionality in frontend/camera.js
- [ ] T019 [US2] Add retake functionality to frontend/app.js
- [ ] T020 [US2] Style capture controls in frontend/styles.css
- [ ] T021 [US2] Add canvas element to frontend/index.html
- [ ] T022 [US2] Implement image preparation for submission in frontend/camera.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Photo Analysis (Priority: P1)

**Goal**: User can submit captured photo for AI analysis with loading indicators

**Independent Test**: Submit photo and verify loading indicator appears during processing

### Implementation for User Story 3

- [ ] T023 [P] [US3] Create analysis endpoint in api/analyze.js
- [ ] T024 [US3] Add Google AI SDK dependency to package.json
- [ ] T025 [US3] Implement analysis request in frontend/app.js
- [ ] T026 [US3] Create loading spinner UI in frontend/app.js
- [ ] T027 [US3] Add progress indicator with time estimate in frontend/app.js
- [ ] T028 [US3] Implement retry logic for failed analysis in frontend/app.js
- [ ] T029 [US3] Add error messaging for analysis failures in frontend/app.js

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Results Display (Priority: P1)

**Goal**: User can see identified food items, cooking methods, and total calories

**Independent Test**: View results screen and verify all information displays correctly

### Implementation for User Story 4

- [ ] T030 [P] [US4] Create results display HTML structure in frontend/index.html
- [ ] T031 [US4] Implement results parsing in frontend/app.js
- [ ] T032 [US4] Display food items with calorie counts in frontend/app.js
- [ ] T033 [US4] Show cooking methods for each food item in frontend/app.js
- [ ] T034 [US4] Calculate and display total calories in frontend/app.js
- [ ] T035 [US4] Add confidence level display in frontend/app.js
- [ ] T036 [US4] Style results screen in frontend/styles.css

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Security Compliance (Priority: P1)

**Goal**: Keep Google AI API key secure on backend only

**Independent Test**: Inspect frontend code and network requests to verify no API key exposure

### Implementation for User Story 5

- [ ] T037 [US5] Secure Google API key in environment variables in api/analyze.js
- [ ] T038 [US5] Implement secure API key retrieval in api/analyze.js
- [ ] T039 [US5] Add input validation for image data in api/analyze.js
- [ ] T040 [US5] Implement proper error responses in api/analyze.js
- [ ] T041 [US5] Add request validation and rate limiting in api/analyze.js
- [ ] T046 [US5] Test API key security by inspecting frontend code and network traffic

**Checkpoint**: All user stories should now be independently functional with security compliance

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T042 [P] Add PWA icons to frontend/icons/
- [ ] T043 [P] Optimize PWA manifest values in frontend/manifest.json
- [ ] T044 [P] Complete service worker implementation in frontend/service-worker.js
- [ ] T045 Add responsive design improvements in frontend/styles.css
- [ ] T047 Performance optimization across all stories
- [ ] T048 Security hardening and validation
- [ ] T049 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on User Story 1 completion (camera feed required)
- **User Story 3 (P1)**: Depends on User Story 2 completion (capture required)
- **User Story 4 (P1)**: Depends on User Story 3 completion (analysis required)
- **User Story 5 (P1)**: Runs in parallel with US3-4 (backend security implementation)

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- US5 security tasks can run in parallel with frontend development
- Different parts of same user story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all setup tasks for User Story 1 together:
Task: "Create main HTML structure in frontend/index.html"
Task: "Implement camera module with getUserMedia in frontend/camera.js"
Task: "Create main app controller in frontend/app.js"
Task: "Add video element styling in frontend/styles.css"
```

---

## Implementation Strategy

### MVP First (User Stories 1-5)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Camera)
4. Complete Phase 4: User Story 2 (Capture)
5. Complete Phase 5: User Story 3 (Analysis)
6. Complete Phase 6: User Story 4 (Results)
7. Complete Phase 7: User Story 5 (Security)
8. **STOP and VALIDATE**: Test complete workflow end-to-end

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test camera independently
3. Add User Story 2 → Test capture independently
4. Add User Story 3 → Test analysis independently
5. Add User Story 4 → Test results independently
6. Add User Story 5 → Validate security compliance
7. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- API key security is critical - never expose to frontend
- Follow mobile-first responsive design principles
- Test on iOS Safari and Android Chrome throughout development
- Validate 10-second analysis target performance