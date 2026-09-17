# FORGE ATHLETICS — GitHub Pages Build

Premium mobile-first gym website concept for DivyanshBuilds.

## Run
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

The build outputs `dist/`.

## GitHub Pages
Push to `main`. The included `.github/workflows/deploy.yml` builds the project and publishes `dist/` through GitHub Pages.

Cloudflare is intentionally not the current deployment target. After client approval, the same source can be adapted for the final Cloudflare deployment.

## Customize
Business-specific content is centralized in `data.js`.

## WhatsApp lead form
The contact form validates the required fields and directly redirects to WhatsApp **+91 87659 89913** with a customized message containing every submitted field.

## Demo content
Pricing, statistics, coach profiles and other business details are demo content and should be replaced with verified client information before commercial launch.
