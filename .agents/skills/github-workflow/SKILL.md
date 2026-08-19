---
name: github-workflow
description: Skill untuk mengelola workflow GitHub seperti membuat Issue/Kanban task dengan Deskripsi dan Action Items lengkap, membuat branch, melakukan commit, dan membuka Pull Request (PR).
---

# GitHub Workflow Skill

Skill ini memberikan petunjuk langkah demi langkah untuk mengelola alur kerja Git dan GitHub CLI (`gh`). Setiap Task (Issue) WAJIB menyertakan **Description** dan **Action Items (Checklist)**.

## Format Standar GitHub Issue (Kanban Task)

Setiap pembuatan task baru harus menyertakan template body yang memiliki bagian **Deskripsi** dan **Action Items**:

```markdown
## Description
[Penjelasan singkat mengenai latar belakang, fitur, atau masalah yang perlu diselesaikan]

## Action Items
- [ ] [Langkah 1: Implementasi/perubahan]
- [ ] [Langkah 2: Integrasi/service]
- [ ] [Langkah 3: Tampilan UI/Screen]
- [ ] [Langkah 4: Testing & Verifikasi]
```

---

## Alur Kerja Langkah Demi Langkah

### 1. Membuat GitHub Issue (Kanban Task dengan Description & Action Items)
```bash
gh issue create --title "feat: AI Financial Assistant Chat Form" --body "## Description
Menambahkan form input chat baru yang terhubung ke SQLite database transaksi untuk analisis kondisi keuangan pengguna menggunakan Gemini AI.

## Action Items
- [x] Buat fungsi agregasi data ringkasan keuangan di dbService.ts
- [x] Buat fungsi chatWithFinancialAI di geminiService.ts
- [x] Buat antarmuka UI AIChatScreen.tsx dengan form input dan bubble chat
- [x] Daftarkan tab AI Chat pada BottomTabNavigator.tsx
- [x] Tambahkan kunci terjemahan i18n Bahasa Indonesia & Inggris
- [x] Jalankan type-check untuk verifikasi TypeScript"
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
Gunakan `gh pr create` untuk membuka Pull Request dan menghubungkannya dengan Issue (`Closes #ID`):
```bash
gh pr create --title "feat: AI Financial Assistant Chat & SQLite Integration" --body "## Description
Menambahkan halaman AI Chat baru yang memungkinkan pengguna berkonsultasi mengenai kondisi keuangan mereka dengan Gemini AI berdasarkan data transaksi SQLite.

Closes #[ISSUE_NUMBER]

## Action Items Completed
- [x] Agregasi data transaksi SQLite (\`getFinancialSummaryContext\`)
- [x] Integrasi Gemini API Chat (\`chatWithFinancialAI\`)
- [x] Tampilan \`AIChatScreen.tsx\` & Tab Navigation
- [x] Terjemahan i18n (ID & EN)"
```
