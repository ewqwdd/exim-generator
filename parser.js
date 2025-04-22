const xlsx = require('xlsx');
const fs = require('fs');
const { minify } = require('terser');

const workbook = xlsx.readFile('./data.xlsx');

const folderExists = fs.existsSync('./scripts');
if (!folderExists) {
  fs.mkdirSync('./scripts');
}

const keys = {
  'лег': 'legkovi',
  'комерційні': 'commercial',
  'груз': 'gruz',
  'прицепы': 'prichepy',
  'спецтехника та сх': 'spectechnika',
  'автобусы': 'bus'
};

Object.keys(keys).forEach(async (key) => {
  const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes(key));
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  const result = {};

  console.log(data[0])

  data.forEach(row => {
    const brand = String(row['Марка'])?.trim();
    const model = String(row['Модель'])?.trim();

    if (!brand || !model) return;

    if (!result[brand]) {
      result[brand] = {};
    }

    if (!result[brand][model]) {
      result[brand][model] = [];
    }
  });

  const json = JSON.stringify(result, null, 2);
  const varName = keys[key];
  const content = `const ${varName} = ${json};`;

  const minified = await minify(content);

  fs.writeFileSync(`./scripts/${varName}.js`, minified.code, 'utf8');
  console.log(`✅ Минифицированный файл сохранён как ${varName}.js`);
});
