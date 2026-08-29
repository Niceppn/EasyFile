# EasyFile VPS Deployment Guide

This guide walks you through deploying **EasyFile Target-Size PDF Compressor** onto your self-hosted VPS using Docker and Nginx.

---

## Prerequisites on VPS
- **Docker & Docker Compose** installed (`docker -v`, `docker compose version`)
- **Nginx** installed (`sudo apt install nginx`)
- Domain pointing to your VPS IP address (A Record)

---

## Option A: Deploy via Docker (Recommended)

1. **Clone or Transfer your project repository to VPS**:
   ```bash
   git clone <your-repo-url> /var/www/easyfile
   cd /var/www/easyfile
   ```

2. **Build and Run container in background**:
   ```bash
   docker compose up -d --build
   ```

3. **Verify running status**:
   ```bash
   docker compose ps
   curl http://localhost:3000
   ```

---

## Option B: Configure Nginx & SSL (Certbot)

1. **Copy Nginx configuration**:
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/easyfile
   ```

2. **Edit domain name**:
   Replace `your-domain.com` with your actual domain in `/etc/nginx/sites-available/easyfile`.

3. **Enable site & restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/easyfile /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Obtain Free SSL Certificate (Certbot)**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

Done! Your PDF Compressor is now live on your VPS with full SSL encryption and peak performance.
