---
name: github-workflow
description: Skill untuk mengelola workflow GitHub seperti membuat Issue/Kanban task, membuat branch, melakukan commit, dan membuka Pull Request (PR).
---

# GitHub Workflow Skill

Skill ini memberikan petunjuk langkah demi langkah untuk mengelola alur kerja Git dan GitHub CLI (`gh`).

## Alur Kerja Kanban Task & PR

### 1. Membuat GitHub Issue (Kanban Task)
Gunakan `gh issue create` untuk mendaftarkan task baru:
```bash
gh issue create --title "feat: AI Financial Assistant Chat Form" --body "Menambahkan form input chat baru yang terhubung ke SQLite database transaksi untuk analisis keuangan dengan AI Gemini."
```

### 2. Membuat Branch Fitur
Buat branch baru dari `main` sesuai fitur yang dikerjakan:
```bash
git checkout -b feat/ai-financial-chat
```

### 3. Staging & Commit Perubahan
Stage semua berkas yang diubah lalu buat commit terstruktur:
```bash
git add .
git commit -m "feat(ai): add AI Financial Chat screen and SQLite transaction context integration"
```

### 4. Push Branch ke Remote Repository
Push branch baru ke origin GitHub:
```bash
git push -u origin feat/ai-financial-chat
```

### 5. Membuat Pull Request (PR)
Gunakan `gh pr create` untuk membuka Pull Request:
```bash
gh pr create --title "feat: AI Financial Assistant Chat & SQLite Integration" --body "## Deskripsi
Menambahkan halaman AI Chat baru yang memungkinkan pengguna berkonsultasi mengenai kondisi keuangan mereka dengan Gemini AI berdasarkan data transaksi SQLite.

## Perubahan Key
- Menambahkan \`getFinancialSummaryContext()\` di \`dbService.ts\`.
- Menambahkan \`chatWithFinancialAI()\` di \`geminiService.ts\`.
- Menambahkan screen \`AIChatScreen.tsx\` dan pendaftaran tab di \`BottomTabNavigator.tsx\`."
```
