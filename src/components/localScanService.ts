export const performLocalScan = async (
  domain: string,
  toolId: string,
  commandDisplay: string
): Promise<string> => {
  try {
    // Attempt to connect to local server
    const response = await fetch('http://localhost:3001/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toolId, target: domain }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.output;

  } catch (error) {
    console.error("Local scan failed:", error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return `[CONNECTION ERROR] Could not connect to local server.
      
1. Ensure 'server.js' is running on your machine:
   $ node server.js

2. Ensure it is listening on port 3001.
3. If running in a cloud IDE/VM, ensure port 3001 is forwarded/exposed.

Command meant to run: ${commandDisplay}`;
    }

    return `[EXECUTION ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
