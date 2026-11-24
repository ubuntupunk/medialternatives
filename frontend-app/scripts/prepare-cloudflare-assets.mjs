import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const assetsDir = join(process.cwd(), '.open-next', 'assets');
const r2PublicBase = 'https://pub-2b74eecbeae64a8492463f9cf7a95392.r2.dev/legal-documents';
const largePdfNames = [
  'Annexures-PAJA-3.pdf',
  'Founding-Affidavit-High-Court-Corruption.pdf',
  'Supplement-Affidavit-CBC-Kahanovitz-9-MAY-2017-TUE.pdf',
];

await mkdir(assetsDir, { recursive: true });

const assetsIgnore = largePdfNames
  .map((name) => `legal-archive/legal-documents/${name}`)
  .join('\n');
await writeFile(join(assetsDir, '.assetsignore'), `${assetsIgnore}\n`);

const redirects = largePdfNames
  .map(
    (name) =>
      `/legal-archive/legal-documents/${name} ${r2PublicBase}/${name} 302`
  )
  .join('\n');
await writeFile(join(assetsDir, '_redirects'), `${redirects}\n`);

console.log(
  `Prepared Cloudflare assets: excluded ${largePdfNames.length} oversized PDFs and added temporary redirects.`
);
