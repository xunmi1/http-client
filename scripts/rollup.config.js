import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import { version, author } from '../package.json';

const currentYear = new Date().getFullYear();
const banner =
`/*!
 * http-client v${version}
 * (c) ${currentYear > 2020 ? '2020-' : ''}${currentYear} ${author}
 * Released under the MIT License.
 */
`;

const outputFileList = [
  { name: 'HttpClient', format: 'umd' },
  { name: 'HttpClient', format: 'umd', min: true },
  { format: 'esm' },
  { format: 'esm', min: true },
];

const output = outputFileList.map(({ name, format, min, ...options }) => {
  const file = `dist/http-client.${format}${min ? '.min' : ''}.js`;
  const plugins = min ? [terser()] : [];
  return { name, format, banner, file, sourcemap: false, plugins, ...options };
});

export default {
  output,
  plugins: [
    json(),
    resolve(),
  ],
};

