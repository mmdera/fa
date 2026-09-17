import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
const files = ['index.html','styles.css','script.js','data.js','favicon.svg','robots.txt','sitemap.xml','_headers'];
for (const file of files) await cp(join(root,file), join(dist,file));
console.log(`Built Forge Athletics → ${dist}`);
