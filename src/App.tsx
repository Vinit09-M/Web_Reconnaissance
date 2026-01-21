import React, { useState } from 'react';
import { Activity, Shield, Download, Play, Settings, Search, ArrowRight, Zap, Target } from 'lucide-react';
import { AVAILABLE_TOOLS } from './types';
import type { ReconTool, ScanResult, LogEntry } from './types';
import { performLocalScan } from './services/localScanService';
import Terminal from './components/Terminal';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<'home' | 'dashboard'>('home');
  const [targetDomain, setTargetDomain] = useState('');
  const [tools, setTools] = useState<ReconTool[]>(AVAILABLE_TOOLS);
  const [results, setResults] = useState<Record<string, ScanResult>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // --- Helpers ---
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  const toggleTool = (id: string) => {
    setTools(tools.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

  const startScan = async () => {
    if (!targetDomain) return;
    
    // Reset or Initialize
    if (view === 'home') setView('dashboard');
    setIsScanning(true);
    setScanProgress(0);
    setResults({});
    setLogs([]); // Clear logs for new scan
    
    const activeTools = tools.filter(t => t.isActive);
    
    addLog(`Target acquired: ${targetDomain}`, 'info');
    addLog(`Connecting to local execution server...`, 'info');
    addLog(`Initializing suite: ${activeTools.map(t => t.id).join(', ')}`, 'info');

    // Initialize empty results
    const initialResults: Record<string, ScanResult> = {};
    activeTools.forEach(t => {
      initialResults[t.id] = {
        toolId: t.id,
        status: 'pending',
        output: '',
        timestamp: new Date().toISOString()
      };
    });
    setResults(initialResults);

    // Sequential Execution Loop
    let completed = 0;
    
    for (const tool of activeTools) {
      // Update status to running
      setResults(prev => ({
        ...prev,
        [tool.id]: { ...prev[tool.id], status: 'running' }
      }));
      addLog(`[${tool.name}] Executing command...`, 'warning');

      const startTime = Date.now();
      
      // CALL LOCAL SERVICE
      // Note: We pass the tool ID so server.js knows which command to run
      const output = await performLocalScan(targetDomain, tool.id, tool.command.replace('{domain}', targetDomain));
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2) + 's';

      // Check for failure keywords in output usually returned by server.js error handler
      const isError = output.includes('[CONNECTION ERROR]') || output.includes('Error:');
      const finalStatus = isError ? 'failed' : 'completed';

      // Update result
      setResults(prev => ({
        ...prev,
        [tool.id]: {
          ...prev[tool.id],
          status: finalStatus,
          output: output,
          duration: duration
        }
      }));

      if (isError) {
          addLog(`[${tool.name}] Failed: See output for details`, 'error');
      } else {
          addLog(`[${tool.name}] Completed in ${duration}`, 'success');
      }
      
      completed++;
      setScanProgress((completed / activeTools.length) * 100);
    }

    setIsScanning(false);
    addLog('Scan sequence finished.', 'success');
  };

  const downloadReport = () => {
    const activeTools = tools.filter(t => t.isActive);
    let reportContent = `# ReconAI Scan Report\n`;
    reportContent += `Target: ${targetDomain}\n`;
    reportContent += `Date: ${new Date().toLocaleString()}\n`;
    reportContent += `Execution Mode: Local Native (server.js)\n\n`;
    reportContent += `---\n\n`;

    activeTools.forEach(tool => {
      const result = results[tool.id];
      if (result) {
        reportContent += `## [${tool.name}] Output\n`;
        reportContent += `Duration: ${result.duration}\n\n`;
        reportContent += `\`\`\`\n${result.output}\n\`\`\`\n\n`;
        reportContent += `---\n\n`;
      }
    });

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recon_report_${targetDomain.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('Report downloaded to local system.', 'info');
  };

  // --- Views ---

  if (view === 'home') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden text-center px-4">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.05),transparent_70%)]"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent"></div>
        
        <div className="relative z-10 max-w-3xl w-full mx-auto">
           <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-cyber-panel border border-cyber-primary/30 shadow-[0_0_30px_rgba(0,240,255,0.2)] animate-pulse-fast">
                <Shield size={64} className="text-cyber-primary" />
              </div>
           </div>

           <h1 className="text-5xl md:text-7xl font-bold font-sans tracking-tight mb-4 glitch-text" data-text="ReconAI">
             Recon<span className="text-cyber-primary">AI</span>
           </h1>
           <p className="text-xl text-cyber-muted mb-12 max-w-2xl mx-auto">
             Local Native Reconnaissance Dashboard
           </p>
           
           <div className="bg-cyber-panel/50 backdrop-blur-md p-2 rounded-xl border border-cyber-primary/30 flex items-center max-w-xl mx-auto shadow-2xl transition-transform focus-within:scale-105 duration-300">
              <Search className="ml-4 text-cyber-muted" />
              <input 
                type="text" 
                placeholder="Target Domain (e.g. google.com)"
                className="bg-transparent border-none outline-none text-cyber-text px-4 py-3 flex-1 font-mono placeholder-gray-600"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startScan()}
              />
              <button 
                onClick={startScan}
                disabled={!targetDomain}
                className="bg-cyber-primary hover:bg-cyan-300 text-cyber-black font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Scan <ArrowRight size={18} />
              </button>
           </div>
           
           <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 border border-gray-800 rounded bg-black/20">
                 <Target className="mb-2 text-cyber-secondary" />
                 <h3 className="font-bold">Real Tools</h3>
                 <p className="text-xs text-cyber-muted">Runs actual Nmap/Nikto binaries</p>
              </div>
              <div className="p-4 border border-gray-800 rounded bg-black/20">
                 <Zap className="mb-2 text-cyber-warning" />
                 <h3 className="font-bold">Local</h3>
                 <p className="text-xs text-cyber-muted">No API keys required</p>
              </div>
              <div className="p-4 border border-gray-800 rounded bg-black/20">
                 <Settings className="mb-2 text-cyber-success" />
                 <h3 className="font-bold">Control</h3>
                 <p className="text-xs text-cyber-muted">Configurable backend</p>
              </div>
               <div className="p-4 border border-gray-800 rounded bg-black/20">
                 <Activity className="mb-2 text-cyber-danger" />
                 <h3 className="font-bold">Private</h3>
                 <p className="text-xs text-cyber-muted">Data stays on your machine</p>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- Dashboard View ---

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b border-gray-800 bg-cyber-black/90 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-50">
         <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
           <Shield className="text-cyber-primary" size={24} />
           <span className="font-bold text-xl tracking-wider">Recon<span className="text-cyber-primary">AI</span> <span className="text-xs text-cyber-muted font-normal ml-2 tracking-normal border border-gray-700 px-2 py-0.5 rounded">LOCAL MODE</span></span>
         </div>
         <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-cyber-dark rounded border border-gray-800 text-sm font-mono text-cyber-success">
               <div className="w-2 h-2 rounded-full bg-cyber-success animate-pulse"></div>
               TARGET: {targetDomain}
            </div>
            <button 
              onClick={startScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-colors ${isScanning ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-cyber-primary text-cyber-black hover:bg-cyan-300'}`}
            >
              {isScanning ? <Activity className="animate-spin" size={16} /> : <Play size={16} />}
              {isScanning ? 'SCANNING...' : 'RE-SCAN'}
            </button>
         </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <div className="bg-cyber-panel border border-gray-800 rounded-lg p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings size={18} className="text-cyber-secondary" /> Tool Configuration
              </h2>
              <div className="space-y-3">
                {tools.map(tool => (
                  <label key={tool.id} className={`flex items-start gap-3 p-3 rounded cursor-pointer transition-colors ${tool.isActive ? 'bg-cyber-dark border border-cyber-secondary/30' : 'bg-transparent border border-transparent hover:bg-cyber-dark'}`}>
                    <input 
                      type="checkbox" 
                      checked={tool.isActive}
                      onChange={() => toggleTool(tool.id)}
                      disabled={isScanning}
                      className="mt-1 w-4 h-4 accent-cyber-secondary"
                    />
                    <div>
                      <div className="font-bold text-sm text-gray-200">{tool.name}</div>
                      <div className="text-xs text-cyber-muted mt-1">{tool.description}</div>
                    </div>
                  </label>
                ))}
              </div>
           </div>

           <div className="bg-cyber-panel border border-gray-800 rounded-lg p-5 flex-1 flex flex-col">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Download size={18} className="text-cyber-warning" /> Reports
              </h2>
              <p className="text-sm text-cyber-muted mb-4">
                Generate a comprehensive markdown report of all active scan modules.
              </p>
              <button 
                onClick={downloadReport}
                disabled={isScanning || Object.keys(results).length === 0}
                className="mt-auto w-full py-3 rounded border border-cyber-primary/50 text-cyber-primary hover:bg-cyber-primary/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Download size={16} /> Download Full Report
              </button>
           </div>
        </div>

        {/* Center/Right Panel: Results & Terminal */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* Progress Bar (Only visible when scanning) */}
          {isScanning && (
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-cyber-secondary to-cyber-primary transition-all duration-500 ease-out"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          )}

          {/* Main Content Split */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[600px]">
            
            {/* Terminal Live Feed */}
            <div className="h-full">
               <div className="mb-2 text-sm font-bold text-cyber-muted flex justify-between items-center">
                 <span>SYSTEM_LOGS</span>
                 <span className="text-[10px] bg-cyber-dark px-2 py-1 rounded">LOCAL_SOCKET_FEED</span>
               </div>
               <Terminal logs={logs} isScanning={isScanning} />
            </div>

            {/* Results Grid */}
            <div className="h-full flex flex-col overflow-hidden">
               <div className="mb-2 text-sm font-bold text-cyber-muted flex justify-between items-center">
                 <span>MODULE_RESULTS</span>
                 <span className="text-[10px] bg-cyber-dark px-2 py-1 rounded">
                   {(Object.values(results) as ScanResult[]).filter(r => r.status === 'completed' || r.status === 'failed').length} / {tools.filter(t => t.isActive).length} DONE
                 </span>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {tools.filter(t => t.isActive).map(tool => (
                    <ResultCard 
                      key={tool.id} 
                      tool={tool} 
                      result={results[tool.id]} 
                    />
                  ))}
                  {!isScanning && Object.keys(results).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-cyber-muted border border-dashed border-gray-800 rounded-lg bg-black/20">
                       <Shield size={48} className="mb-4 opacity-20" />
                       <p>Ready to initiate scan sequence.</p>
                    </div>
                  )}
               </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
