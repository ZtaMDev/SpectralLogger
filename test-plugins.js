const spec = require('./dist/index').default;
const { FileLoggerPlugin, PerformanceTrackerPlugin } = require('./dist/index');

console.log('\n=== Testing Plugins ===\n');

const perfTracker = new PerformanceTrackerPlugin();
spec.use(perfTracker);

spec.info('Testing performance tracker plugin');
spec.log('Log message 1');
spec.success('Log message 2');
spec.warn('Log message 3');

console.log('\n');
perfTracker.printStats();

console.log('\n=== File Logger Plugin ===\n');
const fileLogger = new FileLoggerPlugin({
  filePath: './.spectral/test-logs.txt',
});

spec.use(fileLogger);

spec.info('This will be logged to file AND console');
spec.success('File logging is working!');

setTimeout(() => {
  fileLogger.close();
  console.log('\nCheck .spectral/test-logs.txt for saved logs');
}, 100);
