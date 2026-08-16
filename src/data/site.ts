export const siteProfile = {
  name: '심민우',
  role: 'AI / ML 엔지니어',
  positioning: 'Data-Centric AI · Synthetic Data · Document AI · Computer Vision',
  email: 'smw5626@gmail.com',
  github: 'https://github.com/simsimee',
  resumePath: 'resume.pdf',
  description:
    '데이터 전략으로 모델 성능과 데이터 생산 효율을 개선한 AI 엔지니어 심민우의 포트폴리오.'
};

export const pipelineStages = [
  {
    key: 'diagnose',
    number: '01',
    title: 'Diagnose',
    question: '데이터 결손과 원인',
    description: 'Failure case와 데이터 분포 분석. 성능 저하 원인과 부족 조건 정의.'
  },
  {
    key: 'select',
    number: '02',
    title: 'Select',
    question: '수집·선별 기준',
    description: '학습 기여도가 높은 샘플 우선 확보. 중복 제거와 조건 coverage 관리.'
  },
  {
    key: 'generate',
    number: '03',
    title: 'Generate',
    question: '합성 대상과 생성 조건',
    description: '실제 분포와 변형 조건 모델링. 부족하거나 수집하기 어려운 데이터 생성.'
  },
  {
    key: 'validate',
    number: '04',
    title: 'Validate',
    question: '모델 성능 기여도',
    description: '동일한 평가 조건에서 효과 비교. Quality Gate로 생성 실패 차단.'
  }
] as const;

export const workingPrinciples = [
  '모델 변경 전, 데이터 병목과 Failure Case 확인',
  'Synthetic Data 효과를 동일한 평가 조건에서 검증',
  '생성 실패를 pipeline 내부 Quality Gate에서 처리',
  '측정된 결과와 추정 효과를 명확하게 구분'
];
