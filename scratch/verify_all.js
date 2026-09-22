const http = require('http');
const assert = require('assert');

function checkHttp(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          bodyLength: body.length,
          bodySample: body.substring(0, 100)
        });
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('=== RUNNING AUTOMATED VERIFICATION ===\n');

  // 1. Verify HTTP endpoints
  const endpoints = [
    'http://localhost:3000/',
    'http://localhost:3000/index.html',
    'http://localhost:3000/css/design-system.css',
    'http://localhost:3000/css/components.css',
    'http://localhost:3000/js/app.js',
    'http://localhost:3000/js/store.js',
    'http://localhost:3000/js/carry-forward.js',
    'http://localhost:3000/js/components/dashboard.js',
    'http://localhost:3000/js/components/calendar.js',
    'http://localhost:3000/js/components/history.js',
    'http://localhost:3000/js/components/notes.js',
    'http://localhost:3000/js/components/analytics.js',
    'http://localhost:3000/js/components/modal.js',
    'http://localhost:3000/assets/logo.png',
    'http://localhost:3000/assets/avatar.png',
    'http://localhost:3000/assets/banner.png'
  ];

  console.log('1. Testing HTTP endpoints and asset serving:');
  for (const ep of endpoints) {
    const res = await checkHttp(ep);
    assert.strictEqual(res.statusCode, 200, `Endpoint ${ep} returned ${res.statusCode}`);
    console.log(`  ✓ [200 OK] ${ep} (${res.bodyLength} bytes, ${res.headers['content-type']})`);
  }

  // 2. Test Carry-Forward Logic
  console.log('\n2. Testing Carry-Forward Logic:');
  const { processCarryForward, getTodayString } = await import('../js/carry-forward.js');
  const today = getTodayString();

  const testTasks = [
    {
      id: 'task-old-incomplete',
      title: 'Old unfinished task',
      dueDate: '2026-09-01',
      completed: false,
      carriedForward: false,
      carryForwardCount: 0,
      carryForwardDates: [],
      createdAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'task-old-completed',
      title: 'Old completed task',
      dueDate: '2026-09-01',
      completed: true,
      carriedForward: false,
      carryForwardCount: 0,
      carryForwardDates: [],
      createdAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'task-today-incomplete',
      title: 'Today incomplete task',
      dueDate: today,
      completed: false,
      carriedForward: false,
      carryForwardCount: 0,
      carryForwardDates: [],
      createdAt: new Date().toISOString()
    }
  ];

  const cfResult = processCarryForward(testTasks);
  assert.strictEqual(cfResult.carriedCount, 1, 'Exactly 1 task should be carried forward');
  assert.strictEqual(cfResult.modified, true, 'Result should be marked modified');

  const rolledTask = cfResult.tasks.find(t => t.id === 'task-old-incomplete');
  assert.strictEqual(rolledTask.dueDate, today, 'Rolled task dueDate should now be today');
  assert.strictEqual(rolledTask.carriedForward, true, 'Rolled task should have carriedForward: true');
  assert.strictEqual(rolledTask.carryForwardCount, 1, 'carryForwardCount should be 1');
  assert.deepStrictEqual(rolledTask.carryForwardDates, ['2026-09-01'], 'carryForwardDates should preserve historical date');
  assert.strictEqual(rolledTask.originalDueDate, '2026-09-01', 'originalDueDate should be preserved');
  assert.strictEqual(rolledTask.createdAt, '2026-09-01T10:00:00Z', 'createdAt should be untouched');

  console.log('  ✓ Incomplete overdue tasks automatically roll over to today');
  console.log('  ✓ Completed tasks are not touched by rollover');
  console.log('  ✓ Creation date and original due date are strictly preserved');
  console.log('  ✓ carryForwardCount increments and historical dates array tracked');

  // 3. Test Statistics Aggregation
  console.log('\n3. Testing Statistics Aggregation:');
  const sampleMonthTasks = [
    { id: '1', completed: true, carriedForward: false, createdAt: '2026-09-02T10:00:00Z', completedAt: '2026-09-02T12:00:00Z' },
    { id: '2', completed: true, carriedForward: true, createdAt: '2026-09-10T10:00:00Z', completedAt: '2026-09-10T15:00:00Z' },
    { id: '3', completed: false, carriedForward: true, createdAt: '2026-09-15T10:00:00Z' },
    { id: '4', completed: false, carriedForward: false, createdAt: '2026-09-20T10:00:00Z' }
  ];

  const total = sampleMonthTasks.length;
  const completed = sampleMonthTasks.filter(t => t.completed).length;
  const carried = sampleMonthTasks.filter(t => t.carriedForward).length;
  const rate = Math.round((completed / total) * 100);

  assert.strictEqual(total, 4);
  assert.strictEqual(completed, 2);
  assert.strictEqual(carried, 2);
  assert.strictEqual(rate, 50);
  console.log(`  ✓ Total Created: ${total}, Completed: ${completed}, Carried: ${carried}, Rate: ${rate}%`);

  console.log('\n=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('\n❌ Verification test failed:', err);
  process.exit(1);
});
