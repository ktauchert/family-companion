export type GoogleSignInPath = 'unavailable' | 'native';

export function googleSignInPath(runtime: { isExpoGo: boolean }): GoogleSignInPath {
  return runtime.isExpoGo ? 'unavailable' : 'native';
}
