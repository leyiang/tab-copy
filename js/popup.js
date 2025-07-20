document.addEventListener('DOMContentLoaded', function() {
  const copyCurrentBtn = document.getElementById('copyCurrentBtn');
  const copyAndCloseBtn = document.getElementById('copyAndCloseBtn');
  const openCopyPageBtn = document.getElementById('openCopyPageBtn');
  const copyTodoBtn = document.getElementById('copyTodoBtn');
  const closeTodoBtn = document.getElementById('closeTodoBtn');
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

  // 复制并关闭页面功能
  copyAndCloseBtn.addEventListener('click', async function() {
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
      
      // 关闭当前标签页
      await chrome.tabs.remove(tab.id);
      
      showStatus('复制成功并已关闭页面!', 'success');
      setTimeout(() => {
        hideStatus();
        window.close();
      }, 1500);
      
    } catch (error) {
      console.error('复制并关闭失败:', error);
      showStatus('操作失败', 'error');
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

  // 复制TODO格式功能
  copyTodoBtn.addEventListener('click', async function() {
    try {
      showStatus('复制中...', 'info');
      
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      const copyText = `${tab.title}##[${tab.title}](${tab.url})`;
      
      await navigator.clipboard.writeText(copyText);
      
      showStatus('复制成功!', 'success');
      setTimeout(() => {
        hideStatus();
        window.close();
      }, 1500);
      
    } catch (error) {
      console.error('复制TODO失败:', error);
      showStatus('复制失败', 'error');
      setTimeout(() => {
        hideStatus();
      }, 2000);
    }
  });

  // 复制TODO并关闭页面功能
  closeTodoBtn.addEventListener('click', async function() {
    try {
      showStatus('复制中...', 'info');
      
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      const copyText = `${tab.title}##[${tab.title}](${tab.url})`;
      
      await navigator.clipboard.writeText(copyText);
      
      // 关闭当前标签页
      await chrome.tabs.remove(tab.id);
      
      showStatus('复制成功并已关闭页面!', 'success');
      setTimeout(() => {
        hideStatus();
        window.close();
      }, 1500);
      
    } catch (error) {
      console.error('复制TODO并关闭失败:', error);
      showStatus('操作失败', 'error');
      setTimeout(() => {
        hideStatus();
      }, 2000);
    }
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