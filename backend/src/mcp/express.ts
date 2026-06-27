import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createAuthMiddleware } from './auth.js';

// Import tool registers
import { registerStudentTools } from './tools/student.tools.js';
import { registerFacultyTools } from './tools/faculty.tools.js';
import { registerCourseTools } from './tools/course.tools.js';
import { registerAttendanceTools } from './tools/attendance.tools.js';
import { registerExamTools } from './tools/exam.tools.js';
import { registerFeeTools } from './tools/fee.tools.js';
import { registerLibraryTools } from './tools/library.tools.js';

export function integrateMCPWithExpress(app: express.Express) {
  // Create MCP server instance
  const server = new McpServer({
    name: 'cms-mcp',
    version: '1.0.0',
  });

  // Register all 53 tools
  registerStudentTools(server);
  registerFacultyTools(server);
  registerCourseTools(server);
  registerAttendanceTools(server);
  registerExamTools(server);
  registerFeeTools(server);
  registerLibraryTools(server);

  let transportInstance: SSEServerTransport | null = null;

  // Mount SSE endpoint
  app.get('/mcp/sse', createAuthMiddleware(), async (req, res) => {
    console.error('[MCP] Deployed SSE client connecting...');
    transportInstance = new SSEServerTransport('/mcp/messages', res);
    await server.connect(transportInstance);
    console.error('[MCP] Deployed SSE client connected');
  });

  // Mount message post endpoint
  app.post('/mcp/messages', createAuthMiddleware(), express.json(), async (req, res) => {
    if (!transportInstance) {
      return res.status(400).send('Active SSE session not established. Connect to /mcp/sse first.');
    }
    console.error('[MCP] Deployed SSE received message');
    await transportInstance.handlePostMessage(req, res);
  });

  console.error('[MCP] Mounted MCP SSE routes on /mcp/sse and /mcp/messages');
}
