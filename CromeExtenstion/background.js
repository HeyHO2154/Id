chrome.action.onClicked.addListener(async (tab) => {
  // Chrome 114 이상에서는 단순히 open()을 호출하면 됩니다
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.error('사이드패널을 열 수 없습니다:', error);
  }
}); 