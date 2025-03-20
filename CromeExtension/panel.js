// saveToFile 함수 추가
async function saveToFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  await chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false
  });
  
  URL.revokeObjectURL(url);
}

// 탭 전환 관리
const pravenBtn = document.getElementById('pravenBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeContainer = document.getElementById('analyze-container');
const iframeContainer = document.getElementById('iframe-container');

// 초기 상태 설정 (Praven 탭 활성화)
pravenBtn.classList.add('active');
iframeContainer.classList.add('active');

pravenBtn.addEventListener('click', () => {
  pravenBtn.classList.add('active');
  analyzeBtn.classList.remove('active');
  iframeContainer.classList.add('active');
  analyzeContainer.classList.remove('active');
});

analyzeBtn.addEventListener('click', () => {
  analyzeBtn.classList.add('active');
  pravenBtn.classList.remove('active');
  analyzeContainer.classList.add('active');
  iframeContainer.classList.remove('active');
});

// 기존 분석 기능
document.getElementById('startAnalyze').addEventListener('click', async () => {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '<p class="loading">방문 기록 수집 중...</p>';

  try {
    // 최근 방문 기록 가져오기 (7일)
    const threeMonthsAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
    const historyItems = await chrome.history.search({
      text: '',
      maxResults: 5000,
      startTime: threeMonthsAgo
    });

    // 방문 기록 데이터 구조화
    const processedHistory = await Promise.all(historyItems
      .filter(item => item.title && item.url)
      .map(async item => {
        const visits = await chrome.history.getVisits({ url: item.url });
        return {
          id: item.id,
          url: item.url,
          title: item.title,
          lastVisitTime: item.lastVisitTime,
          visitCount: item.visitCount,
          typedCount: item.typedCount,
          visits: visits.map(visit => ({
            id: visit.id,
            visitId: visit.visitId,
            visitTime: visit.visitTime,
            referringVisitId: visit.referringVisitId,
            transition: visit.transition
          }))
        };
      }));

    // 방문 기록 JSON 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const historyJson = JSON.stringify(processedHistory, null, 2);
    await saveToFile(`history_data_${timestamp}.json`, historyJson);

    // 서버로 전송
    const response = await fetch('http://localhost:3000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: processedHistory
      })
    });

    if (!response.ok) {
      throw new Error('서버 응답 오류');
    }

    const analysis = await response.json();
    console.log('서버 응답:', analysis);  // 응답 구조 확인
    
    if (analysis.error) {
      throw new Error(analysis.error);
    }
    
    // 직접 keyword_groups 접근
    const keywordGroups = analysis.keyword_groups;
    
    // 분석 결과 표시
    resultDiv.innerHTML = `
      <p>총 ${keywordGroups.length}개의 키워드 그룹이 발견되었습니다.</p>
    `;

    // 키워드 클라우드 표시
    displayKeywords(keywordGroups);

  } catch (error) {
    resultDiv.innerHTML = `<p class="error">오류가 발생했습니다: ${error.message}</p>`;
  }
});

function calculateContextSimilarity(word1, word2, titles) {
  // ... 기존 코드 ...
}

function displayKeywords(groups) {
  const container = document.getElementById('cloudContainer');
  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.height = '800px';

  // group_label과 score만 추출 후 상위 100개만 선택
  let labelWords = groups
    .map(group => ({
      word: group.group_label,
      score: group.score
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);  // top 100만 선택

  // 최대 score 찾기
  const maxScore = Math.max(...labelWords.map(k => k.score));
  
  // 중심점 설정
  const centerX = container.clientWidth / 2;
  const centerY = container.clientHeight / 2;
  
  // 배치된 키워드들의 영역을 추적
  let placedAreas = [];
  
  // 각 라벨 배치
  labelWords.forEach(({ word, score }, index) => {
    const keyword = document.createElement('span');
    keyword.className = 'keyword';
    if (index < 3) {  // Top 1
      keyword.classList.add('top-one');
    } else if (index < 15) {  // Top 2
      keyword.classList.add('top-two');
    }
    keyword.textContent = word;

    // score에 따른 폰트 크기 계산 (12px ~ 36px)
    const fontSize = 12 + (24 * (score / maxScore));
    keyword.style.fontSize = `${fontSize}px`;
    keyword.style.position = 'absolute';
    
    // 임시로 DOM에 추가하여 크기 측정
    keyword.style.visibility = 'hidden';
    container.appendChild(keyword);
    const width = keyword.offsetWidth;
    const height = keyword.offsetHeight;
    
    // 적절한 위치 찾기
    let placed = false;
    let radius = 0;
    let angle = Math.random() * 2 * Math.PI; // 랜덤한 시작 각도
    let spiralGrowth = 5; // 나선형 성장 속도
    
    while (!placed) {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      const currentArea = {
        left: x - width/2,
        right: x + width/2,
        top: y - height/2,
        bottom: y + height/2
      };
      
      if (!placedAreas.some(area => intersects(currentArea, area))) {
        keyword.style.visibility = 'visible';
        keyword.style.left = `${x}px`;
        keyword.style.top = `${y}px`;
        keyword.style.transform = 'translate(-50%, -50%)';
        
        placedAreas.push(currentArea);
        placed = true;
      }
      
      radius += spiralGrowth;
      angle += 0.5; // 나선형 회전 각도
    }
    
    // 호버 시 점수 표시
    keyword.title = `중요도: ${score.toFixed(2)}`;
  });
}

function intersects(area1, area2) {
  return !(area1.right < area2.left || 
           area1.left > area2.right || 
           area1.bottom < area2.top || 
           area1.top > area2.bottom);
}

function isWithinContainer(area, container) {
  return area.left >= 0 && 
         area.right <= container.clientWidth && 
         area.top >= 0 && 
         area.bottom <= container.clientHeight;
} 