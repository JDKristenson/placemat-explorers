# Security and privacy

This app intentionally avoids child profiles, accounts, keys and persistent storage. Weather requests are the only optional external requests. Inputs are rendered as text, not HTML.

Do not publish personal details, live credentials, private output, or sensitive examples in an issue. Use a minimal synthetic reproduction. If GitHub private vulnerability reporting is available on this repository, use it for sensitive reports. Otherwise report only a high-level description without exploit details or private data and ask the maintainer for a private channel.

If you accidentally expose a credential, revoke or rotate it promptly. Deleting it from the latest file does not remove it from repository history or copies.

For public releases, inspect the exact staged file list, run the public audit and a separate secret scanner, review the complete git history, and inspect any new assets and metadata. `.gitignore` alone does not protect already-tracked files.
