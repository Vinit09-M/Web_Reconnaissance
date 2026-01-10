import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  isScanning: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ logs, isScanning }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-cyber-black border border-cyber-panel rounded-lg overflow-hidden shadow-2xl shadow-cyber-primary/10">
      {/* Header */}
      <div className="bg-cyber-panel px-4 py-2 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center space-x-2 text-cyber-muted text-xs font-mono">
          <TerminalIcon size={14} className="text-cyber-primary" />
          <span>root@recon-ai:~# scan_controller.sh</span>
        </div>
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm bg-black/90 relative">
         {/* Scan Line Effect */}
         <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
         
        {logs.length === 0 ? (
          <div className="text-cyber-muted italic opacity-50">
            {">"} System ready...
            <br />
            {">"} Waiting for target initialization...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-1 break-words relative z-20">
              <span className="text-cyber-muted mr-2">[{log.timestamp}]</span>
              <span
                className={`${
                  log.type === 'error'
                    ? 'text-cyber-danger'
                    : log.type === 'success'
                    ? 'text-cyber-success'
                    : log.type === 'warning'
                    ? 'text-cyber-warning'
                    : 'text-cyber-text'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
        
        {isScanning && (
          <div className="mt-2 text-cyber-primary animate-pulse relative z-20">
            {">"} _ Executing active threads...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
