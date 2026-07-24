import type { NormalizedPoint } from './types';

export const rinkGeometry = {
  faceoffRadiusHeight: 0.135,
  centerRadiusHeight: 0.155,
  leftGoalLineX: 0.055,
  rightGoalLineX: 0.945,
  leftFaceoffX: 0.155,
  rightFaceoffX: 0.845
} as const;

const HIT_TEST_ASPECT_RATIO = 2;

export function gradeAPolygon(attackingRight: boolean): NormalizedPoint[] {
  const radiusX = rinkGeometry.faceoffRadiusHeight / HIT_TEST_ASPECT_RATIO;
  if (attackingRight) {
    const cx = rinkGeometry.rightFaceoffX;
    const innerX = cx - radiusX;
    return [
      { x: rinkGeometry.rightGoalLineX, y: 0.44 },
      { x: cx, y: 0.25 },
      { x: innerX, y: 0.25 },
      { x: innerX, y: 0.75 },
      { x: cx, y: 0.75 },
      { x: rinkGeometry.rightGoalLineX, y: 0.56 }
    ];
  }

  const cx = rinkGeometry.leftFaceoffX;
  const innerX = cx + radiusX;
  return [
    { x: rinkGeometry.leftGoalLineX, y: 0.44 },
    { x: cx, y: 0.25 },
    { x: innerX, y: 0.25 },
    { x: innerX, y: 0.75 },
    { x: cx, y: 0.75 },
    { x: rinkGeometry.leftGoalLineX, y: 0.56 }
  ];
}

export function isGradeA(point: NormalizedPoint, attackingRight: boolean): boolean {
  const polygon = gradeAPolygon(attackingRight);
  let inside = false;
  let previous = polygon.length - 1;

  polygon.forEach((currentPoint, current) => {
    const previousPoint = polygon[previous];
    const intersects =
      (currentPoint.y > point.y) !== (previousPoint.y > point.y) &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y || 1e-9) +
          currentPoint.x;
    if (intersects) inside = !inside;
    previous = current;
  });

  return inside;
}
