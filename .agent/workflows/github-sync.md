---
description: Sync project with GitHub (Commit & Push)
---

# GitHub Sync Workflow

This workflow will stage all changes, commit them with a message, and push to the remote repository.

## Prerequisites
1.  **Create Repository**: Log in to GitHub and create a new repository/project named `oviyam-reporting`. Do not initialize with README/gitignore.
2.  **Ensure SSH Access**: Run `ssh -T git@github.com` to verify.

## 1. Check Git Status
View current changes.
```bash
git status
```

## 2. Add Remote (One Time)
If you haven't linked the project yet:
```bash
// turbo
git remote add origin git@github.com:techiemen1/ipacx-crm.git
```

## 3. Add All Changes
Stage all modified and new files.
```bash
// turbo
git add .
```

## 4. Commit Changes
Commit with a descriptive message.
```bash
git commit -m "Update: Enhance Admin/CRM features and documentation"
```

## 5. Push to Remote
Push changes to the `origin` remote on branch `main`.
```bash
git push -u origin main
```

## 5. Troubleshooting
If push fails due to "Permission denied (publickey)":
1.  Generate a new SSH key: `ssh-keygen -t ed25519 -C "techiemen1@gmail.com"`
2.  Add it to ssh-agent: `eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519`
3.  Copy key: `cat ~/.ssh/id_ed25519.pub`
4.  Add to GitHub settings > SSH Keys.
