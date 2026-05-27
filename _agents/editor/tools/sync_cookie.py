#!/usr/bin/env python3
import os

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.abspath(os.path.join(HERE, "..", "config.md"))
ENV_PATH = os.path.abspath(os.path.join(HERE, "..", "..", "..", "suno-api", ".env"))

def main():
    print(f"Reading configuration from: {CONFIG_PATH}")
    if not os.path.exists(CONFIG_PATH):
        print(f"❌ Configuration file not found: {CONFIG_PATH}")
        return

    suno_cookie = None
    suno_session = None
    suno_client = None
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        for line in f.readlines():
            if "=" in line:
                if "SUNO_COOKIE" in line:
                    parts = line.split("=", 1)
                    suno_cookie = parts[1].strip().strip('"').strip("'")
                elif "SUNO_SESSION" in line:
                    parts = line.split("=", 1)
                    suno_session = parts[1].strip().strip('"').strip("'")
                elif "SUNO_CLIENT" in line:
                    parts = line.split("=", 1)
                    suno_client = parts[1].strip().strip('"').strip("'")

    if not suno_cookie:
        if suno_session and suno_client:
            suno_cookie = f"__session={suno_session}; __client={suno_client}"
        elif suno_session:
            suno_cookie = f"__session={suno_session}"

    if not suno_cookie:
        print("❌ SUNO_COOKIE, SUNO_SESSION, or SUNO_CLIENT not found in config.md")
        return

    print(f"Loaded Suno cookie (length: {len(suno_cookie)})")
    
    # Read existing env
    env_lines = []
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            env_lines = f.readlines()

    # Update or insert SUNO_COOKIE
    updated = False
    new_env_lines = []
    for line in env_lines:
        if line.strip().startswith("SUNO_COOKIE="):
            new_env_lines.append(f'SUNO_COOKIE="{suno_cookie}"\n')
            updated = True
        else:
            new_env_lines.append(line)

    if not updated:
        new_env_lines.append(f'SUNO_COOKIE="{suno_cookie}"\n')

    with open(ENV_PATH, "w", encoding="utf-8") as f:
        f.writelines(new_env_lines)

    print(f"✅ Successfully synchronized cookies to suno-api/.env!")

if __name__ == "__main__":
    main()
