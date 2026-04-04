// Generates a flat list of unique apps (id + name) for use in selectors
import { primariaApps, esoApps } from './appList';

export function getAllAppsFlat() {
  const seen = new Set();
  const result = [];

  const extract = (appsConfig) => {
    for (const grade in appsConfig) {
      for (const subject in appsConfig[grade]) {
        for (const app of appsConfig[grade][subject]) {
          if (!seen.has(app.id)) {
            seen.add(app.id);
            result.push({ id: app.id, name: app.name });
          }
        }
      }
    }
  };

  extract(primariaApps);
  extract(esoApps);

  return result.sort((a, b) => a.name.localeCompare(b.name));
}
