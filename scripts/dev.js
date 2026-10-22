import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const backendEnv = { ...process.env };
const envFile = path.join(root, '.env');

if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in backendEnv) continue;

    const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
    backendEnv[match[1]] = value;
  }
}

const command = (windowsCommand, unixCommand, unixArgs) => ({
  command: isWindows ? 'cmd.exe' : unixCommand,
  args: isWindows ? ['/d', '/s', '/c', windowsCommand] : unixArgs,
});
const processes = [
  {
    name: 'frontend',
    ...command('npm.cmd --prefix frontend run dev', 'npm', ['--prefix', 'frontend', 'run', 'dev']),
  },
  {
    name: 'backend',
    ...command(
      'backend\\mvnw.cmd -f backend\\pom.xml spring-boot:run',
      'sh',
      ['./backend/mvnw', '-f', 'backend/pom.xml', 'spring-boot:run'],
    ),
  },
];

let shuttingDown = false;
let failure = false;
const children = [];

const stopChildren = (signal = 'SIGTERM') => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill(signal);
  }
};

const database = spawn('docker', ['compose', 'up', '-d', '--wait', 'db'], {
  cwd: root,
  stdio: 'inherit',
});

const databaseReady = await new Promise((resolve) => {
  database.on('error', (error) => {
    console.error(`Failed to start PostgreSQL: ${error.message}`);
    resolve(false);
  });
  database.on('exit', (code) => {
    if (code !== 0) {
      console.error('Could not start PostgreSQL. Make sure Docker Desktop is running.');
    }
    resolve(code === 0);
  });
});

if (!databaseReady) {
  process.exitCode = 1;
} else {
  for (const processConfig of processes) {
    const child = spawn(processConfig.command, processConfig.args, {
      cwd: root,
      stdio: 'inherit',
      ...(processConfig.name === 'backend' ? { env: backendEnv } : {}),
    });
    children.push(child);

    child.on('error', (error) => {
      console.error(`Failed to start ${processConfig.name}: ${error.message}`);
      failure = true;
      stopChildren();
    });

    child.on('exit', (code, signal) => {
      if (!shuttingDown) {
        failure = code !== 0 || signal !== null;
        stopChildren();
      }

      if (children.every((process) => process.exitCode !== null || process.signalCode !== null)) {
        process.exitCode = failure ? 1 : 0;
      }
    });
  }

  process.on('SIGINT', () => stopChildren('SIGINT'));
  process.on('SIGTERM', () => stopChildren('SIGTERM'));
}
