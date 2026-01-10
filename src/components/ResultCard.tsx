import React, { useState } from 'react';
import type { ScanResult, ReconTool } from '../types';
import { CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, Copy, Terminal } from 'lucide-react';

interface ResultCardProps {
  tool: ReconTool;
  result?: ScanResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ tool, result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = () => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-cyber-success';
      case 'failed': return 'text-cyber-danger';
      case 'running': return 'text-cyber-warning';
      default: return 'text-cyber-muted';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={18} />;
      case 'failed': return <AlertCircle size={18} />;
      case 'running': return <Clock size={18} className="animate-spin" />;
      default: return <Terminal size={18} />;
    }
  };

  return (
    <div className={`border rounded-lg bg-cyber-panel/50 backdrop-blur-sm transition-all duration-300 ${
        result?.status === 'running' ? 'border-cyber-primary shadow-[0_0_15px_rgba(0,240,255,0.15)]' : 'border-gray-800 hover:border-gray-700'
    }`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-md bg-cyber-dark border border-gray-800 ${getStatusColor(result?.status)}`}>
            {getStatusIcon(result?.status)}
          </div>
          <div>
            <h3 className="font-bold text-cyber-text flex items-center gap-2">
              {tool.name}
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-normal">
                {tool.category}
              </span>
            </h3>
            <p className="text-xs text-cyber-muted font-mono mt-0.5">{tool.command}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {result?.duration && (
            <span className="text-xs font-mono text-cyber-muted hidden sm:inline-block">
              {result.duration}
            </span>
          )}
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-800 bg-black/40">
           {result?.output ? (
             <div className="relative group">
                <button 
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
                  className="absolute top-2 right-2 p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy Output"
                >
                  <Copy size={14} />
                </button>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-gray-300 whitespace-pre-wrap max-h-96 custom-scrollbar leading-relaxed">
                  {result.output}
                </pre>
             </div>
           ) : (
             <div className="p-4 text-center text-sm text-cyber-muted italic">
               {result?.status === 'pending' ? 'Waiting in queue...' : result?.status === 'running' ? 'Scanning in progress...' : 'No output available.'}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
