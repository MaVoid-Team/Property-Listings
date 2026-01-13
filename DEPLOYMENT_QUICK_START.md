# 🚀 Quick Deployment Guide

## TL;DR - Deploy Everything in 10 Minutes

### Step 1: Deploy Backend (Choose One)

#### Option A: Railway (Easiest) ⭐ Recommended
1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. New Project → Deploy from GitHub → Select `backend` folder
3. Add Variables:
   - `RAILS_MASTER_KEY` = (copy from `backend/config/master.key`)
   - `FRONTEND_URL` = (your Vercel URL, set after frontend deploy)
4. Railway auto-detects Rails and PostgreSQL
5. Copy your backend URL (e.g., `https://xxx.railway.app`)

#### Option B: Render (Free Tier)
1. Go to [render.com](https://render.com) → Sign up
2. New → Web Service → Connect GitHub → Select `backend` folder
3. New → PostgreSQL → Create database
4. In Web Service → Environment:
   - `RAILS_MASTER_KEY` = (from `backend/config/master.key`)
   - `DATABASE_URL` = (from PostgreSQL service)
   - `FRONTEND_URL` = (set after frontend deploy)
5. Copy your backend URL

### Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up
2. Add New Project → Import GitHub repo
3. **Important**: Set Root Directory to `Frontend`
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = (your backend URL from Step 1)
5. Deploy!
6. Copy your frontend URL

### Step 3: Connect Them

1. **Update Backend CORS**:
   - Go to your backend hosting platform
   - Add/Update environment variable:
     - `FRONTEND_URL` = (your Vercel URL)
   - Restart the backend service

2. **Test**:
   - Visit your Vercel URL
   - Check browser console for errors
   - Try logging in as admin

## ✅ Done!

Your full-stack app is now live:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app` (or render.com)

---

## 📋 Environment Variables Checklist

### Backend (Railway/Render)
- [ ] `RAILS_ENV=production`
- [ ] `RAILS_MASTER_KEY` (from `backend/config/master.key`)
- [ ] `DATABASE_URL` (auto-provided)
- [ ] `FRONTEND_URL` (your Vercel URL)

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` (your backend URL)

---

## 🆘 Troubleshooting

**Backend won't start?**
- Check `RAILS_MASTER_KEY` is set correctly
- Verify database is connected
- Check logs in Railway/Render dashboard

**Frontend shows 404?**
- Verify Root Directory is set to `Frontend` in Vercel
- Check `vercel.json` exists in root

**CORS errors?**
- Set `FRONTEND_URL` in backend environment variables
- Restart backend service

**API calls failing?**
- Verify `NEXT_PUBLIC_API_URL` matches your backend URL
- Check backend is running (visit backend URL in browser)
- Test: `curl https://your-backend.railway.app/api/v1/categories`

---

## 📚 Detailed Guides

- **Full Stack Deployment**: See `FULL_STACK_DEPLOYMENT.md`
- **Vercel Only**: See `Frontend/VERCEL_DEPLOYMENT.md`
- **GitHub Pages**: See `Frontend/GITHUB_PAGES_DEPLOYMENT.md`

---

## 💰 Cost Estimate

**Recommended Setup**:
- Railway (Backend): $5/month (or free trial)
- Vercel (Frontend): Free
- **Total: $5/month** (or free with trials)

**Free Alternative**:
- Render (Backend): Free tier
- Vercel (Frontend): Free
- **Total: $0/month** (with limitations)

