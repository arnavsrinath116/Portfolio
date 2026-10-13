// run a Fusion Python script file through the MCP server: node fexec.mjs script.py [readOnly] [KEY=VAL...]
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
let script = readFileSync(process.argv[2], 'utf8');
for (const kv of process.argv.slice(4)) { const [k, v] = kv.split('='); script = script.replaceAll(`{{${k}}}`, v); }
const args = { name: 'fusion_mcp_execute', arguments: { featureType: 'script', object: { script, ...(process.argv[3] === 'ro' ? { readOnly: true } : {}) } } };
const out = execFileSync('node', [fileURLToPath(new URL('./fmcp.mjs', import.meta.url)), 'tools/call', JSON.stringify(args)], { maxBuffer: 1 << 26 }).toString();
const d = JSON.parse(out);
for (const c of d.result?.content ?? []) console.log(c.text ?? c);
if (d.error) console.log('ERROR', JSON.stringify(d.error));
