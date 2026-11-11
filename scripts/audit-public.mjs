/** Conservative file inventory and content guard. Run from the repository root. */
import {readdir,readFile,lstat} from 'node:fs/promises';
import {resolve,relative,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const allowed=new Set(['.gitignore','README.md','LICENSE','CONTRIBUTING.md','SECURITY.md','index.html','styles.css','app.mjs','core.mjs','serve.py','package.json','tests/core.test.mjs','tests/test_server.py','scripts/audit-public.mjs','.github/workflows/checks.yml','docs/architecture.md','docs/architecture.excalidraw']);
const ignored=new Set(['.git','node_modules','__pycache__']);
const findings=[];let count=0;
const patterns=[['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['cloud credential',/(?:AKIA|ASIA)[A-Z0-9]{16}/],['service token',/(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{20,})/],['absolute personal path',/\/(?:Users|home)\/[A-Za-z0-9._-]+\//],['email address',/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i]];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(ignored.has(entry.name))continue;const p=join(dir,entry.name),name=relative(root,p);const stat=await lstat(p);if(stat.isSymbolicLink()){findings.push(`${name}: symlink not allowed`);continue;}if(entry.isDirectory()){await walk(p);continue;}count++;if(!allowed.has(name))findings.push(`${name}: not in public allowlist`);if(stat.size>200000)findings.push(`${name}: unexpected large asset`);const buf=await readFile(p);if(buf.includes(0))findings.push(`${name}: binary file`);const text=buf.toString('utf8');for(const [label,regex] of patterns)if(regex.test(text))findings.push(`${name}: possible ${label}`);}}
await walk(root);
if(findings.length){console.error(findings.join('\n'));process.exitCode=1;}else console.log(`Public-content audit passed: ${count} allowlisted text files, no flagged personal paths, email addresses or token patterns. Human privacy review and a separate secret scan are still required.`);
