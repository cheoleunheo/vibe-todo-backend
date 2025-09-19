const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 모델 및 라우터 import
const Todo = require('./models/Todo');
const todoRoutes = require('./routes/todos');
const { router: authRoutes } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
    origin: 'http://localhost:3000', // 프론트엔드 서버 주소
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('몽고디비 연결 성공');
})
.catch((error) => {
  console.error('몽고디비 연결 실패:', error);
  process.exit(1);
});

// MongoDB 연결 상태 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('Mongoose가 MongoDB에 연결되었습니다.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose가 MongoDB에서 연결이 끊어졌습니다.');
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Todo Backend API Server with MongoDB',
    version: '1.0.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API 라우트
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 인증 라우트 연결
app.use('/api/auth', authRoutes);

// Todo 라우트 연결
app.use('/api/todos', todoRoutes);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 API endpoint: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n서버를 종료합니다...');
  await mongoose.connection.close();
  console.log('MongoDB 연결이 종료되었습니다.');
  process.exit(0);
});

module.exports = app;
