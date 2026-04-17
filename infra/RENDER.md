# Backend Deployment to Render

To deploy the Audiary API to Render:

1. **New Web Service**:
   - Repository: `audiary`
   - Root Directory: `apps/api`
   - Environment: `Node`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start:prod`

2. **Environment Variables**:
   - `PORT`: `4000` (or leave default and Render will set it)
   - `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
   - `APP_URL`: `https://audiary.vercel.app` (your frontend URL)
   - `NODE_VERSION`: `22.x`

3. **Database Setup**:
   - Ensure your Supabase instance is running.
   - Run migrations from your local machine: `pnpm db:push`
