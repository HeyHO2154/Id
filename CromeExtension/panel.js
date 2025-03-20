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

document.getElementById('analyze').addEventListener('click', async () => {
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
    
    if (analysis.error) {
      throw new Error(analysis.error);
    }
    
    // 분석 결과 표시
    resultDiv.innerHTML = `
      <h3>분석 결과</h3>
      <div class="analysis-content">
        <h4>🧐 사용자 프로필 분석:</h4>
        <p>${analysis.user_profile || '프로필 분석을 불러올 수 없습니다.'}</p>
      </div>
    `;

    // 키워드 클라우드 표시
    displayKeywords(analysis.keyword_groups);

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

  // 모든 키워드와 빈도수를 하나의 배열로 모으기
  let allKeywords = [];
  groups.forEach(group => {
    Object.entries(group.frequencies).forEach(([word, freq]) => {
      allKeywords.push({ word, frequency: freq });
    });
  });

  // 빈도수로 정렬 (내림차순)
  allKeywords.sort((a, b) => b.frequency - a.frequency);

  // 최대 빈도수 찾기
  const maxFreq = Math.max(...allKeywords.map(k => k.frequency));
  
  // 중심점 설정
  const centerX = container.clientWidth / 2;
  const centerY = container.clientHeight / 2;
  
  // 배치된 키워드들의 영역을 추적
  let placedAreas = [];
  
  // 각 키워드 배치
  allKeywords.forEach(({ word, frequency }) => {
    const keyword = document.createElement('span');
    keyword.className = 'keyword';
    keyword.textContent = word;

    // 빈도수에 따른 폰트 크기 계산 (12px ~ 48px)
    const fontSize = 12 + (36 * (frequency / maxFreq));
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
    let angle = 0;
    
    while (!placed && radius < Math.max(container.clientWidth, container.clientHeight)) {
      angle = (radius / 50) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      const currentArea = {
        left: x - width/2,
        right: x + width/2,
        top: y - height/2,
        bottom: y + height/2
      };
      
      if (!placedAreas.some(area => intersects(currentArea, area)) &&
          isWithinContainer(currentArea, container)) {
        keyword.style.visibility = 'visible';
        keyword.style.left = `${x}px`;
        keyword.style.top = `${y}px`;
        keyword.style.transform = 'translate(-50%, -50%)';
        
        placedAreas.push(currentArea);
        placed = true;
      }
      
      radius += 5;
    }
    
    keyword.title = `빈도수: ${frequency}`;
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