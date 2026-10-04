import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const server = new McpServer({ name: 'parkflow', version: '1.0.0' });

server.registerTool(
  'check_api_health',
  {
    description: 'Check whether the ParkFlow REST API is reachable and healthy.',
    inputSchema: z.object({
      apiUrl: z.string().url().optional().describe(
        'Optional base URL for the ParkFlow API. Defaults to PARKFLOW_API_URL or http://localhost:5000.',
      ),
    }),
  },
  async ({ apiUrl }) => {
    const baseUrl = (apiUrl || process.env.PARKFLOW_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    try {
      const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(5000) });
      const body = await response.text();
      return {
        content: [{ type: 'text', text: `HTTP ${response.status}: ${body}` }],
        isError: !response.ok,
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `ParkFlow API is unreachable at ${baseUrl}: ${error.message}` }],
        isError: true,
      };
    }
  },
);

await serveStdio(server);
