#!/usr/bin/env node

const { exec } = require('child_process');

// Function to kill processes using Node.js instead of shell utilities
function killProcesses() {
  // Use Node.js compatible ps command
  exec('ps -A', (error, stdout, stderr) => {
    if (error) {
      console.log('No processes to kill or ps command failed');
      return;
    }

    const lines = stdout.split('\n');
    const processesToKill = [];

    lines.forEach(line => {
      // Look for vite or node processes
      if (line.includes('vite') || line.includes('node')) {
        // Extract PID (first column after whitespace)
        const parts = line.trim().split(/\s+/);
        if (parts.length > 0 && !isNaN(parts[0])) {
          processesToKill.push(parts[0]);
        }
      }
    });

    // Kill each process
    processesToKill.forEach(pid => {
      try {
        process.kill(pid, 'SIGTERM');
        console.log(`Killed process ${pid}`);
      } catch (err) {
        console.log(`Could not kill process ${pid}: ${err.message}`);
      }
    });

    if (processesToKill.length === 0) {
      console.log('No vite or node processes found to kill');
    }
  });
}

killProcesses();