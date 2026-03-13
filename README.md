# Japanese Learning Automation MVP

Next.js + TypeScript + Notion API + OpenAI API 기반의 일본어 학습 자동화 시스템입니다.

가정:
- 단일 사용자 MVP입니다.
- 배포 환경은 로컬 또는 Vercel입니다.
- Notion DB는 직접 생성하며, 속성명은 아래 표와 정확히 맞춰야 합니다.
- 로컬 개발 편의를 위해 `OPENAI_ENABLE_MOCK=true`, `NOTION_SKIP_SYNC=true` 모드를 지원합니다.

## 1. 폴더 구조

```text
.
├── app
│   ├── api
│   │   ├── cron
│   │   │   └── daily-generate
│   │   │       └── route.ts
│   │   └── generate
│   │       └── route.ts
│   │   └── notion
│   │       └── generate
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   └── generate-button.tsx
│   └── sync-progress-button.tsx
├── data
│   └── .gitkeep
├── lib
│   ├── date.ts
│   ├── env.ts
│   ├── notion.ts
│   ├── openai.ts
│   ├── services
│   │   └── daily-generator.ts
│   ├── store.ts
│   └── types.ts
├── .env.example
├── .gitignore
├── next.config.ts
├── next-env.d.ts
├── package.json
├── README.md
├── tsconfig.json
└── vercel.json
```

## 2. 필요한 파일 전체 목록

- `package.json`
- `tsconfig.json`
- `next-env.d.ts`
- `next.config.ts`
- `.gitignore`
- `.env.example`
- `vercel.json`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/api/generate/route.ts`
- `app/api/cron/daily-generate/route.ts`
- `app/api/notion/generate/route.ts`
- `components/generate-button.tsx`
- `components/sync-progress-button.tsx`
- `lib/types.ts`
- `lib/date.ts`
- `lib/env.ts`
- `lib/store.ts`
- `lib/notion.ts`
- `lib/openai.ts`
- `lib/services/daily-generator.ts`
- `data/.gitkeep`
- `README.md`

## 3. Notion DB 스키마

### Daily Routine DB

Database 이름 예시: `Daily Routine`

필수 속성:
- `이름` : Title
- `날짜` : Date
- `주제` : Rich text
- `요약` : Rich text
- `상태` : Select
- `총 XP` : Number
- `획득 XP` : Number
- `루틴 ID` : Rich text

`Status` 값 예시:
- `생성됨`

### Vocabulary DB

Database 이름 예시: `Vocabulary`

필수 속성:
- `이름` : Title
- `날짜` : Date
- `일본어` : Rich text
- `읽기` : Rich text
- `뜻` : Rich text
- `예문` : Rich text
- `예문 읽기` : Rich text
- `예문 뜻` : Rich text
- `루틴 ID` : Rich text

### Quest Tracker DB

Database 이름 예시: `Quest Tracker`

필수 속성:
- `이름` : Title
- `날짜` : Date
- `설명` : Rich text
- `XP` : Number
- `상태` : Select
- `완료` : Checkbox
- `루틴 ID` : Rich text

`Status` 값 예시:
- `진행중`
- `완료`

## 4. 설정 및 실행 방법

### 4-1. 환경 변수 준비

```bash
cp .env.example .env
```

로컬 테스트용 최소 설정:

```env
APP_TIMEZONE=Asia/Seoul
APP_BASE_URL=http://localhost:3000
CRON_SECRET=change-me
NOTION_BUTTON_SECRET=change-me-notion-button
OPENAI_ENABLE_MOCK=true
NOTION_SKIP_SYNC=true
```

실제 OpenAI/Notion 연동 설정:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
OPENAI_ENABLE_MOCK=false

NOTION_TOKEN=secret_xxx
NOTION_DAILY_ROUTINE_DB_ID=...
NOTION_VOCABULARY_DB_ID=...
NOTION_QUEST_TRACKER_DB_ID=...
NOTION_SKIP_SYNC=false
```

### 4-2. 패키지 설치

```bash
npm install
```

### 4-3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 후 `오늘 학습 수동 생성` 버튼을 누르면:
- 오늘 날짜 기준 루틴 생성
- 중복 생성이면 기존 데이터 반환
- `NOTION_SKIP_SYNC=false`면 Notion DB에 저장
- 로컬 상태는 `data/state.json`에 저장

`퀘스트 진행 동기화` 버튼을 누르면:
- Notion `퀘스트 추적기`의 `완료` 체크박스 또는 `상태` 값을 읽음
- 완료된 퀘스트 XP를 합산
- `일일 루틴`의 `획득 XP` 값을 갱신

## 5. 하루 1회 자동 생성 방법

### Vercel Cron

`vercel.json`에 다음 cron이 포함되어 있습니다.

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-generate",
      "schedule": "0 6 * * *"
    }
  ]
}
```

한국 시간 오전 6시에 호출되도록 의도한 예시이며, 실제 해석은 배포 환경의 cron 설정에 따라 달라질 수 있으니 배포 플랫폼 시간대를 확인하세요.

cron 호출 시 인증 헤더 필요:

```bash
curl -H "Authorization: Bearer change-me" http://localhost:3000/api/cron/daily-generate
```

## 6. Notion 버튼 연동 방법

Notion 버튼에서 webhook을 호출해 오늘 학습을 생성할 수 있습니다.

추천 엔드포인트:

```text
POST /api/notion/generate?secret=<NOTION_BUTTON_SECRET>
```

로컬 예시:

```text
http://localhost:3000/api/notion/generate?secret=change-me-notion-button
```

배포 예시:

```text
https://your-domain.com/api/notion/generate?secret=change-me-notion-button
```

Notion 버튼 설정 순서:

1. Notion 페이지에서 `/button` 입력
2. 버튼 이름을 `오늘 일본어 생성`으로 지정
3. 액션에서 `Send webhook` 선택
4. URL에 위 엔드포인트 입력
5. 메서드는 `POST`
6. 버튼 클릭

이 버튼은 기존 중복 방지 로직을 그대로 사용하므로 같은 날짜에는 새 루틴을 다시 만들지 않습니다.

## 7. 중복 생성 방지 방식

- 기준 키: `daily-routine:YYYY-MM-DD`
- 저장 위치: `data/state.json`
- 오늘 날짜 루틴이 이미 있으면 새 생성 없이 기존 데이터 반환
- 최근 14일 어휘와 동일한 `japanese + reading` 조합이 나오면 생성 실패 처리

## 8. 테스트 방법

### 로컬 mock 테스트

1. `.env`에서 아래 값을 유지합니다.
   - `OPENAI_ENABLE_MOCK=true`
   - `NOTION_SKIP_SYNC=true`
2. 서버 실행:

```bash
npm run dev
```

3. 수동 생성 API 테스트:

```bash
curl -X POST http://localhost:3000/api/generate
```

4. Notion 버튼용 webhook 테스트:

```bash
curl -X POST "http://localhost:3000/api/notion/generate?secret=change-me-notion-button"
```

5. 중복 방지 확인:
   - 같은 날 다시 한 번 `POST /api/generate` 호출
   - `duplicate: true` 응답 확인

### 실연동 테스트

1. Notion DB 3개 생성
2. `.env`에 OpenAI/Notion 실키 입력
3. 아래 값 설정
   - `OPENAI_ENABLE_MOCK=false`
   - `NOTION_SKIP_SYNC=false`
4. `POST /api/generate` 호출
5. Notion의 `Daily Routine`, `Vocabulary`, `Quest Tracker` DB에 페이지 생성 확인
6. `Quest Tracker`에서 `완료` 체크박스를 바꾼 뒤 `퀘스트 진행 동기화` 버튼 또는 `POST /api/sync-progress` 호출

## 9. API 요약

### `POST /api/generate`

오늘 날짜 기준 루틴을 생성합니다.

응답 예시:

```json
{
  "ok": true,
  "duplicate": false,
  "message": "2026-03-13 루틴 생성과 저장이 완료되었습니다."
}
```

### `GET /api/cron/daily-generate`

하루 1회 자동 생성을 위한 cron 엔드포인트입니다.

헤더:

```text
Authorization: Bearer <CRON_SECRET>
```

### `POST /api/notion/generate?secret=<NOTION_BUTTON_SECRET>`

Notion 버튼 webhook용 엔드포인트입니다.

응답 예시:

```json
{
  "ok": true,
  "duplicate": false,
  "message": "2026-03-13 루틴 생성과 저장이 완료되었습니다.",
  "routineId": "60a5dcdadeec291d",
  "date": "2026-03-13",
  "theme": "카페에서 주문하기"
}
```

### `POST /api/sync-progress`

오늘 `퀘스트 추적기`의 완료 상태를 읽어 `획득 XP`를 다시 계산합니다.

## 10. 구현상 합리적 가정

- 사용자별 멀티 계정 기능은 아직 없습니다.
- XP 누적은 Notion보다는 일일 루틴 생성과 퀘스트 생성까지를 우선 구현했습니다.
- Notion relation 대신 `Routine ID`를 공통 키로 저장해 MVP 연결을 단순화했습니다.
- 영구 저장소는 DB 대신 `data/state.json`을 사용했습니다. 추후 PostgreSQL/Prisma로 교체하기 쉽도록 서비스 로직은 `lib/services`에 분리했습니다.
