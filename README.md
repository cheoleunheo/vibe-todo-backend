# Todo App - 할일 관리 웹 애플리케이션

Node.js와 MongoDB를 사용한 완전한 할일 관리 웹 애플리케이션입니다. 사용자 인증, 개인별 할일 관리, 모바일 반응형 디자인을 지원합니다.

## 🌟 주요 기능

### 🔐 사용자 인증 시스템
- **회원가입**: 이메일, 사용자명, 비밀번호로 계정 생성
- **로그인**: JWT 토큰 기반 인증
- **개인별 데이터**: 각 사용자는 자신의 할일만 관리
- **보안**: 비밀번호 해싱, 토큰 검증

### 📝 할일 관리
- **CRUD 기능**: 할일 생성, 조회, 수정, 삭제
- **완료 상태**: 체크박스로 간편한 완료 토글
- **우선순위**: 높음/보통/낮음 우선순위 설정
- **마감일**: 날짜별 마감일 설정 및 임박 알림
- **검색 및 필터링**: 제목, 설명 검색, 상태별 필터

### 📊 통계 대시보드
- **전체 할일 수**: 총 할일 개수 표시
- **완료율**: 완료된 할일의 비율
- **진행 상황**: 완료/진행중 할일 수

### 📱 사용자 경험
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원
- **현대적 UI**: 직관적이고 아름다운 인터페이스
- **실시간 업데이트**: 할일 변경 시 즉시 반영
- **키보드 단축키**: 효율적인 작업을 위한 단축키 지원
- **접근성**: 스크린 리더, 키보드 네비게이션 지원
- **일괄 삭제**: 여러 할일을 선택하여 한 번에 삭제
- **날짜/시간 설정**: 정확한 마감일과 시간 설정
- **시각적 피드백**: 선택된 할일 강조 표시

## 🚀 시작하기

### 필수 요구사항
- Node.js (v14 이상)
- npm 또는 yarn
- MongoDB (로컬 또는 MongoDB Atlas)

### 설치 및 실행

1. **의존성 설치**:
```bash
npm install
```

2. **환경 변수 설정** (필수):
```bash
# 프로젝트 루트에 .env 파일을 생성하고 다음 내용 추가:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development

# 자세한 설정 방법은 env-setup.md 파일을 참고하세요.
```

3. **개발 서버 실행** (백엔드 + 프론트엔드 동시 실행):
```bash
npm run dev:all
```

4. **개별 서버 실행**:
```bash
# 백엔드만 실행
npm run dev

# 프론트엔드만 실행
npm run dev:frontend
```

5. **프로덕션 서버 실행**:
```bash
# 백엔드 실행
npm start

# 프론트엔드 실행 (별도 터미널에서)
npm run frontend
```

6. **웹사이트 접속**:
```
프론트엔드: http://localhost:3000
백엔드 API: http://localhost:5000
```

## 🛠️ 기술 스택

### 백엔드
- **Node.js** - JavaScript 런타임
- **Express.js** - 웹 프레임워크
- **MongoDB** - NoSQL 데이터베이스
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Token 인증
- **bcryptjs** - 비밀번호 해싱
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - 환경 변수 관리

### 프론트엔드
- **HTML5** - 마크업
- **CSS3** - 스타일링 (Grid, Flexbox, 반응형)
- **Vanilla JavaScript** - ES6+ 기능
- **Font Awesome** - 아이콘

## 📁 프로젝트 구조

```
todo-backend/
├── index.js              # 메인 서버 파일
├── models/               # 데이터 모델
│   ├── Todo.js          # Todo 스키마
│   └── User.js          # User 스키마
├── routes/              # API 라우트
│   ├── todos.js         # Todo API 엔드포인트
│   └── auth.js          # 인증 API 엔드포인트
├── public/              # 정적 파일 (프론트엔드)
│   ├── index.html       # 메인 HTML 파일
│   ├── css/
│   │   └── style.css    # 스타일시트
│   └── js/
│       ├── api.js       # API 통신 및 유틸리티
│       ├── auth.js      # 인증 관련 기능
│       ├── todo.js      # 할일 관리 기능
│       └── app.js       # 메인 애플리케이션
├── package.json         # 프로젝트 설정
├── package-lock.json    # 의존성 잠금 파일
└── README.md           # 프로젝트 문서
```

## 📡 API 엔드포인트

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보 조회

### Todo API
- `GET /api/todos` - 모든 할일 조회 (필터링, 검색, 정렬 지원)
- `GET /api/todos/:id` - 특정 할일 조회
- `POST /api/todos` - 새 할일 생성
- `PUT /api/todos/:id` - 할일 수정
- `DELETE /api/todos/:id` - 할일 삭제
- `PATCH /api/todos/:id/toggle` - 완료/미완료 토글
- `GET /api/todos/stats/summary` - 할일 통계 조회
- `GET /api/todos/due-soon` - 마감일 임박 할일 조회

### 기본 엔드포인트
- `GET /` - 서버 상태 및 데이터베이스 연결 상태 확인
- `GET /api/health` - 헬스 체크

## 🔧 환경 변수

`.env` 파일을 생성하여 다음 변수들을 설정할 수 있습니다:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/todo-app

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# MongoDB Atlas (클라우드 사용 시)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app?retryWrites=true&w=majority
```

## 📊 데이터 모델

### User 스키마
```javascript
{
  username: String (필수, 3-20자, 유니크),
  email: String (필수, 유니크, 이메일 형식),
  password: String (필수, 최소 6자, 해싱됨),
  createdAt: Date (자동 생성),
  updatedAt: Date (자동 생성)
}
```

### Todo 스키마
```javascript
{
  title: String (필수, 최대 100자),
  description: String (선택, 최대 500자),
  completed: Boolean (기본값: false),
  priority: String (low/medium/high, 기본값: medium),
  dueDate: Date (선택),
  category: String (선택, 최대 50자),
  tags: [String] (선택, 각 태그 최대 20자),
  user: ObjectId (필수, User 참조),
  createdAt: Date (자동 생성),
  updatedAt: Date (자동 생성)
}
```

## 💡 사용 방법

### 1. 회원가입
- 웹사이트 접속 후 "회원가입" 탭 클릭
- 사용자명, 이메일, 비밀번호 입력
- "회원가입" 버튼 클릭

### 2. 로그인
- "로그인" 탭에서 이메일과 비밀번호 입력
- "로그인" 버튼 클릭

### 3. 할일 관리
- **할일 추가**: 상단 입력창에 제목 입력 후 "추가" 버튼
- **설명 추가**: 설명, 우선순위, 마감일/시간 설정 가능
- **완료 처리**: 체크박스 클릭으로 완료/미완료 토글
- **편집**: "편집" 버튼으로 할일 수정
- **삭제**: "삭제" 버튼으로 할일 제거
- **일괄 삭제**: 여러 할일 선택 후 "선택 삭제" 버튼으로 한 번에 삭제

### 4. 검색 및 필터링
- **검색**: 상단 검색창에서 키워드 입력
- **필터**: 우선순위, 상태별 필터링
- **통계**: 대시보드에서 진행 상황 확인

## ⌨️ 키보드 단축키

- `Ctrl/Cmd + Enter`: 할일 추가
- `Escape`: 모달 닫기
- `Ctrl/Cmd + K`: 검색창 포커스

## 🗑️ 일괄 삭제 기능

### 사용 방법
1. **할일 선택**: 각 할일 앞의 체크박스를 클릭하여 선택
2. **일괄 삭제**: "선택 삭제 (N)" 버튼을 클릭하여 선택된 할일들을 한 번에 삭제
3. **확인 대화상자**: 삭제 전 확인 메시지 표시

### 특징
- 선택된 할일은 파란색 배경과 왼쪽 테두리로 강조 표시
- 일괄 삭제 버튼은 선택된 할일이 있을 때만 표시
- 버튼에 선택된 할일 개수 표시
- 삭제 후 자동으로 통계 업데이트

## 🔧 주요 기능 상세

### 검색 및 필터링
- **완료 상태별 조회**: 완료/미완료 할일 분류
- **우선순위별 조회**: high/medium/low 우선순위 필터링
- **카테고리별 조회**: 카테고리별 할일 그룹화
- **텍스트 검색**: 제목과 설명에서 키워드 검색
- **정렬**: 다양한 기준으로 정렬 (생성일, 수정일, 제목, 우선순위, 마감일)

### 통계 기능
- **전체 할일 수**: 총 할일 개수
- **완료율**: 완료된 할일의 비율
- **우선순위별 통계**: 우선순위별 할일 분포
- **카테고리별 통계**: 카테고리별 할일 분포
- **마감일 임박**: 3일 이내 마감 예정 할일

### 보안 기능
- **비밀번호 해싱**: bcrypt를 사용한 안전한 비밀번호 저장
- **JWT 토큰**: 7일 유효기간의 인증 토큰
- **사용자별 데이터 격리**: 각 사용자는 자신의 데이터만 접근
- **입력 검증**: 서버 및 클라이언트 양쪽에서 데이터 검증

### 접근성
- **키보드 네비게이션**: Tab 키로 모든 요소 접근 가능
- **스크린 리더 지원**: ARIA 라벨 및 의미있는 HTML 구조
- **포커스 관리**: 모달 열기 시 자동 포커스
- **색상 대비**: 충분한 색상 대비로 가독성 향상

### 날짜/시간 관리
- **정확한 마감일**: 날짜와 시간까지 설정 가능
- **기본값 설정**: 할일 추가 시 현재 시간이 자동으로 설정
- **시간 표시**: "오늘 14:30", "내일 09:00" 형식으로 표시
- **지연 알림**: 마감일이 지난 할일은 "지연됨" 표시

## 📱 반응형 디자인

### 모바일 (480px 이하)
- 세로 레이아웃으로 최적화
- 터치 친화적 버튼 크기
- 간소화된 네비게이션

### 태블릿 (768px 이하)
- 적응형 그리드 레이아웃
- 중간 크기 UI 요소

### 데스크톱 (768px 이상)
- 전체 기능 활용
- 키보드 단축키 지원
- 다중 컬럼 레이아웃

## 🐛 문제 해결

### 로딩 화면이 계속 나타나는 경우
- 브라우저 개발자 도구(F12)에서 Console 탭 확인
- JavaScript 에러가 있는지 확인
- 네트워크 탭에서 파일 로딩 실패 확인

### 네트워크 오류가 발생하는 경우
- 서버가 실행 중인지 확인 (`npm start`)
- MongoDB가 실행 중인지 확인
- 포트 5000이 사용 중인지 확인

### 인증 관련 문제
- 토큰이 만료된 경우 자동으로 로그아웃
- 브라우저의 localStorage 확인
- 서버 로그에서 에러 메시지 확인

## 📝 스크립트

- `npm start` - 백엔드 프로덕션 서버 실행
- `npm run dev` - 백엔드 개발 서버 실행 (nodemon 사용)
- `npm run frontend` - 프론트엔드 프로덕션 서버 실행
- `npm run dev:frontend` - 프론트엔드 개발 서버 실행 (nodemon 사용)
- `npm run dev:all` - 백엔드 + 프론트엔드 동시 실행 (개발용)
- `npm test` - 테스트 실행 (현재 미구현)

## 🔄 최근 업데이트

### v1.1.0 (2025-09-19)
- ✅ **일괄 삭제 기능**: 여러 할일을 선택하여 한 번에 삭제
- ✅ **날짜/시간 설정**: 정확한 마감일과 시간 설정 기능
- ✅ **기본 시간 설정**: 할일 추가 시 현재 시간 자동 설정
- ✅ **시각적 개선**: 선택된 할일 강조 표시, 텍스트 색상 개선
- ✅ **사용자 경험 향상**: 더 직관적인 UI/UX

### v1.0.0 (2025-09-19)
- ✅ 사용자 인증 시스템 추가 (회원가입, 로그인, JWT)
- ✅ 사용자별 개인 할일 관리
- ✅ 완전한 프론트엔드 웹 애플리케이션
- ✅ 모바일 반응형 디자인
- ✅ 실시간 검색 및 필터링
- ✅ 통계 대시보드
- ✅ 키보드 단축키 지원
- ✅ 접근성 기능
- ✅ 에러 처리 및 사용자 피드백
- ✅ 로딩 상태 관리

## 📄 라이선스

ISC License

## 🤝 기여하기

1. 프로젝트 포크
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 이슈를 생성해주세요.

---

**Todo App** - 효율적인 할일 관리로 생산성을 높이세요! 🚀