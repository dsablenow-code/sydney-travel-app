/* ==========================================================================
   2026 호주머니 0원의 배낭연수 여행 & 정산 애플리케이션 코어 로직 v1.7.0
   (결과 보고서 탭 탑재 & md/txt 내보내기 & 정산서 지원금 계산 수정)
   ========================================================================== */

// 1. 초기 시드니 6일간 여행 데이터
const defaultItinerary = [
  {
    id: 'day-1',
    dateStr: '8/19 (수)',
    subtitle: '도착, 숙소 근처만',
    badgeClass: 'badge-purple',
    color: '#5E35B1',
    tourTime: '자유시간',
    spots: [
      { name: '시드니대학교 캠퍼스 & 헬스 허브', note: '도보 15~20분' },
      { name: '패디스 마켓 (Paddy\'s Market)', note: '숙소에서 가까움' }
    ],
    tip: '✈️ 장거리 비행 후 무리 없는 가벼운 일정',
    latlng: [-33.8886, 151.1873]
  },
  {
    id: 'day-2',
    dateStr: '8/20 (목)',
    subtitle: '블루마운틴 + 페더데일',
    badgeClass: 'badge-blue',
    color: '#1565C0',
    tourTime: '12:30 PM',
    spots: [
      { name: '페더데일 야생동물원', note: '12:30PM 시내 픽업 후 첫 코스' },
      { name: '에코포인트 & 세자매봉', note: '블루마운틴 대표 전망대' },
      { name: '선셋포인트 & 카툼바 마을', note: '저녁 자유식' },
      { name: '스타게이징 (별보기)', note: '날씨 흐리면 시티 야경 대체' }
    ],
    tip: '🚘 하루 종일 소요 통합투어 (밤 9~10시 복귀)',
    latlng: [-33.7320, 150.3120]
  },
  {
    id: 'day-3',
    dateStr: '8/21 (금)',
    subtitle: '맨리 비치',
    badgeClass: 'badge-green',
    color: '#2E7D32',
    tourTime: '페리 시간 자율',
    spots: [
      { name: '맨리비치 서핑 체험', note: '페리 왕복 (약 20~25분 소요)' }
    ],
    tip: '⛴️ 서큘러키에서 맨리행 페리 탑승',
    latlng: [-33.7974, 151.2878]
  },
  {
    id: 'day-4',
    dateStr: '8/22 (토)',
    subtitle: '하버 지구 + 록스마켓',
    badgeClass: 'badge-orange',
    color: '#E65100',
    tourTime: '오후 5시 마감',
    spots: [
      { name: '로얄 보타닉 가든', note: '도보 이동 가능' },
      { name: '서큘러키 & 하버브릿지 조망', note: '전망 감상' },
      { name: '록스마켓 (The Rocks)', note: '오후 5시 마감 주의' }
    ],
    tip: '🚶 전부 도보 이동 가능 (산책하듯 여유롭게!)',
    latlng: [-33.8587, 151.2100]
  },
  {
    id: 'day-5',
    dateStr: '8/23 (일)',
    subtitle: '오페라하우스 & 자유시간',
    badgeClass: 'badge-red',
    color: '#C62828',
    tourTime: '11:45 AM',
    spots: [
      { name: '오페라하우스 가이드투어', note: '시간 확정: 11:45 AM' },
      { name: '자유시간 & 짐 정리', note: '서큘러키 인근 산책' }
    ],
    tip: '🎭 8/22 매진으로 이 날로 이동 (투어 시간: 11:45 AM 확정)',
    latlng: [-33.8568, 151.2153]
  },
  {
    id: 'day-6',
    dateStr: '8/24 (월)',
    subtitle: '귀국',
    badgeClass: 'badge-dark',
    color: '#37474F',
    tourTime: '공항 이동',
    spots: [
      { name: '숙소 출발 ➔ 공항 이동', note: '시드니 국제공항 (SYD)' }
    ],
    tip: '✈️ 안전하게 한국 귀국',
    latlng: [-33.9399, 151.1753]
  }
];

const categoryOptions = [
  '항공료', '숙박비', '보험가입비', '문화체험비', '식비', '통신비', '교통비', '기타'
];

const categoryPriorityMap = {
  '항공료': 1, '항공': 1,
  '숙박비': 2, '숙박': 2,
  '보험가입비': 3, '보험': 3,
  '문화체험비': 4, '문화': 4,
  '식비': 5,
  '통신비': 6, '통신': 6,
  '교통비': 7, '교통': 7,
  '기타': 8
};

const defaultSettlements = [
  { id: 1, category: '항공료', date: '2026-06-24', vendor: '네이버페이 / 트립닷컴', detail: '인천 ⇄ 시드니 왕복 항공권', krw: 1347900, aud: 1500, rate: 898, method: '현금/카드', isGrantUsed: true, isSettled: true },
  { id: 2, category: '숙박비', date: '2026-06-11', vendor: '트립닷컴', detail: '시드니 중앙역 인근 숙소 (7박)', krw: 1700680, aud: 1890, rate: 899, method: '현금', isGrantUsed: true, isSettled: true },
  { id: 3, category: '보험가입비', date: '2026-07-31', vendor: '카카오페이 손해보험', detail: '해외 여행자보험 4인', krw: 59980, aud: 66, rate: 900, method: '카카오페이', isGrantUsed: true, isSettled: true },
  { id: 4, category: '문화체험비', date: '2026-07-31', vendor: '트래블포레스트', detail: '오페라하우스 내부 가이드투어 (11:45)', krw: 152000, aud: 168, rate: 904, method: '카드', isGrantUsed: true, isSettled: true }
];

const defaultChecklist = {
  before: [
    { id: 'cb1', text: '호주 ETA 비자 신청 및 승인 확인', done: true },
    { id: 'cb2', text: '여권 유효기간 6개월 이상 확인', done: true }
  ],
  during: [
    { id: 'cd1', text: '8/23 오페라하우스 가이드투어 11:45분 탑승', done: false },
    { id: 'cd2', text: '트래블월렛 / 트래블로그 수수료 우대 환전', done: true }
  ],
  after: [
    { id: 'ca1', text: '영수증 및 카드 사용 내역 정산서 정리', done: false }
  ],
  etc: [
    { id: 'ce1', text: '호주 멀티 어댑터 (11자 사선 모양)', done: true }
  ]
};

const defaultSharedFiles = [
  { id: 'f1', name: '2026_시드니_해외배낭연수_세부계획서.txt', tag: '여행계획', size: '520 KB', date: '06.01', content: '2026 시드니 해외배낭연수 세부계획서 문서 내용입니다.' },
  { id: 'f2', name: '인천-시드니_전자항공권_E-ticket.txt', tag: '항공숙박', size: '280 KB', date: '06.24', content: '인천-시드니 왕복 전자항공권 E-ticket 발권 내역입니다.' },
  { id: 'f3', name: '시드니_중앙역_호텔예약확인서.txt', tag: '항공숙박', size: '455 KB', date: '06.11', content: '시드니 중앙역 인근 호텔 7박 예약 확약서입니다.' }
];

const defaultReportData = {
  topics: [
    {
      id: 'topic-1',
      title: '한방산업의 육성 사례분석 및 지역사회 접목 방안 도출',
      places: [
        '호주 시드니 로열 보태닉 가든 (Royal Botanic Garden Sydney)',
        '블루 마운틴스 (Blue Mountains)'
      ],
      experiences: [
        '로열 보태닉 가든: 약용 식물(Medicinal Plants) 구역 큐레이션 관찰 (효능·역사·활용법 교육 콘텐츠)',
        '보태닉 가든 에듀테인먼트 체험 프로그램 (허브 추출 워크숍 등) 분석',
        '블루 마운틴스: 에코 포인트 & 쓰리 시스터즈 트레킹 등 자연환경 기반 웰니스 힐링 코스 분석'
      ],
      results: [
        '제천시의 한방 도시 브랜드 인프라 대비 체험형/교육형 큐레이션 콘텐츠 부재 진단',
        '기존 전시 중심 시설(한방생명과학관 등)의 한계점 확인 (전체 관광객 대비 방문 비중 5% 불과)',
        '자연경관 감상 위주에 편중된 제천 관광 상품의 고부가가치 웰니스 전환 필요성 도출'
      ],
      connections: [
        '제천 한방엑스포공원 일대에 호주 모델을 벤치마킹한 \'제천 한방약초 테마가든\' 조성 및 디지털 도감 도입',
        '월악산·청풍호 일대에 약초 채집 및 시음 등을 연계한 \'한방 웰니스 트레킹 코스\' 사계절 운영 프로그램 구축',
        '지역 어르신 전통 지식 자원화를 위한 \'한방 해설사\' 일자리 창출 선순환 모델 기획',
        '제천 약초거리에 호주 마켓 모델을 벤치마킹한 \'한방 파머스 마켓\' 정기 개최 제안'
      ]
    },
    {
      id: 'topic-2',
      title: '호주 대학의 Wellness Hub 인프라 분석을 통한 세명대 한의과대학 맞춤형 학생 웰니스 시스템 구축 방안',
      places: [
        '시드니 대학교 (University of Sydney)',
        'UNSW (뉴사우스웨일즈 대학교)'
      ],
      experiences: [
        '시드니 대학교: CAPS 및 Health and Wellbeing Hub 운영 실태 및 공간 구성 분석',
        '의대·보건계열 학생들의 번아웃 예방을 위한 전담 프로그램 벤치마킹',
        'UNSW: 또래 상담원을 양성하는 Peer Support Network 위기 조기 감지 시스템 분석'
      ],
      results: [
        '한국 대학생 우울 위험군(43.5%) 및 의대생 우울증군(42.4%) 등 번아웃 문제의 심각성 대조',
        '세명대 한의과대학 6년제 긴 학업 기간 및 강도 대비 전문적인 학내 심리 웰니스 인프라 부족 진단',
        '지리적 특성(낮은 접근성)에 따른 여가 부재와 한의학적 특화 웰니스 접목 부재 문제점 확인'
      ],
      connections: [
        '세명대 한의과대학 내 한방 통합 심리이완 및 테라피 공간인 \'安神(안신) 힐링 센터\' 설립 제안',
        '한의학과 고학년이 저학년을 체질별 생활습관 등으로 케어하는 \'한방 또래 상담 (Peer Support) 프로그램\' 구축',
        '캠퍼스 유휴 녹지를 활용하여 하이드파크/보태닉 가든 스타일의 \'약초 힐링 가든(명상 산책로)\' 조성',
        '세명대 한의과대학만의 차별화된 학생 복지 브랜드 수립 및 타 대학 의학계열 확산 모델 확보'
      ]
    }
  ],
  pptSlides: [
    { id: 's1', page: 1, title: '표지 및 발표 개요', content: '2026 호주 배낭연수 결과보고서 (제천시 & 세명대 웰니스 발전 방안)' },
    { id: 's2', page: 2, title: '연수 목적 및 배경', content: '한방산업 활성화 및 한의과대학 선진 학생 웰니스 인프라 구축의 필요성' },
    { id: 's3', page: 3, title: '연수단 구성 및 일정 총괄', content: '8/19 ~ 8/24 시드니 핵심 연수 장소 및 일정 경과 요약' },
    { id: 's4', page: 4, title: '주제 1 - 제천시 한방 웰니스 관광 제언', content: '로열 보태닉 가든 및 블루마운틴 에코투어리즘 분석 개요' },
    { id: 's5', page: 5, title: '로열 보태닉 가든 약용식물 구역 분석', content: '200년 역사, 8,900종 식물 중 약용 식물 특화 교육형 큐레이션 및 에듀테인먼트 콘텐츠' },
    { id: 's6', page: 6, title: '호주 웰니스 관광 시장 동향', content: '글로벌 웰니스 시장 1조 달러 돌파 및 자연경관 힐링 코스탈 워크의 고부가가치 모델' },
    { id: 's7', page: 7, title: '제천시 한방 관광의 현주소와 문제점', content: '단순 전시/축제 기간 편중, 사계절 상시 콘텐츠 부재, 방문객 비중 5% 한계 진단' },
    { id: 's8', page: 8, title: '개선안 ① 제천 한방약초 테마가든 조성', content: '약초별 효능 해설판, QR코드 연동 AR 도감 등 MZ 친화적 콘텐츠 제안' },
    { id: 's9', page: 9, title: '개선안 ② 한방 웰니스 트레킹 코스 개발', content: '월악산·청풍호 코스에 약초 채집, 약초차 시음, 뜸 체험 연계' },
    { id: 's10', page: 10, title: '개선안 ③ 고령층 연계 한방 해설사 양성', content: '지역 어르신 전통 지식 보전 및 시니어 일자리 창출 상생 모델' },
    { id: 's11', page: 11, title: '개선안 ④ 약초거리 한방 파머스 마켓', content: '패디스 마켓 벤치마킹, 주말 약초 직거래 및 수제 한방 코스메틱 마켓 정기 개최' },
    { id: 's12', page: 12, title: '주제 1 기대효과 및 로드맵', content: '연간 방문객 확대 및 비축제 기간 사계절 고른 관광 수익 창출 효과' },
    { id: 's13', page: 13, title: '주제 2 - 세명대 한의과대학 학생 웰니스 구축', content: '시드니 대학교 및 UNSW 웰니스 인프라 분석 개요' },
    { id: 's14', page: 14, title: '시드니 대학교 CAPS 및 Wellness Hub 분석', content: '심리 상담, 마음챙김 워크숍, 보건계열 학생 번아웃 예방 전담 케어 시스템' },
    { id: 's15', page: 15, title: 'UNSW Peer Support Network 분석', content: '또래 상담원 양성 및 정신건강 위기 조기 감지 자발적 돌봄 체계' },
    { id: 's16', page: 16, title: '국내 대학생 및 의학계열 번아웃 실태', content: '우울 위험군 43.5%, 의대생 우울증 42.4% 등 세명대 한의과대학 맞춤 케어 필요성' },
    { id: 's17', page: 17, title: '개선안 ① 학내 安神(안신) 힐링 센터 설립', content: '상담, 마음챙김 명상, 약차 테라피, 아로마 뜸, 지압 셀프케어 공간 마련' },
    { id: 's18', page: 18, title: '개선안 ② 한방 또래 상담 프로그램 도입', content: '고학년생 멘토링, 체질 판별에 기초한 맞춤형 생활습관 건강 가이드 연계' },
    { id: 's19', page: 19, title: '개선안 ③ 약초 힐링 캠퍼스 가든 조성', content: '캠퍼스 내 유휴 녹지를 활용한 명상 산책로 및 친환경 웰니스 휴식처 구축' },
    { id: 's20', page: 20, title: '주제 2 기대효과 및 브랜드화', content: '학생 학업 스트레스 완화, 이탈율 감소 및 대학 복지 브랜드 우수 모델 확보' },
    { id: 's21', page: 21, title: '제천시와 세명대의 한방 웰니스 상생 방안', content: '대학 연구 역량과 제천시 한방 가든 콘텐츠 연계 교류 협력 모델' },
    { id: 's22', page: 22, title: '예산 계획 및 자원 조달 방안', content: '지자체 협력 예산 및 대학 지원 예산 구성안' },
    { id: 's23', page: 23, title: '단기 / 중기 / 장기 추진 일정', content: '센터 설립, 프로그램 기획, 시범 운영 및 전체 확산 계획' },
    { id: 's24', page: 24, title: '장애요인 및 대응 전략', content: '학생 참여율 제고 방안, 상담 전문성 및 비밀 보장 신뢰 구축 방안' },
    { id: 's25', page: 25, title: '호주 사례 벤치마킹 시사점 종합', content: '자연·건강·교육의 융합과 자발적 또래 돌봄 문화의 현지 적용점' },
    { id: 's26', page: 26, title: '연수 최종 성과 분석', content: '기관 공식 방문 분석, 관계자 인터뷰 핵심 요약 및 시너지 효과' },
    { id: 's27', page: 27, title: '지역 보건 및 의료 복지 기여도', content: '제천시 한방 웰니스 관광 인지도 상승 및 웰니스 허브 시너지' },
    { id: 's28', page: 28, title: '보고서 작성 및 AI 활용 계획', content: '수집 데이터를 기반으로 한 AI 고도화 보고서 및 PPT 최종 초안 구성 계획' },
    { id: 's29', page: 29, title: '결론 및 제언', content: '한방 웰니스 패러다임 전환과 세명대-제천시 상생 발전의 비전 선포' },
    { id: 's30', page: 30, title: 'Q&A 및 감사 인사', content: '질의응답 진행 및 발표 마무리' }
  ]
};

const STORAGE_KEYS = {
  ITINERARY: 'sydney_master_itinerary_v1',
  SETTLEMENT: 'sydney_master_settlement_v1',
  GRANT: 'sydney_master_grant_v1',
  CHECKLIST: 'sydney_master_checklist_v1',
  HOTEL: 'sydney_master_hotel_v1',
  EMERGENCY: 'sydney_master_emergency_v1',
  FILES: 'sydney_master_files_v1',
  REPORT: 'sydney_master_report_v1',
  MEMOS: 'sydney_master_memos_v1',
  EXCHANGE_RATE: 'sydney_master_exchange_rate_v1',
  FIREBASE_CONFIG: 'sydney_master_fb_config_v1'
};

let itineraryData = [];
let settlementData = [];
let grantAmount = 2500000;
let globalExchangeRate = 900;
let checklistData = {};
let hotelData = {};
let emergencyData = {};
let memoData = [];
let reportData = {};
let sharedFilesData = [];
let currentFileFilter = 'all';
let mapInstance = null;

let dbInstance = null;
let rtdbInstance = null;
let isRemoteUpdating = false;
let syncBroadcastChannel = null;

/* ↩️ Ctrl+Z / Ctrl+Y 히스토리 스택 */
let undoStack = [];
let redoStack = [];

document.addEventListener('DOMContentLoaded', () => {

  initDarkMode();
  loadDataFromStorage();
  initTabNavigation();
  renderItinerarySidebar();
  renderDrawerItineraryList();
  initHoverItineraryDrawer();
  initMap();
  renderChecklist();
  renderSettlementTable();
  initFirebaseCloudSync();
  initMultiWindowSyncChannel();
  initKeyboardShortcutListeners();

  const drawer = document.getElementById('globalItineraryDrawer');
  if (drawer) {
    drawer.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }
});

function initHoverItineraryDrawer() {
  const btn = document.getElementById('globalItineraryToggleBtn');
  const drawer = document.getElementById('globalItineraryDrawer');
  if (!btn || !drawer) return;

  let hoverTimer = null;

  const expandDrawer = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    drawer.classList.add('hover-active');
    renderDrawerItineraryList();
  };

  const collapseDrawer = () => {
    hoverTimer = setTimeout(() => {
      if (!drawer.classList.contains('active')) {
        drawer.classList.remove('hover-active');
      }
    }, 250);
  };

  btn.addEventListener('mouseenter', expandDrawer);
  btn.addEventListener('mouseleave', collapseDrawer);
  drawer.addEventListener('mouseenter', expandDrawer);
  drawer.addEventListener('mouseleave', collapseDrawer);
}

window.toggleGlobalItineraryDrawer = function() {
  const drawer = document.getElementById('globalItineraryDrawer');
  if (drawer) {
    const isActive = drawer.classList.toggle('active');
    if (isActive) {
      drawer.classList.add('hover-active');
      renderDrawerItineraryList();
    } else {
      drawer.classList.remove('hover-active');
    }
  }
};

window.closeGlobalItineraryDrawer = function() {
  const drawer = document.getElementById('globalItineraryDrawer');
  if (drawer) {
    drawer.classList.remove('active');
    drawer.classList.remove('hover-active');
  }
};

function renderDrawerItineraryList() {
  const container = document.getElementById('drawerItineraryList');
  if (!container) return;

  container.innerHTML = '';

  itineraryData.forEach((day) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.style.borderLeftColor = day.color;
    card.style.marginBottom = '0';

    const spotsListHtml = day.spots.map((spot, idx) => `
      <li class="spot-item">
        <span class="spot-num" style="background:${day.color}">${idx + 1}</span>
        <div class="spot-content">
          <div class="spot-name">${escapeHTML(spot.name)}</div>
          <div class="spot-note">${escapeHTML(spot.note || '설명 없음')}</div>
        </div>
      </li>
    `).join('');

    card.innerHTML = `
      <div class="day-card-header">
        <div class="day-title-group">
          <span class="day-date" style="background:${day.color}">${escapeHTML(day.dateStr)}</span>
          <span class="day-subtitle">${escapeHTML(day.subtitle)}</span>
        </div>
        <span class="clay-badge ${day.badgeClass}">${escapeHTML(day.tourTime || '일정')}</span>
      </div>
      <ul class="spot-list">
        ${spotsListHtml}
      </ul>
      <div class="day-footer-tip">
        <i class="fa-solid fa-circle-info" style="color:${day.color}"></i> ${escapeHTML(day.tip)}
      </div>
    `;

    container.appendChild(card);
  });
}

function initDarkMode() {
  const savedTheme = localStorage.getItem('sydney_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeBtnText(true);
  }
}

window.toggleDarkMode = function() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('sydney_theme', isDark ? 'dark' : 'light');
  updateThemeBtnText(isDark);
};

function updateThemeBtnText(isDark) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = isDark 
      ? '<i class="fa-solid fa-sun"></i> <span>라이트모드</span>' 
      : '<i class="fa-solid fa-moon"></i> <span>다크모드</span>';
  }
}

function getItemWithFallback(masterKey, legacyPrefix) {
  const masterData = localStorage.getItem(masterKey);
  if (masterData) return masterData;

  for (let i = 25; i >= 10; i--) {
    const oldKey = `${legacyPrefix}_v1_${i}`;
    const oldData = localStorage.getItem(oldKey);
    if (oldData) {
      localStorage.setItem(masterKey, oldData);
      return oldData;
    }
  }
  return null;
}

function sortSettlementData(dataList) {
  if (!Array.isArray(dataList)) return [];
  return [...dataList].sort((a, b) => {
    const prioA = categoryPriorityMap[a.category] || 99;
    const prioB = categoryPriorityMap[b.category] || 99;
    if (prioA !== prioB) {
      return prioA - prioB;
    }
    const dateA = a.date || '';
    const dateB = b.date || '';
    return dateA.localeCompare(dateB);
  });
}

function pushUndoState() {
  const currentState = JSON.stringify({
    settlementData: settlementData,
    grantAmount: grantAmount,
    globalExchangeRate: globalExchangeRate
  });

  if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== currentState) {
    undoStack.push(currentState);
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
  }
}

window.undo = function() {
  if (undoStack.length <= 1) {
    showSyncFlashToast('↩️ 더 이상 취소할 작업이 없습니다.');
    return;
  }
  const current = undoStack.pop();
  redoStack.push(current);

  const previousState = JSON.parse(undoStack[undoStack.length - 1]);
  settlementData = previousState.settlementData;
  grantAmount = previousState.grantAmount;
  globalExchangeRate = previousState.globalExchangeRate;

  saveDataToStorage(true);
  renderSettlementTable();
  showSyncFlashToast('↩️ 이전 상태로 실행 취소(Undo)되었습니다.');
};

window.redo = function() {
  if (redoStack.length === 0) {
    showSyncFlashToast('↪️ 더 이상 다시 실행할 작업이 없습니다.');
    return;
  }
  const nextStateStr = redoStack.pop();
  undoStack.push(nextStateStr);

  const nextState = JSON.parse(nextStateStr);
  settlementData = nextState.settlementData;
  grantAmount = nextState.grantAmount;
  globalExchangeRate = nextState.globalExchangeRate;

  saveDataToStorage(true);
  renderSettlementTable();
  showSyncFlashToast('↪️ 다시 실행(Redo)되었습니다.');
};

function initKeyboardShortcutListeners() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      redo();
      e.preventDefault();
    }
  });

  const tbody = document.getElementById('settlementTbody');
  if (tbody) {
    tbody.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const inputs = Array.from(tbody.querySelectorAll('input, select'));
        const currIdx = inputs.indexOf(document.activeElement);
        if (currIdx !== -1) {
          if (!e.shiftKey && currIdx === inputs.length - 1) {
            e.preventDefault();
            triggerAddSettlementRow();
            setTimeout(() => {
              const newInputs = Array.from(tbody.querySelectorAll('input, select'));
              if (newInputs.length > 0) newInputs[newInputs.length - 11].focus();
            }, 60);
          }
        }
      }
    });
  }
}

function loadDataFromStorage() {
  const savedItinerary = getItemWithFallback(STORAGE_KEYS.ITINERARY, 'sydney_itinerary');
  itineraryData = savedItinerary ? JSON.parse(savedItinerary) : [...defaultItinerary];

  const savedRate = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE);
  globalExchangeRate = savedRate ? parseFloat(savedRate) : 900;

  const savedSettlement = getItemWithFallback(STORAGE_KEYS.SETTLEMENT, 'sydney_settlement');
  const rawSettlement = savedSettlement ? JSON.parse(savedSettlement) : defaultSettlements;
  
  settlementData = sortSettlementData(rawSettlement.map(r => ({
    ...r,
    rate: r.rate || globalExchangeRate,
    isSettled: typeof r.isSettled === 'boolean' ? r.isSettled : Boolean(r.isGrantUsed)
  })));

  const savedGrant = getItemWithFallback(STORAGE_KEYS.GRANT, 'sydney_grant');
  grantAmount = savedGrant ? parseInt(savedGrant, 10) : 2500000;

  const savedChecklist = getItemWithFallback(STORAGE_KEYS.CHECKLIST, 'sydney_checklist');
  checklistData = savedChecklist ? JSON.parse(savedChecklist) : JSON.parse(JSON.stringify(defaultChecklist));

  const savedHotel = getItemWithFallback(STORAGE_KEYS.HOTEL, 'sydney_hotel');
  hotelData = savedHotel ? JSON.parse(savedHotel) : { name: '시드니 센트럴 스테이션 인근 숙소', address: 'Central Station Area, Sydney NSW 2000', phone: '+61 2 9000 1234 (체크인 15:00 / 체크아웃 11:00)' };

  const savedEmergency = getItemWithFallback(STORAGE_KEYS.EMERGENCY, 'sydney_emergency');
  emergencyData = savedEmergency ? JSON.parse(savedEmergency) : { call: '000 (경찰/구급/소방)', embassy: '+61 2 9210 0200 (긴급 +61 414 627 007)', hospital: 'St Vincent\'s Hospital Sydney (+61 2 8382 1111)' };

  const savedFiles = getItemWithFallback(STORAGE_KEYS.FILES, 'sydney_files');
  sharedFilesData = savedFiles ? JSON.parse(savedFiles) : [...defaultSharedFiles];

  const savedReport = getItemWithFallback(STORAGE_KEYS.REPORT, 'sydney_report');
  reportData = savedReport ? JSON.parse(savedReport) : JSON.parse(JSON.stringify(defaultReportData));

  const savedMemos = getItemWithFallback(STORAGE_KEYS.MEMOS, 'sydney_memos');
  memoData = savedMemos ? JSON.parse(savedMemos) : [
    { id: 'm1', text: '오페라하우스 투어 11:45분까지 서큘러키 입구 집결!', time: '8/19 14:00' }
  ];

  pushUndoState();

  renderHotelAndEmergencyDisplay();
  renderSharedFiles();
  renderMemos();
  renderReport();
}

/* 💾 [LocalStorage 5MB 쿼터 초과 방지 & IndexedDB 세이프가드 파이프라인] */
function saveDataToStorage(skipUndoPush = false) {
  settlementData = sortSettlementData(settlementData);

  if (!skipUndoPush) {
    pushUndoState();
  }

  // LocalStorage 저장 시 대용량 바이너리 제외하고 메타데이터 위주로 보존
  const metaOnlyFiles = sharedFilesData.map(f => ({
    id: f.id,
    name: f.name,
    tag: f.tag,
    size: f.size,
    date: f.date,
    content: (f.content && f.content.length < 50000) ? f.content : 'INDEXED_DB'
  }));

  

  try {
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(itineraryData));
    localStorage.setItem(STORAGE_KEYS.SETTLEMENT, JSON.stringify(settlementData));
    localStorage.setItem(STORAGE_KEYS.GRANT, grantAmount.toString());
    localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATE, globalExchangeRate.toString());
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklistData));
    localStorage.setItem(STORAGE_KEYS.HOTEL, JSON.stringify(hotelData));
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(emergencyData));
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(metaOnlyFiles));
    localStorage.setItem(STORAGE_KEYS.REPORT, JSON.stringify(reportData));
    localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memoData));
  } catch (e) {
    console.warn('LocalStorage 세이프가드 작동:', e);
  }

  if (!isRemoteUpdating) {
    if (rtdbInstance || dbInstance) {
      pushDataToFirebaseCloud();
    }
    broadcastSyncToOtherWindows();
  }
}

function initMultiWindowSyncChannel() {
  if ('BroadcastChannel' in window) {
    syncBroadcastChannel = new BroadcastChannel('sydney_travel_sync_channel');
    syncBroadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'DATA_UPDATED') {
        isRemoteUpdating = true;
        loadDataFromStorage();
        renderAllViews();
        isRemoteUpdating = false;
        showSyncFlashToast('⚡ 다른 창에서 수정한 내용이 실시간 반영되었습니다!');
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (!isRemoteUpdating) {
      isRemoteUpdating = true;
      loadDataFromStorage();
      renderAllViews();
      isRemoteUpdating = false;
      showSyncFlashToast('⚡ 실시간 데이터 동기화 완료!');
    }
  });
}

function broadcastSyncToOtherWindows() {
  if (syncBroadcastChannel) {
    syncBroadcastChannel.postMessage({ type: 'DATA_UPDATED', time: Date.now() });
  }
}

function renderAllViews() {
  renderHotelAndEmergencyDisplay();
  renderItinerarySidebar();
  renderDrawerItineraryList();
  updateMapMarkersAndPolylines();
  renderChecklist();
  renderSettlementTable();
  renderMemos();
  renderSharedFiles();
  renderReport();
}

function showSyncFlashToast(msg) {
  const badge = document.getElementById('cloudStatusText');
  if (badge) {
    const originalText = badge.innerText;
    badge.innerText = msg;
    badge.style.color = '#B37D00';
    setTimeout(() => {
      badge.innerText = originalText;
      badge.style.color = '';
    }, 2000);
  }
}

function initFirebaseCloudSync() {
  const savedConfig = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
  
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      if (typeof firebase !== 'undefined' && config.apiKey) {
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        
        try {
          rtdbInstance = firebase.database();
        } catch(e) {}

        try {
          dbInstance = firebase.firestore();
        } catch(e) {}

        updateCloudSyncBadge(true, '☁️ Realtime Cloud Sync 연결됨');
        subscribeCloudSyncChanges();
      }
    } catch (e) {
      console.warn('Firebase 구글 클라우드 초기화 대기:', e);
      updateCloudSyncBadge(false, '☁️ Sync 설정 (클릭)');
    }
  } else {
    updateCloudSyncBadge(false, '☁️ Realtime Sync 켜짐');
  }
}

function updateCloudSyncBadge(isConnected, text) {
  const badge = document.getElementById('cloudSyncStatusBadge');
  const textEl = document.getElementById('cloudStatusText');
  if (badge && textEl) {
    textEl.innerText = text;
    if (isConnected) {
      badge.className = 'clay-badge badge-green';
    } else {
      badge.className = 'clay-badge badge-gold';
    }
  }
}

function pushDataToFirebaseCloud() {
  const sortedSettlements = sortSettlementData(settlementData);

  const sanitizedFiles = sharedFilesData.map(f => ({
    id: f.id,
    name: f.name,
    tag: f.tag,
    size: f.size,
    date: f.date
  }));

  

  const payload = {
    itinerary: itineraryData,
    settlement: sortedSettlements,
    grant: grantAmount,
    exchangeRate: globalExchangeRate,
    checklist: checklistData,
    hotel: hotelData,
    emergency: emergencyData,
    memos: memoData,
    files: sanitizedFiles,
    report: reportData,
    updatedAt: Date.now()
  };

  if (rtdbInstance) {
    rtdbInstance.ref('sydney_travel_app/master_data').set(payload).catch(e => {});
  }

  if (dbInstance) {
    try {
      dbInstance.collection('sydney_travel_app').doc('master_data').set(payload, { merge: true }).catch(e => {});
    } catch(e) {}
  }
}

function subscribeCloudSyncChanges() {
  if (rtdbInstance) {
    rtdbInstance.ref('sydney_travel_app/master_data').on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        applyRemoteCloudData(data);
      }
    });
  }

  if (dbInstance) {
    try {
      dbInstance.collection('sydney_travel_app').doc('master_data').onSnapshot((doc) => {
        if (doc.exists) {
          applyRemoteCloudData(doc.data());
        }
      });
    } catch(e) {}
  }
}

function applyRemoteCloudData(data) {
  isRemoteUpdating = true;
  if (data.itinerary) itineraryData = data.itinerary;
  if (data.exchangeRate) globalExchangeRate = data.exchangeRate;
  if (data.settlement) {
    settlementData = sortSettlementData(data.settlement.map(r => ({
      ...r,
      rate: r.rate || globalExchangeRate,
      isSettled: typeof r.isSettled === 'boolean' ? r.isSettled : Boolean(r.isGrantUsed)
    })));
  }
  if (data.grant) grantAmount = data.grant;
  if (data.checklist) checklistData = data.checklist;
  if (data.hotel) hotelData = data.hotel;
  if (data.emergency) emergencyData = data.emergency;
  if (data.memos) memoData = data.memos;

  if (data.files && Array.isArray(data.files)) {
    const fileMap = new Map(sharedFilesData.map(f => [f.id, f]));
    sharedFilesData = data.files.map(rf => {
      const existing = fileMap.get(rf.id);
      return {
        ...rf,
        content: existing ? existing.content : null
      };
    });
  }

  if (data.report) reportData = data.report;

  saveDataToStorage();
  renderAllViews();
  isRemoteUpdating = false;
  showSyncFlashToast('⚡ 구글 클라우드 0.1초 실시간 수신 완료!');
}

window.openCloudSyncConfigModal = function() {
  const overlay = document.getElementById('cloudSyncModalOverlay');
  const savedConfig = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      document.getElementById('fbApiKey').value = parsed.apiKey || '';
      document.getElementById('fbProjectId').value = parsed.projectId || '';
    } catch(e) {}
  }
  if (overlay) overlay.classList.add('active');
};

window.closeCloudSyncConfigModal = function() {
  const overlay = document.getElementById('cloudSyncModalOverlay');
  if (overlay) overlay.classList.remove('active');
};

window.saveFirebaseConfigModal = function(e) {
  if (e) e.preventDefault();
  const apiKey = document.getElementById('fbApiKey').value.trim();
  const projectId = document.getElementById('fbProjectId').value.trim();

  if (!apiKey || !projectId) {
    alert('Firebase apiKey와 projectId를 입력해주세요.');
    return;
  }

  const configObj = {
    apiKey: apiKey,
    projectId: projectId,
    databaseURL: `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`,
    authDomain: `${projectId}.firebaseapp.com`,
    storageBucket: `${projectId}.appspot.com`
  };

  localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(configObj));
  alert('☁️ 구글 파이어베이스 설정이 저장되었습니다! 0.1초 실시간 클라우드 동기화를 가동합니다.');
  closeCloudSyncConfigModal();
  initFirebaseCloudSync();
};

window.downloadSingleFile = async function(id) {
  const file = sharedFilesData.find(f => f.id === id);
  if (!file) return;

  let fileContent = file.content;
  if (!fileContent || fileContent === 'INDEXED_DB') {
    fileContent = await getBlobFromIndexedDB('files_blob', id);
  }

  const link = document.createElement('a');

  if (fileContent && typeof fileContent === 'string' && fileContent.startsWith('data:')) {
    link.href = fileContent;
  } else {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + (fileContent || '서류 데이터 내용입니다.')], { type: 'text/plain;charset=utf-8' });
    link.href = URL.createObjectURL(blob);
  }

  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.triggerDocUpload = function() {
  const fileInput = document.getElementById('fileInput');
  if (fileInput) fileInput.click();
};

/* 💡 [IndexedDB 무제한 파일 업로드 엔진 연동] */
window.handleFileUpload = function(files) {
  if (!files || files.length === 0) return;
  Array.from(files).forEach(file => {
    const tagChoice = prompt(`파일 [${file.name}]의 태그 분류를 선택하세요:\n1: 여행계획\n2: 항공숙박\n3: 영수증\n4: 학교제출 서류\n5: 기타`, "1");
    
    let tag = '기타';
    if (tagChoice === '1') tag = '여행계획';
    else if (tagChoice === '2') tag = '항공숙박';
    else if (tagChoice === '3') tag = '영수증';
    else if (tagChoice === '4') tag = '학교제출 서류';

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileId = 'f-' + Date.now() + Math.random().toString(36).substr(2, 4);
      const fileRecord = {
        id: fileId,
        name: file.name,
        tag: tag,
        size: (file.size / 1024).toFixed(0) + ' KB',
        date: (new Date().getMonth() + 1) + '.' + new Date().getDate(),
        content: e.target.result
      };

      // 💡 IndexedDB에 대용량 바이너리 보관!
      await saveBlobToIndexedDB('files_blob', { id: fileId, content: e.target.result });

      sharedFilesData.push(fileRecord);
      saveDataToStorage();
      renderSharedFiles();
      showSyncFlashToast('📄 서류 파일이 IndexedDB에 안전 등록되었습니다!');
    };
    reader.readAsDataURL(file);
  });
};

window.filterDocTag = function(tag, btnEl) {
  currentFileFilter = tag;
  const chips = document.querySelectorAll('#docTagFilter .doc-tag-chip');
  chips.forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderSharedFiles();
};

function renderSharedFiles() {
  const container = document.getElementById('sharedFileList');
  if (!container) return;

  container.innerHTML = '';

  const filteredFiles = sharedFilesData.filter(f => {
    if (currentFileFilter === 'all') return true;
    return f.tag === currentFileFilter;
  });

  if (filteredFiles.length === 0) {
    container.innerHTML = '<li style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:16px;">이 분류에 등록된 서류가 없습니다.</li>';
    return;
  }

  filteredFiles.forEach(file => {
    const li = document.createElement('li');
    li.className = 'doc-item-li';

    li.innerHTML = `
      <div class="doc-item-info">
        <i class="fa-solid fa-file-pdf" style="color:var(--uluru-red); font-size:1.3rem; flex-shrink:0; margin-top:2px;"></i>
        <div style="overflow:hidden; flex-grow:1;">
          <span class="doc-file-name">${escapeHTML(file.name)}</span>
          <div class="doc-file-meta">
            <span class="clay-badge badge-blue" style="font-size:0.68rem; padding:1px 6px;">${escapeHTML(file.tag)}</span>
            <span>${file.size || '100 KB'}</span> · <span>${file.date || '최근'}</span>
          </div>
        </div>
      </div>
      <div class="doc-item-actions">
        <button class="clay-btn clay-btn-primary" style="padding:4px 10px; font-size:0.75rem; white-space:nowrap;" onclick="downloadSingleFile('${file.id}')">
          <i class="fa-solid fa-download"></i> 다운
        </button>
        <button class="clay-btn clay-btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteSharedFile('${file.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    container.appendChild(li);
  });
}

window.deleteSharedFile = function(id) {
  sharedFilesData = sharedFilesData.filter(f => f.id !== id);
  saveDataToStorage();
  renderSharedFiles();
};

function renderHotelAndEmergencyDisplay() {
  document.getElementById('hotelName').innerText = hotelData.name || '';
  document.getElementById('hotelAddress').innerText = hotelData.address || '';
  document.getElementById('hotelPhone').innerText = hotelData.phone || '';

  document.getElementById('emgCall').innerText = emergencyData.call || '';
  document.getElementById('emgEmbassy').innerText = emergencyData.embassy || '';
  document.getElementById('emgHospital').innerText = emergencyData.hospital || '';
}

window.openHotelModal = function() {
  document.getElementById('inputHotelName').value = hotelData.name || '';
  document.getElementById('inputHotelAddress').value = hotelData.address || '';
  document.getElementById('inputHotelPhone').value = hotelData.phone || '';
  const overlay = document.getElementById('hotelModalOverlay');
  if (overlay) overlay.classList.add('active');
};

window.closeHotelModal = function() {
  const overlay = document.getElementById('hotelModalOverlay');
  if (overlay) overlay.classList.remove('active');
};

window.saveHotelModal = function(e) {
  if (e) e.preventDefault();
  hotelData.name = document.getElementById('inputHotelName').value.trim();
  hotelData.address = document.getElementById('inputHotelAddress').value.trim();
  hotelData.phone = document.getElementById('inputHotelPhone').value.trim();
  saveDataToStorage();
  renderHotelAndEmergencyDisplay();
  closeHotelModal();
};

window.openEmergencyModal = function() {
  document.getElementById('inputEmgCall').value = emergencyData.call || '';
  document.getElementById('inputEmgEmbassy').value = emergencyData.embassy || '';
  document.getElementById('inputEmgHospital').value = emergencyData.hospital || '';
  const overlay = document.getElementById('emergencyModalOverlay');
  if (overlay) overlay.classList.add('active');
};

window.closeEmergencyModal = function() {
  const overlay = document.getElementById('emergencyModalOverlay');
  if (overlay) overlay.classList.remove('active');
};

window.saveEmergencyModal = function(e) {
  if (e) e.preventDefault();
  emergencyData.call = document.getElementById('inputEmgCall').value.trim();
  emergencyData.embassy = document.getElementById('inputEmgEmbassy').value.trim();
  emergencyData.hospital = document.getElementById('inputEmgHospital').value.trim();
  saveDataToStorage();
  renderHotelAndEmergencyDisplay();
  closeEmergencyModal();
};

window.openEditModal = function(dayId) {
  const targetDay = itineraryData.find(d => d.id === dayId);
  if (!targetDay) return;

  document.getElementById('editDayId').value = targetDay.id;
  document.getElementById('editDateStr').value = targetDay.dateStr || '';
  document.getElementById('editDateTitle').value = targetDay.subtitle || '';
  document.getElementById('editTourTime').value = targetDay.tourTime || '';

  const spotsText = targetDay.spots.map(s => `${s.name} | ${s.note || ''}`).join('\n');
  document.getElementById('editSpots').value = spotsText;
  document.getElementById('editNote').value = targetDay.tip || '';

  const overlay = document.getElementById('editModalOverlay');
  if (overlay) overlay.classList.add('active');
};

window.closeEditModal = function() {
  const overlay = document.getElementById('editModalOverlay');
  if (overlay) overlay.classList.remove('active');
};

window.saveEditModal = function(e) {
  if (e) e.preventDefault();

  const dayId = document.getElementById('editDayId').value;
  const dateStr = document.getElementById('editDateStr').value.trim();
  const title = document.getElementById('editDateTitle').value.trim();
  const tourTime = document.getElementById('editTourTime').value.trim();
  const spotsRawText = document.getElementById('editSpots').value.trim();
  const note = document.getElementById('editNote').value.trim();

  const targetDay = itineraryData.find(d => d.id === dayId);
  if (targetDay) {
    if (dateStr) targetDay.dateStr = dateStr;
    if (title) targetDay.subtitle = title;
    targetDay.tourTime = tourTime || '자율시간';
    if (note) targetDay.tip = note;

    if (spotsRawText) {
      const lines = spotsRawText.split('\n');
      targetDay.spots = lines.map(line => {
        if (!line.trim()) return null;
        const parts = line.split('|');
        return {
          name: parts[0] ? parts[0].trim() : '장소명 미입력',
          note: parts[1] ? parts[1].trim() : '세부 메모 없음'
        };
      }).filter(Boolean);
    }

    saveDataToStorage();
    renderItinerarySidebar();
    renderDrawerItineraryList();
    updateMapMarkersAndPolylines();
    closeEditModal();
  }
};

window.triggerDeleteDay = function() {
  const dayId = document.getElementById('editDayId').value;
  if (confirm('이 일자를 삭제하시겠습니까?')) {
    itineraryData = itineraryData.filter(d => d.id !== dayId);
    saveDataToStorage();
    renderItinerarySidebar();
    renderDrawerItineraryList();
    updateMapMarkersAndPolylines();
    closeEditModal();
  }
};

window.triggerAddDay = function() {
  const newId = 'day-' + Date.now();
  itineraryData.push({
    id: newId,
    dateStr: `8/${18 + itineraryData.length}`,
    subtitle: '새로운 일정',
    badgeClass: 'badge-blue',
    color: '#008094',
    tourTime: '자유시간',
    spots: [{ name: '새로운 장소 이름', note: '밑의 작은 설명글을 작성하세요' }],
    tip: '안내 팁을 자유롭게 작성하세요',
    latlng: [-33.8688, 151.2093]
  });
  saveDataToStorage();
  renderItinerarySidebar();
  renderDrawerItineraryList();
};

window.addChecklistItem = function(category) {
  const text = prompt('추가할 체크리스트 항목을 입력하세요:');
  if (text && text.trim()) {
    if (!checklistData[category]) checklistData[category] = [];
    checklistData[category].push({
      id: 'c-' + Date.now(),
      text: text.trim(),
      done: false
    });
    saveDataToStorage();
    renderChecklist();
  }
};

function renderChecklist() {
  const categories = ['before', 'during', 'after', 'etc'];
  categories.forEach(cat => {
    const listEl = document.getElementById(`list${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
    if (!listEl) return;

    listEl.innerHTML = '';
    const items = checklistData[cat] || [];

    items.forEach(item => {
      const li = document.createElement('li');
      li.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--input-bg);
        padding: 8px 12px;
        border-radius: 12px;
        box-shadow: var(--clay-shadow-pressed);
        font-size: 0.85rem;
      `;

      li.innerHTML = `
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex-grow: 1; text-decoration: ${item.done ? 'line-through' : 'none'}; color: ${item.done ? 'var(--text-muted)' : 'var(--text-primary)'}; word-break: keep-all;">
          <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleChecklistItem('${cat}', '${item.id}')" style="width:16px; height:16px; accent-color: var(--sydney-ocean);">
          <span>${escapeHTML(item.text)}</span>
        </label>
        <button class="close-btn" onclick="deleteChecklistItem('${cat}', '${item.id}')" style="font-size: 1.1rem; color: #999;">&times;</button>
      `;
      listEl.appendChild(li);
    });
  });
}

window.toggleChecklistItem = function(category, id) {
  const item = (checklistData[category] || []).find(i => i.id === id);
  if (item) {
    item.done = !item.done;
    saveDataToStorage();
    renderChecklist();
  }
};

window.deleteChecklistItem = function(category, id) {
  checklistData[category] = (checklistData[category] || []).filter(i => i.id !== id);
  saveDataToStorage();
  renderChecklist();
};

window.triggerAddSettlementRow = function() {
  const newRow = {
    id: Date.now(),
    category: '항공료',
    date: '2000-01-01',
    vendor: '업체',
    detail: '내역',
    krw: 0,
    aud: 0,
    rate: globalExchangeRate || 900,
    method: '트래블 카드',
    isGrantUsed: true,
    isSettled: true
  };
  settlementData.push(newRow);
  saveDataToStorage();
  renderSettlementTable();
};

window.triggerEditGlobalRate = function() {
  const input = prompt('모든 지출 행에 일괄 적용할 환율(1 AUD 당 원화)을 입력하세요:', globalExchangeRate);
  if (input !== null) {
    const newRate = parseFloat(input);
    if (!isNaN(newRate) && newRate > 0) {
      applyGlobalExchangeRate(newRate);
    }
  }
};

function applyGlobalExchangeRate(newRate) {
  globalExchangeRate = newRate;
  settlementData.forEach(row => {
    row.rate = newRate;
    const currentKRW = parseInt(row.krw, 10) || 0;
    if (newRate > 0) {
      row.aud = Math.round((currentKRW / newRate) * 100) / 100;
    }
  });
  saveDataToStorage();
  renderSettlementTable();
}

function renderSettlementTable() {
  const tbody = document.getElementById('settlementTbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  let personalTotalExpense = 0;
  let grantExpenseTotal = 0;
  let settledPersonalExpenseTotal = 0;

  const sortedSettlements = sortSettlementData(settlementData);
  settlementData = sortedSettlements;

  sortedSettlements.forEach((row, idx) => {
    const krwVal = parseInt(row.krw, 10) || 0;
    const isGrant = Boolean(row.isGrantUsed);
    const isSettled = typeof row.isSettled === 'boolean' ? row.isSettled : isGrant;

    if (isGrant) {
      grantExpenseTotal += krwVal;
    } else {
      personalTotalExpense += krwVal;
      if (isSettled) {
        settledPersonalExpenseTotal += krwVal;
      }
    }

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--input-border)';

    const categoryOptionsHtml = categoryOptions.map(opt => `
      <option value="${opt}" ${row.category === opt ? 'selected' : ''}>${opt}</option>
    `).join('');

    const formattedKRW = krwVal.toLocaleString();

    tr.innerHTML = `
      <td style="padding:6px; font-weight:700; text-align:center;">${idx + 1}</td>
      <td style="padding:6px;">
        <select onchange="updateSettlementField(${row.id}, 'category', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; outline:none; color:var(--sydney-ocean); cursor:pointer;">
          ${categoryOptionsHtml}
        </select>
      </td>
      <td style="padding:6px;"><input type="date" value="${row.date}" onchange="updateSettlementField(${row.id}, 'date', this.value)" style="width:100%; border:none; background:transparent; outline:none; font-size:0.8rem; color:var(--text-primary);"></td>
      <td style="padding:6px;"><input type="text" value="${escapeHTML(row.vendor)}" onchange="updateSettlementField(${row.id}, 'vendor', this.value)" style="width:100%; border:none; background:transparent; font-weight:600; outline:none; color:var(--text-primary);"></td>
      <td style="padding:6px;"><input type="text" value="${escapeHTML(row.detail)}" onchange="updateSettlementField(${row.id}, 'detail', this.value)" style="width:100%; border:none; background:transparent; outline:none; color:var(--text-primary);"></td>
      
      <td style="padding:6px; text-align:center;">
        <input type="checkbox" ${isGrant ? 'checked' : ''} onchange="updateSettlementField(${row.id}, 'isGrantUsed', this.checked)" style="width:18px; height:18px; accent-color: var(--sydney-ocean); cursor:pointer;">
      </td>
      <td style="padding:6px; text-align:center;">
        <input type="checkbox" ${isSettled ? 'checked' : ''} onchange="updateSettlementField(${row.id}, 'isSettled', this.checked)" style="width:18px; height:18px; accent-color: var(--eucalyptus-green); cursor:pointer;">
      </td>

      <td style="padding:6px;">
        <input type="text" value="${formattedKRW}" onchange="updateSettlementField(${row.id}, 'krw', this.value)" style="width:100%; border:none; background:transparent; font-weight:800; color:var(--uluru-red); outline:none;" placeholder="0">
      </td>
      <td style="padding:6px;">
        <input type="number" value="${row.aud}" onchange="updateSettlementField(${row.id}, 'aud', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; color:var(--sydney-ocean); outline:none;" placeholder="0">
      </td>
      <td style="padding:6px;">
        <input type="number" value="${row.rate || globalExchangeRate}" onchange="updateSettlementField(${row.id}, 'rate', this.value)" style="width:100%; border:none; background:transparent; font-weight:700; outline:none; color:var(--text-primary);" placeholder="900">
      </td>
      <td style="padding:6px;"><input type="text" value="${escapeHTML(row.method)}" onchange="updateSettlementField(${row.id}, 'method', this.value)" style="width:100%; border:none; background:transparent; outline:none; color:var(--text-primary);"></td>
      
      <td style="padding:6px; text-align:center;">
        <button class="clay-btn clay-btn-danger" style="padding:3px 8px; font-size:0.75rem;" onclick="deleteSettlementRow(${row.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const rateDisplayEl = document.getElementById('displayGlobalRate');
  if (rateDisplayEl) rateDisplayEl.innerText = `1 AUD = ₩ ${globalExchangeRate.toLocaleString()}`;

  const grantBalance = grantAmount - grantExpenseTotal;
  let personalBalance = personalTotalExpense - settledPersonalExpenseTotal;

  if (grantBalance < 0) {
    personalBalance += Math.abs(grantBalance);
  }

  let perPersonExpense = 0;
  let subExplanation = '';

  if (grantBalance < 0) {
    perPersonExpense = Math.round((Math.abs(grantBalance) + personalTotalExpense) / 4);
    subExplanation = `지원금 초과 ₩${Math.abs(grantBalance).toLocaleString()} 포함 (1/4 N빵)`;
  } else {
    perPersonExpense = Math.round(personalTotalExpense / 4);
    subExplanation = `개인 총지출 ₩${personalTotalExpense.toLocaleString()} 기준 (1/4 N빵)`;
  }

  document.getElementById('summaryGrant').innerText = `₩ ${grantAmount.toLocaleString()}`;
  document.getElementById('summaryPersonalTotalExpense').innerText = `₩ ${personalTotalExpense.toLocaleString()}`;
  document.getElementById('summaryGrantExpense').innerText = `₩ ${grantExpenseTotal.toLocaleString()}`;
  document.getElementById('summaryPersonalExpense').innerText = `₩ ${settledPersonalExpenseTotal.toLocaleString()}`;
  
  document.getElementById('summaryGrantBalance').innerText = `₩ ${grantBalance.toLocaleString()}`;
  document.getElementById('summaryPersonalBalance').innerText = `₩ ${personalBalance.toLocaleString()}`;

  const perPersonEl = document.getElementById('summaryPerPersonExpense');
  const perPersonSubEl = document.getElementById('summaryPerPersonSubText');
  if (perPersonEl) perPersonEl.innerText = `₩ ${perPersonExpense.toLocaleString()}`;
  if (perPersonSubEl) perPersonSubEl.innerText = subExplanation;
}

function parseFormattedNumber(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const clean = String(val).replace(/,/g, '').trim();
  return parseInt(clean, 10) || 0;
}

window.updateSettlementField = function(id, field, value) {
  const row = settlementData.find(s => s.id === id);
  if (row) {
    if (field === 'rate') {
      const newRate = parseFloat(value) || globalExchangeRate || 900;
      applyGlobalExchangeRate(newRate);
      return;
    } else if (field === 'krw') {
      row.krw = parseFormattedNumber(value);
      const currentRate = parseFloat(row.rate) || globalExchangeRate || 1;
      if (currentRate > 0) {
        row.aud = Math.round((row.krw / currentRate) * 100) / 100;
      }
    } else if (field === 'aud') {
      row.aud = parseFloat(value) || 0;
      const currentRate = parseFloat(row.rate) || globalExchangeRate || 1;
      row.krw = Math.round(row.aud * currentRate);
    } else if (field === 'isGrantUsed') {
      row.isGrantUsed = Boolean(value);
      row.isSettled = Boolean(value);
    } else if (field === 'isSettled') {
      row.isSettled = Boolean(value);
    } else {
      row[field] = value;
    }
    saveDataToStorage();
    renderSettlementTable();
  }
};

window.triggerEditGrant = function() {
  const input = prompt('수정할 총 지원금(가지급금) 원화 금액을 입력하세요 (예: 2,500,000):', grantAmount.toLocaleString());
  if (input !== null) {
    const parsed = parseFormattedNumber(input);
    if (!isNaN(parsed)) {
      grantAmount = parsed;
      saveDataToStorage();
      renderSettlementTable();
    }
  }
};

window.deleteSettlementRow = function(id) {
  settlementData = settlementData.filter(s => s.id !== id);
  saveDataToStorage();
  renderSettlementTable();
};

window.exportGrantOnlyCSV = function() {
  const BOM = "\uFEFF";
  let csvContent = "연번,구분,결제일자,업체명,내역(상세),지원금 사용,정산완료 여부,금액(원),현지(AUD),환율,결제방법\n";
  const grantRows = sortSettlementData(settlementData.filter(r => r.isGrantUsed));
  if (grantRows.length === 0) {
    alert('지원금 사용이 체크된 지출 항목이 없습니다.');
    return;
  }
  grantRows.forEach((r, i) => {
    const isUsedStr = r.isGrantUsed ? "사용함(O)" : "미사용(X)";
    const settledStr = r.isSettled ? "정산완료(O)" : "미정산(X)";
    csvContent += `${i+1},"${r.category}","${r.date}","${r.vendor}","${r.detail}","${isUsedStr}","${settledStr}",${r.krw},${r.aud},${r.rate},"${r.method}"\n`;
  });
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "2026_호주머니_0원의_배낭연수_지원금_정산서.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.exportFullCSV = function() {
  const BOM = "\uFEFF";
  let csvContent = "연번,구분,결제일자,업체명,내역(상세),지원금 사용여부,정산완료 여부,금액(원),현지(AUD),환율,결제방법\n";
  const sortedRows = sortSettlementData(settlementData);
  sortedRows.forEach((r, i) => {
    const isUsedStr = r.isGrantUsed ? "사용함(O)" : "미사용(X)";
    const settledStr = r.isSettled ? "정산완료(O)" : "미정산(X)";
    csvContent += `${i+1},"${r.category}","${r.date}","${r.vendor}","${r.detail}","${isUsedStr}","${settledStr}",${r.krw},${r.aud},${r.rate},"${r.method}"\n`;
  });
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "2026_호주머니_0원의_배낭연수_전체_정산서.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.triggerAddMemo = function() {
  const text = prompt('추가할 메모 내용을 입력하세요:');
  if (text && text.trim()) {
    memoData.push({
      id: 'm-' + Date.now(),
      text: text.trim(),
      time: (new Date().getMonth() + 1) + '/' + new Date().getDate() + ' ' + new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0')
    });
    saveDataToStorage();
    renderMemos();
  }
};

function renderMemos() {
  const container = document.getElementById('memoGrid');
  if (!container) return;
  container.innerHTML = '';

  memoData.forEach(m => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: var(--aus-gold-soft);
      padding: 14px;
      border-radius: 16px;
      box-shadow: var(--clay-shadow-main);
      font-size: 0.85rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 120px;
    `;

    card.innerHTML = `
      <p style="font-weight:600; color:var(--text-primary); line-height:1.4; word-break:keep-all;">${escapeHTML(m.text)}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px dashed #E6DF9A; padding-top:6px;">
        <span style="font-size:0.72rem; color:var(--text-muted);">${m.time || '최근'}</span>
        <div>
          <button class="clay-btn clay-btn-secondary" style="padding:2px 6px; font-size:0.7rem; margin-right:4px;" onclick="editMemo('${m.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="clay-btn clay-btn-danger" style="padding:2px 6px; font-size:0.7rem;" onclick="deleteMemo('${m.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

window.editMemo = function(id) {
  const target = memoData.find(m => m.id === id);
  if (!target) return;

  const newText = prompt('메모 내용을 수정하세요:', target.text);
  if (newText !== null && newText.trim()) {
    target.text = newText.trim();
    target.time = '수정됨 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    saveDataToStorage();
    renderMemos();
  }
};

window.deleteMemo = function(id) {
  if (confirm('이 메모를 삭제하시겠습니까?')) {
    memoData = memoData.filter(m => m.id !== id);
    saveDataToStorage();
    renderMemos();
  }
};

/* ========== 결과 보고서 탭 ========== */

const reportFieldLabels = {
  places: { icon: '🏢', label: '연수 장소', color: 'var(--sydney-ocean)' },
  experiences: { icon: '📝', label: '체험 내용', color: 'var(--aus-gold)' },
  results: { icon: '🎯', label: '도출 결과', color: 'var(--uluru-red)' },
  connections: { icon: '🏛️', label: '제천시 연계 방안', color: 'var(--eucalyptus-green)' }
};

function renderReport() {
  reportData.topics.forEach(topic => {
    const titleEl = document.getElementById(`topicTitle-${topic.id}`);
    if (titleEl) titleEl.innerText = topic.title;

    const bodyEl = document.getElementById(`topicBody-${topic.id}`);
    if (!bodyEl) return;
    bodyEl.innerHTML = '';

    // 2단 분할 그리드 생성
    const grid = document.createElement('div');
    grid.className = 'report-grid-2col';
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; width: 100%;';

    // 좌측 열: 호주 사례분석
    const leftCol = document.createElement('div');
    leftCol.style.cssText = 'display: flex; flex-direction: column; gap: 12px; background: rgba(0, 128, 148, 0.04); padding: 12px; border-radius: 12px; border: 1px solid rgba(0, 128, 148, 0.1);';
    leftCol.innerHTML = `<h4 style="margin: 0 0 6px 0; font-size: 0.9rem; font-weight: 800; color: var(--sydney-ocean);"><i class="fa-solid fa-earth-oceania"></i> 🇦🇺 호주 선진 사례분석</h4>`;

    // 우측 열: 접목 및 결과 도출
    const rightCol = document.createElement('div');
    rightCol.style.cssText = 'display: flex; flex-direction: column; gap: 12px; background: rgba(229, 81, 0, 0.04); padding: 12px; border-radius: 12px; border: 1px solid rgba(229, 81, 0, 0.1);';
    const isTopic1 = topic.id === 'topic-1';
    const targetLabel = isTopic1 ? '제천시' : '세명대';
    const targetColor = isTopic1 ? 'var(--uluru-red)' : 'var(--eucalyptus-green)';
    rightCol.innerHTML = `<h4 style="margin: 0 0 6px 0; font-size: 0.9rem; font-weight: 800; color: ${targetColor};"><i class="fa-solid fa-house-medical"></i> 🇰🇷 ${targetLabel} 접목 및 결과 도출</h4>`;

    ['places', 'experiences', 'results', 'connections'].forEach(field => {
      const meta = reportFieldLabels[field];
      const section = document.createElement('div');
      section.style.cssText = 'background: var(--card-bg); padding: 10px 12px; border-radius: var(--radius-md); box-shadow: var(--clay-shadow-pressed);';

      const items = topic[field] || [];
      const itemsHtml = items.map((item, idx) => `
        <li style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: var(--input-bg); border-radius: 8px; font-size: 0.82rem; margin-bottom: 4px; border: 1px solid var(--input-border); gap: 8px;">
          <span style="flex: 1; word-break: keep-all; line-height: 1.35;">${escapeHTML(item)}</span>
          <div style="display: flex; gap: 4px; flex-shrink: 0;">
            <button class="clay-btn clay-btn-secondary" style="padding: 2px 6px; font-size: 0.68rem;" onclick="editReportItem('${topic.id}', '${field}', ${idx})">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="clay-btn clay-btn-danger" style="padding: 2px 6px; font-size: 0.68rem;" onclick="deleteReportItem('${topic.id}', '${field}', ${idx})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </li>
      `).join('');

      section.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.83rem; font-weight: 800; color: ${meta.color};">${meta.icon} ${meta.label}</span>
          <button class="clay-btn clay-btn-secondary" style="padding: 2px 8px; font-size: 0.7rem;" onclick="addReportItem('${topic.id}', '${field}')">
            <i class="fa-solid fa-plus"></i> 추가
          </button>
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${itemsHtml || '<li style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 8px;">항목이 없습니다</li>'}
        </ul>
      `;

      if (field === 'places' || field === 'experiences') {
        leftCol.appendChild(section);
      } else {
        rightCol.appendChild(section);
      }
    });

    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    bodyEl.appendChild(grid);
  });

  renderPptSlides();
}

window.editTopicTitle = function(topicId) {
  const topic = reportData.topics.find(t => t.id === topicId);
  if (!topic) return;
  const newTitle = prompt('주제 제목을 입력하세요:', topic.title);
  if (newTitle !== null && newTitle.trim()) {
    topic.title = newTitle.trim();
    saveDataToStorage();
    renderReport();
  }
};

window.addReportItem = function(topicId, field) {
  const topic = reportData.topics.find(t => t.id === topicId);
  if (!topic) return;
  const label = reportFieldLabels[field]?.label || field;
  const text = prompt(`[${label}] 항목을 입력하세요:`);
  if (text && text.trim()) {
    if (!topic[field]) topic[field] = [];
    topic[field].push(text.trim());
    saveDataToStorage();
    renderReport();
  }
};

window.editReportItem = function(topicId, field, idx) {
  const topic = reportData.topics.find(t => t.id === topicId);
  if (!topic || !topic[field]) return;
  const newText = prompt('내용을 수정하세요:', topic[field][idx]);
  if (newText !== null && newText.trim()) {
    topic[field][idx] = newText.trim();
    saveDataToStorage();
    renderReport();
  }
};

window.deleteReportItem = function(topicId, field, idx) {
  const topic = reportData.topics.find(t => t.id === topicId);
  if (!topic || !topic[field]) return;
  if (confirm('이 항목을 삭제하시겠습니까?')) {
    topic[field].splice(idx, 1);
    saveDataToStorage();
    renderReport();
  }
};

function renderPptSlides() {
  const container = document.getElementById('pptSlideList');
  if (!container) return;
  container.innerHTML = '';

  const slides = reportData.pptSlides || [];
  slides.forEach((slide, idx) => {
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; align-items: flex-start; gap: 10px; background: var(--input-bg); padding: 10px 14px; border-radius: var(--radius-lg); box-shadow: var(--clay-shadow-pressed);';

    div.innerHTML = `
      <div style="min-width: 40px; text-align: center;">
        <span style="display: inline-block; background: var(--uluru-red); color: white; width: 30px; height: 30px; line-height: 30px; border-radius: 50%; font-weight: 800; font-size: 0.78rem;">P.${slide.page}</span>
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
        <input type="text" value="${escapeHTML(slide.title)}" onchange="updatePptSlide(${idx}, 'title', this.value)" style="border: none; background: transparent; font-weight: 700; font-size: 0.88rem; outline: none; color: var(--text-primary); width: 100%;" placeholder="슬라이드 제목">
        <textarea onchange="updatePptSlide(${idx}, 'content', this.value)" style="border: 1px solid var(--input-border); background: var(--card-bg); border-radius: 8px; padding: 6px 8px; font-size: 0.8rem; outline: none; color: var(--text-primary); resize: vertical; min-height: 36px; width: 100%;" placeholder="내용 메모 (AI 보고서 작성 시 활용)">${escapeHTML(slide.content)}</textarea>
      </div>
      <button class="clay-btn clay-btn-danger" style="padding: 3px 8px; font-size: 0.72rem; flex-shrink: 0; margin-top: 4px;" onclick="deletePptSlide(${idx})">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    container.appendChild(div);
  });
}

window.addPptSlide = function() {
  const slides = reportData.pptSlides || [];
  const nextPage = slides.length > 0 ? slides[slides.length - 1].page + 1 : 1;
  slides.push({ id: 's-' + Date.now(), page: nextPage, title: '', content: '' });
  reportData.pptSlides = slides;
  saveDataToStorage();
  renderPptSlides();
};

window.updatePptSlide = function(idx, field, value) {
  if (reportData.pptSlides && reportData.pptSlides[idx]) {
    reportData.pptSlides[idx][field] = value;
    saveDataToStorage();
  }
};

window.deletePptSlide = function(idx) {
  if (confirm('이 슬라이드를 삭제하시겠습니까?')) {
    reportData.pptSlides.splice(idx, 1);
    reportData.pptSlides.forEach((s, i) => { s.page = i + 1; });
    saveDataToStorage();
    renderPptSlides();
  }
};

/* ========== md / txt 내보내기 ========== */

function buildReportMarkdown() {
  let md = '# 2026 호주 배낭연수 결과 보고서\\n\\n';
  md += `- 연수 기간: 2026.08.19 ~ 08.24\\n`;
  md += `- 연수지: 호주 시드니\\n\\n`;
  md += '---\\n\\n';

  reportData.topics.forEach((topic, tIdx) => {
    md += `## ${tIdx + 1}. ${topic.title}\\n\\n`;

    const fields = [
      { key: 'places', label: '연수 장소' },
      { key: 'experiences', label: '체험 내용' },
      { key: 'results', label: '도출 결과' },
      { key: 'connections', label: '제천시 연계 방안' }
    ];

    fields.forEach(f => {
      md += `### ${f.label}\\n\\n`;
      const items = topic[f.key] || [];
      if (items.length === 0) {
        md += '- (미입력)\\n';
      } else {
        items.forEach(item => { md += `- ${item}\\n`; });
      }
      md += '\\n';
    });

    md += '---\\n\\n';
  });

  md += '## PPT 결과보고서 개요\\n\\n';
  md += '| 페이지 | 제목 | 내용 |\\n';
  md += '|:---:|:---|:---|\\n';
  (reportData.pptSlides || []).forEach(slide => {
    md += `| P.${slide.page} | ${slide.title} | ${slide.content} |\\n`;
  });

  return md;
}

window.exportReportAsMd = function() {
  const md = buildReportMarkdown();
  const BOM = '\\uFEFF';
  const blob = new Blob([BOM + md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '2026_호주배낭연수_결과보고서.md';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.exportReportAsTxt = function() {
  const md = buildReportMarkdown();
  const plain = md.replace(/^#{1,3}\\s*/gm, '').replace(/\\|/g, '\\t').replace(/---/g, '').replace(/\\n{3,}/g, '\\n\\n');
  const BOM = '\\uFEFF';
  const blob = new Blob([BOM + plain], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '2026_호주배낭연수_결과보고서.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function initTabNavigation() {
  const navBtns = document.querySelectorAll('.clay-nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.onclick = () => {
      const targetTab = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');

      if (targetTab === 'tab-map' && mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 200);
      }
    };
  });
}

function initMap() {
  mapInstance = L.map('sydney-map', {
    center: [-33.8688, 151.2093],
    zoom: 11
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance);

  updateMapMarkersAndPolylines();
}

function updateMapMarkersAndPolylines() {
  if (!mapInstance) return;

  const polylineCoords = [];

  itineraryData.forEach((day, idx) => {
    if (day.latlng) {
      polylineCoords.push(day.latlng);

      const customIcon = L.divIcon({
        className: 'custom-clay-pin',
        html: `<div style="
          background: ${day.color};
          color: white;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">${idx + 1}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker(day.latlng, { icon: customIcon }).addTo(mapInstance);
      
      const spotsHtml = day.spots.map(s => `<li><b>${escapeHTML(s.name)}</b> (${escapeHTML(s.note)})</li>`).join('');
      marker.bindPopup(`
        <div style="padding: 6px;">
          <h4 style="color:${day.color}; margin-bottom:4px;">${escapeHTML(day.dateStr)} - ${escapeHTML(day.subtitle)}</h4>
          <ul style="padding-left:14px; font-size:12px;">${spotsHtml}</ul>
          <p style="font-size:11px; margin-top:4px; color:#666;">${escapeHTML(day.tip)}</p>
        </div>
      `);
    }
  });

  if (polylineCoords.length > 1) {
    L.polyline(polylineCoords, {
      color: '#008094',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.8
    }).addTo(mapInstance);
  }
}

function renderItinerarySidebar() {
  const container = document.getElementById('itineraryCardList');
  if (!container) return;

  container.innerHTML = '';

  itineraryData.forEach((day) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.style.borderLeftColor = day.color;

    const spotsListHtml = day.spots.map((spot, idx) => `
      <li class="spot-item">
        <span class="spot-num" style="background:${day.color}">${idx + 1}</span>
        <div class="spot-content">
          <div class="spot-name">${escapeHTML(spot.name)}</div>
          <div class="spot-note">${escapeHTML(spot.note || '설명 없음')}</div>
        </div>
      </li>
    `).join('');

    card.innerHTML = `
      <div class="day-card-header">
        <div class="day-title-group">
          <span class="day-date" style="background:${day.color}">${escapeHTML(day.dateStr)}</span>
          <span class="day-subtitle">${escapeHTML(day.subtitle)}</span>
        </div>
        <div class="day-action-group">
          <span class="clay-badge ${day.badgeClass}">${escapeHTML(day.tourTime || '일정')}</span>
          <button class="clay-btn clay-btn-secondary" style="padding:3px 8px; font-size:0.75rem;" onclick="openEditModal('${day.id}')">
            <i class="fa-solid fa-pen"></i> 수정
          </button>
        </div>
      </div>
      <ul class="spot-list">
        ${spotsListHtml}
      </ul>
      <div class="day-footer-tip">
        <i class="fa-solid fa-circle-info" style="color:${day.color}"></i> ${escapeHTML(day.tip)}
      </div>
    `;

    container.appendChild(card);
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

window.copyAiPrompt = function() {
  const mdContent = buildReportMarkdown();
  
  const promptText = `너는 지자체(제천시) 및 대학(세명대)의 연수 성과 보고서를 전문적으로 집필하는 유능한 기획자이자 연구원이야.
아래에 입력된 [2026 호주 배낭연수 결과 보고서 및 30p PPT 개요] 데이터를 바탕으로, 다음 지침을 엄격히 준수하여 30페이지 분량의 상세한 결과보고서 PPT 최종 기획안을 작성해줘.

[작성 지침]
1. 각 슬라이드(P.1 ~ P.30)의 주제와 논리적 흐름이 매끄럽게 연결되도록 구성할 것.
2. 각 페이지마다 다음 세 요소를 반드시 포함할 것:
   - 슬라이드 제목 (Slide Title)
   - 슬라이드 시각적 레이아웃 구상 (Visual Concept & Layout)
   - 상세 발표 대본 (Detailed Script) - 대본은 구체적이고 현실적인 공무원/대학 기획서 어조로 자세하게 작성할 것.
3. 호주 현지 사례분석(보태닉 가든, 블루마운틴, 시드니대 CAPS)의 통계 수치 및 분석 결과와 제천시/세명대의 접목 방안이 유기적으로 매칭되도록 풍부한 살을 붙여 서술할 것.

--------------------------------------------------
[2026 호주 배낭연수 결과 보고서 데이터]
--------------------------------------------------
${mdContent}
--------------------------------------------------`;

  navigator.clipboard.writeText(promptText).then(() => {
    alert('📋 AI 결과보고서 작성용 최적화 프롬프트가 클립보드에 복사되었습니다!\nChatGPT, Claude, Gemini 등에 붙여넣어 30p 분량의 발표 대본과 기획안을 즉시 집필해보세요.');
  }).catch(err => {
    console.error('클립보드 복사 실패:', err);
    alert('복사에 실패했습니다. 콘솔 로그를 확인하거나 텍스트를 드래그하여 수동으로 복사해주세요.');
  });
};

