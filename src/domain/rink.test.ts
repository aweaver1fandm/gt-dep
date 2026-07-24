import { describe, expect, it } from 'vitest';
import { gradeAPolygon, isGradeA } from './rink';

describe('Grade A geometry', () => {
  it('matches the Version 1 six-point polygon', () => {
    expect(gradeAPolygon(false)).toHaveLength(6);
    expect(gradeAPolygon(true)).toHaveLength(6);
  });

  it('classifies the centers near each net as Grade A', () => {
    expect(isGradeA({ x: 0.1, y: 0.5 }, false)).toBe(true);
    expect(isGradeA({ x: 0.9, y: 0.5 }, true)).toBe(true);
  });

  it('does not classify center ice as Grade A', () => {
    expect(isGradeA({ x: 0.5, y: 0.5 }, true)).toBe(false);
  });
});
