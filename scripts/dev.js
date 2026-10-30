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

const tryStartDatabase = () => {
  return new Promise((resolve) => {
    try {
      const dockerCmd = isWindows
        ? { command: 'cmd.exe', args: ['/d', '/s', '/c', 'docker-compose up -d db'] }
        : { command: 'docker-compose', args: ['up', '-d', 'db'] };

      const db = spawn(dockerCmd.command, dockerCmd.args, { cwd: root, stdio: 'ignore' });
      db.on('error', () => resolve(false));
      db.on('exit', (code) => resolve(code === 0));
    } catch {
      resolve(false);
    }
  });
};

const databaseReady = await tryStartDatabase();

if (!databaseReady) {
  console.warn('\n[!] Notice: PostgreSQL container not running (Docker Desktop is stopped or not found).');
  console.warn('[!] Automatically starting Spring Boot backend with in-memory H2 profile so live chat & APIs work immediately!\n');
}

const backendRunCmd = databaseReady
  ? 'backend\\mvnw.cmd -f backend\\pom.xml spring-boot:run'
  : 'backend\\mvnw.cmd -f backend\\pom.xml spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=h2';

const backendUnixArgs = databaseReady
  ? ['./backend/mvnw', '-f', 'backend/pom.xml', 'spring-boot:run']
  : ['./backend/mvnw', '-f', 'backend/pom.xml', 'spring-boot:run', '-Dspring-boot.run.arguments=--spring.profiles.active=h2'];

const processes = [
  {
    name: 'frontend',
    ...command('npm.cmd --prefix frontend run dev', 'npm', ['--prefix', 'frontend', 'run', 'dev']),
  },
  {
    name: 'backend',
    ...command(
      backendRunCmd,
      'sh',
      backendUnixArgs,
    ),
  },
];

let shuttingDown = false;
let failure = false;
const children = [];

for (const processConfig of processes) {
  const child = spawn(processConfig.command, processConfig.args, {
    cwd: root,
    stdio: 'inherit',
    ...(processConfig.name === 'backend' ? { env: backendEnv } : {}),
  });
  children.push(child);

  child.on('error', (error) => {
    console.error(`Failed to start ${processConfig.name}: ${error.message}`);
    if (processConfig.name === 'frontend') {
      failure = true;
      stopChildren();
    }
  });

  child.on('exit', (code, signal) => {
    // If backend exits because PostgreSQL is not running, don't crash the frontend!
    if (processConfig.name === 'backend' && (code !== 0 || signal !== null)) {
      if (!shuttingDown) {
        console.warn('\n[!] Backend stopped (PostgreSQL is offline). Frontend is still active and running.');
        console.warn('[!] You can access the app at http://localhost:3000/\n');
      }
      return;
    }

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
