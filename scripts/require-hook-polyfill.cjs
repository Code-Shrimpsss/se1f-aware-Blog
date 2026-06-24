// Polyfill for Next.js 16's next-config-ts/require-hook.js in Yarn PnP
// In PnP, require.extensions is undefined. Next.js 16 expects it to exist
// and reads require.extensions['.js'] to save the old hook.
if (typeof require !== 'undefined' && require.extensions === undefined) {
  require.extensions = Object.create(null);
}
if (typeof require !== 'undefined' && require.extensions['.js'] === undefined) {
  // Provide a minimal default .js handler so Next.js can save/restore it
  require.extensions['.js'] = function(module, filename) {
    // Default Node.js behavior: compile and run the module
    const content = require('fs').readFileSync(filename, 'utf8');
    module._compile(content, filename);
  };
}
