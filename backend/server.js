const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configuration for tool execution
// Ensure these tools are installed in your PATH (apt install nmap, go install ..., etc)
const TOOL_CONFIG = {
  'nmap': (target) => `nmap -sV -sC -T4 -F ${target}`, // Fast scan of top 100 ports
  // Added -exclude-sources digitorus to prevent known segmentation fault/panic in recent versions
  'subfinder': (target) => `subfinder -d ${target} -silent -exclude-sources digitorus`,
  // Updated httpx to also use the safe subfinder command
  'httpx': (target) => `subfinder -d ${target} -silent -exclude-sources digitorus | httpx -title -status-code -tech-detect -silent`,
  'waybackurls': (target) => `waybackurls ${target} | head -n 50`, // Limit to 50 for UI performance
  'dirsearch': (target) => `dirsearch -u ${target} -e php,html,js,txt -t 20 --format=plain`,
  'dirb': (target) => `dirb ${target} `,
};

app.post('/api/scan', (req, res) => {
  const { toolId, target } = req.body;

  // Basic security validation
  if (!target || !/^[a-zA-Z0-9.-]+$/.test(target)) {
    return res.status(400).json({ output: 'Error: Invalid domain format.' });
  }

  const commandGen = TOOL_CONFIG[toolId];
  if (!commandGen) {
    return res.status(400).json({ output: `Error: Tool '${toolId}' not configured in server.js` });
  }

  const command = commandGen(target);
  console.log(`[EXEC] ${command}`);

  // Execute the command
  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[ERR] ${error.message}`);
      // We return the error output/stderr so the user sees what happened
      // Check if it was a panic
      const outputMsg = stdout + '\n' + (stderr || error.message);
      if (outputMsg.includes('panic:') || outputMsg.includes('SIGSEGV')) {
         return res.json({
            status: 'failed',
            output: `[CRITICAL TOOL FAILURE] The external tool crashed.\n\nRaw Error:\n${outputMsg}\n\nTroubleshooting:\n- Try running '${command}' manually in your terminal.\n- Update the tool (go install ...@latest).`
         });
      }

      return res.json({ 
        status: 'failed', 
        output: outputMsg 
      });
    }
    
    console.log(`[DONE] ${toolId} on ${target}`);
    res.json({ 
      status: 'completed', 
      output: stdout || stderr || "Command executed but returned no output." 
    });
  });
});

app.listen(PORT, () => {
  console.log(`\n--- LOCAL RECON SERVER STARTED ---`);
  console.log(`Listening on http://reconai:${PORT}`);
  console.log(`Ready to execute: ${Object.keys(TOOL_CONFIG).join(', ')}`);
  console.log(`Make sure these tools are installed in your system PATH.\n`);
});
