/**
 * Composes every service into the AcademyApi the UI talks to. Parent-only actions check the
 * Parent PIN here, in the main process, on every call.
 */
import type { AcademyApi, AnswerKind, SectionId } from '../../shared/api';
import { ServiceContext } from './context';
import * as parent from './parent';
import * as profiles from './profiles';
import * as lessons from './lessons';
import * as days from './days';
import * as dashboard from './dashboard';
import * as diagnostic from './diagnostic';
import * as backup from './backup';
import { previewAnswer } from './preview';
import { addStudyTime } from './records';

export function createApi(ctx: ServiceContext): AcademyApi {
  const guard = (pin: string) => parent.requireParent(ctx, pin);
  return {
    async getStatus() {
      return {
        firstRun: !parent.hasParent(ctx),
        version: ctx.appVersion,
        dataDir: ctx.dataDir,
        recoveredFrom: ctx.recoveredFrom,
        migratedFrom: ctx.migratedFrom,
        persistError: ctx.db.lastPersistError?.message,
      };
    },
    async setupParent(pin) {
      return parent.setupParent(ctx, pin);
    },
    async verifyParentPin(pin) {
      return parent.verifyPin(ctx, pin);
    },
    async changeParentPin(cur, next) {
      return parent.changePin(ctx, cur, next);
    },
    async resetParentPin(code, next) {
      return parent.resetPin(ctx, code, next);
    },

    async listProfiles() {
      return profiles.listProfiles(ctx);
    },
    async createProfile(pin, name, avatar) {
      guard(pin);
      return profiles.createProfile(ctx, name, avatar);
    },
    async updateProfile(pin, id, changes) {
      guard(pin);
      return profiles.updateProfile(ctx, id, changes);
    },
    async getSettings(id) {
      return profiles.getSettings(ctx, id);
    },
    async updateSettings(id, s) {
      return profiles.updateSettings(ctx, id, s);
    },
    async setOnboarding(id, o) {
      return profiles.setOnboarding(ctx, id, o);
    },
    async setGoals(pin, id, g) {
      guard(pin);
      profiles.setGoals(ctx, id, g);
    },

    async getDiagnostic(id) {
      return diagnostic.getDiagnostic(ctx, id);
    },
    async startDiagnostic(id) {
      return diagnostic.startDiagnostic(ctx, id);
    },
    async diagnosticSubmit(id, key, response, elapsed) {
      return diagnostic.diagnosticSubmit(ctx, id, key, response, elapsed);
    },
    async diagnosticNotLearned(id, key) {
      return diagnostic.diagnosticNotLearned(ctx, id, key);
    },
    async startDiagnosticReview(id) {
      return diagnostic.startDiagnosticReview(ctx, id);
    },
    async diagnosticReviewSubmit(id, key, response, elapsed) {
      return diagnostic.diagnosticReviewSubmit(ctx, id, key, response, elapsed);
    },
    async diagnosticReviewHint(id, key) {
      return diagnostic.diagnosticReviewHint(ctx, id, key);
    },
    async diagnosticReviewReveal(id, key) {
      return diagnostic.diagnosticReviewReveal(ctx, id, key);
    },
    async diagnosticReviewNext(id) {
      return diagnostic.diagnosticReviewNext(ctx, id);
    },
    async closeDiagnosticReview(id) {
      return diagnostic.closeDiagnosticReview(ctx, id);
    },
    async skipDiagnostic(pin, id) {
      guard(pin);
      return diagnostic.skipDiagnostic(ctx, id);
    },
    async reofferDiagnostic(pin, id) {
      guard(pin);
      return diagnostic.reofferDiagnostic(ctx, id);
    },

    async getCourse(id) {
      return lessons.getCourse(ctx, id);
    },
    async openLesson(id, lessonId) {
      return lessons.openLesson(ctx, id, lessonId);
    },
    async goToSection(id, lessonId, section: SectionId) {
      return lessons.goToSection(ctx, id, lessonId, section);
    },
    async advanceSection(id, lessonId) {
      return lessons.advanceSection(ctx, id, lessonId);
    },
    async selectProblem(id, lessonId, index) {
      return lessons.selectProblem(ctx, id, lessonId, index);
    },
    async submitAnswer(id, lessonId, key, response, elapsedMs) {
      return lessons.submitAnswer(ctx, id, lessonId, key, response, elapsedMs);
    },
    async requestHint(id, lessonId, key) {
      return lessons.requestHint(ctx, id, lessonId, key);
    },
    async revealSolution(id, lessonId, key) {
      return lessons.revealSolution(ctx, id, lessonId, key);
    },
    async nextProblem(id, lessonId) {
      return lessons.nextProblem(ctx, id, lessonId);
    },
    async finishQuiz(id, lessonId) {
      return lessons.finishQuiz(ctx, id, lessonId);
    },
    async startRemediation(id, lessonId) {
      return lessons.startRemediation(ctx, id, lessonId);
    },
    async retakeQuiz(id, lessonId) {
      return lessons.retakeQuiz(ctx, id, lessonId);
    },
    async startTestOut(id, lessonId) {
      return lessons.startTestOut(ctx, id, lessonId);
    },
    async teachMeAgain(id, lessonId, approach) {
      return lessons.teachMeAgain(ctx, id, lessonId, approach);
    },
    async openDay(id, lessonId) {
      return days.openDay(ctx, id, lessonId);
    },
    async startDay(id, lessonId) {
      return days.startDay(ctx, id, lessonId);
    },
    async daySubmit(id, lessonId, key, response, elapsed) {
      return days.daySubmit(ctx, id, lessonId, key, response, elapsed);
    },
    async dayHint(id, lessonId, key) {
      return days.dayHint(ctx, id, lessonId, key);
    },
    async dayReveal(id, lessonId, key) {
      return days.dayReveal(ctx, id, lessonId, key);
    },
    async dayNext(id, lessonId) {
      return days.dayNext(ctx, id, lessonId);
    },
    async daySelect(id, lessonId, index) {
      return days.daySelect(ctx, id, lessonId, index);
    },
    async finishDay(id, lessonId) {
      return days.finishDay(ctx, id, lessonId);
    },
    async retakeDay(id, lessonId) {
      return days.retakeDay(ctx, id, lessonId);
    },
    async heartbeat(id, lessonId, activity, activeSeconds) {
      profiles.requireProfile(ctx, id);
      ctx.db.transaction(() => {
        addStudyTime(ctx, id, lessonId, String(activity).slice(0, 30), Number(activeSeconds) || 0);
        ctx.db.run('UPDATE profiles SET last_active_at = ? WHERE id = ?', [ctx.now(), id]);
      });
    },
    async previewAnswer(input, kind: AnswerKind) {
      return previewAnswer(input, kind);
    },

    async getStudentDashboard(id) {
      return dashboard.getStudentDashboard(ctx, id);
    },
    async getParentDashboard(pin, id) {
      guard(pin);
      return dashboard.getParentDashboard(ctx, id);
    },
    async getWeeklyReport(pin, id, weekStart) {
      guard(pin);
      return dashboard.getWeeklyReport(ctx, id, weekStart);
    },
    async getSkillMastery(id) {
      profiles.requireProfile(ctx, id);
      return dashboard.skillViews(ctx, id);
    },
    async getStandards() {
      return dashboard.getStandards();
    },
    async getAssessmentDetail(pin, id, assessmentId) {
      guard(pin);
      return dashboard.getAssessmentDetail(ctx, id, assessmentId);
    },

    async exportBackup(pin) {
      guard(pin);
      return backup.exportBackup(ctx);
    },
    async inspectBackup(pin, data) {
      guard(pin);
      return backup.inspectBackup(ctx, data);
    },
    async restoreBackup(pin, data) {
      guard(pin);
      return backup.restoreBackup(ctx, data);
    },
  };
}

