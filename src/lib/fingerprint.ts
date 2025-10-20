import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<string> | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (!fpPromise) {
    fpPromise = (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
    })();
  }
  return fpPromise;
}

export function hasCreatedLamp(): boolean {
  return localStorage.getItem('lampCreated') === 'true';
}

export function markLampCreated(): void {
  localStorage.setItem('lampCreated', 'true');
}
