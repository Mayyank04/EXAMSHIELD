# ExamShield Production Deployment & Verification

ExamShield is structured as a fullstack TypeScript application using Node.js, Express, Vite, React, and Three.js.

---

## 1. Quick Start (Local Development)

### Prerequisites
- Node.js version 18.0.0 or higher
- npm version 9.0.0 or higher

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Start fullstack server (Express + Vite Dev Server on Port 3000)
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 2. Production Build & Execution

```bash
# 1. Run full typecheck across all components
npm run lint

# 2. Build production assets (Vite client bundle & esbuild server bundle)
npm run build

# 3. Start production server
npm start
```

---

## 3. Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
