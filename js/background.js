// 创建右键菜单
chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "openTabCopyPage",
    title: "Tab Copy Page",
    contexts: ["page"]
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "openTabCopyPage") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("ui/tab-copy-page.html")
    });
  }
});

