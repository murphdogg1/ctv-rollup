# Supabase Setup Guide for CTV Rollup

## 🚨 Current Issue: Upload Failing in Production

Your production environment is getting "Ingestion Failed" errors because:
1. **Missing Database Tables**: Supabase doesn't have the required tables
2. **File Storage Issues**: Vercel serverless can't write local files
3. **Schema Mismatch**: Database service expects tables that don't exist

## 🔧 Solution Steps

### Step 1: Set Up Supabase Tables

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your CTV Rollup project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Setup Script**
   - Copy and paste the contents of `scripts/setup-supabase.sql`
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these new tables:
     - `campaigns`
     - `campaign_uploads` 
     - `campaign_content_raw`
     - `content_aliases`
   - And these views:
     - `rr_rollup_app`
     - `rr_rollup_genre`
     - `rr_rollup_content`

### Step 2: Verify Environment Variables

Ensure these are set in your Vercel project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Test the Fix

1. **Deploy the Updated Code**
   - The upload route has been fixed to work with Vercel
   - Local file storage removed
   - Better error handling added

2. **Try Uploading Again**
   - Go to your production app
   - Navigate to `/upload` or `/campaigns`
   - Try uploading a CSV file

## 📊 Expected CSV Format

Your CSV should have these columns:
- `campaign name` (optional)
- `content title`
- `content network name`
- `impression` (number)
- `quartile100` (number)

## 🔍 Troubleshooting

### If Tables Still Missing:
```sql
-- Check what tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if campaigns table exists
SELECT * FROM campaigns LIMIT 1;
```

### If Permission Errors:
```sql
-- Grant permissions to authenticated users
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaign_uploads TO authenticated;
GRANT ALL ON campaign_content_raw TO authenticated;
```

### If Views Not Working:
```sql
-- Refresh views
REFRESH MATERIALIZED VIEW IF EXISTS rr_rollup_app;
REFRESH MATERIALIZED VIEW IF EXISTS rr_rollup_genre;
REFRESH MATERIALIZED VIEW IF EXISTS rr_rollup_content;
```

## ✅ Success Indicators

After setup, you should see:
- **API Status**: `{"connected":true,"engine":"supabase"}`
- **Row Counts**: All tables showing proper counts
- **Upload Success**: Files processing without errors
- **Campaigns Appearing**: In the campaigns list

## 🚀 Next Steps

1. **Run the SQL setup script** in Supabase
2. **Deploy the updated code** to Vercel
3. **Test file upload** with a sample CSV
4. **Verify data appears** in campaigns and reports

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs for SQL errors
2. Check Vercel function logs for runtime errors
3. Verify environment variables are correct
4. Ensure CSV format matches expected schema
