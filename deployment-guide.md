# 우분투 서버 배포 가이드

## 1. 서버 설정

### Node.js 설치
```bash
# Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2
```

### Caddy 설치
```bash
# Caddy 설치
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

## 2. 애플리케이션 배포

### 프로젝트 클론 및 설정
```bash
# 프로젝트 클론
git clone https://github.com/yourusername/todo-backend.git
cd todo-backend

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
nano .env
```

### .env 파일 설정 (프로덕션)
```bash
# MongoDB Atlas 연결 정보
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# JWT 시크릿 키 (강력한 키 사용)
JWT_SECRET=your-super-secret-jwt-key-for-production

# 서버 포트
PORT=5000
FRONTEND_PORT=5001

# 프론트엔드 URL (실제 도메인)
FRONTEND_URL=https://heoce-todo-front.duckdns.org

# 환경 설정
NODE_ENV=production
```

## 3. PM2로 서비스 실행

### PM2 설정 파일 생성
```bash
# ecosystem.config.js 생성
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'todo-backend',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'todo-frontend',
      script: 'frontend-server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        FRONTEND_PORT: 5001
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF
```

### 로그 디렉토리 생성 및 서비스 시작
```bash
# 로그 디렉토리 생성
mkdir -p logs

# PM2로 서비스 시작
pm2 start ecosystem.config.js

# PM2 상태 확인
pm2 status

# PM2 자동 시작 설정
pm2 startup
pm2 save
```

## 4. Caddy 설정

### Caddyfile 설정
```bash
# Caddyfile을 /etc/caddy/ 디렉토리에 복사
sudo cp Caddyfile /etc/caddy/

# Caddy 설정 테스트
sudo caddy validate --config /etc/caddy/Caddyfile

# Caddy 서비스 시작
sudo systemctl start caddy
sudo systemctl enable caddy

# Caddy 상태 확인
sudo systemctl status caddy
```

## 5. 방화벽 설정

```bash
# UFW 방화벽 설정
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 6. 모니터링 및 관리

### PM2 명령어
```bash
# 서비스 상태 확인
pm2 status

# 로그 확인
pm2 logs todo-backend
pm2 logs todo-frontend

# 서비스 재시작
pm2 restart all

# 서비스 중지
pm2 stop all
```

### Caddy 명령어
```bash
# Caddy 상태 확인
sudo systemctl status caddy

# Caddy 로그 확인
sudo journalctl -u caddy -f

# Caddy 설정 리로드
sudo systemctl reload caddy
```

## 7. SSL 인증서 (Let's Encrypt)

Caddy는 자동으로 Let's Encrypt SSL 인증서를 발급하고 갱신합니다.

```bash
# SSL 인증서 상태 확인
sudo caddy list-certificates
```

## 8. 백업 및 유지보수

### 정기 백업
```bash
# MongoDB 백업 (MongoDB Atlas 사용 시 자동 백업)
# 로그 파일 정리
find ./logs -name "*.log" -mtime +30 -delete
```

### 업데이트
```bash
# 코드 업데이트
git pull origin main
npm install
pm2 restart all
```
