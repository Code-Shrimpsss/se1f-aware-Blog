#!/usr/bin/env node
// Wrapper to run Next.js CLI with require.extensions polyfill for Yarn PnP
require('./require-hook-polyfill.cjs');

// Forward all arguments to Next.js CLI
const nextBin = require.resolve('next/dist/bin/next');
process.argv = [process.argv[0], nextBin, ...process.argv.slice(2)];
require(nextBin);
