# 🚀 Free Lifetime Hosting on Cloudflare Pages (Zero Cost, No Workers)

This project is architected to run **100% client-side** in the user's web browser using WebAssembly. Because there is no server-side logic, database, or backend required, you can host it **permanently free for lifetime** on **Cloudflare Pages**.

### Why Cloudflare Pages is 100% Free Forever for this App:
* **Unlimited Bandwidth & Requests**: Cloudflare's free tier imposes zero traffic or request charges for static Pages.
* **No Workers Required**: Runs as a pure static single-page application (SPA).
* **Worldwide Edge CDN**: Fast loading times across 300+ global data centers.
* **Free SSL / HTTPS**: Automatic lifetime certificates for your `*.pages.dev` domain or any custom domain.

---

## Deployment Option 1: Drag & Drop (Fastest — 30 Seconds, No Git Needed)

1. Build the production files:
   ```bash
   cd W:\Projects\playstation-retro
   npm run build
   ```
   This creates the self-contained static folder at `W:\Projects\playstation-retro\dist\`.

2. Log in to your free [Cloudflare Dashboard](https://dash.cloudflare.com/).
3. In the left navigation, click **Compute (Workers & Pages)** > **Pages**.
4. Click **Create Application** > **Upload assets**.
5. Give your project a name (e.g. `retro-deck`).
6. Drag and drop the `dist` folder into the upload box.
7. Click **Deploy site**.
8. Done! Your site will be live instantly at `https://<your-project>.pages.dev` with free SSL and global CDN!

---

## Deployment Option 2: Connect via GitHub / GitLab (Automated CI/CD)

1. Push your project to a GitHub repository:
   ```bash
   cd W:\Projects\playstation-retro
   git remote add origin https://github.com/chandranshB/retro-deck.git
   git push -u origin main
   ```

2. On the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** > **Pages** > **Create application** > **Connect to Git**.
3. Select your repository.
4. Set the build settings:
   * **Framework preset**: `Vite`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
   * **Node version**: `20` or higher
5. Click **Save and Deploy**.
6. Every time you push a git commit, Cloudflare Pages will automatically rebuild and deploy your site for free!

---

## Deployment Option 3: Command Line via Wrangler

You can also deploy straight from your terminal with 1 command:
```bash
npm run deploy
```
*Note: The first time you run this, Wrangler will prompt you to authenticate with your free Cloudflare account in your browser.*

---

## Verifying Headers and Security
The repository includes a pre-configured `public/_headers` file:
* Caches assets with `Cache-Control: public, max-age=31536000, immutable` for lightning-fast loads.
* Sets proper CORS and referrer policies so the EmulatorJS WebAssembly cores load smoothly without cross-origin blocks.
