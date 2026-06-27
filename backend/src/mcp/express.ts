import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { serveDashboard } from './dashboard.js';

// Import tool registers
import { registerStudentTools } from './tools/student.tools.js';
import { registerFacultyTools } from './tools/faculty.tools.js';
import { registerCourseTools } from './tools/course.tools.js';
import { registerAttendanceTools } from './tools/attendance.tools.js';
import { registerExamTools } from './tools/exam.tools.js';
import { registerFeeTools } from './tools/fee.tools.js';
import { registerLibraryTools } from './tools/library.tools.js';

/** Create a fresh MCP server with all tools registered */
function createMCPServer(): McpServer {
  const server = new McpServer({
    name: 'cms-mcp',
    version: '1.0.0',
  });

  registerStudentTools(server);
  registerFacultyTools(server);
  registerCourseTools(server);
  registerAttendanceTools(server);
  registerExamTools(server);
  registerFeeTools(server);
  registerLibraryTools(server);

  return server;
}

export function integrateMCPWithExpress(app: express.Express) {
  // Each SSE session gets its own server+transport pair
  const sessions = new Map<string, { server: McpServer; transport: SSEServerTransport }>();

  // Dashboard UI
  app.get('/mcp', serveDashboard);

  // Mount SSE endpoint — creates a fresh server per connection
  app.get('/mcp/sse', async (req, res) => {
    console.error('[MCP] SSE client connecting...');
    const server = createMCPServer();
    const transport = new SSEServerTransport('/mcp/messages', res);

    sessions.set(transport.sessionId, { server, transport });

    res.on('close', () => {
      sessions.delete(transport.sessionId);
      console.error('[MCP] SSE client disconnected:', transport.sessionId);
    });

    await server.connect(transport);
    console.error('[MCP] SSE client connected:', transport.sessionId);
  });

  // Mount message post endpoint
  app.post('/mcp/messages', express.json(), async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(400).json({ error: 'Invalid or expired session. Reconnect to /mcp/sse.' });
    }
    await session.transport.handlePostMessage(req, res);
  });

  console.error('[MCP] Mounted MCP routes: /mcp (dashboard), /mcp/sse, /mcp/messages');
}
