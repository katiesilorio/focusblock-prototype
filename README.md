# focusblock-prototype

Build a desktop web app called FocusBlock. It is a clickable prototype of an AI attention layer for teams that work asynchronously: it pulls a person's messages, emails, tickets, and document comments from the tools they already use, groups them into the projects the person is working on (called Blocks), decides which ones actually need the person's attention, and lets the person work through them in timed focus sessions. There is no login, no real AI, no real integration, and no persistence between visits except one flag that remembers the onboarding tour was seen. Every AI result is dummy data written into the app. Every action is simulated.

Name the project exactly focusblock-prototype.

Design: minimal and calm, built for someone who is trying to concentrate. Mostly white space, a near-black text color, a muted grey for secondary text, one accent color used sparingly for the selected Block, the primary button, and the timer, a clean geometric sans typeface, line icons rather than emoji. Three urgency colors only, used for small flags, never for whole cards. Rounded cards and soft shadows only where a card helps. No dashboard clutter, no charts, no marketing copy. Never use an em dash anywhere in the app. Use a period, a comma, or a spaced hyphen instead.

Desktop only. On any viewport narrower than 1000 pixels, do not render the app; render a single centered card that says FocusBlock is optimized for desktop and mobile is coming soon.

Two persistent elements appear on every app screen. First, a thin banner across the top that tells the user this is a prototype with simulated data and simulated integrations, linking to the About page. Second, a footer with "FocusBlock prototype. Nothing here is real." on the left and "About FocusBlock" on the right.

The app has four areas, reached from a small top navigation: Focus (the main interface and the home screen), Blocks (block configuration), Integrations, and About. Plus a first-visit onboarding tour laid over the Focus screen. The screen blocks below describe each. Do not add screens beyond these.

Dummy data lives in one place in the code so it is easy to change later.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5f33e3b0-dc2d-455e-b6ed-c89dba8d7d49).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
