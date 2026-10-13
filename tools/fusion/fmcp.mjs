// minimal MCP client for Fusion's local server: node fmcp.mjs <method> [jsonParams]
const URL = 'http://127.0.0.1:27182/mcp';
const H = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
let sid;
async function rpc(method, params, id) {
  const r = await fetch(URL, { method: 'POST', headers: { ...H, ...(sid ? { 'MCP-Session-Id': sid } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', ...(id != null ? { id } : {}), method, params }) });
  sid = r.headers.get('mcp-session-id') ?? sid;
  const t = await r.text();
  if (!t) return null;
  const m = t.match(/^data: (.*)$/m);
  return JSON.parse(m ? m[1] : t);
}
await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'portfolio', version: '1' } }, 1);
await rpc('notifications/initialized', {});
const out = await rpc(process.argv[2], process.argv[3] ? JSON.parse(process.argv[3]) : {}, 2);
console.log(JSON.stringify(out, null, 1));
