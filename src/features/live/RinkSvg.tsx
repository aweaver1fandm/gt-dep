import type { MouseEvent } from 'react';
import type { Game } from '../../domain/game';
import { gradeAPolygon, rinkGeometry } from '../../domain/rink';

interface RinkSvgProps {
  game: Game;
  onShot: (x: number, y: number) => void;
}

const VIEW_W = 1000;
const VIEW_H = 500;

function polygonPoints(attackingRight: boolean): string {
  return gradeAPolygon(attackingRight)
    .map((point) => `${point.x * VIEW_W},${point.y * VIEW_H}`)
    .join(' ');
}

export function RinkSvg({ game, onShot }: RinkSvgProps) {
  function handleClick(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    onShot(x, y);
  }

  const circleRadius = rinkGeometry.faceoffRadiusHeight * VIEW_H;
  const centerRadius = rinkGeometry.centerRadiusHeight * VIEW_H;

  return (
    <svg className="rink-svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label="Interactive hockey rink. Tap to record a shot." onClick={handleClick}>
      <rect x="4" y="4" width="992" height="492" rx="62" className="rink-ice" />
      {[0.055, 0.355, 0.5, 0.645, 0.945].map((x) => (
        <line key={x} x1={x * VIEW_W} x2={x * VIEW_W} y1="4" y2="496" className={x === 0.5 ? 'center-line' : x === 0.355 || x === 0.645 ? 'blue-line' : 'goal-line'} />
      ))}
      <circle cx="500" cy="250" r={centerRadius} className="center-circle" />
      {[0.155, 0.845].flatMap((x) => [0.25, 0.75].map((y) => (
        <g key={`${x}-${y}`}>
          <circle cx={x * VIEW_W} cy={y * VIEW_H} r={circleRadius} className="faceoff-circle" />
          <circle cx={x * VIEW_W} cy={y * VIEW_H} r="7" className="faceoff-dot" />
        </g>
      )))}
      {[0.385, 0.615].flatMap((x) => [0.25, 0.75].map((y) => (
        <circle key={`${x}-${y}`} cx={x * VIEW_W} cy={y * VIEW_H} r="6" className="neutral-dot" />
      )))}
      <circle cx="500" cy="250" r="6" className="neutral-dot" />

      <path d="M55 220 L82 220 Q96 220 96 250 Q96 280 82 280 L55 280 Z" className="goal-net" />
      <path d="M945 220 L918 220 Q904 220 904 250 Q904 280 918 280 L945 280 Z" className="goal-net" />
      <path d="M55 220 A40 40 0 0 1 55 280 L82 280 L82 220 Z" className="crease" />
      <path d="M945 220 A40 40 0 0 0 945 280 L918 280 L918 220 Z" className="crease" />

      <polygon points={polygonPoints(false)} className="grade-a-boundary" />
      <polygon points={polygonPoints(true)} className="grade-a-boundary" />

      {game.shots.map((shot) => (
        <g key={shot.id} className={`shot-marker ${shot.team}`}>
          {shot.result === 'goal' ? (
            <text x={shot.location.x * VIEW_W} y={shot.location.y * VIEW_H + 9} textAnchor="middle" className="goal-star">★</text>
          ) : (
            <circle cx={shot.location.x * VIEW_W} cy={shot.location.y * VIEW_H} r="8" />
          )}
        </g>
      ))}
    </svg>
  );
}
