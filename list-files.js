import { execSync } from 'child_process';

console.log('--- GIT STATUS ---');
try {
  const status = execSync('git status', { encoding: 'utf8' });
  console.log(status);
} catch (e) {
  console.error('Error running git status:', e.message);
}

console.log('--- GIT REF LOG OR COMMITS ---');
try {
  const commits = execSync('git log --oneline -n 10', { encoding: 'utf8' });
  console.log(commits);
} catch (e) {
  console.error('Error running git log:', e.message);
}
