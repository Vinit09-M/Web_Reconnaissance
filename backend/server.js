const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

/* -------------------- MIDDLEWARE -------------------- */

// Security headers
app.use(
  helmet({
    frameguard: { action: 'sameorigin' },
    noSniff: true
  })
);

// CORS (allow frontend access)
app.use(
  cors({
    origin: '*', // allow all for now (restrict later)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })
);

app.use(express.json());

/* -------------------- HEALTH CHECK -------------------- */

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

/* -------------------- TOOL CONFIG -------------------- */

const TOOL_CONFIG = {
  nmap: (target) => `nmap -sV -sC -T4 -F ${target}`,
  subfinder: (target) => `subfinder -d ${target} -silent`,
  httpx: (target) =>
    `subfinder -d ${target} -silent | httpx -title -status-code -tech-detect -silent`,
  waybackurls: (target) => `waybackurls ${target} | head -n 100`,
  dirsearch: (target) =>
    `dirsearch -u ${target} -e php,html,js,txt -t 20 --format=plain`,
  nikto: (target) =>
    `nikto -h ${target} -maxtime 300s -ask no -nointeractive`
};

/* -------------------- API ROUTE -------------------- */

app.post('/api/scan', (req, res) => {
  const { toolId, target } = req.body;

  // Input validation
  if (!target || !/^[a-zA-Z0-9.-]+$/.test(target)) {
    return res.status(400).json({
      status: 'error',
      output: 'Invalid domain format'
    });
  }

  const commandGen = TOOL_CONFIG[toolId];
  if (!commandGen) {
    return res.status(400).json({
      status: 'error',
      output: `Tool '${toolId}' not supported`
    });
  }

  const command = commandGen(target);
  console.log(`[EXEC] ${command}`);

  exec(
    command,
    {
      maxBuffer: 1024 * 1024 * 10, // 10MB
      timeout: 1000 * 360,         // 6 minutes
      shell: '/bin/bash'
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`[ERROR] ${error.message}`);
        return res.json({
          status: 'failed',
          output: stdout + '\n' + (stderr || error.message)
        });
      }

      res.json({
        status: 'completed',
        output: stdout || stderr || 'Scan completed with no output'
      });
    }
  );
});

/* -------------------- SERVER START -------------------- */

// IMPORTANT: bind to 0.0.0.0 for Cloudflare / external access
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n--- AUTO RECON BACKEND STARTED ---');
  console.log(`Server running on port ${PORT}`);
  console.log(`Available tools: ${Object.keys(TOOL_CONFIG).join(', ')}`);
  console.log('Ensure tools are installed and in PATH\n');
});
