/**
 * The contract between the renderer (UI) and the main process (services).
 * The renderer can only *ask* and *report actions*; it never writes records directly.
 * Correct answers are never sent to the renderer for an open problem.
 */
import type { Block, SolutionStep, WorkedExample, LessonKind, TeachAgainApproach } from '../core/curriculum/types';
import type { MasteryStage } from '../core/engine/mastery';
import type { CheckStatus } from '../core/math/answers';

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

export interface Settings {
  sound: boolean;
  reducedMotion: boolean;
  textScale: number; // 0.9 .. 1.4
  theme: 'light' | 'dark' | 'system';
  dailyGoalMinutes: number;
}
export const DEFAULT_SETTINGS: Settings = { sound: false, reducedMotion: false, textScale: 1, theme: 'system', dailyGoalMinutes: 30 };

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
  diagnostic?: 'offered' | 'skipped' | 'in_progress' | 'completed';
  recommendedLessonId?: string;
}

export interface AppStatus {
  firstRun: boolean; // no parent PIN yet
  version: string;
  dataDir: string;
  recoveredFrom?: string;
  migratedFrom?: number;
  persistError?: string;
}

// ---------------------------------------------------------------------------
// Problems
// ---------------------------------------------------------------------------

export type AnswerKind = 'number' | 'expression' | 'equation' | 'inequality' | 'point' | 'solutions' | 'interval' | 'choice' | 'sequence-terms';

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
  unit?: string;
  /** step-by-step mode (guided practice) */
  step?: { index: number; total: number; prompt: Block[]; answerKind: AnswerKind; inputHint?: string; choices?: Array<{ id: string; label: string }>; completed: Array<{ prompt: Block[]; explanation: string }> };
  hintsShown: string[];
  hintsRemaining: number;
  hintsAllowed: boolean;
  attempts: number;
  state: 'open' | 'correct' | 'revealed' | 'incorrect-final';
  lastFeedback?: FeedbackView;
  lastResponse?: string;
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
  remediation: { active: boolean; reason: string; skills: string[] } | null;
  xpThisLesson: number;
  canAdvance: boolean;
  advanceBlockedReason?: string;
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
  continueLesson: { lessonId: string; title: string; section: string; unitTitle: string; resume: boolean } | null;
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
  strengths: SkillMasteryView[];
  time: { totalMinutes: number; thisWeekMinutes: number; byWeek: Array<{ weekStart: string; minutes: number; lessons: number }> };
  engagement: { streak: number; longestStreak: number; xp: number; level: number; weeklyLessons: number };
  support: { attempts: number; hintsUsed: number; teachAgainUses: number; teachAgainByLesson: Array<{ lessonId: string; title: string; count: number }>; repeatedErrors: Array<{ misconception: string; label: string; count: number }>; firstTryAccuracy: number | null };
  recentActivity: Array<{ at: number; text: string }>;
  upcoming: CourseLesson[];
  goals: { weeklyLessons: number; dailyMinutes: number };
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
  // learning
  getCourse(profileId: number): Promise<CourseUnit[]>;
  openLesson(profileId: number, lessonId: string): Promise<LessonView>;
  goToSection(profileId: number, lessonId: string, section: SectionId): Promise<LessonView>;
  advanceSection(profileId: number, lessonId: string): Promise<LessonView>;
  selectProblem(profileId: number, lessonId: string, index: number): Promise<LessonView>;
  submitAnswer(profileId: number, lessonId: string, problemKey: string, response: string, elapsedMs: number): Promise<LessonView>;
  requestHint(profileId: number, lessonId: string, problemKey: string): Promise<LessonView>;
  revealSolution(profileId: number, lessonId: string, problemKey: string): Promise<LessonView>;
  nextProblem(profileId: number, lessonId: string): Promise<LessonView>;
  finishQuiz(profileId: number, lessonId: string): Promise<LessonView>;
  startRemediation(profileId: number, lessonId: string): Promise<LessonView>;
  retakeQuiz(profileId: number, lessonId: string): Promise<LessonView>;
  startTestOut(profileId: number, lessonId: string): Promise<LessonView>;
  teachMeAgain(profileId: number, lessonId: string, approach?: string): Promise<TeachAgainView>;
  heartbeat(profileId: number, lessonId: string | null, activity: string, activeSeconds: number): Promise<void>;
  previewAnswer(input: string, kind: AnswerKind): Promise<{ tex: string | null; error: string | null }>;
  // dashboards
  getStudentDashboard(profileId: number): Promise<StudentDashboard>;
  getParentDashboard(parentPin: string, profileId: number): Promise<ParentDashboard>;
  getWeeklyReport(parentPin: string, profileId: number, weekStart?: string): Promise<WeeklyReport>;
  getSkillMastery(profileId: number): Promise<SkillMasteryView[]>;
  getStandards(): Promise<Array<{ code: string; text: string; parent?: string; lessons: string[] }>>;
  getAssessmentDetail(parentPin: string, profileId: number, assessmentId: number): Promise<ResultsView>;
  // data
  exportBackup(parentPin: string): Promise<{ fileName: string; data: string }>;
  inspectBackup(parentPin: string, data: string): Promise<BackupInfo>;
  restoreBackup(parentPin: string, data: string): Promise<{ ok: boolean; message: string; safetyBackup?: string }>;
}

export const API_METHODS: Array<keyof AcademyApi> = [
  'getStatus', 'setupParent', 'verifyParentPin', 'changeParentPin', 'resetParentPin',
  'listProfiles', 'createProfile', 'updateProfile', 'getSettings', 'updateSettings', 'setOnboarding', 'setGoals',
  'getCourse', 'openLesson', 'goToSection', 'advanceSection', 'selectProblem', 'submitAnswer', 'requestHint', 'revealSolution', 'nextProblem',
  'finishQuiz', 'startRemediation', 'retakeQuiz', 'startTestOut', 'teachMeAgain', 'heartbeat', 'previewAnswer',
  'getStudentDashboard', 'getParentDashboard', 'getWeeklyReport', 'getSkillMastery', 'getStandards', 'getAssessmentDetail',
  'exportBackup', 'inspectBackup', 'restoreBackup',
];
