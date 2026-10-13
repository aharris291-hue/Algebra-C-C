/**
 * The one notion of "done" for progress (current unit and week, semester %, Coming up, milestones,
 * pace, the course map, the student and parent views): a course day is done when it is completed or
 * tested out, or when it is an optional unit review (every lesson of the unit done and every reviewed
 * skill Proficient or better), which the student may skip. Used by the main process and the renderer
 * so the student and parent numbers always agree.
 */
import type { LessonStatus } from './api';

export function isDoneForProgress(c: { status: LessonStatus; optional?: boolean }): boolean {
  return c.status === 'completed' || c.status === 'tested_out' || c.optional === true;
}
