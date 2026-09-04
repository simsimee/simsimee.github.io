export type PipelineStage = 'diagnose' | 'select' | 'generate' | 'validate';

export type ProjectMetric = {
  value: string;
  label: string;
  context: string;
};

export type ProjectArtifact = {
  src: string;
  title: string;
  caption: string;
  alt: string;
  width: number;
  height: number;
  featured?: boolean;
};

export type Project = {
  slug: string;
  order: number;
  organization: string;
  title: string;
  shortTitle: string;
  period: string;
  category: string;
  intro: string;
  resultLine: string;
  role: string;
  stacks: string[];
  stages: PipelineStage[];
  metrics: ProjectMetric[];
  evidenceSummary: string;
  artifacts?: ProjectArtifact[];
  context: string[];
  dataProblem: {
    title: string;
    description: string;
    signals: string[];
  };
  alternatives: Array<{
    name: string;
    limitation: string;
    selected?: boolean;
  }>;
  pipeline: Array<{
    title: string;
    detail: string;
  }>;
  decisions: Array<{
    number: string;
    title: string;
    problem: string;
    solution: string;
    effect: string;
  }>;
  contributions: {
    direct: string[];
    reused: string[];
    collaboration: string[];
  };
  experiment: string[];
  findings: string[];
  limitations: string[];
  nextSteps: string[];
};

export const projects: Project[] = [
  {
    slug: 'dla',
    order: 1,
    organization: '셀렉트스타',
    title: 'Document Layout Analysis',
    shortTitle: 'Layout-aware Augmentation',
    period: '2025.06 — 2025.09',
    category: 'Computer Vision · Object Detection',
    intro:
      '도메인별 원본 400장을 보완하기 위해 레이아웃 분포 기반 합성과 박스 라벨 자동 생성을 설계했습니다.',
    resultLine: '두 모델·세 도메인에서 비교 증강 중 최고 mAP',
    role: '기법 제안 · 구현 · 실험 설계 · 평가',
    stacks: ['YOLOv13', 'RF-DETR', 'PyTorch', 'DocLayNet', 'KDE', 'Augraphy', 'Python'],
    stages: ['diagnose', 'select', 'generate', 'validate'],
    metrics: [
      { value: '0.7375 → 0.8049', label: 'YOLOv13 평균 mAP', context: '세 도메인 평균' },
      { value: '0.6390 → 0.6951', label: 'RF-DETR 평균 mAP', context: '세 도메인 평균' },
      { value: '+8.81%p', label: '최대 개선', context: 'baseline 대비' }
    ],
    evidenceSummary: '공개 가능한 결과표·파이프라인·증강 예시만 수록.',
    artifacts: [
      {
        src: '/images/projects/dla/doclaynet-results.png',
        title: 'DocLayNet 공개 데이터셋 결과',
        caption: '두 탐지 모델의 도메인별 mAP 비교.',
        alt: 'DocLayNet 3개 도메인에서 YOLOv13과 RF-DETR 증강 방법별 mAP를 비교한 결과표',
        width: 1210,
        height: 985,
        featured: true
      },
      {
        src: '/images/projects/dla/pipeline.png',
        title: 'Layout-aware 합성 파이프라인',
        caption: '요소 추출, 분포 추정, 페이지 생성 과정.',
        alt: '저자원 라벨 문서에서 자산을 추출하고 레이아웃 분포를 모델링해 합성 문서를 생성하는 파이프라인',
        width: 1151,
        height: 631
      },
      {
        src: '/images/projects/dla/augmentation-examples.png',
        title: '기존 증강 적용 사례',
        caption: '문서 구조를 훼손한 혼합 증강 사례.',
        alt: '혼합 기반 문서 증강이 적용된 네 가지 예시',
        width: 1142,
        height: 482
      }
    ],
    context: [
      '민감정보로 추가 수집과 외부 라벨링이 제한됐습니다.',
      '표·본문·제목의 위치와 크기가 도메인마다 달랐습니다.',
      '픽셀 증강만으로는 문서 배치가 충분히 달라지지 않았습니다.'
    ],
    dataProblem: {
      title: '데이터 수보다 레이아웃 커버리지가 부족했습니다',
      description:
        '저자원 문서에서는 특정 클래스가 나타나는 위치와 크기가 편중되고, Formula·Caption 같은 희소 클래스는 수십 개 수준에 머물렀습니다. 문제를 단순한 샘플 부족이 아니라 도메인 레이아웃 분포의 미관측 영역으로 정의했습니다.',
      signals: ['도메인별 500장', '상위 3개 클래스가 70% 이상 점유', '희소 클래스 수십 개 수준', '템플릿 편중']
    },
    alternatives: [
      { name: 'Cutout · GridMask', limitation: '국소 손상에는 강해지지만 새로운 레이아웃 변주를 만들지 못합니다.' },
      { name: 'CutMix · MixUp', limitation: '한 페이지가 하나의 의미 단위라는 문서 구조를 훼손할 수 있습니다.' },
      { name: '무작위 문서 합성', limitation: '위치·구성·문맥이 어긋난 비현실적인 페이지가 증가합니다.' },
      { name: '분포 기반 합성', limitation: '실제 레이아웃 prior를 유지하면서 부족한 변형을 확장할 수 있습니다.', selected: true }
    ],
    pipeline: [
      { title: '요소 추출', detail: '본문·표·제목 crop과 의미 임베딩을 저장합니다.' },
      { title: '분포 추정', detail: '위치·크기·개수 분포를 KDE로 추정합니다.' },
      { title: '페이지 생성', detail: '겹침·점유율 조건을 적용하고 라벨을 함께 생성합니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: '레이아웃 분포를 증강 단위로 사용',
        problem: '일반 증강은 이미지를 바꾸지만 부족한 위치·크기·개수 조합을 새로 관측시키지 못했습니다.',
        solution: '클래스별 위치·크기·개수 분포를 KDE로 추정해 새 페이지를 샘플링했습니다.',
        effect: '원본 요소를 재사용하면서 배치 변화를 늘렸습니다.'
      },
      {
        number: '02',
        title: '배치와 라벨을 함께 생성',
        problem: '분포만 따라도 요소가 겹치거나 서로 무관한 자산이 한 페이지에 섞일 수 있었습니다.',
        solution: '겹침·점유율 조건을 통과한 배치만 사용하고 박스 라벨을 자동 생성했습니다.',
        effect: '두 모델·세 도메인에서 비교 증강 중 최고 mAP를 기록했습니다.'
      }
    ],
    contributions: {
      direct: ['레이아웃 합성 설계·구현', '박스 라벨 자동 생성', '비교 증강 실험과 두 모델 평가'],
      reused: ['YOLOv13·RF-DETR', 'DocLayNet·Augraphy'],
      collaboration: ['내부 데이터 구축·공개 범위 검토']
    },
    experiment: [
      '도메인별 500장을 Train 400 / Test 100으로 분리했습니다.',
      '원본 400장에 합성 2,000장을 추가했습니다.',
      '동일 test set에서 비교 증강을 평가했습니다.'
    ],
    findings: [
      'YOLOv13 평균 mAP는 0.7375에서 0.8049로 높아졌습니다.',
      'RF-DETR 평균 mAP는 0.6390에서 0.6951로 높아졌습니다.'
    ],
    limitations: ['레이아웃 분포 재현성을 별도 지표로 측정하지 못했습니다.', '의미 유사도 단계의 독립 기여도를 확인하지 못했습니다.'],
    nextSteps: ['레이아웃 분포 재현성 측정', '의미 유사도 기반 자산 선택 ablation', '저품질 스캔·손상 문서 평가']
  },
  {
    slug: 'data-centric-detection',
    order: 3,
    organization: '에이모 (AIMMO)',
    title: '에이모 · 자율주행 데이터셋 최적화',
    shortTitle: 'Dataset Optimization',
    period: '2022.02 — 2023.05',
    category: 'Computer Vision · Object Detection',
    intro:
      'ODD로 수집 조건을 정의하고, Active Learning과 임베딩 검색으로 학습 데이터의 중복을 줄였습니다.',
    resultLine: '13만 → 8만 장, mAP 0.64 → 0.85',
    role: '조건 정의 · 추출 시스템 · 큐레이션 툴 · FP/FN 분석',
    stacks: ['YOLOv5', 'CLIP', 'ResNet', 'PyTorch', 'FAISS', 'FiftyOne', 'Python', 'ISO 34503'],
    stages: ['diagnose', 'select', 'validate'],
    metrics: [
      { value: '13만 → 8만', label: '학습 데이터', context: '약 40% 감소' },
      { value: '0.64 → 0.85', label: 'mAP', context: '동일 탐지 과제' },
      { value: '5일 → 2일', label: 'AL 수집', context: '정제 비용 약 50% 절감' }
    ],
    evidenceSummary: '고객 데이터는 비공개. 실험 수치와 구현 구조만 수록.',
    context: [
      '학습 기여도가 낮은 데이터가 대량 저장됐습니다.',
      '날씨·조도·도로·가림 기준이 필요했습니다.',
      '중복 이미지가 데이터 다양성을 낮췄습니다.'
    ],
    dataProblem: {
      title: '데이터의 양보다 정보 밀도와 조건 커버리지가 문제였습니다',
      description:
        '날씨·조도·도로 환경·객체 가림 정도를 통제하지 않은 수집은 쉬운 샘플과 중복 장면을 과도하게 축적했습니다. ODD와 오류 분석을 이용해 모델이 취약한 조건을 수집 변수로 다시 정의했습니다.',
      signals: ['중복·유사 주행 장면', '무기여 데이터 대량 저장', '희소 조건 부족', '레이블링 비용 증가']
    },
    alternatives: [
      { name: '무작위 대량 수집', limitation: '쉬운 장면과 중복 데이터가 함께 늘어납니다.' },
      { name: '수집 후 전수 정제', limitation: '저장·검수·레이블링 비용이 이미 발생한 뒤입니다.' },
      { name: '조건·불확실성 기반 수집', limitation: '어려운 조건을 앞단에서 우선 확보할 수 있습니다.', selected: true },
      { name: '임베딩 기반 큐레이션', limitation: '유사도와 분포를 이용해 중복을 제거하고 다양성을 확인할 수 있습니다.', selected: true }
    ],
    pipeline: [
      { title: '데이터셋 최적화', detail: 'ISO 34503 ODD를 정의하고 7건을 실험합니다.' },
      { title: 'Active Learning', detail: 'YOLOv5와 uncertainty로 어려운 샘플을 먼저 추출합니다.' },
      { title: '중복 제거', detail: '임베딩 유사도 검색으로 중복 데이터를 제거합니다.' },
      { title: '큐레이션 툴', detail: 'ResNet·FAISS·FiftyOne으로 분포를 확인합니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: '수집 조건을 ODD로 정의',
        problem: '수집 요청이 “다양하게 많이”처럼 모호하면 실제 취약 조건의 커버리지를 판단할 수 없었습니다.',
        solution: '날씨·조도·도로·가림을 수집 변수로 정의했습니다.',
        effect: '7건의 조건별 실험 기준을 통일했습니다.'
      },
      {
        number: '02',
        title: '어려운 샘플을 먼저 저장',
        problem: '학습 기여도와 관계없이 데이터를 저장한 후 사람이 정제하고 있었습니다.',
        solution: 'YOLOv5 조건 필터와 uncertainty로 수집 우선순위를 정했습니다.',
        effect: '수집 기간을 5일에서 2일로 줄였습니다.'
      },
      {
        number: '03',
        title: '임베딩으로 중복 확인',
        problem: '파일 목록과 단순 메타데이터만으로는 대량 이미지의 중복과 분포를 파악하기 어려웠습니다.',
        solution: 'ResNet·FAISS 검색과 FiftyOne 시각화를 연결했습니다.',
        effect: '중복 제거와 분포 확인을 한 화면에서 처리했습니다.'
      }
    ],
    contributions: {
      direct: ['ODD 조건 정의·7건 실험', 'Active Learning 추출 시스템', '큐레이션 툴과 FP/FN 분석'],
      reused: ['YOLOv5·CLIP·ResNet', 'FAISS·FiftyOne'],
      collaboration: ['자율주행팀과 수집·레이블링 기준 조정']
    },
    experiment: ['날씨·조도·도로·가림 조건으로 7건을 실험했습니다.', '무작위 13만 장과 최적화 8만 장을 비교했습니다.'],
    findings: ['데이터를 약 40% 줄이고 mAP을 0.64에서 0.85로 높였습니다.', 'AL 수집 기간은 5일에서 2일로 줄었습니다.'],
    limitations: ['큐레이션 단계별 기여도를 분리하지 못했습니다.', '고객 데이터의 세부 구성은 공개할 수 없습니다.'],
    nextSteps: ['선택 정책별 ablation', '데이터 버전·실험·성능 manifest']
  },
  {
    slug: 'ocr',
    order: 2,
    organization: '셀렉트스타',
    title: '실시간 한글 손글씨 OCR 모델 개발',
    shortTitle: 'Handwriting OCR',
    period: '2024.05 — 2024.12',
    category: 'Computer Vision · Vision-Language',
    intro:
      '합성 손글씨와 character-level 토크나이저를 결합한 1-stage TrOCR를 개발했습니다.',
    resultLine: 'Text Recognition Accuracy 83%, 평균 추론 0.07초',
    role: '데이터 생성 · TrOCR 학습 · 오류 분석 · 납품',
    stacks: ['TrOCR', 'Hugging Face', 'PyTorch', 'OpenCV', 'TensorBoard', 'Pillow', 'Python'],
    stages: ['diagnose', 'select', 'generate', 'validate'],
    metrics: [
      { value: '83%', label: 'Text Recognition Accuracy', context: '실사용 800장 평가' },
      { value: '0.07초', label: '평균 추론 시간', context: '0.04~0.1초' },
      { value: '800', label: '실사용 평가 이미지', context: '학습 데이터와 분리' }
    ],
    evidenceSummary: '고객사와 사내 데이터 세부 구성은 비공개.',
    artifacts: [
      {
        src: '/images/projects/ocr/prediction-cases.png',
        title: 'CustomTokenizer 추론 결과',
        caption: '기존 TrOCR와 문자 단위 토크나이저 비교.',
        alt: '한글 손글씨 네 건에 대한 기존 TrOCR와 CustomTokenizer 모델의 예측 결과 비교',
        width: 850,
        height: 650,
        featured: true
      },
      {
        src: '/images/projects/ocr/augmentation-samples.png',
        title: '손글씨 증강 결과',
        caption: '필압·회전·지움·밝기·노이즈 변형.',
        alt: '같은 한글 손글씨에 일곱 가지 증강 방법을 적용한 결과',
        width: 1132,
        height: 737
      },
      {
        src: '/images/projects/ocr/model-results.png',
        title: '개발 과정의 Accuracy·CER 비교',
        caption: 'TrOCR 구성별 내부 비교. 최종 800장 평가와는 조건이 다릅니다.',
        alt: 'TrOCR 모델 구성별 CER Accuracy 카테고리 정확도 추론 속도를 비교한 표',
        width: 860,
        height: 670
      },
      {
        src: '/images/projects/ocr/failure-cases.png',
        title: '판단이 어려운 실패 사례',
        caption: '모호한 필기와 잘못된 고신뢰 예측.',
        alt: '인식하기 어려운 손글씨와 OCR 오예측 사례',
        width: 810,
        height: 500
      }
    ],
    context: [
      '평가용 실사용 800장은 학습에 사용할 수 없었습니다.',
      '멀티라인과 필체·필압 차이를 학습해야 했습니다.',
      'BPE가 작성 중 문자열을 완성해 출력했습니다.'
    ],
    dataProblem: {
      title: '실사용 데이터 제한과 조기 문자열 생성',
      description:
        '초기 실사용 이미지는 116장뿐이었고 멀티라인·필체·필압의 차이가 컸습니다. 동시에 BPE 토크나이저가 작성되지 않은 이후 문자열까지 복원하는 현상이 있어 데이터와 표현 방식을 함께 수정해야 했습니다.',
      signals: ['초기 실사용 116장', '멀티라인 가능성', '필체·필압 편차', '조기 토큰 예측']
    },
    alternatives: [
      { name: 'Detection → Recognition', limitation: '붙거나 기울어진 손글씨에서 Detection 오류가 전체 결과로 전파됩니다.' },
      { name: '실사용 데이터만 학습', limitation: '수량과 작성자 다양성이 부족해 과적합 위험이 큽니다.' },
      { name: '새 토크나이저 학습', limitation: '저자원 조건에서 사전학습 임베딩을 잃는 비용이 큽니다.' },
      { name: '1-stage TrOCR + 합성 + 기존 vocab 래핑', limitation: 'Detection 의존성을 없애고 사전학습 정보를 유지할 수 있습니다.', selected: true }
    ],
    pipeline: [
      { title: '학습 데이터', detail: '공개·사내·합성 데이터를 단계적으로 사용합니다.' },
      { title: '손글씨 생성', detail: '폰트·자간·행간·시작 위치를 무작위화합니다.' },
      { title: '문자 단위 디코딩', detail: '기존 vocab을 유지하고 한 글자씩 출력합니다.' },
      { title: '오류 분석', detail: 'CER·난이도·confidence별 오답을 분리합니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: '필기 변형을 생성 조건으로 사용',
        problem: '깨끗한 폰트 이미지만으로는 태블릿 필기의 자간·행간·필압·획 특성을 표현하기 어려웠습니다.',
        solution: '폰트·자간·행간·시작 위치와 필압을 무작위화했습니다.',
        effect: '합성 손글씨 31,900장을 만들었습니다.'
      },
      {
        number: '02',
        title: '기존 vocab을 문자 단위로 사용',
        problem: 'BPE 방식이 관측되지 않은 이후 토큰까지 복원해 “아직 다 쓰지 않음”을 “정답”으로 오판했습니다.',
        solution: 'encode·decode만 문자 단위로 바꾸고 나머지는 기존 인터페이스를 유지했습니다.',
        effect: '작성되지 않은 접미 문자열 생성을 줄였습니다.'
      },
      {
        number: '03',
        title: '고신뢰 오답을 별도 분리',
        problem: '평균 지표만으로는 특정 필드의 실패와 모델이 확신하며 틀리는 사례를 찾기 어려웠습니다.',
        solution: '카테고리·난이도·confidence별 오답을 기록했습니다.',
        effect: '난독 필기의 보류 구간을 따로 검토했습니다.'
      }
    ],
    contributions: {
      direct: ['손글씨 생성·증강', 'TrOCR 학습·평가', 'Character-level CustomTokenizer', '고신뢰 오답 분석'],
      reused: ['한국어 TrOCR 사전학습 모델', 'AI Hub 손글씨 데이터'],
      collaboration: ['평가 기준 조율·추론 코드 전달']
    },
    experiment: ['AI Hub 519,550장, 사내 63,000장, 합성 31,900장을 사용했습니다.', '실사용 800장은 학습에서 제외하고 평가에만 사용했습니다.'],
    findings: ['정확도 83%, 평균 추론 0.07초를 기록했습니다.', '문자 단위 토크나이저로 조기 문자열 생성을 줄였습니다.'],
    limitations: ['개인별 연결 필기 습관은 충분히 재현하지 못했습니다.', '난독 필기의 보류 기준을 완성하지 못했습니다.'],
    nextSteps: ['confidence·난이도별 보류 구간 설정', '실패 유형을 합성 조건에 반영']
  },
  {
    slug: '3d-marine',
    order: 6,
    organization: '셀렉트스타',
    title: '정찰용 무인수상정 3D 합성 데이터',
    shortTitle: '3D Synthetic Data',
    period: '2025.09 — 2026.07',
    category: 'Generative Vision · Image-to-3D',
    intro: '단일 이미지에서 3D 객체와 여러 시점을 만들어 고해상도 배경에 합성했습니다.',
    resultLine: '합성 데이터 10,000건, 배경·위치·스케일·조도 4개 조건',
    role: '3D 객체 생성 · 다각도 렌더 · 해상도 정합 · 파이프라인 설계',
    stacks: ['TRELLIS', 'Diffusers', 'CLIP', 'PyTorch', 'OpenCV', 'CUDA', 'Docker'],
    stages: ['select', 'generate', 'validate'],
    metrics: [
      { value: '10,000건', label: '합성 데이터', context: '내부 활용' },
      { value: '4개', label: '생성 조건', context: '배경·위치·스케일·조도' },
      { value: '내부 운영', label: '정찰용 무인수상정 체계', context: '보안·컴플라이언스 기준' }
    ],
    evidenceSummary: '보안 대상 원본과 합성 이미지는 비공개입니다.',
    context: [
      '수집할 수 없는 표적의 학습 데이터가 필요했습니다.',
      '소량의 실물·공개 이미지만 확보할 수 있었습니다.',
      '한 장의 이미지로는 여러 각도를 만들기 어려웠습니다.',
      '합성 출력과 원본 배경의 해상도를 맞춰야 했습니다.'
    ],
    dataProblem: {
      title: '현실에서 관측하기 어려운 시점과 배경 조합이 비어 있었습니다',
      description:
        '탐지 모델이 취약한 조건은 학습 데이터에 없는 각도와 장면이지만, 대상 특성상 추가 촬영이 어려웠습니다. 단순 복사보다 3D 표현을 경유해 시점을 만들고 장면 정합성을 확보하는 방향을 선택했습니다.',
      signals: ['희귀 객체', '단일 시점 입력', '배경 조건 부족', '1080p·4K 원본', '복수 CUDA 환경']
    },
    alternatives: [
      { name: '2D 회전·원근 변형', limitation: '가려진 면의 형상을 새로 만들 수 없습니다.' },
      { name: '단순 copy-paste', limitation: '테두리와 색조 불일치가 남고 시점 분포가 바뀌지 않습니다.' },
      { name: '배경 전체 512 리사이즈', limitation: '종횡비와 고해상도 원본 디테일이 손실됩니다.' },
      { name: 'Image-to-3D + 조건부 확산', limitation: '새 시점과 장면 정합성을 함께 다룰 수 있습니다.', selected: true }
    ],
    pipeline: [
      { title: '3D 객체 생성', detail: 'TRELLIS로 단일 이미지를 3D 객체로 변환합니다.' },
      { title: '다각도 렌더', detail: '3D 객체를 여러 각도에서 렌더링해 시점 데이터를 만듭니다.' },
      { title: '해상도 정합', detail: '합성 영역만 crop하고 원본 좌표에 복원합니다.' },
      { title: '조건 조합', detail: '배경·위치·스케일·조도를 바꿔 합성 데이터를 생성합니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: '단일 이미지를 다각도 객체로 변환',
        problem: '단일 이미지 3D는 후면과 상부를 추정하므로 육안 전수 검사가 어려운 실패가 발생했습니다.',
        solution: 'TRELLIS로 생성한 3D 객체를 여러 각도에서 렌더링했습니다.',
        effect: '한 장의 이미지로 시점 조건을 확장했습니다.'
      },
      {
        number: '02',
        title: '합성 영역만 잘라 원본 위치에 복원',
        problem: '배경 전체를 512로 줄이면 16:9가 찌그러지고 다시 확대해도 4K 디테일을 복구할 수 없었습니다.',
        solution: 'bbox 중심으로 합성 영역을 crop하고 추론 후 원본 좌표에 복원했습니다.',
        effect: '배경 디테일과 원본 해상도를 유지했습니다.'
      }
    ],
    contributions: {
      direct: ['3D 객체 생성·다각도 렌더', 'crop-paste 좌표 변환', '데이터 생성 파이프라인'],
      reused: ['TRELLIS·조건부 확산', 'OpenCV·Docker'],
      collaboration: ['보안·컴플라이언스 기준 반영']
    },
    experiment: ['배경·위치·스케일·조도 4개 조건을 조합했습니다.', '원본 배경은 유지하고 합성 영역만 복원했습니다.'],
    findings: ['내부 활용 합성 데이터 10,000건을 생성했습니다.', '원본 배경의 해상도와 디테일을 보존했습니다.'],
    limitations: ['합성 전후의 탐지 성능은 측정하지 못했습니다.', '보안 대상 이미지는 공개할 수 없습니다.'],
    nextSteps: ['동일 test set에서 실데이터 전후 성능 비교', 'crop 경계 이음새·기하 일관성 검증']
  },
  {
    slug: 'character-pipeline',
    order: 4,
    organization: '셀렉트스타',
    title: '개인화 캐릭터 생성 AI 파이프라인',
    shortTitle: 'Character Generation',
    period: '2025.03 — 2025.06',
    category: 'Multimodal Vision · Generation',
    intro: '인물 특성을 JSON으로 구조화해 기존 캐릭터 에셋에 적용하고, 로컬 검사 뒤 AI 검수를 수행했습니다.',
    resultLine: '검수 통과율 35% → 85%, 이미지 변환 성공률 98%',
    role: '5단계 파이프라인 단독 설계 · 구현 · 검수 기준 · 예외 처리',
    stacks: ['Gemini', 'OpenCV', 'Pydantic', 'Python', 'NumPy', 'Pillow'],
    stages: ['select', 'generate', 'validate'],
    metrics: [
      { value: '35% → 85%', label: '검수 통과율', context: '내부 PoC 품질 게이트' },
      { value: '98%', label: '이미지 변환 성공률', context: '5단계 파이프라인 결과' },
      { value: '2단계', label: '자동 품질 게이트', context: '로컬 검사 → AI 검수' }
    ],
    evidenceSummary: '내부 PoC 이미지는 비공개입니다. 파이프라인과 집계 결과만 수록했습니다.',
    context: [
      '인물 사진을 직접 변환하면 캐릭터 스타일이 흔들렸습니다.',
      '인물의 특성과 기존 캐릭터의 정체성을 함께 보존해야 했습니다.',
      '배경·손가락·관절 오류를 사람이 매번 검수할 수 없었습니다.'
    ],
    dataProblem: {
      title: '스타일·배경·인체 오류를 자동으로 걸러야 했습니다',
      description:
        '손가락·관절·비율 오류나 배경이 남은 이미지가 사용자에게 전달되면 안 됩니다. 생성 결과의 성공 조건을 명시적인 출력 계약과 단계별 품질 신호로 변환했습니다.',
      signals: ['스타일 미적용', '해부학 오류', '배경 잔여', 'API 일시 실패', '자유 텍스트 파싱 오류']
    },
    alternatives: [
      { name: '인물→캐릭터 직접 변환', limitation: '기존 캐릭터 에셋의 아이덴티티와 스타일을 보존하기 어려웠습니다.' },
      { name: '세그멘테이션 모델 추가', limitation: '별도 모델의 실행 비용과 운영 복잡도가 증가합니다.' },
      { name: 'AI 검수만 사용', limitation: '단순 배경 실패에도 API 비용이 발생하고 판정 일관성이 불명확합니다.' },
      { name: '구조화 스타일 + 로컬→AI 게이트', limitation: '입출력 계약을 고정하고 값싼 실패를 앞에서 차단할 수 있습니다.', selected: true }
    ],
    pipeline: [
      { title: 'Character Select', detail: '기존 캐릭터 에셋을 선택합니다.' },
      { title: 'Style Extract', detail: '피부·헤어·의상·액세서리·포즈를 JSON으로 추출합니다.' },
      { title: 'Image Generate', detail: '특성을 주입하고 #00FF00 배경으로 생성합니다.' },
      { title: 'Local Gate', detail: 'OpenCV로 배경을 제거하고 투명 픽셀을 검사합니다.' },
      { title: 'AI Gate', detail: '인체·스타일·배경 등 7개 기준으로 최종 판정합니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: '인물 특성을 먼저 JSON으로 구조화',
        problem: '사진을 직접 변환하면 캐릭터의 기존 스타일이 적용되지 않거나 정체성이 흔들렸습니다.',
        solution: '피부·헤어·의상·액세서리·포즈만 추출해 기존 캐릭터에 적용했습니다.',
        effect: '인물 특성과 캐릭터 정체성을 분리했습니다.'
      },
      {
        number: '02',
        title: '#00FF00 배경과 OpenCV 크로마키',
        problem: '생성 후 매번 배경 분리 모델을 실행하면 비용과 실패 지점이 늘어납니다.',
        solution: '배경색을 고정하고 크로마키·모폴로지로 알파를 만들었습니다.',
        effect: '별도 배경 제거 모델을 없앴습니다.'
      },
      {
        number: '03',
        title: '로컬 검사 후 AI 검수',
        problem: '배경 제거가 명백히 실패한 결과까지 AI에 보내면 비용이 낭비됩니다.',
        solution: '투명 픽셀 비율을 먼저 검사한 뒤 통과 결과만 AI에 전달했습니다.',
        effect: '단순 실패를 조기에 차단했습니다.'
      }
    ],
    contributions: {
      direct: ['5단계 파이프라인·프롬프트', 'Pydantic 출력 스키마', 'OpenCV 배경 제거', '로컬→AI 품질 게이트'],
      reused: ['Gemini 이미지·멀티모달 모델', '기존 픽셀 캐릭터 에셋', 'OpenCV·Pillow 이미지 처리'],
      collaboration: ['내부 PoC 품질 기준 검토']
    },
    experiment: ['5단계마다 출력 계약을 나눠 자동으로 검사했습니다.', '로컬 검사와 AI 7개 기준을 순차 적용했습니다.'],
    findings: ['검수 통과율을 35%에서 85%로 높였습니다.', '이미지 변환 성공률은 98%였습니다.'],
    limitations: ['AI 검수와 사람 판정의 일치율은 측정하지 못했습니다.', '녹색 계열 의상에서는 크로마키가 취약할 수 있습니다.'],
    nextSteps: ['리뷰·난이도별 자동 보류 구간 설정', '입력 색에 따른 동적 배경색 선택']
  }
];

export const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
