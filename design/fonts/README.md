# Fonts

## Sans — Nunito  (the real brand font)
The app loads **Nunito** via `next/font/google` in `nextapp/src/app/layout.tsx`.
We load the same family from the Google Fonts CDN — it IS the brand font, not a
substitution.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800;1,900&display=swap" rel="stylesheet">
```

Weights that matter: **900 (black) italic** for all display/headings; 700/800 for
labels; 400 for the rare body line.

## Mono — system stack (the real brand mono)
The app uses Tailwind's default `font-mono`, i.e. the OS monospace stack. No
webfont is bundled, by design.

```css
font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
             "Liberation Mono", monospace;
```

If you ever want a pinned mono webfont for parity across machines, **JetBrains
Mono** or **IBM Plex Mono** are the closest matches — but that would be a
substitution; flag it if you make the swap.
