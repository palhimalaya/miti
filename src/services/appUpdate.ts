import Constants from 'expo-constants'
import * as Application from 'expo-application'
import { getJsonSetting, saveJsonSetting } from '@/src/db/repositories/settings'
import { isVersionNewer } from '@/src/services/versionCompare'

export { isVersionNewer, parseVersion } from '@/src/services/versionCompare'

export type AppUpdateInfo = {
  available: boolean
  currentVersion: string
  latestVersion: string
  releaseUrl: string
  downloadUrl: string | null
  releaseNotes: string | null
  tagName: string
}

type GithubRelease = {
  tag_name: string
  html_url: string
  body: string | null
  draft?: boolean
  prerelease?: boolean
  assets?: Array<{
    name: string
    browser_download_url: string
    content_type?: string
  }>
}

const DISMISSED_KEY = 'update_dismissed_version'

function githubRepo(): string | null {
  const extra = Constants.expoConfig?.extra as { githubRepo?: string } | undefined
  const repo = extra?.githubRepo?.trim()
  return repo && repo.includes('/') ? repo : null
}

export function getInstalledVersion(): string {
  return (
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    '0.0.0'
  )
}

function pickApkUrl(release: GithubRelease): string | null {
  const apk = release.assets?.find((asset) => asset.name.toLowerCase().endsWith('.apk'))
  return apk?.browser_download_url ?? null
}

/**
 * Best-effort check against GitHub Releases latest.
 * Fails soft (returns available:false) when offline / misconfigured / rate-limited.
 */
export async function checkForAppUpdate(): Promise<AppUpdateInfo> {
  const currentVersion = getInstalledVersion()
  const empty: AppUpdateInfo = {
    available: false,
    currentVersion,
    latestVersion: currentVersion,
    releaseUrl: '',
    downloadUrl: null,
    releaseNotes: null,
    tagName: '',
  }

  const repo = githubRepo()
  if (!repo) return empty

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'miti-android-update-check',
      },
    })
    if (!response.ok) return empty

    const release = (await response.json()) as GithubRelease
    if (!release?.tag_name || release.draft || release.prerelease) return empty

    const latestVersion = release.tag_name.replace(/^v/i, '')
    const available = isVersionNewer(latestVersion, currentVersion)

    return {
      available,
      currentVersion,
      latestVersion,
      releaseUrl: release.html_url,
      downloadUrl: pickApkUrl(release),
      releaseNotes: release.body,
      tagName: release.tag_name,
    }
  } catch {
    return empty
  }
}

export async function getDismissedUpdateVersion(): Promise<string | null> {
  return getJsonSetting<string | null>(DISMISSED_KEY, null)
}

export async function dismissUpdateVersion(version: string): Promise<void> {
  await saveJsonSetting(DISMISSED_KEY, version)
}
