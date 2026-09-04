# 심민우 · Computer Vision Engineer 포트폴리오

`심민우_AI_Engineer_Portfolio_v10.pptx`의 16:9 레이아웃과 17개 섹션 흐름을 웹에 맞게 옮긴 GitHub Pages용 Astro 정적 포트폴리오입니다. 데스크톱에서는 슬라이드 비율을 유지하고, 태블릿·모바일에서는 같은 정보 구조를 세로형으로 재배치합니다.

## 콘텐츠 수정

- 프로필·연락처: `src/data/site.ts`
- PPT형 홈 구성: `src/pages/index.astro`
- 프로젝트 상세 내용: `src/data/projects.ts`
- 경력: `src/pages/experience.astro`
- 소개: `src/pages/about.astro`
- 전체 디자인: `src/styles/global.css`

`src/data/site.ts`의 `github`와 `email`은 공개 전 실제 연락처와 일치하는지 확인합니다.

## 로컬 확인

```bash
npm install
npm run dev
```

## GitHub Pages 배포

1. 이 폴더의 내용을 GitHub 저장소에 올립니다.
2. 저장소의 `Settings → Pages`에서 Source를 `GitHub Actions`로 선택합니다.
3. `main` 브랜치에 변경사항을 올리면 자동으로 빌드·배포됩니다.

사용자 페이지 저장소(`<github-id>.github.io`)와 일반 프로젝트 저장소 양쪽의 경로를 자동으로 처리합니다.

## 공개 전 확인

- `src/data/site.ts`의 이메일·전화번호·GitHub URL 확인
- 회사·고객·데이터·특허의 공개 가능 범위 확인
- 프로젝트 성과 수치와 평가 조건 최종 대조
- 필요하면 `public/resume.pdf` 교체
