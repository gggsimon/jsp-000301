// 通过 GitHub REST Contents API 把本仓库文件推到 gggsimon/jsp-000301。
// 适用：github.com 的 git 通道不通，但 api.github.com 可达的环境。
// 用法（token 只从环境变量读，绝不写入文件、日志或 git）：
//   GH_TOKEN=<token> node push_api.js
// 用完请立即到 GitHub Settings → Developer settings 撤销该 token。
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');

const TOKEN = process.env.GH_TOKEN;
if (!TOKEN) {
  console.error('缺少 GH_TOKEN 环境变量');
  process.exit(2);
}

const OWNER = 'gggsimon';
const REPO = 'jsp-000301';
const ROOT = __dirname;

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: urlPath,
      method,
      headers: {
        'User-Agent': 'jsp000301-uploader',
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer ' + TOKEN,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
      },
      timeout: 45000
    }, r => {
      let b = '';
      r.on('data', d => b += d);
      r.on('end', () => {
        let j = {};
        try { j = JSON.parse(b); } catch (e) { /* ignore */ }
        resolve({ status: r.statusCode, body: j });
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  // 1. 校验仓库可访问（fine-grained token 不依赖 /user 端点）
  const repo = await api('GET', `/repos/${OWNER}/${REPO}`);
  if (repo.status !== 200) {
    console.error('仓库不可访问:', repo.status, repo.body.message || '');
    process.exit(4);
  }
  console.log('repo:', repo.body.full_name, '| default_branch:', repo.body.default_branch || '(空仓库)');

  // 2. 取本地已纳入版本的文件清单
  const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
  console.log('files to upload:', files.length, '\n');

  // 3. 逐个 PUT（首次会自动创建默认分支 main）
  let ok = 0, fail = 0;
  for (const f of files) {
    const abs = path.join(ROOT, f);
    if (!fs.existsSync(abs)) { console.log('SKIP (missing)', f); continue; }
    const content = fs.readFileSync(abs);
    const res = await api('PUT', `/repos/${OWNER}/${REPO}/contents/${f}`, {
      message: `Add ${f}`,
      content: content.toString('base64')
    });
    if (res.status === 201 || res.status === 200) {
      ok++;
      console.log('OK  ', f, '| commit', String(res.body.commit && res.body.commit.sha || '').slice(0, 12));
    } else {
      fail++;
      console.log('FAIL', f, res.status, res.body.message || '');
    }
  }
  console.log(`\nDONE ok=${ok} fail=${fail}`);

  // 4. 回读确认
  const tree = await api('GET', `/repos/${OWNER}/${REPO}/git/trees/HEAD?recursive=1`);
  if (tree.status === 200 && tree.body.tree) {
    console.log('remote file count:', tree.body.tree.filter(x => x.type === 'blob').length);
  }
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('ERROR', e.message); process.exit(5); });
