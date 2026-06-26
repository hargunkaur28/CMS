import type { Request, Response, NextFunction } from 'express';

/**
 * SSE-only Bearer token middleware.
 * stdio transport doesn't need auth — the process itself is the trust boundary.
 * SSE validates Authorization header at the HTTP layer before requests reach MCP.
 */
export function createAuthMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const expected = process.env.MCP_SECRET;
    // If no secret configured, allow all (dev mode)
    if (!expected) return next();

    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${expected}`) {
      return res.status(401).json({ error: 'Unauthorized: invalid or missing MCP_SECRET' });
    }
    next();
  };
}
