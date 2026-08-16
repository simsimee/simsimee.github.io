export type PipelineStage = 'diagnose' | 'select' | 'generate' | 'validate';

export type ProjectMetric = {
  value: string;
  label: string;
  context: string;
};

export type Project = {
  slug: string;
  order: number;
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
    title: '저자원 Document AI를 위한 Layout-aware Synthetic Augmentation',
    shortTitle: 'Layout-aware Augmentation',
    period: '2025.06 — 2025.09',
    category: 'Document AI · Synthetic Data',
    intro:
      '도메인별 500장만 확보할 수 있는 문서 레이아웃 검출 문제에서, 실제 레이아웃 분포를 학습해 페이지와 라벨을 함께 생성하는 증강 기법을 설계했습니다.',
    resultLine: 'DocLayNet 3개 도메인에서 YOLOv13·RF-DETR 모두 비교 증강 중 Top-1',
    role: '기법 제안 · 실험 설계 · 전 구간 구현 및 평가',
    stacks: ['Python', 'PyTorch', 'YOLOv13', 'RF-DETR', 'DocLayNet', 'KDE', 'Augraphy'],
    stages: ['diagnose', 'generate', 'validate'],
    metrics: [
      { value: '+8.81', label: '최대 mAP points', context: 'YOLOv13 · Financial Reports · baseline 대비' },
      { value: '2 × 3', label: '모델 × 공개 도메인', context: '두 아키텍처, 세 도메인에서 비교 방법 중 Top-1' },
      { value: '400 → 2,400', label: '도메인별 학습 샘플', context: '원본 400장과 합성 2,000장' }
    ],
    context: [
      '금융·공공·과학 문서는 민감정보로 인해 수집·공유·외부 라벨링이 어렵습니다.',
      '도메인별 소수 템플릿에 데이터가 편중되면 위치·크기·구성 요소 수의 변화를 충분히 학습하기 어렵습니다.',
      '픽셀 수준의 일반 증강보다 실제 문서의 레이아웃 prior를 보존하며 변주를 확장할 방법이 필요했습니다.'
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
      { title: 'Asset Mining', detail: '라벨 문서에서 Title·Text·Table·Figure 등 클래스 박스를 잘라 자산 풀을 구성합니다.' },
      { title: 'Layout Modeling', detail: '클래스별 위치·크기와 페이지별 구성 요소 개수 분포를 KDE로 추정합니다.' },
      { title: 'Page Composition', detail: '추정 분포에서 슬롯을 만들고 의미적으로 유사한 자산을 선택해 배치합니다.' },
      { title: 'Quality Control', detail: '겹침과 점유율 제약으로 과밀·과소 샘플을 배제하고 라벨을 자동 생성합니다.' },
      { title: 'Cross-model Evaluation', detail: '동일한 train/test 조건에서 YOLOv13과 RF-DETR로 비교 증강을 평가합니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: '픽셀 변형이 아니라 레이아웃 분포를 증강 단위로 선택',
        problem: '일반 증강은 이미지를 바꾸지만 부족한 위치·크기·개수 조합을 새로 관측시키지 못했습니다.',
        solution: '라벨에서 클래스별 공간 분포와 페이지 구성 분포를 추정하고 그 분포에서 새 페이지 골격을 샘플링했습니다.',
        effect: '자주 등장하는 배치는 자주, 드문 배치는 드물게 생성하면서 실제 범위 안의 변주를 늘렸습니다.'
      },
      {
        number: '02',
        title: '공간 제약과 의미 유사도를 품질 보조 장치로 결합',
        problem: '분포만 따라도 요소가 겹치거나 서로 무관한 자산이 한 페이지에 섞일 수 있었습니다.',
        solution: 'overlap·occupancy 필터로 공간 오류를 줄이고, 자산 선택에는 의미 유사도를 보조적으로 사용했습니다.',
        effect: '규칙을 과도하게 강제하지 않으면서 비현실적인 합성 노이즈를 줄였습니다.'
      },
      {
        number: '03',
        title: '단일 모델 의존성 제거: 두 architecture에서 반복 검증',
        problem: '개선이 특정 탐지기 특성에만 의존하면 증강 방법의 일반성을 주장하기 어렵습니다.',
        solution: 'YOLOv13과 RF-DETR, 내부 데이터와 공개 DocLayNet에서 동일한 비교 조건을 구성했습니다.',
        effect: '공개 데이터의 3개 도메인 모두에서 두 모델이 비교 방법 중 가장 높은 mAP@50:95를 기록했습니다.'
      }
    ],
    contributions: {
      direct: ['합성 증강 아이디어와 3단계 파이프라인 설계', 'KDE 기반 레이아웃 모델링과 자동 라벨 생성', '비교군·데이터 분할·평가 지표를 포함한 실험 설계', '두 탐지 모델 학습 및 결과 분석'],
      reused: ['YOLOv13·RF-DETR 학습 프레임워크', 'DocLayNet 공개 데이터셋', 'Augraphy와 일반 Detection 증강 기법'],
      collaboration: ['내부 도메인 데이터 구축 및 공개 범위 검토', '기술 평가 문서와 특허 자료 정리']
    },
    experiment: [
      '도메인별 500장을 Train 400 / Test 100으로 분할하고 증강은 Train에만 적용했습니다.',
      '원본 400장에 증강 2,000장을 추가해 총 2,400장으로 학습했습니다.',
      'baseline, cutout, cutmix, mixup, gridmask, augraphy, doclayout과 제안 방법을 비교했습니다.',
      '평가 지표는 동일 test set의 mAP@50:95로 고정했습니다.'
    ],
    findings: [
      'DocLayNet에서 제안 방법은 두 아키텍처·3개 도메인 모두 비교 증강 중 Top-1을 기록했습니다.',
      '내부 데이터에서는 두 아키텍처 모두 3개 도메인 평균 기준 Top-1이었지만, 공공 도메인에서는 Augraphy가 더 높았습니다.',
      '레이아웃 변주와 이미지 열화는 서로 다른 병목을 다루므로 대체재가 아니라 보완재라는 결론을 얻었습니다.'
    ],
    limitations: ['레이아웃 분포 재현성 자체를 별도 지표로 측정하지 못했습니다.', '의미 유사도 단계의 독립적인 기여를 분리한 ablation이 없습니다.', '검출 외 정보추출·문서 QA 태스크에서 일반성을 확인하지 못했습니다.'],
    nextSteps: ['레이아웃 샘플링 → 공간 제약 → 의미 선택의 단계별 ablation', '위치·크기·개수 분포의 합성-실제 유사도 측정', 'Augraphy와 제안 방법을 함께 적용한 결합 실험']
  },
  {
    slug: 'data-centric-detection',
    order: 2,
    title: 'Data-Centric Object Detection: Dataset Optimization',
    shortTitle: 'Dataset Optimization',
    period: '2022.02 — 2023.05',
    category: 'Data Curation · Active Learning',
    intro:
      '무작위로 더 많이 모으는 대신 모델이 어려워하는 조건과 중복되지 않는 샘플을 우선 확보해, 더 적은 데이터로 더 높은 탐지 성능을 만들었습니다.',
    resultLine: '데이터 약 40% 절감, mAP 0.64 → 0.85',
    role: '데이터 조건 정의 · 실험 · 추출 시스템 · 큐레이션 프로토타입',
    stacks: ['Python', 'PyTorch', 'YOLOv5', 'CLIP', 'ResNet', 'FAISS', 'FiftyOne', 'ISO 34503'],
    stages: ['diagnose', 'select', 'validate'],
    metrics: [
      { value: '−40%', label: '학습 데이터 수량', context: '무작위 13만 장 대비 최적화 8만 장' },
      { value: '0.64 → 0.85', label: 'mAP', context: '동일 탐지 과제에서 데이터 구성 개선 후' },
      { value: '5일 → 2일', label: '데이터 수집 기간', context: '조건별 추출 시스템 적용' }
    ],
    context: [
      '자율주행 데이터는 양이 많아도 유사한 주행 장면이 반복되면 모델에 새로운 정보를 주지 못합니다.',
      '수집 이후 사람이 대량 데이터를 정제하는 방식은 저장·레이블링·검수 비용을 함께 증가시켰습니다.',
      '어떤 조건을 수집하고 어떤 샘플을 남길지 모델 학습 전에 정의할 필요가 있었습니다.'
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
      { title: 'ODD Definition', detail: 'ISO 34503을 바탕으로 날씨·조도·도로·가림 조건을 수집 변수로 정의합니다.' },
      { title: 'Model-guided Extraction', detail: 'YOLOv5와 uncertainty를 이용해 모델이 어려워하는 샘플을 우선 추출합니다.' },
      { title: 'Embedding Curation', detail: 'CLIP·ResNet 임베딩과 FAISS로 중복·유사 데이터를 제거합니다.' },
      { title: 'Visual Inspection', detail: 'FiftyOne으로 분포와 대표 샘플을 시각화해 기준을 검토합니다.' },
      { title: 'Feedback Loop', detail: '100개 이상 테스트 케이스와 FP/FN 분석을 데이터 기준에 다시 반영합니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: 'ODD를 데이터 요구사항으로 변환',
        problem: '수집 요청이 “다양하게 많이”처럼 모호하면 실제 취약 조건의 커버리지를 판단할 수 없었습니다.',
        solution: 'ISO 34503 기반 ODD를 날씨·조도·도로 환경·가림 변수로 풀어 수집·레이블링 요구사항으로 연결했습니다.',
        effect: '실험 조건을 표준화하고 어떤 데이터가 부족한지 팀과 같은 기준으로 논의할 수 있었습니다.'
      },
      {
        number: '02',
        title: 'Active Learning을 수집 앞단에 배치',
        problem: '학습 기여도와 관계없이 데이터를 저장한 후 사람이 정제하고 있었습니다.',
        solution: 'YOLOv5 조건 필터와 uncertainty sampling으로 모델이 어려워하는 장면을 먼저 저장했습니다.',
        effect: '수집 기간을 5일에서 2일로 줄이고 정제 비용을 약 50% 절감했습니다.'
      },
      {
        number: '03',
        title: '임베딩을 품질 탐색 도구로 사용',
        problem: '파일 목록과 단순 메타데이터만으로는 대량 이미지의 중복과 분포를 파악하기 어려웠습니다.',
        solution: 'ResNet 임베딩과 FAISS 인덱싱, FiftyOne 시각화를 결합한 프로토타입을 만들었습니다.',
        effect: '데이터 정제 작업 효율을 약 30% 높이고 고객사 PoC의 데이터 설명 도구로 활용했습니다.'
      }
    ],
    contributions: {
      direct: ['ODD 기반 데이터 조건 정의', 'Active Learning·Uncertainty Sampling 추출 시스템', 'CLIP 기반 semi-auto labeling', 'ResNet·FAISS·FiftyOne 큐레이션 프로토타입', '100개 이상 테스트 케이스와 FP/FN 분석'],
      reused: ['YOLOv5 객체 탐지 모델', 'CLIP·ResNet 사전학습 임베딩', 'FAISS와 FiftyOne 오픈소스 도구'],
      collaboration: ['자율주행팀 데이터 수집·레이블링 담당자와 기준 조정', '고객사 PoC와 대외 기술 검증 자료 지원']
    },
    experiment: ['날씨·조도·도로·가림 변수를 통제한 Data-Centric 실험 7건을 수행했습니다.', '무작위 13만 장과 조건 기반 최적화 8만 장의 학습 결과를 비교했습니다.', '테스트 케이스와 FP/FN을 다시 데이터 요구사항으로 환류했습니다.'],
    findings: ['최적화한 8만 장은 무작위 13만 장보다 데이터가 적으면서 mAP이 0.64에서 0.85로 높았습니다.', '데이터 수집 효율은 모델 선택뿐 아니라 수집 시점의 조건 정의에서 크게 달라졌습니다.', '임베딩은 검색뿐 아니라 데이터 분포를 설명하고 협업하는 공통 언어로 활용할 수 있었습니다.'],
    limitations: ['각 큐레이션 단계의 독립적인 기여도를 분리한 실험 기록은 부족합니다.', '프로토타입이 정식 툴로 이관된 이후 운영 지표를 직접 추적하지 못했습니다.', '고객 데이터의 세부 구성과 절대 수치는 공개할 수 없습니다.'],
    nextSteps: ['데이터 선택 정책별 ablation과 비용 대비 성능 비교', '데이터 버전·실험·모델 성능을 연결하는 manifest 도입', '드리프트 조건을 반영한 주기적 재선별 루프']
  },
  {
    slug: 'ocr',
    order: 3,
    title: '한글 Handwriting OCR 학습·평가 시스템',
    shortTitle: 'Handwriting OCR',
    period: '2024.05 — 2024.12',
    category: 'OCR · Synthetic Data',
    intro:
      '실사용 데이터가 매우 적고 모든 손글씨가 멀티라인이 될 수 있는 조건에서, 합성 손글씨 생성기와 character-level 토크나이저를 결합한 1-stage OCR 시스템을 개발했습니다.',
    resultLine: 'Accuracy 목표 0.8 달성, 평균 추론 0.07초',
    role: '데이터 생성·증강 · 모델 학습·평가 · 토크나이저 개조',
    stacks: ['Python', 'PyTorch', 'Hugging Face', 'TrOCR', 'OpenCV', 'Pillow', 'TensorBoard'],
    stages: ['diagnose', 'generate', 'validate'],
    metrics: [
      { value: '116 → 2,498', label: '실사용 이미지', context: '초기 보유 수량에서 프로젝트 기간 중 확대' },
      { value: '31,900', label: '합성 손글씨 이미지', context: '폰트 기반 생성 데이터셋' },
      { value: '0.07초', label: '평균 추론 시간', context: '최소 0.04초 · 최대 0.1초' }
    ],
    context: [
      '태블릿에 작성되는 규정 문구·이름·금액을 실시간으로 점검해야 했습니다.',
      '손글씨가 붙거나 기울어져 Text Detection 성능에 지나치게 의존하는 문제가 있었습니다.',
      '작성 중인 글씨를 완성된 문자열로 미리 예측하면 기능 요건을 위반하게 됩니다.'
    ],
    dataProblem: {
      title: '저자원뿐 아니라 입력이 완성되기 전에도 판단해야 했습니다',
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
      { title: 'Text Corpus', detail: '규정 문구·이름·금액 텍스트를 수집하고 이름 15,000가지를 조합합니다.' },
      { title: 'Handwriting Generator', detail: '글자별 폰트·자간·행간·시작 위치와 멀티라인을 무작위화합니다.' },
      { title: 'Domain Augmentation', detail: '필압·획 삐침·회전·지움·밝기·노이즈·JPEG 열화를 적용합니다.' },
      { title: 'TrOCR Training', detail: '1-stage VisionEncoderDecoder 구조로 Detection 없이 문자열을 직접 생성합니다.' },
      { title: 'Layered Evaluation', detail: 'CER·문장 정확도·카테고리·난이도·confidence를 함께 기록합니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: '실제 필기 변형을 생성기의 파라미터로 전환',
        problem: '깨끗한 폰트 이미지만으로는 태블릿 필기의 자간·행간·필압·획 특성을 표현하기 어려웠습니다.',
        solution: '글자별 폰트, 멀티라인 분할, 시작 위치와 여백, 텍스트 일부 삭제, 필압과 삐침을 확률적으로 생성했습니다.',
        effect: '실사용 데이터가 적은 상황에서도 다양한 작성 방식과 오기입 사례를 학습 데이터에 포함했습니다.'
      },
      {
        number: '02',
        title: '기존 vocab을 유지한 character-level 래퍼',
        problem: 'BPE 방식이 관측되지 않은 이후 토큰까지 복원해 “아직 다 쓰지 않음”을 “정답”으로 오판했습니다.',
        solution: '기존 토크나이저를 감싸 encode·decode를 문자 단위로 바꾸고 나머지 인터페이스는 원본에 위임했습니다.',
        effect: '사전학습 vocab과 임베딩을 유지하면서 한글 음절 단위의 일관된 출력을 만들 수 있었습니다.'
      },
      {
        number: '03',
        title: '평균 CER 밖의 위험 케이스를 자동 표면화',
        problem: '평균 지표만으로는 특정 필드의 실패와 모델이 확신하며 틀리는 사례를 찾기 어려웠습니다.',
        solution: '정규화 문장 정확도와 카테고리·난이도·라벨 타입을 기록하고 고신뢰 오답을 별도로 추출했습니다.',
        effect: '다음 데이터 보강이 필요한 오류 유형을 평가 결과에서 바로 확인할 수 있게 했습니다.'
      }
    ],
    contributions: {
      direct: ['손글씨 폰트 기반 데이터 생성기', '8종 이미지 증강과 전처리', 'TrOCR 학습·검증·테스트 모듈', 'Character-level CustomTokenizer', '카테고리·난이도·confidence 기반 오류 분석'],
      reused: ['team-lucid/trocr-small-korean 사전학습 모델', 'AI Hub 태블릿 손글씨 데이터', 'Hugging Face VisionEncoderDecoder 인터페이스'],
      collaboration: ['고객 요구사항과 평가 기준 조율', '실사용 데이터 수집·레이블링', '추론 코드와 소스코드 전달']
    },
    experiment: ['AI Hub 519,550장, 사내 수집·레이블링 63,000장, 합성 31,900장을 단계적으로 활용했습니다.', '실사용 데이터는 초기 116장에서 2,498장으로 확대했습니다.', 'Accuracy 0.8 이상과 평균 추론 0.07초 이내를 제품 목표로 두었습니다.'],
    findings: ['초기 Accuracy 목표 0.8을 달성하고 평균 0.07초의 추론 시간으로 요구 조건을 충족했습니다.', 'CustomTokenizer 적용 모델에서 기존 파인튜닝 대비 Accuracy·CER 개선과 오인식 감소를 확인했습니다.', '데이터 구성 완료 시점이 늦어 실험 설계 이전에 데이터 확보 일정을 고정해야 한다는 교훈을 얻었습니다.'],
    limitations: ['폰트 합성으로 도메인 격차를 줄였지만 개인별 연결 필기 습관까지 재현하지는 못했습니다.', '문자 단위 토큰화로 디코딩 시퀀스가 길어지는 비용이 있습니다.', '사람도 판단하기 어려운 필기에 대한 reject 정책을 완성하지 못했습니다.'],
    nextSteps: ['합성-실제 혼합 비율에 따른 실제 test CER 비교', '저신뢰·고신뢰 오답 기반 Active Learning', '숫자·날짜 등 필드 타입별 제약 디코딩과 reject 구간 설계']
  },
  {
    slug: '3d-marine',
    order: 4,
    title: 'Single Image 기반 3D 해양 객체 Synthetic Data Pipeline',
    shortTitle: '3D Synthetic Data',
    period: '2025.09 — 2026.07',
    category: 'Generative CV · Data Pipeline',
    intro:
      '수집이 제한된 해양 객체 이미지 한 장에서 3D 표현과 여러 시점의 전경을 생성하고, 고해상도 배경의 지정 위치에 합성하는 데이터 생산 시스템을 구축했습니다.',
    resultLine: '내부 활용 합성 데이터 10,000건, 공개 검증 산출물 150 scene',
    role: '파이프라인 설계 · 추론 로직 재구현 · 실행 인프라',
    stacks: ['PyTorch', 'Diffusers', 'TRELLIS', 'CLIP', 'OpenCV', 'Docker', 'CUDA'],
    stages: ['generate', 'validate'],
    metrics: [
      { value: '10,000', label: '내부 활용 합성 데이터', context: '다양한 배경·위치·스케일·조도 조건' },
      { value: '150', label: '공개 검증 scene', context: '1080p 87개 · 4K 63개' },
      { value: 'O×B → O', label: '3D 생성 호출', context: '객체 단위 결과 캐시 후 배경 조합에서 재사용' }
    ],
    context: [
      '군함·특수 선박처럼 현실적으로 수집이 제한된 객체는 시점과 배경 조건을 충분히 확보하기 어렵습니다.',
      '2D copy-paste는 수량을 늘려도 보이지 않는 면이나 새로운 관측 시점을 만들지 못합니다.',
      '서로 다른 모델의 입출력·CUDA 환경·고정 512 입력 연결이 필요했습니다.'
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
      { title: 'Preprocess', detail: 'LDM 업스케일과 BEN2 배경 제거로 객체 입력과 경계를 정리합니다.' },
      { title: 'Image-to-3D', detail: 'TRELLIS로 3D Gaussian·mesh를 만들고 검증용 4시점을 렌더링합니다.' },
      { title: 'Quality Gate', detail: '입력과 렌더의 CLIP 평균 유사도가 임계값을 넘는 3D만 사용합니다.' },
      { title: 'Conditional Synthesis', detail: '5개 시점·mask·배경·bbox를 조건으로 확산 합성을 수행합니다.' },
      { title: 'High-res Restore', detail: '512 crop 결과를 padding 제거 후 원본 1080p·4K 좌표에 되붙입니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: '검증 시점과 합성 시점을 목적에 따라 분리',
        problem: '단일 이미지 3D는 후면과 상부를 추정하므로 육안 전수 검사가 어려운 실패가 발생했습니다.',
        solution: '3D 일관성을 확인할 4개 검증 시점과 장면 배치에 사용할 5개 합성 시점을 별도로 구성했습니다.',
        effect: '후면 붕괴 같은 실패를 자동 차단하면서 합성에 유리한 시점 조합을 유지했습니다.'
      },
      {
        number: '02',
        title: '512 모델 주변에 crop-paste 좌표계를 설계',
        problem: '배경 전체를 512로 줄이면 16:9가 찌그러지고 다시 확대해도 4K 디테일을 복구할 수 없었습니다.',
        solution: 'bbox 중심 512 영역만 잘라 local 좌표로 변환해 추론하고 padding을 제거한 뒤 원본 위치에 복원했습니다.',
        effect: '변경 영역만 생성하면서 나머지 배경 픽셀과 원본 해상도를 보존했습니다.'
      },
      {
        number: '03',
        title: '재사용 가능한 계산과 환경을 분리',
        problem: '객체×배경 조합마다 3D를 다시 만들고 모델을 로드하면 초기화 비용이 크게 반복됐습니다.',
        solution: '3D 결과를 객체 단위로 캐시하고 합성 모델은 배치 전체에서 한 번만 로드했습니다. 충돌하는 CUDA 환경은 컨테이너로 나눴습니다.',
        effect: '3D 생성 호출을 O×B에서 O로 줄이고 중단된 배치를 이어서 실행할 수 있게 했습니다.'
      }
    ],
    contributions: {
      direct: ['TRELLIS와 조건부 확산 모델 사이의 데이터 계약', 'CLIP 기반 다각도 품질 게이트', 'bbox 중심 crop-paste 좌표 변환', '객체 캐시·모델 1회 로드 배치 구조', '두 CUDA 환경의 Docker 격리'],
      reused: ['TRELLIS·BEN2·LDM Super Resolution', 'MureObjectStitch 조건부 확산 구현', 'CLIP 사전학습 모델'],
      collaboration: ['입력 객체·배경·bbox 데이터 준비', '보안·컴플라이언스에 맞춘 내부 산출물 운영']
    },
    experiment: ['공개 가능한 저장 산출물 150 scene과 비교 grid 150개를 직접 집계했습니다.', '1080p 87개와 4K 63개에서 원본 해상도 보존을 확인했습니다.', '처리 시간과 downstream mAP은 실행 로그가 없어 추정하지 않았습니다.'],
    findings: ['Image-to-3D와 조건부 확산을 연결해 단일 이미지에서 시점과 배경 조건을 동시에 확장했습니다.', '고정 입력 모델의 제약은 모델 변경보다 좌표계와 주변 파이프라인 설계로 해결할 수 있었습니다.', '가장 비싼 계산을 데이터 의존성 기준으로 분리하면 조합 수가 늘어도 중복 비용을 억제할 수 있습니다.'],
    limitations: ['합성 데이터 투입 전후의 탐지 mAP·희귀 클래스 recall을 측정하지 못했습니다.', 'CLIP 유사도는 세밀한 기하 오류를 검출하지 못하는 대리 지표입니다.', '512보다 큰 bbox와 crop 경계 이음새에 제약이 있습니다.'],
    nextSteps: ['동일 test set에서 실데이터 baseline과 합성 추가 모델 비교', 'scene별 seed·bbox·CLIP·시간을 기록하는 manifest', '기하 일관성 지표와 경계 blending·동적 crop 도입']
  },
  {
    slug: 'character-pipeline',
    order: 5,
    title: 'Personalized Character Generation & Quality Automation',
    shortTitle: 'Character Generation',
    period: '2025.03 — 2025.06',
    category: 'VLM · Quality Automation',
    intro:
      '생성 모델의 역할을 Style Extraction·Image Generation·Quality Review로 분리하고, Rule Check와 AI Review를 연결해 실패 결과를 자동 차단했습니다.',
    resultLine: '검수 통과율 35% → 85%, 이미지 변환 성공률 98%',
    role: '5단계 End-to-End 파이프라인 단독 설계 및 구현',
    stacks: ['Python', 'Gemini', 'Pydantic', 'OpenCV', 'NumPy', 'Pillow'],
    stages: ['generate', 'validate'],
    metrics: [
      { value: '35% → 85%', label: '검수 통과율', context: '내부 PoC 품질 게이트 개선' },
      { value: '98%', label: '이미지 변환 성공률', context: '5단계 파이프라인 결과' },
      { value: '2단계', label: '자동 품질 게이트', context: '로컬 알파 검사 → AI 7개 기준 검수' }
    ],
    context: [
      '인물 사진을 캐릭터로 직접 변환하면 원본 캐릭터의 아이덴티티와 스타일이 무너지는 문제가 있었습니다.',
      '생성 모델의 확률적 실패와 배경 제거 실패를 사람이 매번 검수할 수 없었습니다.',
      '외부 API 실패·파싱 오류·품질 실패를 서로 다른 방식으로 처리해야 했습니다.'
    ],
    dataProblem: {
      title: '생성보다 실패 결과를 안정적으로 걸러내는 것이 더 중요한 문제였습니다',
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
      { title: 'Character Select', detail: '성별 폴더에서 기존 캐릭터 에셋을 선택해 아이덴티티 기준을 고정합니다.' },
      { title: 'Style Extract', detail: '피부·헤어·의상·액세서리·포즈를 Pydantic JSON으로 추출합니다.' },
      { title: 'Image Generate', detail: '구조화 스타일을 주입하고 배경색을 #00FF00으로 고정해 이미지를 생성합니다.' },
      { title: 'Local Gate', detail: '크로마키·모폴로지로 배경을 제거하고 투명 픽셀 비율을 검사합니다.' },
      { title: 'AI Gate', detail: '손가락·관절·비율·얼굴·픽셀 스타일 등 7개 기준으로 최종 판정합니다.' }
    ],
    decisions: [
      {
        number: '01',
        title: '이미지 변환 전에 사람의 컨텍스트를 구조화',
        problem: '사진을 직접 변환하면 캐릭터의 기존 스타일이 적용되지 않거나 정체성이 흔들렸습니다.',
        solution: '사람 사진에서 피부·헤어·의상·액세서리·포즈만 JSON으로 추출해 캐릭터 에셋에 적용했습니다.',
        effect: '사람의 특징과 기존 캐릭터의 아이덴티티를 서로 다른 입력으로 분리했습니다.'
      },
      {
        number: '02',
        title: '생성 제약으로 후속 모델 하나를 제거',
        problem: '생성 후 매번 배경 분리 모델을 실행하면 비용과 실패 지점이 늘어납니다.',
        solution: '생성 배경을 #00FF00으로 고정하고 좌상단 기준 크로마키와 모폴로지로 알파를 만들었습니다.',
        effect: '별도 세그멘테이션 모델 없이 투명 배경을 만들 수 있었습니다.'
      },
      {
        number: '03',
        title: '값싼 로컬 검사를 AI 검수보다 먼저 배치',
        problem: '배경 제거가 명백히 실패한 결과까지 AI에 보내면 비용이 낭비됩니다.',
        solution: '투명 픽셀 비율을 먼저 검사한 뒤 통과 결과만 7개 기준 AI 검수에 전달했습니다.',
        effect: '단순 실패를 조기에 차단하고 최종 저장 조건을 파이프라인 내부에 명시했습니다.'
      }
    ],
    contributions: {
      direct: ['전체 5단계 파이프라인과 역할별 프롬프트', 'Pydantic 출력 스키마', 'OpenCV 크로마키와 모폴로지 배경 제거', '로컬·AI 2단계 품질 게이트', '예외 계층과 retry/backoff'],
      reused: ['Gemini 이미지·멀티모달 모델', '기존 픽셀 캐릭터 에셋', 'OpenCV·Pillow 이미지 처리'],
      collaboration: ['내부 PoC 품질 기준과 결과 검토', '서비스 적용 가능성 검토']
    },
    experiment: ['스타일 추출·생성·검수 호출마다 다른 출력 계약을 적용했습니다.', '투명 픽셀 20% 미만은 AI 호출 전에 실패로 처리했습니다.', 'AI 검수는 손가락·관절·비율·얼굴·픽셀 스타일 등 7개 기준을 사용했습니다.'],
    findings: ['생성 단계의 출력 제약이 후속 세그멘테이션 모델 의존성을 제거했습니다.', 'Rule Check 우선 적용으로 품질과 API 비용을 함께 관리할 수 있습니다.', 'Generation·Review·Retry를 단일 pipeline으로 연결해 확률적 모델을 운영 가능한 형태로 정리했습니다.'],
    limitations: ['AI 검수 판정의 반복 일관성과 사람 라벨 일치율을 측정하지 못했습니다.', '녹색 계열 의상에서는 크로마키가 취약할 수 있습니다.', '현재 코드는 단일 실행 중심이며 대량 작업용 manifest가 없습니다.'],
    nextSteps: ['동일 이미지 반복 판정과 사람 라벨 일치율 측정', '입력 색 분포에 따른 동적 배경색 선택', '실패 단계·비용·재시도 횟수를 기록하는 실행 manifest']
  }
];

export const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
