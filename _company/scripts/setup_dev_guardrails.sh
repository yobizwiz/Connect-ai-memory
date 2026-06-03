#!/bin/bash
# @description Yobizwiz Global Architecture Guardrail Setup Script (Codari Mandate)
# This script must be run before any major feature development or refactoring cycle begins.

echo "========================================================"
echo "🚨 [CODEGUARD]: System Integrity Check Starting..."
echo "--------------------------------------------------------"

# 1. ARCHITECTURE MANDATE CHECK: Check if the core rules are present.
if [ ! -f "ARCHITECTURE.md" ]; then
    echo "❌ ERROR: Missing 'ARCHITECTURE.md'. Cannot proceed with development." >&2
    exit 1
fi

# 2. DEPRECATED HARD GUARD ACTIVATION
DEPRECATED_DIR="./deprecated"
if [ -d "$DEPRECATED_DIR" ]; then
    echo "⚠️ WARNING: Found '$DEPRECATED_DIR' directory."
    read -r -p "Are you absolutely sure you need to proceed despite the Hard Guard on deprecated code? (y/N): " CONFIRMATION
    if [[ "$CONFIRMATION" != [Aa] ]]; then
        echo "🛑 TERMINATING: Access to deprecated modules is strictly forbidden by architecture mandate." >&2
        exit 1
    fi
else
    echo "✅ Guardrail Check: No 'deprecated' folder found. Proceeding normally."
fi

# 3. E2E COMPLETION HOOK DEFINITION (Reminder)
echo ""
echo "========================================================"
echo "💡 Remember the Final Gate Protocol:"
echo "--------------------------------------------------------"
echo "When ALL feature development is complete, you MUST execute:"
echo "python _shared/auto_healer.py --fix"
echo "Failure to run this command invalidates all changes."
echo "========================================================"

exit 0