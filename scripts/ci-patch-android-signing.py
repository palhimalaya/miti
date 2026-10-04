#!/usr/bin/env python3
"""Patch Expo-generated android/app/build.gradle to use CI upload keystore."""

from __future__ import annotations

import sys
from pathlib import Path

path = Path("android/app/build.gradle")
if not path.exists():
    raise SystemExit(f"Missing {path} — run expo prebuild first")

text = path.read_text()
if "release.keystore" in text and "MITI_UPLOAD_STORE_PASSWORD" in text:
    print("build.gradle already uses upload keystore")
    sys.exit(0)

old = """    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug"""

new = """    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('release.keystore')
            storePassword System.getenv("MITI_UPLOAD_STORE_PASSWORD") ?: ""
            keyAlias System.getenv("MITI_UPLOAD_KEY_ALIAS") ?: ""
            keyPassword System.getenv("MITI_UPLOAD_KEY_PASSWORD") ?: ""
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release"""

if old not in text:
    raise SystemExit("Could not find Expo default signing block to patch in android/app/build.gradle")

path.write_text(text.replace(old, new, 1))
print("Patched release signing to use upload keystore")
