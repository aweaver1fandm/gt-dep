import { buildInfo } from '../../app/buildInfo';
import { useAppStore } from '../../app/store';

export function BrandHeader() {
  const online = useAppStore((state) => state.online);

  return (
    <header className="brand-header">
      <img src={`${import.meta.env.BASE_URL}assets/york-devils-logo.png`} alt="York Devils logo" />
      <div>
        <p className="eyebrow">York Devils</p>
        <h1>Game Tracker</h1>
        <p className="version">Version {buildInfo.version}</p>
      </div>
      <span className={`connection ${online ? 'online' : 'offline'}`}>
        <span aria-hidden="true" className="connection-dot" />
        {online ? 'Online' : 'Ready offline'}
      </span>
    </header>
  );
}
