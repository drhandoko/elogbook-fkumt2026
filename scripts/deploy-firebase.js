'use strict';
// Deploy only the reviewed static bundle. Firebase project must remain on Spark.
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const project = process.argv[2];
if (!project || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project)) {
  throw new Error('Provide an explicit Firebase project ID: node scripts/deploy-firebase.js PROJECT_ID');
}
const config = JSON.parse(fs.readFileSync('firebase.json', 'utf8').replace(/^\uFEFF/, ''));
if (Object.keys(config).some(key => key !== 'hosting') || config.hosting.public !== 'public') {
  throw new Error('Deployment is restricted to static Firebase Hosting from public/.');
}
const built = fs.readFileSync('public/config.js', 'utf8');
if (!/const API_URL = ['"]https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec['"];/.test(built)) {
  throw new Error('Build with ELOGBOOK_API_URL set to the deployed Apps Script /exec URL before deploying.');
}
const cli = process.platform === 'win32' ? 'firebase.cmd' : 'firebase';
const result = spawnSync(cli, ['deploy', '--only', 'hosting', '--project', project], { stdio: 'inherit', shell: false });
if (result.error) throw result.error;
process.exitCode = result.status == null ? 1 : result.status;
