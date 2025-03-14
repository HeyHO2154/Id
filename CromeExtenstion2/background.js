// 현재는 비어있음 

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.error('사이드패널을 열 수 없습니다:', error);
  }
}); 