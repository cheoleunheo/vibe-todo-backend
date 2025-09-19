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

## 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 더 복잡한 JWT_SECRET을 사용하세요
- MongoDB Atlas에서 IP 화이트리스트를 설정하세요
