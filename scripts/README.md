# Add Test Data to Supabase

## 🚀 Quick Start

### 1. Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/jghdutlejpmmfmfvwybd/settings/api
2. Copy the **`service_role` secret** key (NOT the anon key!)
3. Add it to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Run the Script

```bash
cd C:\Users\josef\Desktop\padelliga
node scripts/add-test-data.js
```

### 3. With Data Clearing (Optional)

If you want to clear existing test data first:

```bash
node scripts/add-test-data.js --clear
```

## 📊 What Gets Added

- **4 Regions**: Oslo, Bergen, Trondheim, Stavanger
- **4 Leagues**: Premier League, Division 1, Division 2, Beginners League
- **40 Players**: With Norwegian names and phone numbers
- **16 Teams**: Distributed across active leagues and regions
- **Multiple Matches**: Round-robin format for each league
- **Match Results**: Realistic scores for completed matches

## ⚠️ Important Notes

- This uses the **service_role** key which has admin access
- Never commit the service_role key to git
- The script creates **fake players** (not tied to real auth users)
- You'll still need to create your own real user account via the UI

## 🔒 Security

The `.env.local` file is already in `.gitignore`, so your service role key won't be committed.

## 🐛 Troubleshooting

**"SUPABASE_SERVICE_ROLE_KEY not found"**
- Make sure you added it to `.env.local`
- Restart your terminal after adding it
- Make sure there are no extra spaces

**Foreign key errors**
- Run with `--clear` flag to remove old data first
- Check that your database schema matches the expected structure

**"Module not found"**
- Make sure you ran `npm install` first
- The script uses `@supabase/supabase-js` which should already be installed
