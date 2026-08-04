/* ==========================================================================
   2026 호주머니 0원의 배낭연수 여행 & 정산 애플리케이션 코어 로직 v1.5.0
   (다크모드 토글 / 인당지출 1*1 분리 / 메모-서류 순서 변경 지원)
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

const defaultPhotos = [
  { id: 'p1', src: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?auto=format&fit=crop&w=600&q=80', title: '오페라하우스 전경', category: '8/23', heart: 5, thumb: 3, wow: 2, party: 4 },
  { id: 'p2', src: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80', title: '하버브릿지 석양', category: '8/22', heart: 8, thumb: 6, wow: 5, party: 3 },
  { id: 'p3', src: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=600&q=80', title: '본다이비치 해변', category: '8/23', heart: 6, thumb: 4, wow: 3, party: 2 },
  { id: 'p4', src: 'https://images.unsplash.com/photo-1549180030-48bf079fb38a?auto=format&fit=crop&w=600&q=80', title: '시드니 공항 귀국길', category: '8/24', heart: 3, thumb: 2, wow: 1, party: 5 }
];

const STORAGE_KEYS = {
  ITINERARY: 'sydney_master_itinerary_v1',
  SETTLEMENT: 'sydney_master_settlement_v1',
  GRANT: 'sydney_master_grant_v1',
  CHECKLIST: 'sydney_master_checklist_v1',
  HOTEL: 'sydney_master_hotel_v1',
  EMERGENCY: 'sydney_master_emergency_v1',
  FILES: 'sydney_master_files_v1',
  PHOTOS: 'sydney_master_photos_v1',
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
let photoData = [];
let sharedFilesData = [];
let currentFileFilter = 'all';
let currentPhotoFilter = 'all';
let currentActivePhotoId = null;
let mapInstance = null;

let dbInstance = null;
let rtdbInstance = null;
let isRemoteUpdating = false;
let syncBroadcastChannel = null;

/* ↩️ Ctrl+Z (Undo) / Ctrl+Y (Redo) 히스토리 스택 변수 */
let undoStack = [];
let redoStack = [];

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  loadDataFromStorage();
  initTabNavigation();
  renderItinerarySidebar();
  initMap();
  renderChecklist();
  renderSettlementTable();
  initFirebaseCloudSync();
  initMultiWindowSyncChannel();
  initKeyboardShortcutListeners();
});

// 🌙 다크모드 제어
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

  const savedPhotos = getItemWithFallback(STORAGE_KEYS.PHOTOS, 'sydney_photos');
  photoData = savedPhotos ? JSON.parse(savedPhotos) : [...defaultPhotos];

  const savedMemos = getItemWithFallback(STORAGE_KEYS.MEMOS, 'sydney_memos');
  memoData = savedMemos ? JSON.parse(savedMemos) : [
    { id: 'm1', text: '오페라하우스 투어 11:45분까지 서큘러키 입구 집결!', time: '8/19 14:00' }
  ];

  pushUndoState();

  renderHotelAndEmergencyDisplay();
  renderSharedFiles();
  renderMemos();
  renderPhotos();
}

function saveDataToStorage(skipUndoPush = false) {
  settlementData = sortSettlementData(settlementData);

  if (!skipUndoPush) {
    pushUndoState();
  }

  localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(itineraryData));
  localStorage.setItem(STORAGE_KEYS.SETTLEMENT, JSON.stringify(settlementData));
  localStorage.setItem(STORAGE_KEYS.GRANT, grantAmount.toString());
  localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATE, globalExchangeRate.toString());
  localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklistData));
  localStorage.setItem(STORAGE_KEYS.HOTEL, JSON.stringify(hotelData));
  localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(emergencyData));
  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(sharedFilesData));
  localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photoData));
  localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memoData));

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
  updateMapMarkersAndPolylines();
  renderChecklist();
  renderSettlementTable();
  renderMemos();
  renderSharedFiles();
  renderPhotos();
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
  const payload = {
    itinerary: itineraryData,
    settlement: sortedSettlements,
    grant: grantAmount,
    exchangeRate: globalExchangeRate,
    checklist: checklistData,
    hotel: hotelData,
    emergency: emergencyData,
    memos: memoData,
    updatedAt: Date.now()
  };

  if (rtdbInstance) {
    rtdbInstance.ref('sydney_travel_app/master_data').set(payload);
  }

  if (dbInstance) {
    try {
      dbInstance.collection('sydney_travel_app').doc('master_data').set(payload, { merge: true });
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

function createPureZipBlob(fileEntries) {
  const textEncoder = new TextEncoder();

  function getUint32LE(val) {
    return [val & 0xff, (val >> 8) & 0xff, (val >> 16) & 0xff, (val >> 24) & 0xff];
  }
  function getUint16LE(val) {
    return [val & 0xff, (val >> 8) & 0xff];
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const localHeaders = [];
  const centralDirs = [];
  let offset = 0;

  fileEntries.forEach(entry => {
    const filenameBytes = textEncoder.encode(entry.name);
    let dataBytes = null;

    if (entry.content && typeof entry.content === 'string' && entry.content.startsWith('data:')) {
      try {
        const parts = entry.content.split(',');
        const isBase64 = parts[0].includes('base64');
        const rawData = parts[1] || '';

        if (isBase64) {
          const cleanBase64 = rawData.replace(/\s/g, '');
          const binaryStr = atob(cleanBase64);
          dataBytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            dataBytes[i] = binaryStr.charCodeAt(i);
          }
        } else {
          const decodedStr = decodeURIComponent(rawData);
          const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
          const contentBytes = textEncoder.encode(decodedStr);
          dataBytes = new Uint8Array(BOM.length + contentBytes.length);
          dataBytes.set(BOM, 0);
          dataBytes.set(contentBytes, BOM.length);
        }
      } catch (e) {
        const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
        const contentBytes = textEncoder.encode(entry.content);
        dataBytes = new Uint8Array(BOM.length + contentBytes.length);
        dataBytes.set(BOM, 0);
        dataBytes.set(contentBytes, BOM.length);
      }
    } else {
      const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
      const contentBytes = textEncoder.encode(entry.content || '');
      dataBytes = new Uint8Array(BOM.length + contentBytes.length);
      dataBytes.set(BOM, 0);
      dataBytes.set(contentBytes, BOM.length);
    }

    const dataCrc = crc32(dataBytes);
    const size = dataBytes.length;
    const flagsLE = [0x00, 0x08];

    const localHeader = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04,
      0x14, 0x00,
      ...flagsLE,
      0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      ...getUint32LE(dataCrc),
      ...getUint32LE(size),
      ...getUint32LE(size),
      ...getUint16LE(filenameBytes.length),
      0x00, 0x00
    ]);

    const localChunk = new Uint8Array(localHeader.length + filenameBytes.length + dataBytes.length);
    localChunk.set(localHeader, 0);
    localChunk.set(filenameBytes, localHeader.length);
    localChunk.set(dataBytes, localHeader.length + filenameBytes.length);
    localHeaders.push(localChunk);

    const centralHeader = new Uint8Array([
      0x50, 0x4b, 0x01, 0x02,
      0x14, 0x00,
      0x14, 0x00,
      ...flagsLE,
      0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      ...getUint32LE(dataCrc),
      ...getUint32LE(size),
      ...getUint32LE(size),
      ...getUint16LE(filenameBytes.length),
      0x00, 0x00,
      0x00, 0x00,
      0x00, 0x00,
      0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      ...getUint32LE(offset)
    ]);

    const centralChunk = new Uint8Array(centralHeader.length + filenameBytes.length);
    centralChunk.set(centralHeader, 0);
    centralChunk.set(filenameBytes, centralHeader.length);
    centralDirs.push(centralChunk);

    offset += localChunk.length;
  });

  const centralOffset = offset;
  let centralSize = 0;
  centralDirs.forEach(cd => centralSize += cd.length);

  const eocd = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06,
    0x00, 0x00,
    0x00, 0x00,
    ...getUint16LE(fileEntries.length),
    ...getUint16LE(fileEntries.length),
    ...getUint32LE(centralSize),
    ...getUint32LE(centralOffset),
    0x00, 0x00
  ]);

  const finalParts = [...localHeaders, ...centralDirs, eocd];
  return new Blob(finalParts, { type: 'application/zip' });
}

window.triggerDownloadAllDocs = function() {
  const filteredFiles = sharedFilesData.filter(f => {
    if (currentFileFilter === 'all') return true;
    return f.tag === currentFileFilter;
  });

  if (filteredFiles.length === 0) {
    alert('다운로드할 서류가 없습니다.');
    return;
  }

  try {
    const zipBlob = createPureZipBlob(filteredFiles);
    const zipName = `시드니_배낭연수_서류모음_${currentFileFilter.replace('/', '_')}.zip`;
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('ZIP 압축 다운로드 에러:', err);
    alert('ZIP 압축 다운로드 중 오류가 발생하였습니다: ' + err.message);
  }
};

window.downloadSingleFile = function(id) {
  const file = sharedFilesData.find(f => f.id === id);
  if (!file) return;

  const link = document.createElement('a');

  if (file.content && typeof file.content === 'string' && file.content.startsWith('data:')) {
    link.href = file.content;
  } else {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + (file.content || '서류 데이터')], { type: 'text/plain;charset=utf-8' });
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
    reader.onload = (e) => {
      sharedFilesData.push({
        id: 'f-' + Date.now() + Math.random().toString(36).substr(2, 4),
        name: file.name,
        tag: tag,
        size: (file.size / 1024).toFixed(0) + ' KB',
        date: (new Date().getMonth() + 1) + '.' + new Date().getDate(),
        content: e.target.result
      });
      saveDataToStorage();
      renderSharedFiles();
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
    category: '식비',
    date: '2026-08-20',
    vendor: '현지 식당',
    detail: '시드니 현지 식사',
    krw: Math.round(50 * globalExchangeRate),
    aud: 50,
    rate: globalExchangeRate,
    method: '트래블월렛',
    isGrantUsed: true,
    isSettled: true
  };
  settlementData.push(newRow);
  saveDataToStorage();
  renderSettlementTable();
};

/* 💱 [총괄 환율 일괄 변경 기능] */
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
    if (row.aud) {
      row.krw = Math.round(row.aud * newRate);
    }
  });
  saveDataToStorage();
  renderSettlementTable();
}

/* 📊 [핵심 정산 연산 & 렌더링]: 2*3 요약 + 1*1 단독 인당지출 카드 연산 */
function renderSettlementTable() {
  const tbody = document.getElementById('settlementTbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  let personalTotalExpense = 0;        // 순수 개인 부담 지출 원화 합계
  let settledGrantExpenseTotal = 0;    // 지원금 지출 중 정산완료(isSettled === true) 합계
  let settledPersonalExpenseTotal = 0; // 개인 지출 중 정산완료(isSettled === true) 합계

  const sortedSettlements = sortSettlementData(settlementData);
  settlementData = sortedSettlements;

  sortedSettlements.forEach((row, idx) => {
    const krwVal = parseInt(row.krw, 10) || 0;
    const isGrant = Boolean(row.isGrantUsed);
    const isSettled = typeof row.isSettled === 'boolean' ? row.isSettled : isGrant;

    if (isGrant) {
      if (isSettled) {
        settledGrantExpenseTotal += krwVal;
      }
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

  // 📊 비즈니스 연산:
  // 1. 지원금 차액: 총 지원금 - 정산완료 체크된 지원금 지출액
  const grantBalance = grantAmount - settledGrantExpenseTotal;

  // 2. 개인 정산 차액 기본값: 개인 총 지출 - 정산완료 체크된 개인 지출액
  let personalBalance = personalTotalExpense - settledPersonalExpenseTotal;

  // 지원금 차액이 마이너스(-)가 되면 그 절대값 만큼을 '개인 정산 차액'에 자동 더함!
  if (grantBalance < 0) {
    personalBalance += Math.abs(grantBalance);
  }

  // 💡 [4인 기준 '인당 지출' 연산 공식]:
  // 1. 지원금 차액이 - 값인 경우 : (차액의 절대값 + 개인 총 지출) / 4
  // 2. 지원금 차액이 + 값인 경우 : (개인 총 지출) / 4
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
  document.getElementById('summaryGrantExpense').innerText = `₩ ${settledGrantExpenseTotal.toLocaleString()}`;
  document.getElementById('summaryPersonalExpense').innerText = `₩ ${settledPersonalExpenseTotal.toLocaleString()}`;
  
  document.getElementById('summaryGrantBalance').innerText = `₩ ${grantBalance.toLocaleString()}`;
  document.getElementById('summaryPersonalBalance').innerText = `₩ ${personalBalance.toLocaleString()}`;

  // 💡 인당 지출 1*1 단독 카드 DOM 갱신
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

/* 📊 [환율 일괄 동기화 & 양방향 자동 계산 핵심 연동 엔진] */
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

window.triggerPhotoUpload = function() {
  const photoInput = document.getElementById('photoInput');
  if (photoInput) photoInput.click();
};

window.handlePhotoUpload = function(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    photoData.push({
      id: 'p-' + Date.now(),
      src: event.target.result,
      title: file.name,
      category: currentPhotoFilter !== 'all' ? currentPhotoFilter : '8/23',
      heart: 1,
      thumb: 0,
      wow: 0,
      party: 0
    });
    saveDataToStorage();
    renderPhotos();
  };
  reader.readAsDataURL(file);
};

window.filterPhotoTag = function(filter, btnEl) {
  currentPhotoFilter = filter;
  const chips = document.querySelectorAll('#photoCategoryFilter .photo-tag-chip');
  chips.forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderPhotos();
};

function renderPhotos() {
  const container = document.getElementById('photoGrid');
  if (!container) return;
  container.innerHTML = '';

  const filteredPhotos = photoData.filter(p => {
    if (currentPhotoFilter === 'all') return true;
    return p.category === currentPhotoFilter;
  });

  if (filteredPhotos.length === 0) {
    container.innerHTML = '<p style="font-size:0.88rem; color:var(--text-muted); grid-column: 1/-1; text-align:center; padding:24px;">이 카테고리에 해당하는 사진이 없습니다. [사진 업로드] 버튼을 눌러 사진을 추가해보세요!</p>';
    return;
  }

  filteredPhotos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'clay-card';
    card.style.cssText = 'padding: 12px; cursor: pointer; transition: transform 0.2s ease;';

    card.onclick = (e) => {
      if (e.target.closest('button')) return;
      openPhotoLightbox(p.id);
    };

    let categoryLabel = p.category === '8/23' ? '8/23 오페라하우스' : (p.category === '8/24' ? '8/24 복귀' : p.category);

    card.innerHTML = `
      <div style="overflow:hidden; border-radius:12px; margin-bottom:8px; height:140px; background:#000;">
        <img src="${p.src}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      </div>
      <div style="font-weight:700; font-size:0.88rem; margin-bottom:6px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${escapeHTML(p.title)}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:4px;">
        <span class="clay-badge badge-red" style="white-space:nowrap; flex-shrink:0; max-width:65%; text-overflow:ellipsis; overflow:hidden;">${categoryLabel}</span>
        <button class="clay-btn clay-btn-primary" style="padding:3px 8px; font-size:0.72rem; white-space:nowrap; flex-shrink:0;" onclick="downloadPhotoFile('${p.id}')">
          <i class="fa-solid fa-download"></i> 다운
        </button>
      </div>
      <div style="display:flex; justify-around; background:var(--input-bg); padding:4px; border-radius:8px; gap:2px;">
        <button class="clay-btn clay-btn-secondary" style="padding:2px 5px; font-size:0.7rem; box-shadow:none;" onclick="reactPhoto('${p.id}', 'heart')">❤️ ${p.heart || 0}</button>
        <button class="clay-btn clay-btn-secondary" style="padding:2px 5px; font-size:0.7rem; box-shadow:none;" onclick="reactPhoto('${p.id}', 'thumb')">👍 ${p.thumb || 0}</button>
        <button class="clay-btn clay-btn-secondary" style="padding:2px 5px; font-size:0.7rem; box-shadow:none;" onclick="reactPhoto('${p.id}', 'wow')">😮 ${p.wow || 0}</button>
        <button class="clay-btn clay-btn-secondary" style="padding:2px 5px; font-size:0.7rem; box-shadow:none;" onclick="reactPhoto('${p.id}', 'party')">🎉 ${p.party || 0}</button>
      </div>
    `;

    container.appendChild(card);
  });
}

window.reactPhoto = function(id, type) {
  const p = photoData.find(item => item.id === id);
  if (p) {
    if (!p[type]) p[type] = 0;
    p[type]++;
    saveDataToStorage();
    renderPhotos();
  }
};

window.openPhotoLightbox = function(id) {
  const photo = photoData.find(p => p.id === id);
  if (!photo) return;

  currentActivePhotoId = id;
  const overlay = document.getElementById('photoLightboxModal');
  const imgEl = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  const categoryEl = document.getElementById('lightboxCategory');

  imgEl.src = photo.src;
  titleEl.innerText = photo.title || '사진 상세보기';
  
  let categoryLabel = photo.category === '8/23' ? '8/23 오페라하우스' : (photo.category === '8/24' ? '8/24 복귀' : photo.category);
  categoryEl.innerText = categoryLabel;

  overlay.classList.add('active');
};

window.closePhotoLightbox = function() {
  const overlay = document.getElementById('photoLightboxModal');
  if (overlay) overlay.classList.remove('active');
};

window.downloadCurrentLightboxPhoto = function() {
  if (currentActivePhotoId) {
    downloadPhotoFile(currentActivePhotoId);
  }
};

window.downloadPhotoFile = function(id) {
  const photo = photoData.find(p => p.id === id);
  if (!photo) return;

  const link = document.createElement('a');
  link.href = photo.src;
  link.download = `시드니여행_${photo.title || '사진'}.jpg`;
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
