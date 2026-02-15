# Deploy Purplesky to https://<username>.github.io/

To serve the app at the root URL (`https://<username>.github.io/`), follow these steps:

## 1. Create the `<username>.github.io` repository

1. Go to https://github.com/new
2. Repository name: **`<username>.github.io`** (must match your GitHub username exactly)
3. Visibility: Public
4. Create the repository (can be empty)

## 2. Create a fine-grained Personal Access Token

1. Go to https://github.com/settings/tokens?type=beta
2. **Generate new token**
3. Token name: `Artsky Pages Deploy`
4. Expiration: your preference
5. **Repository access**: Select **Only select repositories**, then choose:
   - Your **`<username>.github.io`** repository (the Pages site)
6. **Permissions** → **Repository permissions**:
   - **Contents**: Read and write
7. Generate token and **copy it** (you won't see it again)

## 3. Add the token as a secret

1. Go to your Purplesky repo: **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name: **GH_PAGES_TOKEN**
4. Value: paste the token from step 2

## 4. Trigger a deploy (adds initial content)

GitHub requires content in the repo before Pages can be enabled. Run the deploy to add it:

1. Push to `main` in the Purplesky repo, or go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**
2. Wait for the workflow to complete

This pushes the built app to your **`<username>.github.io`** repo.

## 5. Enable GitHub Pages

1. Go to your **`<username>.github.io`** repo: **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Branch: **main** / **(root)**
4. Save

The app will be available at **`https://<username>.github.io/`**.


# Purplesky Social App

Welcome friends! This is the codebase for the Bluesky Social app.

Get the app itself:

- **Web: [purplesky](https://purpleskyart.github.io)**
- **iOS: [App Store](https://apps.apple.com/us/app/bluesky-social/id6444370199)**
- **Android: [Play Store](https://play.google.com/store/apps/details?id=xyz.blueskyweb.app)**

## Development Resources

This is a [React Native](https://reactnative.dev/) application, written in the TypeScript programming language. It builds on the `atproto` TypeScript packages (like [`@atproto/api`](https://www.npmjs.com/package/@atproto/api)), which are also open source, but in [a different git repository](https://github.com/bluesky-social/atproto).

There is a small amount of Go language source code (in `./bskyweb/`), for a web service that returns the React Native Web application.

The [Build Instructions](./docs/build.md) are a good place to get started with the app itself.

The Authenticated Transfer Protocol ("AT Protocol" or "atproto") is a decentralized social media protocol. You don't *need* to understand AT Protocol to work with this application, but it can help. Learn more at:

- [Overview and Guides](https://atproto.com/guides/overview)
- [GitHub Discussions](https://github.com/bluesky-social/atproto/discussions) 👈 Great place to ask questions
- [Protocol Specifications](https://atproto.com/specs/atp)
- [Blogpost on self-authenticating data structures](https://bsky.social/about/blog/3-6-2022-a-self-authenticating-social-protocol)

The Bluesky Social application encompasses a set of schemas and APIs built in the overall AT Protocol framework. The namespace for these "Lexicons" is `app.bsky.*`.

## Contributions

> [!NOTE]
> While we do accept contributions, we prioritize high quality issues and pull requests. Adhering to the below guidelines will ensure a more timely review.

**Rules:**

- We may not respond to your issue or PR.
- We may close an issue or PR without much feedback.
- We may lock discussions or contributions if our attention is getting DDOSed.
- We're not going to provide support for build issues.

**Guidelines:**

- Check for existing issues before filing a new one please.
- Open an issue and give some time for discussion before submitting a PR.
- Stay away from PRs like...
  - Changing "Post" to "Skeet."
  - Refactoring the codebase, e.g., to replace React Query with Redux Toolkit or something.
  - Adding entirely new features without prior discussion. 

Remember, we serve a wide community of users. Our day-to-day involves us constantly asking "which top priority is our top priority." If you submit well-written PRs that solve problems concisely, that's an awesome contribution. Otherwise, as much as we'd love to accept your ideas and contributions, we really don't have the bandwidth. That's what forking is for!

## Forking guidelines

You have our blessing 🪄✨ to fork this application! However, it's very important to be clear to users when you're giving them a fork.

Please be sure to:

- Change all branding in the repository and UI to clearly differentiate from Bluesky.
- Change any support links (feedback, email, terms of service, etc) to your own systems.
- Replace any analytics or error-collection systems with your own so we don't get super confused.

## Security disclosures

If you discover any security issues, please send an email to security@bsky.app. The email is automatically CC'd to the entire team and we'll respond promptly.

## Are you a developer interested in building on atproto?

Bluesky is an open social network built on the AT Protocol, a flexible technology that will never lock developers out of the ecosystems that they help build. With atproto, third-party integration can be as seamless as first-party through custom feeds, federated services, clients, and more.

## License (MIT)

See [./LICENSE](./LICENSE) for the full license.

Bluesky Social PBC has committed to a software patent non-aggression pledge. For details see [the original announcement](https://bsky.social/about/blog/10-01-2025-patent-pledge).

## P.S.

We ❤️ you and all of the ways you support us. Thank you for making Bluesky a great place!
