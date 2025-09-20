# 환경 변수 설정 가이드

## .env 파일 생성 방법

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# MongoDB Atlas 클라우드 연결 정보
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# JWT 시크릿 키 (프로덕션에서는 더 복잡한 키 사용)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 서버 포트
PORT=5000
FRONTEND_PORT=5001

# 프론트엔드 URL (프로덕션용)
FRONTEND_URL=https://heoce-todo-front.duckdns.org

# 환경 설정
NODE_ENV=development
```

## Windows에서 .env 파일 생성

1. **명령 프롬프트 사용**:
```cmd
echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name > .env
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> .env
echo PORT=5000 >> .env
echo NODE_ENV=development >> .env
```

2. **PowerShell 사용**:
```powershell
@"
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

3. **텍스트 에디터 사용**:
   - 메모장이나 VS Code에서 새 파일 생성
   - 위의 내용을 복사하여 붙여넣기
   - `.env` 이름으로 저장 (확장자 없음)

## 중요: 환경 변수 필수

이제 모든 민감한 정보는 `.env` 파일에서만 관리됩니다. 서버를 실행하기 전에 반드시 `.env` 파일을 생성해야 합니다.

## 우분투 서버 자동 시작 설정

### PM2 자동 시작 설정
```bash
# 현재 실행 중인 서비스들 저장
pm2 save

# PM2 자동 시작 스크립트 생성
pm2 startup

# 위 명령어 실행 후 나오는 명령어를 복사해서 실행
# 예: sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u heoce --hp /home/heoce
```

### Caddy 자동 시작 설정
```bash
# Caddy 서비스 활성화
sudo systemctl enable caddy

# Caddy 서비스 상태 확인
sudo systemctl status caddy
```

### MongoDB 자동 시작 설정 (로컬 MongoDB 사용 시)
```bash
# MongoDB 서비스 활성화
sudo systemctl enable mongod

# MongoDB 서비스 상태 확인
sudo systemctl status mongod
```

### 전체 설정 확인
```bash
# PM2 상태 확인
pm2 status

# 시스템 서비스 상태 확인
sudo systemctl status caddy
sudo systemctl status mongod  # 로컬 MongoDB 사용 시

# 자동 시작 설정된 서비스 목록 확인
sudo systemctl list-unit-files --type=service --state=enabled
```

### 재부팅 테스트
```bash
# 서버 재부팅
sudo reboot

# 재부팅 후 서비스 상태 확인
pm2 status
sudo systemctl status caddy
```

## 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 더 복잡한 JWT_SECRET을 사용하세요
- MongoDB Atlas에서 IP 화이트리스트를 설정하세요
- DuckDNS 도메인을 사용할 때는 HTTPS를 통해 접속하세요
