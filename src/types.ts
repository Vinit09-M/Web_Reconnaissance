export interface ReconTool {
  id: string;
  name: string;
  description: string;
  command: string; // The typical CLI command for visual flair
  category: 'Discovery' | 'Vulnerability' | 'Network' | 'Content';
  isActive: boolean;
}

export interface ScanResult {
  toolId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output: string;
  timestamp: string;
  duration?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const AVAILABLE_TOOLS: ReconTool[] = [
  {
    id: 'subfinder',
    name: 'Subfinder',
    description: 'Fast passive subdomain enumeration tool.',
    command: 'subfinder -d {domain}',
    category: 'Discovery',
    isActive: false,
  },
  {
    id: 'httpx',
    name: 'HTTPX',
    description: 'Fast and multi-purpose HTTP toolkit.',
    command: 'httpx -u {domain} -status-code -title',
    category: 'Discovery',
    isActive: false,
  },
  {
    id: 'nmap',
    name: 'Nmap',
    description: 'Network mapping and port scanning.',
    command: 'nmap -sV -sC {domain}',
    category: 'Network',
    isActive: false,
  },
  {
    id: 'waybackurls',
    name: 'Waybackurls',
    description: 'Fetch known URLs from the Wayback Machine.',
    command: 'waybackurls {domain}',
    category: 'Content',
    isActive: false,
  },
  {
    id: 'dirsearch',
    name: 'Dirsearch',
    description: 'Web path scanner (brute-force).',
    command: 'dirsearch -u {domain} -e php,html,js',
    category: 'Content',
    isActive: false,
  },
  {
    id: 'nikto',
    name: 'Nikto',
    description: 'Web server scanner for dangerous files/CGIs.',
    command: 'nikto -h {domain} -useragent Mozilla/5.0 -maxtime 300 -timeout 10 ',
    category: 'Vulnerability',
    isActive: false,
  },
];
