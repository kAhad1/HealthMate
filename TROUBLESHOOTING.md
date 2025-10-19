# HealthMate Troubleshooting Guide 🔧

## If Your Frontend Page Looks Empty

### Quick Fix Steps:

1. **Check if you see the HealthMate welcome page**
   - If you see a blue "H" logo and "HealthMate" text, React is working!
   - If you see a blank page, continue with the steps below.

2. **Install Dependencies**
   ```bash
   # Option 1: Use the batch file (Windows)
   double-click install.bat
   
   # Option 2: Use Command Prompt (not PowerShell)
   cd frontend
   npm install
   
   # Option 3: Fix PowerShell execution policy
   # Run PowerShell as Administrator, then:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Start the Development Server**
   ```bash
   # Option 1: Use the batch file
   double-click run.bat
   
   # Option 2: Command line
   cd frontend
   npm run dev
   ```

4. **Check Browser Console**
   - Press F12 in your browser
   - Look for any error messages in the Console tab
   - Share any red error messages if you need help

### Common Issues & Solutions:

#### Issue: PowerShell Execution Policy Error
**Error:** `cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Issue: Module Not Found Errors
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Port Already in Use
**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Kill process using port 5173
npx kill-port 5173
# Or use a different port
npm run dev -- --port 3000
```

#### Issue: Blank White Page
**Check:**
1. Open browser developer tools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Make sure you're accessing `http://localhost:5173`

### Expected Behavior:
- ✅ You should see a blue "H" logo
- ✅ "HealthMate - Sehat ka Smart Dost" title
- ✅ Green checkmarks showing React is working
- ✅ Next steps instructions

### Still Having Issues?
1. Make sure Node.js is installed: `node --version`
2. Make sure npm is working: `npm --version`
3. Try creating a fresh React app: `npx create-vite@latest test-app --template react`
4. Check if antivirus is blocking npm

### Quick Test:
Open your browser and go to `http://localhost:5173`
You should see the HealthMate welcome page with a blue logo.

If you see this, everything is working! 🎉
