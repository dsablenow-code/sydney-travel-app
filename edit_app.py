import sys
import json
import re

file_path = r"C:\Users\bjh\Documents\sydney-travel-app\app.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 2-A. Version text
content = re.sub(
    r'/\* ==.*?2026 호주머니 0원의 배낭연수 여행 & 정산 애플리케이션 코어 로직 v1.6.7.*?== \*/',
    '''/* ==========================================================================
   2026 호주머니 0원의 배낭연수 여행 & 정산 애플리케이션 코어 로직 v1.7.0
   (결과 보고서 탭 탑재 & md/txt 내보내기 & 정산서 지원금 계산 수정)
   ========================================================================== */''',
    content,
    flags=re.DOTALL
)

# 2-B. defaultPhotos -> defaultReportData
content = re.sub(
    r'const defaultPhotos = \[.*?\];',
    '''const defaultReportData = {
  topics: [
    {
      id: 'topic-1',
      title: '주제 1 제목을 입력하세요',
      places: [],
      experiences: [],
      results: [],
      connections: []
    },
    {
      id: 'topic-2',
      title: '주제 2 제목을 입력하세요',
      places: [],
      experiences: [],
      results: [],
      connections: []
    }
  ],
  pptSlides: [
    { id: 's1', page: 1, title: '표지', content: '2026 호주 배낭연수 결과보고서' },
    { id: 's2', page: 2, title: '목차', content: '' },
    { id: 's3', page: 3, title: '연수 개요', content: '기간, 인원, 목적, 연수지' },
    { id: 's4', page: 4, title: '연수 일정 총괄', content: '8/19~8/24 일정 요약' },
    { id: 's5', page: 5, title: '주제 1 - 개요', content: '' },
    { id: 's6', page: 6, title: '주제 1 - 연수 장소', content: '' },
    { id: 's7', page: 7, title: '주제 1 - 체험 내용 (1)', content: '' },
    { id: 's8', page: 8, title: '주제 1 - 체험 내용 (2)', content: '' },
    { id: 's9', page: 9, title: '주제 1 - 도출 결과', content: '' },
    { id: 's10', page: 10, title: '주제 1 - 제천시 연계 방안', content: '' },
    { id: 's11', page: 11, title: '주제 2 - 개요', content: '' },
    { id: 's12', page: 12, title: '주제 2 - 연수 장소', content: '' },
    { id: 's13', page: 13, title: '주제 2 - 체험 내용 (1)', content: '' },
    { id: 's14', page: 14, title: '주제 2 - 체험 내용 (2)', content: '' },
    { id: 's15', page: 15, title: '주제 2 - 도출 결과', content: '' },
    { id: 's16', page: 16, title: '주제 2 - 제천시 연계 방안', content: '' },
    { id: 's17', page: 17, title: '종합 비교 분석', content: '' },
    { id: 's18', page: 18, title: '연수 성과 요약', content: '' },
    { id: 's19', page: 19, title: '향후 추진 계획', content: '' },
    { id: 's20', page: 20, title: '예산 집행 현황', content: '' },
    { id: 's21', page: 21, title: '기대 효과', content: '' },
    { id: 's22', page: 22, title: 'Q&A / 감사 인사', content: '' }
  ]
};''',
    content,
    flags=re.DOTALL
)

# 2-C. STORAGE_KEYS
content = content.replace(
    "PHOTOS: 'sydney_master_photos_v1'",
    "REPORT: 'sydney_master_report_v1'"
)

# 2-D. let photoData
content = content.replace('let photoData = [];', 'let reportData = {};')
content = content.replace("let currentPhotoFilter = 'all';\n", "")
content = content.replace("let currentActivePhotoId = null;\n", "")

# 2-E. loadDataFromStorage
content = content.replace(
    "const savedPhotos = getItemWithFallback(STORAGE_KEYS.PHOTOS, 'sydney_photos');\n  photoData = savedPhotos ? JSON.parse(savedPhotos) : [...defaultPhotos];",
    "const savedReport = getItemWithFallback(STORAGE_KEYS.REPORT, 'sydney_report');\n  reportData = savedReport ? JSON.parse(savedReport) : JSON.parse(JSON.stringify(defaultReportData));"
)

# 2-F. saveDataToStorage
content = re.sub(
    r'const metaOnlyPhotos = photoData\.map\(p => \(\{.*?\}\)\);',
    '',
    content,
    flags=re.DOTALL
)
content = content.replace(
    "localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(metaOnlyPhotos));",
    "localStorage.setItem(STORAGE_KEYS.REPORT, JSON.stringify(reportData));"
)
content = content.replace(
    "localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photoData));",
    ""
)

# 2-G. pushDataToFirebaseCloud
content = re.sub(
    r'const sanitizedPhotos = photoData\.map\(p => \(\{.*?\}\)\);',
    '',
    content,
    flags=re.DOTALL
)
content = content.replace(
    "photos: sanitizedPhotos,",
    "report: reportData,"
)

# 2-H. applyRemoteCloudData
content = re.sub(
    r'if \(data\.photos && Array\.isArray\(data\.photos\)\) \{.*?\}\n',
    'if (data.report) reportData = data.report;\n',
    content,
    flags=re.DOTALL
)

# 2-I & 2-L. renderPhotos -> renderReport
content = content.replace("renderPhotos();", "renderReport();")
content = re.sub(r'initIndexedDBEngine\(\);', '', content)
content = re.sub(r'await initIndexedDBEngine\(\);', '', content)

# 2-J. Settlement logic
old_settlement = '''  let personalTotalExpense = 0;
  let settledGrantExpenseTotal = 0;
  let settledPersonalExpenseTotal = 0;

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
    }'''

new_settlement = '''  let personalTotalExpense = 0;
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
    }'''
content = content.replace(old_settlement, new_settlement)
content = content.replace('settledGrantExpenseTotal', 'grantExpenseTotal')

# 2-K. Remove photo/IndexedDB functions and add report functions
content = re.sub(
    r'function initIndexedDBEngine\(\) \{.*?\}\n(async )?function saveBlobToIndexedDB',
    'function saveBlobToIndexedDB',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'(async )?function saveBlobToIndexedDB\(storeName, item\) \{.*?\n\}\n(async )?function getBlobFromIndexedDB',
    'function getBlobFromIndexedDB',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'(async )?function getBlobFromIndexedDB\(storeName, id\) \{.*?\n\}\n',
    '',
    content,
    flags=re.DOTALL
)

start_idx = content.find('window.triggerPhotoUpload = function() {')
end_idx = content.find('};\n', content.find('window.downloadPhotoFile = async function(id) {')) + 3
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + r'''/* ========== 결과 보고서 탭 ========== */

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

    ['places', 'experiences', 'results', 'connections'].forEach(field => {
      const meta = reportFieldLabels[field];
      const section = document.createElement('div');
      section.style.cssText = 'margin-bottom: 14px; background: var(--input-bg); padding: 12px 14px; border-radius: var(--radius-lg); box-shadow: var(--clay-shadow-pressed);';

      const items = topic[field] || [];
      const itemsHtml = items.map((item, idx) => `
        <li style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: var(--card-bg); border-radius: 8px; box-shadow: var(--clay-shadow-pressed); font-size: 0.83rem;">
          <span style="flex: 1; word-break: keep-all;">${escapeHTML(item)}</span>
          <div style="display: flex; gap: 4px; flex-shrink: 0;">
            <button class="clay-btn clay-btn-secondary" style="padding: 2px 6px; font-size: 0.7rem;" onclick="editReportItem('${topic.id}', '${field}', ${idx})">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="clay-btn clay-btn-danger" style="padding: 2px 6px; font-size: 0.7rem;" onclick="deleteReportItem('${topic.id}', '${field}', ${idx})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </li>
      `).join('');

      section.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.88rem; font-weight: 800; color: ${meta.color};">${meta.icon} ${meta.label}</span>
          <button class="clay-btn clay-btn-secondary" style="padding: 3px 10px; font-size: 0.73rem;" onclick="addReportItem('${topic.id}', '${field}')">
            <i class="fa-solid fa-plus"></i> 추가
          </button>
        </div>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px;">
          ${itemsHtml || '<li style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 8px;">항목을 추가해주세요</li>'}
        </ul>
      `;

      bodyEl.appendChild(section);
    });
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
};\n''' + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
