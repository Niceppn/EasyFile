# 🚀 EasyFile Deployment Guide (Docker & Docker Compose)

This guide provides simple instructions for deploying the **EasyFile** utility suite on any VPS, cloud server, or container environment (AWS, DigitalOcean, Hetzner, Linode, Vercel, Railway, Render, etc.).

---

## 🐳 Option 1: Deploy with Docker Compose (Recommended - 1 Click)

1. **Clone or Copy project files to your server**.
2. **Run Docker Compose**:
   ```bash
   docker-compose up -d --build
   ```
3. **Verify Deployment**:
   Open `http://your-server-ip:3000` in your browser.

---

## 📦 Option 2: Manual Docker Commands

1. **Build Docker Image**:
   ```bash
   docker build -t easyfile-app .
   ```

2. **Run Docker Container**:
   ```bash
   docker run -d \
     --name easyfile \
     -p 3000:3000 \
     -e CONTACT_ADMIN_EMAIL=pphutana01@gmail.com \
     -e RESEND_API_KEY=YOUR_RESEND_API_KEY \
     -e ADMIN_PASSWORD=easyfile2026 \
     -v easyfile-data:/app/.data \
     --restart always \
     easyfile-app
   ```

---

## 🔐 Environment Variables

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `CONTACT_ADMIN_EMAIL` | Recipient email for ad inquiries & health checks | `pphutana01@gmail.com` |
| `RESEND_API_KEY` | Resend API key for real-time email dispatch | `YOUR_RESEND_API_KEY` |
| `ADMIN_PASSWORD` | Password gate for secret admin portal | `easyfile2026` |
| `PORT` | Container HTTP listen port | `3000` |

---

## 🛡️ Admin Portal & Security Path
- Secret Admin Portal: `http://your-server-ip:3000/easy-admin-portal-998`
- Default Admin Password: `easyfile2026`
