const express = require('express');
const xlsx = require('xlsx');
const fs = require('fs');
const multer = require('multer');
const { minify } = require('terser');
const path = require('path');
require("dotenv").config();

const router = express.Router();

// Настройка multer
const upload = multer({ dest: 'uploads/' });

const keys = {
  'лег': 'legkovi',
  'комерційні': 'commercial',
  'груз': 'gruz',
  'прицепы': 'prichepy',
  'спецтехника та сх': 'spectechnika',
  'автобусы': 'bus'
};

router.post('/generate-scripts', upload.single('file'), async (req, res) => {
  try {
    console.log(req.headers['authorization'], process.env.AUTH_KEY);
    if (req.headers['authorization'] !== process.env.AUTH_KEY) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const folderPath = './scripts';

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    for (const key of Object.keys(keys)) {
      const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes(key));
      if (!sheetName) continue;

      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      const result = {};

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

      fs.writeFileSync(`${folderPath}/${varName}.js`, minified.code, 'utf8');
      console.log(`✅ Файл ${varName}.js создан`);
    }

    // Удалить загруженный файл
    fs.unlinkSync(req.file.path);

    res.status(200).json({ message: 'Скрипты успешно сгенерированы' });
  } catch (error) {
    console.error('Ошибка при генерации скриптов:', error);
    res.status(500).json({ error: 'Ошибка при генерации скриптов' });
  }
});

module.exports = router;
