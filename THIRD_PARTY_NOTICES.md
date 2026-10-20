# Third-party notices

## Notion Style

- Upstream: https://github.com/chonnz/obsidian-notion-style
- Upstream repository author: chonnz
- Copyright notice from upstream: Copyright (c) 2026 背过手
- License: MIT, reproduced in `vendor/LICENSE`.

The adapted upstream stylesheet is preserved in `vendor/upstream-theme.css`. Names and implementation identifiers were changed to Shadcn. The build removes blanket `!important` flags and scopes the stylesheet to `body.shadcn-workspace`. Additional palette, sidebar, spacing, and list refinements are in `appearance.css`. The plugin controls whether that body class is present; it does not install or update the upstream theme.

Plugin integration, list functionality, and local customizations are maintained by Clark Lei.

The generated installation ZIP includes the upstream license text in its root `LICENSE` so attribution remains available without the repository's vendor directory.
