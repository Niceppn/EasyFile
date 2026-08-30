# 🚀 Qubezip Deployment Guide (Docker & Docker Compose)

This guide provides simple instructions for deploying the **Qubezip** utility suite on any VPS, cloud server, or container environment (AWS, DigitalOcean, Hetzner, Linode, Vercel, Railway, Render, etc.).

---

## 🐳 Option 1: Deploy with Docker Compose (Recommended - 1 Click)

1. **Clone or Copy project files to your server**.
2. **Run Docker Compose**:
   ```bash
   docker compose up -d --build
   ```
3. **Verify Deployment**:
   Open `https://qubezip.online` in your browser.

---

## 📦 Option 2: Manual Docker Commands

1. **Build Docker Image**:
   ```bash
   docker build -t qubezip-app .
   ```

2. **Run Docker Container**:
   ```bash
   docker run -d \
     --name qubezip-app \
     -p 3000:3000 \
     -e CONTACT_ADMIN_EMAIL=pphutana01@gmail.com \
     -e RESEND_API_KEY=YOUR_RESEND_API_KEY \
     -e ADMIN_PASSWORD=qubezip2026 \
     -v qubezip-data:/app/.data \
     --restart always \
     qubezip-app
   ```

---

## 🔐 Environment Variables

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `CONTACT_ADMIN_EMAIL` | Recipient email for ad inquiries & health checks | `pphutana01@gmail.com` |
| `RESEND_API_KEY` | Resend API key for real-time email dispatch | `YOUR_RESEND_API_KEY` |
| `ADMIN_PASSWORD` | Password gate for secret admin portal | `qubezip2026` |
| `PORT` | Container HTTP listen port | `3000` |

---

## 🛡️ Admin Portal & Security Path
- Secret Admin Portal: `https://qubezip.online/qube-admin-portal-998`
- Default Admin Password: `qubezip2026`
