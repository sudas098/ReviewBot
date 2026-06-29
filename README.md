<div align="center">
  <img width="1200" height="475" alt="ReviewBot Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🤖 ReviewBot

> A code review tool built with TypeScript — by **sudas098**

---

## 🔍 What is ReviewBot?

ReviewBot is a tool I built that analyzes your code and tells you exactly what's wrong and what's right.

It checks for:

- 🐛 **Logical Bugs** — unused variables, dead code, bad assignments
- 🔐 **Security Issues** — hardcoded secrets, missing input validation
- ⚡ **Performance Problems** — redundant logic, memory waste
- ✅ **Good code** — it also tells you what you got right

Just paste your code, hit **Review My Code**, and get detailed feedback with the exact line, the issue, and how to fix it.

---

## 🚀 Live

👉 **[https://reviewbot-bsby.onrender.com/](https://reviewbot-bsby.onrender.com/)**

---

## 🛠️ Built With

- **TypeScript** — main language
- **Node.js + Express** — backend
- **Vite** — frontend build

---

## 🏃 Run Locally

**Prerequisites:** Node.js

1. Clone the repo:
```bash
   git clone https://github.com/sudas098/ReviewBot.git
   cd ReviewBot
```

2. Install dependencies:
```bash
   npm install
```

3. Add your API key to `.env.local`:
