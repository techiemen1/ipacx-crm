---
description: Sync project with GitHub (Commit & Push)
---

# GitHub Sync Workflow

This workflow will stage all changes, commit them with a message, and push to the remote repository.

## 1. Check Git Status
View current changes.
```bash
git status
```

## 2. Add All Changes
Stage all modified and new files.
```bash
// turbo
git add .
```

## 3. Commit Changes
Commit with a descriptive message. Replace "Update" with a specific message if running manually.
```bash
git commit -m "Update: Enhance Admin/CRM features and documentation"
```

## 4. Push to Remote
Push changes to the `origin` remote on branch `main`.
*Note: Ensure SSH keys are configured for techiemen1@gmail.com*
```bash
git push origin main
```

## 5. Troubleshooting
If push fails due to "Permission denied (publickey)":
1.  Generate a new SSH key: `ssh-keygen -t ed25519 -C "techiemen1@gmail.com"`
2.  Add it to ssh-agent: `eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519`
3.  Copy key: `cat ~/.ssh/id_ed25519.pub`
4.  Add to GitHub settings > SSH Keys.
