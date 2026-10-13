/**
 * The contract between the renderer (UI) and the main process (services).
 * The renderer can only *ask* and *report actions*; it never writes records directly.
 * Correct answers are never sent to the renderer for an open problem.
 */
import type { Block, SolutionStep, WorkedExample, LessonKind, TeachAgainApproach } from '../core/curriculum/types';
import type { MasteryStage } from '../core/engine/mastery';
import type { CheckStatus } from '../core/math/answers';
import type { GraphConfig } from '../core/math/graphAnswer';

export type SectionId = 'goal' | 'needToKnow' | 'instruction' | 'examples' | 'guided' | 'independent' | 'quiz' | 'feedback' | 'mastery' | 'summary';
export const LESSON_SECTIONS: SectionId[] = ['goal', 'needToKnow', 'instruction', 'examples', 'guided', 'independent', 'quiz', 'feedback', 'mastery', 'summary'];
export const SECTION_TITLES: Record<SectionId, string> = {
  goal: "Today's Goal",
  needToKnow: 'What You Need to Know',
  instruction: 'Learn',
  examples: 'Worked Examples',
  guided: 'Guided Practice',
  independent: 'Independent Practice',
  quiz: 'Quiz',
  feedback: 'Feedback & Corrections',
  mastery: 'Mastery Check',
  summary: 'Lesson Summary',
};

export type ActivityKind = 'guided' | 'independent' | 'quiz' | 'review' | 'assessment' | 'diagnostic' | 'testout' | 'remediation' | 'corrections';

/**
 * Activities whose time counts as learning time (study minutes and the streak's 10-minute rule):
 * every lesson section, review/assessment/project days, the diagnostic and practice. Time on the
 * dashboard, course map, skills list or settings is not learning time and is never recorded.
 */
export const LEARNING_ACTIVITIES: readonly string[] = [...LESSON_SECTIONS, 'review', 'assessment', 'diagnostic', 'testout', 'remediation', 'corrections', 'practice'];
export function isLearningActivity(activity: string): boolean {
  return LEARNING_ACTIVITIES.includes(activity);
}

export interface Settings {
  sound: boolean;
  reducedMotion: boolean;
  textScale: number; // 0.9 .. 1.4
  theme: 'light' | 'dark' | 'system';
}
/** Limits of the parent's goals; the service enforces them and the Parent Mode inputs use the same values. */
export const GOAL_LIMITS = { weeklyLessons: { min: 1, max: 10 }, dailyMinutes: { min: 10, max: 120 } } as const;

/** The daily study goal is not a student setting: it is the parent's goal (goals.daily_minutes). */
export const DEFAULT_SETTINGS: Settings = { sound: false, reducedMotion: false, textScale: 1, theme: 'system' };

export interface ProfileSummary {
  id: number;
  displayName: string;
  avatar: string;
  createdAt: number;
  lastActiveAt: number | null;
  archived: boolean;
  level: number;
  xp: number;
  onboarding: OnboardingState;
}

export interface OnboardingState {
  introSeen?: boolean;
  /** set only by the diagnostic service (a parent skips it with the PIN) */
  diagnostic?: 'offered' | 'skipped' | 'in_progress' | 'completed';
  recommendedLessonId?: string;
  /** what the diagnostic found (kept for the student, the parent and the course map) */
  diagnosticSummary?: DiagnosticSummary;
}

export type DiagnosticVerdict = 'strong' | 'needs-work' | 'not-learned';

export interface DiagnosticSkillResult {
  skillId: string;
  name: string;
  /** 'prereq': earlier-grade skill; 'course': a skill this course teaches */
  group: 'prereq' | 'course';
  verdict: DiagnosticVerdict;
  correct: number;
  answered: number;
  /** for course skills: the lesson that teaches it */
  lessonId?: string;
  lessonTitle?: string;
}

export interface DiagnosticSummary {
  completedAt: number;
  skills: DiagnosticSkillResult[];
  /** lessons whose Show What You Know is worth trying */
  testOutLessonIds: string[];
  recommendedLessonId: string;
  recommendedLessonTitle: string;
  headline: string;
}

export interface DiagnosticView {
  status: 'offered' | 'skipped' | 'in_progress' | 'completed';
  phase: 'intro' | 'questions' | 'results' | 'review';
  /** while answering: which part and how far along */
  part: 'prereq' | 'course' | null;
  progress: { skillsDone: number; skillsTotal: number; answered: number };
  problem: ProblemView | null;
  summary: DiagnosticSummary | null;
  /** optional warm-up practice on prerequisite skills that need work (hints, immediate feedback) */
  review: PracticeView | null;
  canReview: boolean;
}

/**
 * Every call result carries `saveError` (a friendly message) while the latest changes could not
 * be written to disk. The renderer's API client re-announces it as this window event with
 * detail `{ saveError?: string }` (undefined once saving works again); App shows the banner.
 */
export const SAVE_STATUS_EVENT = 'academy:save-status';

export interface AppStatus {
  firstRun: boolean; // no parent PIN yet
  version: string;
  dataDir: string;
  recoveredFrom?: string;
  migratedFrom?: number;
  /** friendly warning while the latest changes are not on disk; absent when everything is saved */
  persistError?: string;
}

// ---------------------------------------------------------------------------
// Problems
// ---------------------------------------------------------------------------

export type AnswerKind = 'number' | 'expression' | 'equation' | 'inequality' | 'point' | 'region-point' | 'solutions' | 'interval' | 'choice' | 'sequence-terms' | 'graph';

export interface FeedbackView {
  status: CheckStatus;
  message: string;
  misconception?: string;
  xp?: number;
}

export interface ProblemView {
  key: string;
  index: number;
  total: number;
  skillId: string;
  skillName: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
  prompt: Block[];
  answerKind: AnswerKind;
  inputHint?: string;
  choices?: Array<{ id: string; label: string }>;
  /** a graph to draw: the grid and the scale menus only (never the target or the accepted scales) */
  graph?: GraphConfig;
  unit?: string;
  /** step-by-step mode (guided practice) */
  step?: { index: number; total: number; prompt: Block[]; answerKind: AnswerKind; inputHint?: string; choices?: Array<{ id: string; label: string }>; graph?: GraphConfig; completed: Array<{ prompt: Block[]; explanation: string }> };
  hintsShown: string[];
  hintsRemaining: number;
  hintsAllowed: boolean;
  attempts: number;
  state: 'open' | 'correct' | 'revealed' | 'incorrect-final';
  lastFeedback?: FeedbackView;
  /** the answer that was saved (deferred sets) or last checked (immediate feedback) */
  lastResponse?: string;
  /**
   * deferred sets (quiz, assessment, test-out, diagnostic): an answer is saved (or scored). An
   * unreadable or wrong-form answer is never saved, so its message must show even when its text
   * matches nothing saved.
   */
  saved?: boolean;
  /** deferred sets: the text of the last refused answer, put back in the answer box with its message */
  draft?: string;
  /** only once the problem is finished (correct, revealed or graded) */
  solution?: SolutionStep[];
  correctAnswer?: string;
  canReveal: boolean;
  /** suggestion from the adaptive engine, e.g. "Try Teach Me Again" */
  suggestion?: string;
}

export interface PracticeView {
  activity: ActivityKind;
  problems: ProblemView[];
  currentIndex: number;
  complete: boolean;
  correctCount: number;
  requiredCorrect?: number;
  /** quiz/assessment: answers are graded only at the end */
  deferredFeedback: boolean;
}

export interface SkillChange {
  skillId: string;
  skillName: string;
  before: MasteryStage;
  after: MasteryStage;
  score: number;
}

export interface ResultsView {
  kind: 'quiz' | 'unit-assessment' | 'semester-assessment' | 'test-out' | 'diagnostic' | 'review';
  title: string;
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  passPercent: number;
  durationMs: number;
  attemptNumber: number;
  items: Array<{ index: number; skillId: string; skillName: string; correct: boolean; response: string; correctAnswer: string; prompt: Block[]; solution: SolutionStep[]; feedback?: string; misconception?: string }>;
  didWell: string[];
  needsPractice: string[];
  nextStep: string;
  skillChanges: SkillChange[];
  xpEarned: number;
  canRetake: boolean;
}

// ---------------------------------------------------------------------------
// Lesson player
// ---------------------------------------------------------------------------

export interface LessonView {
  lessonId: string;
  title: string;
  unitId: string;
  unitTitle: string;
  kind: LessonKind;
  week: number;
  day: number;
  durationMinutes: number;
  standards: Array<{ code: string; text: string }>;
  objectives: string[];
  status: 'in_progress' | 'completed' | 'tested_out';
  section: SectionId;
  sections: SectionId[];
  sectionsDone: SectionId[];
  content: {
    goal: string;
    needToKnow: Block[];
    instruction: Block[];
    examples: WorkedExample[];
    vocabulary: Array<{ term: string; meaning: string }>;
    summary: string[];
  };
  teachAgainOptions: Array<{ approach: TeachAgainApproach; title: string; used: boolean }>;
  practice: PracticeView | null;
  results: ResultsView | null;
  /** extra problems for corrections after the quiz */
  corrections: PracticeView | null;
  /**
   * refreshers: prerequisites below Proficient that the targeted practice starts with (one easy
   * problem each), with the worked example from the lesson that teaches them when there is one.
   */
  remediation: {
    active: boolean;
    reason: string;
    skills: string[];
    refreshers: Array<{ skillId: string; skillName: string; lessonId?: string; lessonTitle?: string; example?: WorkedExample }>;
  } | null;
  xpThisLesson: number;
  canAdvance: boolean;
  advanceBlockedReason?: string;
}

/** Review and assessment days (unit reviews, checkpoints, unit and semester assessments). */
export interface DayView {
  lessonId: string;
  title: string;
  kind: LessonKind;
  mode: 'review' | 'assessment';
  unitTitle: string;
  week: number;
  day: number;
  durationMinutes: number;
  standards: Array<{ code: string; text: string }>;
  objectives: string[];
  status: 'in_progress' | 'completed' | 'tested_out';
  phase: 'overview' | 'practice' | 'results';
  skills: Array<{ skillId: string; name: string; stage: MasteryStage; essential: boolean }>;
  itemCount: number | null;
  passPercent: number | null;
  practice: PracticeView | null;
  results: ResultsView | null;
  corrections: PracticeView | null;
  attempts: number;
  canRetake: boolean;
  retakeBlockedReason?: string;
  startedAt: number | null;
  xpThisDay: number;
  /** capstone projects: the situation, the modeling plan, the parts in order and the closing reflection */
  project?: { goal: string; intro: Block[]; plan: string[]; parts: string[]; wrapUp: Block[] };
}

export interface TeachAgainView {
  approach: TeachAgainApproach;
  title: string;
  blocks: Block[];
  timesUsedThisLesson: number;
}

// ---------------------------------------------------------------------------
// Course map & dashboards
// ---------------------------------------------------------------------------

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'tested_out' | 'coming_soon';

export interface CourseLesson {
  id: string;
  title: string;
  kind: LessonKind;
  week: number;
  day: number;
  status: LessonStatus;
  hasContent: boolean;
  canTestOut: boolean;
  /** the diagnostic suggests trying Show What You Know here */
  suggestedTestOut?: boolean;
  /** a unit review that can be skipped: the unit's lessons are done and its skills are Proficient or better */
  optional?: boolean;
  quizBest: number | null;
  standards: string[];
}

export interface CourseUnit {
  id: string;
  number: number;
  title: string;
  lessons: CourseLesson[];
  completedCount: number;
  masteryPercent: number;
}

export interface SkillMasteryView {
  skillId: string;
  name: string;
  unitId: string;
  standards: string[];
  stage: MasteryStage;
  score: number;
  evidence: number;
  dueForReview: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: number | null;
}

export interface StudentDashboard {
  profile: ProfileSummary;
  continueLesson: { lessonId: string; title: string; section: string; unitTitle: string; resume: boolean; kind: LessonKind } | null;
  todayGoal: string;
  semester: { completedLessons: number; totalLessons: number; percent: number; currentWeek: number; plannedWeek: number };
  currentUnit: { id: string; number: number; title: string; percent: number } | null;
  xp: { total: number; level: number; title: string; progress: number; current: number; needed: number; thisWeek: number };
  streak: { current: number; longest: number; todayCounted: boolean };
  weeklyGoal: { lessonsTarget: number; lessonsDone: number; minutesTarget: number; minutesDone: number };
  todayMinutes: number;
  skills: { mastered: number; proficient: number; developing: number; learning: number; notStarted: number; total: number };
  developingSkills: SkillMasteryView[];
  masteredSkills: SkillMasteryView[];
  upcoming: CourseLesson[];
  suggestedReview: SkillMasteryView[];
  achievements: Achievement[];
  grade: { percent: number | null; letter: string | null };
}

export interface ParentDashboard {
  profile: ProfileSummary;
  overview: {
    semesterPercent: number;
    grade: { percent: number | null; letter: string | null };
    lessonsCompleted: number;
    lessonsRemaining: number;
    currentUnit: string | null;
    paceStatus: 'ahead' | 'on-track' | 'behind' | 'not-started';
    paceDetail: string;
    headline: string;
  };
  gradeDetail: { categories: Array<{ category: string; label: string; weight: number; percent: number | null; items: Array<{ refId: string; label: string; percent: number; attempts: number }> }>; effectiveWeights: Record<string, number> };
  gradeTrend: Array<{ date: string; percent: number }>;
  assessments: Array<{ id: number; kind: string; refId: string; title: string; date: number; percent: number; durationMs: number; attemptNumber: number; missed: number }>;
  masteryByUnit: Array<{ unitId: string; title: string; standards: string[]; skills: SkillMasteryView[]; percentProficient: number }>;
  needsAttention: SkillMasteryView[];
  /** repeated Teach Me Again use (3+ in a lesson or on a skill): a sign that more explanation may help, never a penalty */
  supportSignals: string[];
  strengths: SkillMasteryView[];
  time: { totalMinutes: number; thisWeekMinutes: number; byWeek: Array<{ weekStart: string; minutes: number; lessons: number }> };
  engagement: { streak: number; longestStreak: number; xp: number; level: number; weeklyLessons: number };
  support: { attempts: number; hintsUsed: number; teachAgainUses: number; teachAgainByLesson: Array<{ lessonId: string; title: string; count: number }>; repeatedErrors: Array<{ misconception: string; label: string; count: number }>; firstTryAccuracy: number | null };
  recentActivity: Array<{ at: number; text: string }>;
  upcoming: CourseLesson[];
  /** the Overview's "Coming up" card: next course days, the next unit/semester assessment, milestones */
  comingUp: ComingUp;
  goals: { weeklyLessons: number; dailyMinutes: number };
}

export interface ComingUp {
  nextLessons: CourseLesson[];
  /** the next unit or semester assessment not yet finished; `daysBefore` open course days come first */
  nextAssessment: { id: string; title: string; kind: LessonKind; daysBefore: number; weeksAtGoal: number } | null;
  milestones: string[];
}

export interface StandardProgress {
  code: string;
  text: string;
  bigIdea: string;
  units: number[];
  skills: Array<{ skillId: string; name: string; stage: MasteryStage }>;
  taught: Array<{ id: string; title: string; status: LessonStatus }>;
  reviewed: Array<{ id: string; title: string; status: LessonStatus }>;
  assessed: Array<{ id: string; title: string; status: LessonStatus }>;
  /** share of this expectation's skills at Proficient or Mastered */
  percentProficient: number;
}

export interface WeeklyReport {
  profileId: number;
  studentName: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: number;
  lessonsCompleted: Array<{ id: string; title: string }>;
  minutes: number;
  previous: { lessons: number; minutes: number; accuracy: number | null } | null;
  accuracy: number | null;
  assessments: Array<{ title: string; percent: number }>;
  skillsMastered: string[];
  improvements: string[];
  needsAttention: string[];
  /** repeated Teach Me Again use this week (absent in reports saved by older versions) */
  supportSignals?: string[];
  recommendedFocus: string[];
  streak: number;
  xpEarned: number;
  summary: string;
}

export interface BackupInfo {
  ok: boolean;
  reason?: string;
  createdAt?: number;
  appVersion?: string;
  schemaVersion?: number;
  profiles?: string[];
}

// ---------------------------------------------------------------------------
// The API itself
// ---------------------------------------------------------------------------

export interface AcademyApi {
  // app
  getStatus(): Promise<AppStatus>;
  // parent
  setupParent(pin: string): Promise<{ recoveryCode: string }>;
  verifyParentPin(pin: string): Promise<{ ok: boolean; lockedForSeconds?: number; attemptsLeft?: number }>;
  changeParentPin(currentPin: string, newPin: string): Promise<{ ok: boolean; message?: string }>;
  resetParentPin(recoveryCode: string, newPin: string): Promise<{ ok: boolean; recoveryCode?: string; message?: string }>;
  // profiles
  listProfiles(): Promise<ProfileSummary[]>;
  createProfile(parentPin: string, name: string, avatar: string): Promise<ProfileSummary>;
  updateProfile(parentPin: string, id: number, changes: { displayName?: string; avatar?: string; archived?: boolean }): Promise<ProfileSummary>;
  getSettings(profileId: number): Promise<Settings>;
  updateSettings(profileId: number, s: Partial<Settings>): Promise<Settings>;
  setOnboarding(profileId: number, o: Partial<OnboardingState>): Promise<OnboardingState>;
  setGoals(parentPin: string, profileId: number, g: { weeklyLessons: number; dailyMinutes: number }): Promise<void>;
  // diagnostic (placement) assessment
  getDiagnostic(profileId: number): Promise<DiagnosticView>;
  startDiagnostic(profileId: number): Promise<DiagnosticView>;
  diagnosticSubmit(profileId: number, problemKey: string, response: string, elapsedMs: number): Promise<DiagnosticView>;
  /** "I haven't learned this yet": no answer is recorded, the skill is marked not learned */
  diagnosticNotLearned(profileId: number, problemKey: string): Promise<DiagnosticView>;
  startDiagnosticReview(profileId: number): Promise<DiagnosticView>;
  diagnosticReviewSubmit(profileId: number, problemKey: string, response: string, elapsedMs: number, stepIndex?: number): Promise<DiagnosticView>;
  diagnosticReviewHint(profileId: number, problemKey: string): Promise<DiagnosticView>;
  diagnosticReviewReveal(profileId: number, problemKey: string): Promise<DiagnosticView>;
  diagnosticReviewNext(profileId: number): Promise<DiagnosticView>;
  closeDiagnosticReview(profileId: number): Promise<DiagnosticView>;
  skipDiagnostic(parentPin: string, profileId: number): Promise<DiagnosticView>;
  /** let the student take the diagnostic again (after a skip or to re-place) */
  reofferDiagnostic(parentPin: string, profileId: number): Promise<DiagnosticView>;
  // learning
  getCourse(profileId: number): Promise<CourseUnit[]>;
  openLesson(profileId: number, lessonId: string): Promise<LessonView>;
  goToSection(profileId: number, lessonId: string, section: SectionId): Promise<LessonView>;
  advanceSection(profileId: number, lessonId: string): Promise<LessonView>;
  selectProblem(profileId: number, lessonId: string, index: number): Promise<LessonView>;
  submitAnswer(profileId: number, lessonId: string, problemKey: string, response: string, elapsedMs: number, stepIndex?: number): Promise<LessonView>;
  requestHint(profileId: number, lessonId: string, problemKey: string): Promise<LessonView>;
  revealSolution(profileId: number, lessonId: string, problemKey: string): Promise<LessonView>;
  nextProblem(profileId: number, lessonId: string): Promise<LessonView>;
  finishQuiz(profileId: number, lessonId: string): Promise<LessonView>;
  startRemediation(profileId: number, lessonId: string): Promise<LessonView>;
  retakeQuiz(profileId: number, lessonId: string): Promise<LessonView>;
  startTestOut(profileId: number, lessonId: string): Promise<LessonView>;
  teachMeAgain(profileId: number, lessonId: string, approach?: string): Promise<TeachAgainView>;
  openDay(profileId: number, lessonId: string): Promise<DayView>;
  startDay(profileId: number, lessonId: string): Promise<DayView>;
  daySubmit(profileId: number, lessonId: string, problemKey: string, response: string, elapsedMs: number, stepIndex?: number): Promise<DayView>;
  dayHint(profileId: number, lessonId: string, problemKey: string): Promise<DayView>;
  dayReveal(profileId: number, lessonId: string, problemKey: string): Promise<DayView>;
  dayNext(profileId: number, lessonId: string): Promise<DayView>;
  daySelect(profileId: number, lessonId: string, index: number): Promise<DayView>;
  finishDay(profileId: number, lessonId: string): Promise<DayView>;
  retakeDay(profileId: number, lessonId: string): Promise<DayView>;
  heartbeat(profileId: number, lessonId: string | null, activity: string, activeSeconds: number): Promise<void>;
  previewAnswer(input: string, kind: AnswerKind): Promise<{ tex: string | null; error: string | null }>;
  // dashboards
  getStudentDashboard(profileId: number): Promise<StudentDashboard>;
  getParentDashboard(parentPin: string, profileId: number): Promise<ParentDashboard>;
  getWeeklyReport(parentPin: string, profileId: number, weekStart?: string): Promise<WeeklyReport>;
  getSkillMastery(profileId: number): Promise<SkillMasteryView[]>;
  /** every expectation with where it is taught, reviewed and assessed, and this student's progress on it */
  getStandardsProgress(parentPin: string, profileId: number): Promise<StandardProgress[]>;
  getStandards(): Promise<Array<{ code: string; text: string; parent?: string; lessons: string[] }>>;
  getAssessmentDetail(parentPin: string, profileId: number, assessmentId: number): Promise<ResultsView>;
  // data
  exportBackup(parentPin: string): Promise<{ fileName: string; data: string }>;
  inspectBackup(parentPin: string, data: string): Promise<BackupInfo>;
  restoreBackup(parentPin: string, data: string): Promise<{ ok: boolean; message: string; safetyBackup?: string }>;
  // diagnostics
  /** write a renderer error to the local log (kind: error | unhandledrejection | boundary); scrubbed and truncated in the main process */
  reportClientError(kind: string, message: string, detail?: string): Promise<{ logged: boolean }>;
}

export const API_METHODS: Array<keyof AcademyApi> = [
  'getStatus', 'setupParent', 'verifyParentPin', 'changeParentPin', 'resetParentPin',
  'listProfiles', 'createProfile', 'updateProfile', 'getSettings', 'updateSettings', 'setOnboarding', 'setGoals',
  'getDiagnostic', 'startDiagnostic', 'diagnosticSubmit', 'diagnosticNotLearned', 'startDiagnosticReview', 'diagnosticReviewSubmit', 'diagnosticReviewHint', 'diagnosticReviewReveal', 'diagnosticReviewNext', 'closeDiagnosticReview', 'skipDiagnostic', 'reofferDiagnostic',
  'getCourse', 'openLesson', 'goToSection', 'advanceSection', 'selectProblem', 'submitAnswer', 'requestHint', 'revealSolution', 'nextProblem',
  'finishQuiz', 'startRemediation', 'retakeQuiz', 'startTestOut', 'teachMeAgain', 'openDay', 'startDay', 'daySubmit', 'dayHint', 'dayReveal', 'dayNext', 'daySelect', 'finishDay', 'retakeDay', 'heartbeat', 'previewAnswer',
  'getStudentDashboard', 'getParentDashboard', 'getWeeklyReport', 'getSkillMastery', 'getStandards', 'getStandardsProgress', 'getAssessmentDetail',
  'exportBackup', 'inspectBackup', 'restoreBackup',
  'reportClientError',
];
