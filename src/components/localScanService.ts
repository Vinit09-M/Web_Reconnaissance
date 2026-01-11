export const performLocalScan = async (
  domain: string,
  toolId: string,
  commandDisplay: string
): Promise<string> => {
  try {
    // Get backend URL from environment (Vite + Vercel)
    const API_URL =
      import.meta.env.VITE_CLIENT_KEY || 'http://localhost:3001';

    const response = await fetch(`${API_URL}/api/scan`, {
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
      return `[CONNECTION ERROR] Could not connect to backend server.

1. Ensure backend server is running:
   $ node server.js

2. Ensure backend is listening on port 3001 (or correct port).
3. Ensure ngrok is running and VITE_CLIENT_KEY is correctly set in Vercel.
4. If ngrok restarted, update the URL in Vercel and redeploy.

Command meant to run: ${commandDisplay}`;
    }

    return `[EXECUTION ERROR] ${
      error instanceof Error ? error.message : 'Unknown error'
    }`;
  }
};
