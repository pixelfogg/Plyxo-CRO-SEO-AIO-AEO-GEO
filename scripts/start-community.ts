import { spawn } from 'child_process';
import * as path from 'path';

console.log('🚀 Starting Plyxo Community Edition (Local Mode)...');

// Run setup-community.ts first if needed, then spawn next dev
const setup = spawn('npx', ['tsx', 'scripts/setup-community.ts'], {
  stdio: 'inherit',
  shell: true,
});

setup.on('close', (code) => {
  if (code !== 0) {
    console.warn(`⚠️ Setup finished with code ${code}, attempting to start Next.js anyway...`);
  }
  
  console.log('🌐 Launching Next.js Community Server...');
  const nextDev = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NEXT_PUBLIC_IS_CLOUD_EDITION: 'false',
    }
  });

  nextDev.on('close', (devCode) => {
    process.exit(devCode ?? 0);
  });
});
