import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import cors from 'cors';

const app = express();
const PORT = 3000;

// разрешения CORS с нашего React приложения (dev-режим на http://localhost:5173)
app.use(cors({ origin: 'http://localhost:5173' }));

// для проверки JWT
const jwtCheck = auth({
    audience: 'aje27so1a2ijsc18b80t',
    // Полный URL issuer'а OIDC провайдера (без протокола библиотека не сможет скачать JWKS)
    issuerBaseURL: 'https://auth.cloud.yandex.ru',
    tokenSigningAlg: 'RS256' // пара ключей для подписи и проверки
});

// Корневой маршрут, чтобы не было 404 на GET /
app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'OIDC backend работает' });
});

// Публичный маршрут
app.get('/public', (req, res) => {
    res.json({ message: 'Это публичные данные.' });
});

// Защищенный маршрут
app.get('/protected', jwtCheck, (req, res) => {
    res.json({
        message: 'Это защищенные данные. Вы аутентифицированы!',
        user: (req as any).auth.payload
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});