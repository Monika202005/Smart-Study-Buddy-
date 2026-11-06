import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

console.log('🚀 Starting StudyBuddy backend server (port 5001)...');
const server = spawn('node', ['server.js'], {
  cwd: path.join(rootDir, 'server'),
  stdio: 'inherit',
  shell: true
});

console.log('⚡ Starting StudyBuddy frontend client (port 5173)...');
const client = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'client'),
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

client.on('error', (err) => {
  console.error('Failed to start client:', err);
});

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  server.kill();
  client.kill();
  process.exit();
});
