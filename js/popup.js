document.addEventListener('DOMContentLoaded', function() {
  const copyCurrentBtn = document.getElementById('copyCurrentBtn');
  const openCopyPageBtn = document.getElementById('openCopyPageBtn');
  const status = document.getElementById('status');

  // 复制当前页面功能
  copyCurrentBtn.addEventListener('click', async function() {
    try {
      showStatus('复制中...', 'info');
      
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      const result = await chrome.tabs.sendMessage(tab.id, {action: 'getTabInfo'});
      
      let copyText;
      if (result && result.customText) {
        copyText = result.customText;
      } else {
        copyText = `[${tab.title}](${tab.url})`;
      }
      
      await navigator.clipboard.writeText(copyText);
      
      showStatus('复制成功!', 'success');
      setTimeout(() => {
        hideStatus();
        window.close(); // 关闭popup
      }, 1500);
      
    } catch (error) {
      console.error('复制失败:', error);
      showStatus('复制失败', 'error');
      setTimeout(() => {
        hideStatus();
      }, 2000);
    }
  });

  // 打开复制页面功能
  openCopyPageBtn.addEventListener('click', function() {
    chrome.tabs.create({
      url: chrome.runtime.getURL("ui/tab-copy-page.html")
    });
    window.close(); // 关闭popup
  });

  // 状态显示函数
  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status show ' + type;
  }

  function hideStatus() {
    status.className = 'status';
  }
});