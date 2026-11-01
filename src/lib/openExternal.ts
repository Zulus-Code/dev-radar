import { openUrl } from '@tauri-apps/plugin-opener'

/**
 * Opens a URL in the user's default browser.
 * Inside the Tauri webview the opener plugin hands the URL to the OS;
 * in a regular browser tab we fall back to `window.open`.
 */
export function openExternal(url: string): void {
  if ('__TAURI_INTERNALS__' in window) {
    void openUrl(url)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
