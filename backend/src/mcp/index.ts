import 'dotenv/config';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { connectDB } from './db.js';
import { createAuthMiddleware } from './auth.js';

// Import tool registers
import { registerStudentTools } from './tools/student.tools.js';
import { registerFacultyTools } from './tools/faculty.tools.js';
import { registerCourseTools } from './tools/course.tools.js';
import { registerAttendanceTools } from './tools/attendance.tools.js';
import { registerExamTools } from './tools/exam.tools.js';
import { registerFeeTools } from './tools/fee.tools.js';
import { registerLibraryTools } from './tools/library.tools.js';

async function main() {
  const transport = process.env.MCP_TRANSPORT || 'stdio';

  // Connect to MongoDB
  await connectDB();

  // Create MCP server
  const server = new McpServer({
    name: 'cms-mcp',
    version: '1.0.0',
  });

  // Register all 53 tools across the 7 modules
  registerStudentTools(server);
  registerFacultyTools(server);
  registerCourseTools(server);
  registerAttendanceTools(server);
  registerExamTools(server);
  registerFeeTools(server);
  registerLibraryTools(server);

  // Start transport
  if (transport === 'sse') {
    const app = express();
    const port = process.env.MCP_PORT || 5000;

    // Apply Bearer token authentication at the HTTP layer
    app.use(createAuthMiddleware());

    let transportInstance: SSEServerTransport | null = null;

    app.get('/sse', async (req, res) => {
      console.error('[MCP] SSE client connecting...');
      // SSEServerTransport needs the endpoint path where client POSTs back client messages, and the response stream
      transportInstance = new SSEServerTransport('/messages', res);
      await server.connect(transportInstance);
      console.error('[MCP] SSE client connected and connected to server');
    });

    app.post('/messages', express.json(), async (req, res) => {
      if (!transportInstance) {
        return res.status(400).send('Active SSE session not established. Connect to /sse first.');
      }
      console.error('[MCP] Received message on /messages');
      await transportInstance.handlePostMessage(req, res);
    });

    app.listen(port, () => {
      console.error(`[MCP] CMS MCP Server running on SSE transport at http://localhost:${port}`);
    });
  } else {
    // stdio transport — default (no HTTP auth needed since process is the boundary)
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error('[MCP] CMS MCP Server running on stdio');
  }
}

main().catch((err) => {
  console.error('[MCP] Fatal error:', err);
  process.exit(1);
});
