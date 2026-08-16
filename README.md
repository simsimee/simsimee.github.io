# 심민우 · 데이터 중심 AI 포트폴리오

GitHub Pages에서 배포할 수 있는 Astro 기반 정적 포트폴리오입니다.

## 콘텐츠 수정

- 프로필·연락처: `src/data/site.ts`
- 프로젝트 상세 내용: `src/data/projects.ts`
- 경력: `src/pages/experience.astro`
- 소개: `src/pages/about.astro`
- 전체 디자인: `src/styles/global.css`

`src/data/site.ts`의 `github` 값은 실제 GitHub 주소가 확정되면 입력합니다. 빈 값일 때는 GitHub 링크가 화면에 나타나지 않습니다.

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

- `src/data/site.ts`에 실제 GitHub URL 입력
- 회사·고객·데이터·특허의 공개 가능 범위 확인
- 프로젝트 성과 수치와 평가 조건 최종 대조
- 필요하면 `public/resume.pdf` 교체
