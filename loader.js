import * as fs from 'fs';
import * as readline from 'readline';

import Qieyun from 'qieyun';

export async function* loadUnt() {
  const fin = fs.createReadStream('data-unt.txt');
  const rl = readline.createInterface({
    input: fin,
    crlfDelay: Infinity,
  });
  let row = 0;
  for await (const line of rl) {
    row++;
    if (row <= 1) {
      continue;
    }
    const fields = line.trim().split(/\s+/);
    if (fields[2] === '(deleted)') {
      continue;
    }
    const 地位 = Qieyun.音韻地位.from編碼(fields[2]);
    yield {
      地位,
      字頭: fields[1],
      拼音: fields[3],
    };
  }
}

// TODO 特殊字頭測試
export function* loadQieyun() {
  for (const 地位 of Qieyun.iter音韻地位()) {
    yield {
      地位,
      拼音: tshet(地位, 地位.代表字, {
        脣音咍韻歸灰韻: true,
      }),
      字頭: 地位.代表字,
    };
  }
  for (const [描述, 字頭] of [
    ['匣合一灰上', '倄'],
    ['知開二庚上', '打'],
    ['影開三蒸入', '抑'],
    ['曉三幽平', '烋'],
  ]) {
    const 地位 = Qieyun.音韻地位.from描述(描述);
    yield {
      地位,
      拼音: tshet(地位, 字頭, 默認選項),
      字頭,
    };
  }
}

const tshet = Function(
  '音韻地位',
  '字頭',
  '選項',
  fs.readFileSync('tshet.js').toString(),
);

const 默認選項 = Object.fromEntries(
  tshet().map((entry) => {
    if (typeof entry[1] === 'boolean') {
      return entry;
    } else if (entry[1] instanceof Array) {
      return [entry[0], entry[1][0]];
    } else {
      throw new Error(`Nekonata agordo: ${entry}`);
    }
  }),
);