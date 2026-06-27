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

  // ── Dashboard UI ──
  app.get('/mcp', serveDashboard);

  // ── Dashboard REST API (tool listing + execution without SSE) ──
  app.get('/mcp/api/tools', async (_req, res) => {
    try {
      const server = createMCPServer();
      // Access the internal server's registered tools
      const internalServer = (server as any).server;
      const toolsList: any[] = [];

      if (internalServer?._registeredTools) {
        for (const [name, entry] of internalServer._registeredTools) {
          toolsList.push({
            name,
            description: entry.description || '',
            inputSchema: entry.inputSchema || { type: 'object', properties: {} },
          });
        }
      }

      res.json({ tools: toolsList });
    } catch (err: any) {
      console.error('[MCP] /mcp/api/tools error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/mcp/api/run', express.json(), async (req, res) => {
    try {
      const { toolName, args } = req.body;
      if (!toolName) return res.status(400).json({ error: 'toolName is required' });

      const server = createMCPServer();
      const internalServer = (server as any).server;
      const toolEntry = internalServer?._registeredTools?.get(toolName);

      if (!toolEntry) {
        return res.status(404).json({ error: `Tool "${toolName}" not found` });
      }

      // Execute the tool callback directly
      const result = await toolEntry.callback(args || {}, { server: internalServer });
      res.json({ result });
    } catch (err: any) {
      console.error('[MCP] /mcp/api/run error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ── MCP SSE Transport (for AI clients like Claude Desktop) ──
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

  app.post('/mcp/messages', express.json(), async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(400).json({ error: 'Invalid or expired session. Reconnect to /mcp/sse.' });
    }
    await session.transport.handlePostMessage(req, res);
  });

  console.error('[MCP] Mounted MCP routes: /mcp, /mcp/api/tools, /mcp/api/run, /mcp/sse, /mcp/messages');
}
