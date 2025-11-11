// server/index.ts
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

/** GET /options/for/select — 1000 опций строками '1'..'1000' */
app.get('/options/for/select', (req, res) => {
  // Можно дергать разный сценарий для проверки клиента:
  // ?mode=ok | empty | null
  const mode = String(req.query.mode || 'ok');
  if (mode === 'empty') return res.json([]);
  if (mode === 'null') return res.json(null);

  const options = Array.from({ length: 1000 }, (_, i) => {
    const n = String(i + 1);
    return { name: n, value: n };
  });
  res.json(options);
});

/** POST /selected/option — принимает { value } */
app.post('/selected/option', (req, res) => {
  const { value } = req.body || {};
  if (typeof value !== 'string' || !/^\d{1,4}$/.test(value)) {
    return res.status(400).json({ message: 'Некорректное value' });
  }
  res.json({ message: `Выбранная опция ${value} успешно принята.` });
});

const port = process.env.PORT || 5055;
app.listen(port, () => {
  console.log(`Server on http://127.0.0.1:${port}`);
});
