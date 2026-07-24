import { type FormEvent, useMemo, useState } from 'react';
import { createGame } from '../../domain/game';
import { saveGame } from '../../storage/gameRepository';
import { useAppStore } from '../../app/store';
import { BrandHeader } from './BrandHeader';

type GoalieChoice = 'Anthony' | 'Mason' | 'Other';

function localDateValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function GameSetupPage() {
  const showHome = useAppStore((state) => state.showHome);
  const showLiveGame = useAppStore((state) => state.showLiveGame);
  const [opponent, setOpponent] = useState('');
  const [gameDate, setGameDate] = useState(localDateValue);
  const [periodMinutes, setPeriodMinutes] = useState(17);
  const [goalieChoice, setGoalieChoice] = useState<GoalieChoice>('Anthony');
  const [otherGoalie, setOtherGoalie] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const goalieName = goalieChoice === 'Other' ? otherGoalie.trim() : goalieChoice;
  const errors = useMemo(() => ({
    opponent: opponent.trim() ? '' : 'Enter the opponent team name.',
    gameDate: gameDate ? '' : 'Select the game date.',
    periodMinutes: periodMinutes >= 1 && periodMinutes <= 60 ? '' : 'Period length must be between 1 and 60 minutes.',
    goalie: goalieName ? '' : 'Enter the starting goalie name.'
  }), [gameDate, goalieName, opponent, periodMinutes]);

  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setSaveError('');
    if (hasErrors) return;

    setSaving(true);
    try {
      const game = createGame({
        gameDate,
        opponent: opponent.trim(),
        initialGoalie: goalieName,
        periodLengthSeconds: periodMinutes * 60
      });
      const saved = await saveGame(game);
      showLiveGame(saved.id);
    } catch (error) {
      console.error(error);
      setSaveError('The game could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="setup-shell">
      <BrandHeader />

      <section className="setup-card" aria-labelledby="setup-heading">
        <div className="setup-title-row">
          <span className="section-icon" aria-hidden="true">▣</span>
          <div>
            <h2 id="setup-heading">Game Setup</h2>
            <p>Enter the details to create a new game.</p>
          </div>
          <button type="button" className="text-button" onClick={showHome}>Back</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <span className="field-icon" aria-hidden="true">♟</span>
            <label htmlFor="opponent">Opponent Team <b>*</b></label>
            <div className="field-control">
              <input
                id="opponent"
                value={opponent}
                onChange={(event) => setOpponent(event.target.value)}
                placeholder="Enter opponent team name"
                autoComplete="organization"
                aria-invalid={submitted && Boolean(errors.opponent)}
                aria-describedby="opponent-help opponent-error"
              />
              <small id="opponent-help">Example: Hershey Bears</small>
              {submitted && errors.opponent && <small id="opponent-error" className="error-text">{errors.opponent}</small>}
            </div>
          </div>

          <div className="form-row">
            <span className="field-icon" aria-hidden="true">▦</span>
            <label htmlFor="game-date">Game Date <b>*</b></label>
            <div className="field-control">
              <input
                id="game-date"
                type="date"
                value={gameDate}
                onChange={(event) => setGameDate(event.target.value)}
                aria-invalid={submitted && Boolean(errors.gameDate)}
                aria-describedby="date-help date-error"
              />
              <small id="date-help">Select the date of the game</small>
              {submitted && errors.gameDate && <small id="date-error" className="error-text">{errors.gameDate}</small>}
            </div>
          </div>

          <div className="form-row">
            <span className="field-icon" aria-hidden="true">◷</span>
            <label htmlFor="period-length">Regulation Period Length <b>*</b></label>
            <div className="field-control compact-control">
              <div className="number-with-unit">
                <input
                  id="period-length"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="60"
                  value={periodMinutes}
                  onChange={(event) => setPeriodMinutes(Number(event.target.value))}
                  aria-invalid={submitted && Boolean(errors.periodMinutes)}
                  aria-describedby="period-help period-error"
                />
                <span>minutes</span>
              </div>
              <small id="period-help">Default is 17 minutes</small>
              {submitted && errors.periodMinutes && <small id="period-error" className="error-text">{errors.periodMinutes}</small>}
            </div>
          </div>

          <fieldset className="goalie-row">
            <legend><span className="field-icon" aria-hidden="true">◉</span> Starting Goalie <b>*</b></legend>
            <div className="goalie-options">
              {(['Anthony', 'Mason', 'Other'] as const).map((choice) => (
                <label key={choice} className={`goalie-option ${goalieChoice === choice ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="goalie"
                    value={choice}
                    checked={goalieChoice === choice}
                    onChange={() => setGoalieChoice(choice)}
                  />
                  <span aria-hidden="true">{choice === 'Other' ? '◉' : '♙'}</span>
                  <strong>{choice}</strong>
                </label>
              ))}
            </div>
          </fieldset>

          {goalieChoice === 'Other' && (
            <div className="form-row goalie-name-row">
              <span className="field-icon" aria-hidden="true">◉</span>
              <label htmlFor="goalie-name">Goalie Name <b>*</b></label>
              <div className="field-control">
                <input
                  id="goalie-name"
                  value={otherGoalie}
                  onChange={(event) => setOtherGoalie(event.target.value)}
                  placeholder="Enter starting goalie name"
                  autoComplete="name"
                  aria-invalid={submitted && Boolean(errors.goalie)}
                  aria-describedby="goalie-help goalie-error"
                />
                <small id="goalie-help">Enter the name of the starting goalie</small>
                {submitted && errors.goalie && <small id="goalie-error" className="error-text">{errors.goalie}</small>}
              </div>
            </div>
          )}

          {saveError && <p className="form-save-error" role="alert">{saveError}</p>}

          <button type="submit" className="start-game-button" disabled={saving}>
            <span aria-hidden="true">▶</span> {saving ? 'Saving Game…' : 'Start Game'}
          </button>
          <p className="autosave-note"><span aria-hidden="true">▢</span> A new game will be created and saved automatically.</p>
        </form>
      </section>
    </main>
  );
}
