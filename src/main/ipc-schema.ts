/**
 * Argument shapes for every API method. The main process rejects any call whose arguments
 * don't match before it reaches a service, so a compromised or buggy renderer can't send
 * unexpected data.
 */
import type { AcademyApi } from '../shared/api';

type ArgType = 'string' | 'int' | 'number' | 'object' | 'string?' | 'int?' | 'string|null';

export const ARG_SCHEMA: Record<keyof AcademyApi, ArgType[]> = {
  getStatus: [],
  setupParent: ['string'],
  verifyParentPin: ['string'],
  changeParentPin: ['string', 'string'],
  resetParentPin: ['string', 'string'],
  listProfiles: [],
  createProfile: ['string', 'string', 'string'],
  updateProfile: ['string', 'int', 'object'],
  getSettings: ['int'],
  updateSettings: ['int', 'object'],
  setOnboarding: ['int', 'object'],
  setGoals: ['string', 'int', 'object'],
  getDiagnostic: ['int'],
  startDiagnostic: ['int'],
  diagnosticSubmit: ['int', 'string', 'string', 'number'],
  diagnosticNotLearned: ['int', 'string'],
  startDiagnosticReview: ['int'],
  diagnosticReviewSubmit: ['int', 'string', 'string', 'number'],
  diagnosticReviewHint: ['int', 'string'],
  diagnosticReviewReveal: ['int', 'string'],
  diagnosticReviewNext: ['int'],
  closeDiagnosticReview: ['int'],
  skipDiagnostic: ['string', 'int'],
  reofferDiagnostic: ['string', 'int'],
  getCourse: ['int'],
  openLesson: ['int', 'string'],
  goToSection: ['int', 'string', 'string'],
  advanceSection: ['int', 'string'],
  selectProblem: ['int', 'string', 'int'],
  submitAnswer: ['int', 'string', 'string', 'string', 'number'],
  requestHint: ['int', 'string', 'string'],
  revealSolution: ['int', 'string', 'string'],
  nextProblem: ['int', 'string'],
  finishQuiz: ['int', 'string'],
  startRemediation: ['int', 'string'],
  retakeQuiz: ['int', 'string'],
  startTestOut: ['int', 'string'],
  teachMeAgain: ['int', 'string', 'string?'],
  openDay: ['int', 'string'],
  startDay: ['int', 'string'],
  daySubmit: ['int', 'string', 'string', 'string', 'number'],
  dayHint: ['int', 'string', 'string'],
  dayReveal: ['int', 'string', 'string'],
  dayNext: ['int', 'string'],
  daySelect: ['int', 'string', 'int'],
  finishDay: ['int', 'string'],
  retakeDay: ['int', 'string'],
  heartbeat: ['int', 'string|null', 'string', 'number'],
  previewAnswer: ['string', 'string'],
  getStudentDashboard: ['int'],
  getParentDashboard: ['string', 'int'],
  getWeeklyReport: ['string', 'int', 'string?'],
  getSkillMastery: ['int'],
  getStandards: [],
  getAssessmentDetail: ['string', 'int', 'int'],
  exportBackup: ['string'],
  inspectBackup: ['string', 'string'],
  restoreBackup: ['string', 'string'],
};

const MAX_STRING = 250 * 1024 * 1024; // backups are large strings

export function validateArgs(method: string, args: unknown[]): string | null {
  const schema = (ARG_SCHEMA as Record<string, ArgType[] | undefined>)[method];
  if (!schema) return `unknown method ${method}`;
  if (!Array.isArray(args) || args.length > schema.length) return 'wrong number of arguments';
  for (let i = 0; i < schema.length; i++) {
    const t = schema[i];
    const a = args[i];
    const optional = t.endsWith('?');
    if ((a === undefined || a === null) && optional) continue; // JSON turns a missing argument into null
    const base = t.replace('?', '');
    const ok =
      base === 'string' ? typeof a === 'string' && a.length <= MAX_STRING
      : base === 'int' ? Number.isSafeInteger(a)
      : base === 'number' ? typeof a === 'number' && Number.isFinite(a)
      : base === 'object' ? typeof a === 'object' && a !== null && !Array.isArray(a)
      : base === 'string|null' ? a === null || typeof a === 'string'
      : false;
    if (!ok) return `argument ${i + 1} of ${method} must be ${t}`;
  }
  return null;
}
