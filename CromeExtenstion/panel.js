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
        
        <h4>🎯 주요 관심사 그룹:</h4>
        <ul>
          ${(analysis.keyword_analysis?.keyword_groups || [])
            .slice(0, 5)
            .map(group => `
              <li>
                <strong>${group.group_label}</strong> 
                <br>
                <small>관련 키워드: ${Array.isArray(group.keywords) ? 
                  group.keywords.slice(0, 5).join(', ') : 
                  Object.keys(group.keywords || {}).slice(0, 5).join(', ')
                }</small>
              </li>
            `).join('')}
        </ul>
      </div>
    `;

  } catch (error) {
    resultDiv.innerHTML = `<p class="error">오류가 발생했습니다: ${error.message}</p>`;
  }
});

function calculateContextSimilarity(word1, word2, titles) {
  // ... 기존 코드 ...
} 