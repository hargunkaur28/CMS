import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createAuthMiddleware } from './auth.js';
import { serveDashboard } from './dashboard.js';

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

  const transports = new Map<string, SSEServerTransport>();

  // Dashboard UI
  app.get('/mcp', serveDashboard);

  // Mount SSE endpoint
  app.get('/mcp/sse', async (req, res) => {
    console.error('[MCP] Deployed SSE client connecting...');
    const transport = new SSEServerTransport('/mcp/messages', res);
    transports.set(transport.sessionId, transport);

    res.on('close', () => {
      transports.delete(transport.sessionId);
      console.error('[MCP] SSE client disconnected:', transport.sessionId);
    });

    await server.connect(transport);
    console.error('[MCP] Deployed SSE client connected:', transport.sessionId);
  });

  // Mount message post endpoint
  app.post('/mcp/messages', express.json(), async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);
    if (!transport) {
      return res.status(400).json({ error: 'Invalid or expired session. Reconnect to /mcp/sse.' });
    }
    await transport.handlePostMessage(req, res);
  });

  console.error('[MCP] Mounted MCP routes: /mcp (dashboard), /mcp/sse, /mcp/messages');
}
