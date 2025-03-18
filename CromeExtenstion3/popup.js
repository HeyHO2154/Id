document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      displayKeywords(data.keyword_groups);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
    }
  };

  reader.readAsText(file);
});

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
  allKeywords.forEach(({ word, frequency }, index) => {
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
      // 나선형으로 위치 탐색
      angle = (radius / 50) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // 현재 위치에 배치 가능한지 확인
      const currentArea = {
        left: x - width/2,
        right: x + width/2,
        top: y - height/2,
        bottom: y + height/2
      };
      
      if (!placedAreas.some(area => intersects(currentArea, area)) &&
          isWithinContainer(currentArea, container)) {
        // 위치 설정
        keyword.style.visibility = 'visible';
        keyword.style.left = `${x}px`;
        keyword.style.top = `${y}px`;
        keyword.style.transform = 'translate(-50%, -50%)';
        
        // 배치 영역 기록
        placedAreas.push(currentArea);
        placed = true;
      }
      
      radius += 5;
    }
    
    // 빈도수 표시 (호버 시)
    keyword.title = `빈도수: ${frequency}`;
  });
}

// 두 영역이 겹치는지 확인
function intersects(area1, area2) {
  return !(area1.right < area2.left || 
           area1.left > area2.right || 
           area1.bottom < area2.top || 
           area1.top > area2.bottom);
}

// 컨테이너 내부에 있는지 확인
function isWithinContainer(area, container) {
  return area.left >= 0 && 
         area.right <= container.clientWidth && 
         area.top >= 0 && 
         area.bottom <= container.clientHeight;
} 