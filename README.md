# WareHouse-Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Github

## Github Commands for Collaborators

### First Time Setup
```bash
# Clone the repository
git clone https://github.com/edwardsean/WareHouse-Project.git
cd warehousedb

# Create and switch to your feature branch
git checkout -b <your-branch-name>
```

### Daily Workflow
```bash
# Get latest changes from remote
git fetch origin

# Pull latest changes from main
git pull origin main

# Check working tree status (modified files, staged changes)
git status

# List all local branches (* shows current branch)
git branch

# Switch to your feature branch
git checkout <your-branch-name>

# Stage and commit changes
git add .
git commit -m "Your commit message"

# Push changes to your branch
git push origin <your-branch-name>
```

### Common Scenarios
```bash
# Switch between branches
git checkout branch-name

# Discard local changes in a file
git checkout -- filename

# Merge main into your branch
git checkout your-branch-name
git pull origin main

# Create a new branch
git checkout -b new-branch-name

# View commit history
git log --oneline
```

### Pull Request Workflow
1. Push your changes to your branch
2. Go to GitHub repository
3. Click "Pull requests"
4. Click "New pull request"
5. Select base:main and compare:your-branch
6. Add description and create pull request

### Resolving Conflicts
```bash
# If you encounter merge conflicts
git pull origin main
# Fix conflicts in VS Code
git add .
git commit -m "Resolve merge conflicts"
git push origin your-branch-name
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
