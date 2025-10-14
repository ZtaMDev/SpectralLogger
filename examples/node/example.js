const spec = require('../../dist/index').default;
const config = require('../../specConf.js').default;
console.log('\n=== Spectral Logger Demo ===\n');

spec.configure(config)
spec.log('This is a normal log message');
spec.info('This is an informational message');
spec.success('Operation completed successfully!');
spec.warn('This is a warning message');
spec.error('This is an error message');

console.log('\n--- Custom Colors ---\n');
spec.log('Custom HEX color', '#07d53a');
spec.info('Custom RGB color', 'rgb(255, 100, 50)');
spec.log('Named color', 'orange');

console.log('\n--- Error Handling ---\n');
try {
  throw new Error('Something went wrong!');
} catch (err) {
  spec.error(err);
}

console.log('\n--- Object Logging ---\n');
spec.log({ name: 'Spectral', version: '0.1.0', fast: true });

console.log('\n--- Configuration ---\n');
console.log('Current configuration:', config);
