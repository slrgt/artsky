# Deploy Artsky to https://<username>.github.io/

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

1. Go to your Artsky repo: **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name: **GH_PAGES_TOKEN**
4. Value: paste the token from step 2

## 4. Enable GitHub Pages on your user site repo

1. Go to your **`<username>.github.io`** repo: **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Branch: **main** / **(root)**
4. Save

## 5. Configure the workflow

Update `.github/workflows/deploy-pages.yml` and set `external_repository` to your Pages repo (e.g. `yourname/yourname.github.io`).

## 6. Trigger a deploy

Push to `main` in the Artsky repo, or go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

The app will be available at **`https://<username>.github.io/`**.
