export interface BuildInfo {
  version: string;
  buildTime: string;
  commit: string;
  buildNumber: string;
}

export const buildInfo: BuildInfo = {
  version: __APP_VERSION__,
  buildTime: __BUILD_TIME__,
  commit: __COMMIT_SHA__,
  buildNumber: __BUILD_NUMBER__
};

export function formatBuildTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}
