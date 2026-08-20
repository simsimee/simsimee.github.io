export const siteProfile = {
  name: '심민우',
  role: 'Computer Vision Engineer',
  positioning: 'Computer Vision · Object Detection · Generative Vision · Multimodal AI',
  email: 'smw5626@gmail.com',
  github: 'https://github.com/simsimee',
  resumePath: 'resume.pdf',
  description:
    'Object Detection·OCR·Generative Vision·Multimodal AI 모델을 학습하고 평가한 Computer Vision 엔지니어 심민우의 포트폴리오.'
};

export const pipelineStages = [
  {
    key: 'diagnose',
    number: '01',
    title: 'Task',
    question: 'CV Task·Metric 정의',
    description: '입력·출력·성공 지표 정의. Failure Case 분석을 통한 성능 병목 구체화.'
  },
  {
    key: 'select',
    number: '02',
    title: 'Model',
    question: 'Architecture·Representation',
    description: 'YOLO·RF-DETR·TrOCR·TRELLIS·CLIP 등 태스크에 맞는 모델과 표현 방식 선택.'
  },
  {
    key: 'generate',
    number: '03',
    title: 'Data',
    question: 'Curation·Synthetic Data',
    description: '모델 오류와 분포를 기준으로 학습 데이터 선별·증강·생성.'
  },
  {
    key: 'validate',
    number: '04',
    title: 'Evaluate',
    question: 'Performance·Quality',
    description: 'mAP·Accuracy·CER·품질 기준으로 모델 성능 비교. 오류 분석을 다음 실험으로 환류.'
  }
] as const;

export const workingPrinciples = [
  'Task·Metric·Failure Case를 모델 선택 전에 명확히 정의',
  '단일 Architecture가 아닌 복수 모델에서 효과 비교',
  'Synthetic Data·Multimodal 품질을 모델 지표와 Quality Gate로 검증',
  '측정된 결과와 추정 효과를 명확하게 구분'
];
