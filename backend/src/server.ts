import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
// Для Google в качестве audience используется client_id
const AUTH_AUDIENCE =
    process.env.AUTH_AUDIENCE ??
    '200783178468-gp5ael3ruc8b2qrgkkfr348oovqno48q.apps.googleusercontent.com';
const AUTH_ISSUER_BASE_URL =
    process.env.AUTH_ISSUER_BASE_URL ?? 'https://accounts.google.com';

app.use(cors({ origin: CLIENT_ORIGIN }));

// для проверки JWT
const jwtCheck = auth({
    audience: AUTH_AUDIENCE,
    issuerBaseURL: AUTH_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256', // пара ключей для подписи и проверки
});

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