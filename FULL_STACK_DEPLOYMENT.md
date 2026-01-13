# Full Stack Deployment Guide

This guide will help you deploy both the **Rails backend** and **Next.js frontend** together.

## Architecture Overview

- **Backend (Rails API)**: Deploy on Railway, Render, or Heroku
- **Frontend (Next.js)**: Deploy on Vercel
- **Database**: PostgreSQL (provided by hosting platform or separate service)

## Option 1: Railway (Recommended - Easiest)

Railway supports both Rails and provides PostgreSQL, making it the simplest option.

### Backend Deployment on Railway

1. **Sign up/Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder as the root

3. **Configure Environment Variables**
   In Railway → Variables, add:
   ```
   RAILS_ENV=production
   RAILS_MASTER_KEY=<your-master-key-from-backend/config/master.key>
   DATABASE_URL=<auto-provided-by-railway>
   ```

4. **Set Build Command** (if needed)
   Railway should auto-detect Rails, but you can set:
   - Build Command: `bundle install && rails db:migrate`
   - Start Command: `bin/rails server -b 0.0.0.0 -p $PORT`

5. **Deploy**
   - Railway will automatically deploy
   - Note the generated URL (e.g., `https://your-app.railway.app`)

6. **Run Migrations**
   - Go to Railway → Deployments → View Logs
   - Or use Railway CLI: `railway run rails db:migrate`

### Frontend Deployment on Vercel

1. **Deploy Frontend** (follow VERCEL_DEPLOYMENT.md)
2. **Set Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

---

## Option 2: Render (Free Tier Available)

### Backend Deployment on Render

1. **Sign up/Login to Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder

3. **Configure Service**
   - **Name**: `property-listing-backend`
   - **Environment**: `Ruby`
   - **Build Command**: `bundle install && bundle exec rails db:migrate`
   - **Start Command**: `bundle exec puma -C config/puma.rb`
   - **Plan**: Free (or paid for better performance)

4. **Add PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name it `property-listing-db`
   - Note the connection string

5. **Set Environment Variables**
   In Render → Environment:
   ```
   RAILS_ENV=production
   RAILS_MASTER_KEY=<your-master-key>
   DATABASE_URL=<from-postgres-service>
   ```

6. **Deploy**
   - Render will automatically deploy
   - Note the URL (e.g., `https://property-listing-backend.onrender.com`)

### Frontend Deployment on Vercel

1. **Deploy Frontend** (follow VERCEL_DEPLOYMENT.md)
2. **Set Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://property-listing-backend.onrender.com
   ```

---

## Option 3: Heroku (Paid, Most Reliable)

### Backend Deployment on Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd backend
   heroku create property-listing-backend
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set RAILS_ENV=production
   heroku config:set RAILS_MASTER_KEY=$(cat config/master.key)
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   # Or if using separate repo:
   git push heroku main
   ```

6. **Run Migrations**
   ```bash
   heroku run rails db:migrate
   ```

### Frontend Deployment on Vercel

1. **Deploy Frontend** (follow VERCEL_DEPLOYMENT.md)
2. **Set Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://property-listing-backend.herokuapp.com
   ```

---

## Post-Deployment Setup

### 1. Update CORS Settings

Update `backend/config/initializers/cors.rb` to allow your frontend domain:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins [
      'https://your-frontend.vercel.app',
      'https://your-custom-domain.com',
      'http://localhost:3000' # for local development
    ]
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

### 2. Configure Active Storage

For file uploads, you'll need cloud storage. Options:

**Option A: AWS S3** (Recommended)
1. Create S3 bucket
2. Add to `backend/config/storage.yml`:
   ```yaml
   amazon:
     service: S3
     access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
     secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
     region: <%= ENV['AWS_REGION'] %>
     bucket: <%= ENV['AWS_BUCKET'] %>
   ```
3. Set environment variables in your hosting platform

**Option B: Cloudinary** (Easier setup)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Add `gem 'cloudinary'` to Gemfile
3. Configure in `config/storage.yml`

**Option C: Railway/Render Volume** (Simple but limited)
- Use local storage (files lost on restart)

### 3. Seed Database (Optional)

```bash
# On Railway
railway run rails db:seed

# On Render (via Shell)
render.com → Shell → rails db:seed

# On Heroku
heroku run rails db:seed
```

### 4. Test the Connection

1. Visit your frontend URL
2. Check browser console for API errors
3. Test API endpoints:
   ```bash
   curl https://your-backend.railway.app/api/v1/categories
   ```

---

## Environment Variables Summary

### Backend (Railway/Render/Heroku)
```
RAILS_ENV=production
RAILS_MASTER_KEY=<from-config/master.key>
DATABASE_URL=<auto-provided>
AWS_ACCESS_KEY_ID=<if-using-s3>
AWS_SECRET_ACCESS_KEY=<if-using-s3>
AWS_REGION=<if-using-s3>
AWS_BUCKET=<if-using-s3>
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## Troubleshooting

### Backend Issues

**Database Connection Errors**
- Verify `DATABASE_URL` is set correctly
- Check database is running (Railway/Render show status)
- Run migrations: `rails db:migrate`

**CORS Errors**
- Update `cors.rb` with frontend URL
- Restart backend after changes

**500 Errors**
- Check logs in hosting platform
- Verify `RAILS_MASTER_KEY` is set
- Check database migrations ran successfully

### Frontend Issues

**API Calls Failing**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Test backend URL directly in browser

**404 on Routes**
- Ensure `vercel.json` is configured
- Check Next.js build logs
- Verify locale routing is working

---

## Cost Comparison

| Platform | Backend | Frontend | Database | Total/Month |
|----------|---------|----------|----------|------------|
| Railway | $5-20 | - | Included | $5-20 |
| Render | Free/$7 | - | Free/$7 | Free/$14 |
| Heroku | $7+ | - | $5+ | $12+ |
| Vercel | - | Free | - | Free |

**Recommended**: Railway (backend) + Vercel (frontend) = **$5-20/month**

---

## Quick Start Commands

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Render
- Use web dashboard (no CLI needed)

### Heroku
```bash
heroku login
heroku create your-app-name
git push heroku main
```

---

## Next Steps

1. ✅ Deploy backend (choose Railway/Render/Heroku)
2. ✅ Deploy frontend on Vercel
3. ✅ Update CORS settings
4. ✅ Configure file storage (S3/Cloudinary)
5. ✅ Test all features
6. ✅ Set up custom domain (optional)

Your full-stack application is now live! 🚀

