// 云端 Lean 编译验证（无需本地安装 Lean/mathlib）
// 依赖: npm i ws https-proxy-agent@7
// 用法: node verify_cloud.js [project] [codeFile]
// 原理: 连 lean4web 公开 WebSocket LSP 端点，服务端为每条连接启动 lake serve --。
//       发送 initialize → initialized → textDocument/didOpen，收集 publishDiagnostics。
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');

const project = process.argv[2] || 'MathlibDemo';
const codeFile = process.argv[3] || path.join(__dirname, 'JSP000301.lean');
const code = fs.readFileSync(codeFile, 'utf8');
const HOST = process.env.LEAN_HOST || 'live.lean-lang.org';
const DOC_URI = 'file:///Lean4Web.lean';
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;

let msgId = 0, sawInit = false, sawDiag = false, finished = false;
let diagnostics = [];

function send(ws, method, params, isRequest = false) {
  const msg = { jsonrpc: '2.0', method, params };
  if (isRequest) msg.id = ++msgId;
  ws.send(JSON.stringify(msg));
}

setTimeout(() => finish('TIMEOUT'), 180000);

function finish(reason) {
  if (finished) return;
  finished = true;
  const errs = diagnostics.filter(d => d.severity === 1);
  const infos = diagnostics.filter(d => d.severity === 3);
  console.log('\n===== 云端 Lean 验证 =====');
  console.log('project:', project, '| reason:', reason,
              '| sawDiagnostics:', sawDiag, '| errors:', errs.length);
  errs.forEach(d => console.log('  ERROR L' + ((d.range?.start?.line ?? 0) + 1) + ': ' +
                                String(d.message).replace(/\s+/g, ' ').slice(0, 300)));
  infos.forEach(d => console.log('  INFO  L' + ((d.range?.start?.line ?? 0) + 1) + ': ' +
                                 String(d.message).replace(/\s+/g, ' ').slice(0, 300)));
  const pass = sawDiag && errs.length === 0;
  console.log(pass ? 'VERDICT: NO_ERRORS' : 'VERDICT: FAILED');
  try { ws.close(); } catch (e) {}
  process.exit(pass ? 0 : 1);
}

const opts = {
  headers: {
    Origin: `https://${HOST}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: '*/*', 'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache', Pragma: 'no-cache', Referer: `https://${HOST}/`
  },
  handshakeTimeout: 60000
};
if (proxy) opts.agent = new HttpsProxyAgent(proxy);

const ws = new WebSocket(`wss://${HOST}/websocket/${project}`, opts);

ws.on('open', () => {
  console.log('[open] wss://' + HOST + '/websocket/' + project);
  send(ws, 'initialize', {
    processId: null, rootUri: 'file:///', rootPath: '/',
    capabilities: { textDocument: { publishDiagnostics: { relatedInformation: false } } },
    workspaceFolders: null
  }, true);
});

ws.on('message', (raw) => {
  let m;
  try { m = JSON.parse(raw.toString()); } catch (e) { return; }
  if (m.id && !sawInit && m.result?.capabilities) {
    sawInit = true;
    console.log('[initialize ok]', JSON.stringify(m.result.serverInfo || {}));
    send(ws, 'initialized', {});
    send(ws, 'textDocument/didOpen', {
      textDocument: { uri: DOC_URI, languageId: 'lean', version: 1, text: code }
    });
    console.log('[didOpen] code chars:', code.length);
    setTimeout(() => finish('SETTLED'), Number(process.env.SETTLE_MS || 45000));
    return;
  }
  if (m.method === 'textDocument/publishDiagnostics' && m.params?.uri === DOC_URI) {
    sawDiag = true;
    diagnostics = m.params.diagnostics || [];
    console.log('[diagnostics]', diagnostics.length,
                'errors=' + diagnostics.filter(d => d.severity === 1).length);
  }
});

ws.on('error', (e) => { console.log('[ws error]', e.message || String(e)); finish('WS_ERROR'); });
ws.on('close', (c) => { if (!finished) finish('WS_CLOSED_' + c); });
