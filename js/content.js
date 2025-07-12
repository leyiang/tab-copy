// 全局变量存储最新PDF信息（临时存储，每次请求时清除）
let pdfInfo = null;

// 向所有iframe发送postMessage的通用函数
function sendPostMessageToAll(message, targetOrigin = '*') {
  console.log('[Tab Copy] 📤 发送消息到所有iframe:', message);
  
  // 1. Send message to all iframes in the current document
  const iframes = document.querySelectorAll('iframe');
  console.log('[Tab Copy] 找到iframe数量:', iframes.length);
  
  iframes.forEach((iframe, index) => {
    try {
      // Check if iframe.contentWindow is accessible
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(message, targetOrigin);
        console.log(`[Tab Copy] ✅ 消息已发送到iframe ${index}:`, iframe.src);
      } else {
        console.log(`[Tab Copy] ❌ iframe ${index} contentWindow不可访问:`, iframe.src);
      }
    } catch (e) {
      console.error(`[Tab Copy] ❌ 向iframe ${index} 发送消息失败:`, iframe.src, e);
    }
  });
  
  // 2. Also send to current window (in case PDF.js is in the same context)
  try {
    window.postMessage(message, targetOrigin);
    console.log('[Tab Copy] ✅ 消息也已发送到当前窗口');
  } catch (e) {
    console.error('[Tab Copy] ❌ 向当前窗口发送消息失败:', e);
  }
}

// 监听来自PDF.js的postMessage
window.addEventListener('message', function(event) {
  console.log('[Tab Copy] 📥 收到postMessage:', event);
  console.log('[Tab Copy] - origin:', event.origin);
  console.log('[Tab Copy] - source:', event.source);
  console.log('[Tab Copy] - data:', event.data);
  
  // 检查消息类型
  if (event.data && event.data.type === 'tab-copy-pdf-info') {
    console.log('[Tab Copy] ✅ 这是来自PDF.js的页码信息!');
    console.log('[Tab Copy] 消息时间戳:', new Date().toISOString());
    
    // PDF.js可能直接发送数据，也可能在payload中发送
    let pdfData = event.data.payload || event.data;
    
    if (pdfData.currentPage !== undefined) {
      console.log('[Tab Copy] 解析PDF信息:');
      console.log('[Tab Copy] - 当前页:', pdfData.currentPage);
      console.log('[Tab Copy] - 总页数:', pdfData.totalPages);
      console.log('[Tab Copy] - 文件名:', pdfData.fileName);
      
      // 存储最新的PDF信息（临时存储）
      pdfInfo = {
        currentPage: pdfData.currentPage,
        totalPages: pdfData.totalPages,
        fileName: pdfData.fileName
      };
      console.log('[Tab Copy] ✅ 最新PDF信息已接收:', pdfInfo);
    } else {
      console.log('[Tab Copy] ❌ 消息中缺少currentPage字段:', pdfData);
    }
  } else {
    console.log('[Tab Copy] 🔍 非PDF相关消息，忽略');
  }
});

// 特定网站的解析器
const parsers = {
  'github.com': function() {
    const title = document.querySelector('h1[itemprop="name"], .js-repo-name');
    if (title) {
      const repoName = title.textContent.trim();
      return `[GitHub - ${repoName}](${window.location.href})`;
    }
    return null;
  },
  
  'stackoverflow.com': function() {
    const title = document.querySelector('#question-header h1');
    if (title) {
      const questionTitle = title.textContent.trim();
      return `[Stack Overflow - ${questionTitle}](${window.location.href})`;
    }
    return null;
  },
  
  'youtube.com': function() {
    const title = document.querySelector('h1.ytd-video-primary-info-renderer, h1 yt-formatted-string');
    if (title) {
      const videoTitle = title.textContent.trim();
      return `[YouTube - ${videoTitle}](${window.location.href})`;
    }
    return null;
  },
  
  'medium.com': function() {
    const title = document.querySelector('h1');
    if (title) {
      const articleTitle = title.textContent.trim();
      return `[Medium - ${articleTitle}](${window.location.href})`;
    }
    return null;
  },
  
  'book.douban.com': function() {
    console.log('[Tab Copy] 豆瓣书籍页面解析开始');
    console.log('[Tab Copy] 当前URL:', window.location.href);
    
    const title = document.querySelector('h1');
    const ratingElement = document.querySelector('.rating_num');
    const votesElement = document.querySelector('[property="v:votes"]');
    
    console.log('[Tab Copy] 找到的元素:');
    console.log('  - 标题元素:', title);
    console.log('  - 评分元素:', ratingElement);
    console.log('  - 评价人数元素:', votesElement);
    
    if (title) {
      console.log('  - 标题内容:', title.textContent);
    }
    if (ratingElement) {
      console.log('  - 评分内容:', ratingElement.textContent);
    }
    if (votesElement) {
      console.log('  - 评价人数内容:', votesElement.textContent);
    }
    
    if (title && ratingElement) {
      const bookTitle = title.textContent.trim();
      const rating = ratingElement.textContent.trim();
      const votes = votesElement ? votesElement.textContent.trim() : '';
      
      console.log('[Tab Copy] 提取的数据:');
      console.log('  - 书名:', bookTitle);
      console.log('  - 评分:', rating);
      console.log('  - 评价人数:', votes);
      
      let titleText = `${bookTitle} 评分${rating}`;
      if (votes) {
        titleText += `(${votes}人评价)`;
      }
      
      const result = `[${titleText}](${window.location.href})`;
      console.log('[Tab Copy] 最终结果:', result);
      return result;
    }
    
    console.log('[Tab Copy] 豆瓣解析失败 - 未找到必需元素');
    return null;
  }
};

// 生成PDF结果的辅助函数
function generatePDFResult(pdfData) {
  const currentPage = pdfData.currentPage;
  const totalPages = pdfData.totalPages;
  let fileName = pdfData.fileName;
  
  // 如果PDF.js没有提供文件名，从URL中提取
  if (!fileName) {
    const url = new URL(window.location.href);
    const pathParts = url.pathname.split('/');
    fileName = pathParts[pathParts.length - 1];
  }
  
  const fileNameWithoutExt = fileName.replace('.pdf', '');
  const baseUrl = window.location.href.split('#')[0];
  const newUrl = `${baseUrl}#page=${currentPage}`;
  
  let result;
  if (totalPages) {
    result = `[${fileNameWithoutExt} p${currentPage}/${totalPages}](${newUrl})`;
  } else {
    result = `[${fileNameWithoutExt} p${currentPage}](${newUrl})`;
  }
  
  console.log('[Tab Copy] 生成PDF结果:', result);
  return result;
}

// 专门处理PDF文件的函数（始终获取最新信息）
async function parsePDFFile() {
  console.log('[Tab Copy] PDF文件解析开始');
  console.log('[Tab Copy] 当前URL:', window.location.href);
  
  // 检查是否是PDF文件
  if (!window.location.href.toLowerCase().includes('.pdf')) {
    console.log('[Tab Copy] 不是PDF文件');
    return null;
  }
  
  console.log('[Tab Copy] 请求PDF.js最新页码信息');
  
  // 清除之前的PDF信息，确保获取最新数据
  pdfInfo = null;
  console.log('[Tab Copy] 清除旧的PDF信息，准备获取最新数据');
  
  // 使用postMessage请求PDF.js发送页码信息
  console.log('[Tab Copy] 发送postMessage请求到PDF.js');
  const requestMessage = {
    type: 'tab-copy-request-info',
    timestamp: Date.now()
  };
  
  // 使用通用函数向所有iframe发送消息
  sendPostMessageToAll(requestMessage);
  
  console.log('[Tab Copy] postMessage请求已发送，等待PDF.js响应...');
  
  // 等待PDF.js响应（最多1000ms）
  const maxWaitTime = 1000;
  const checkInterval = 50;
  let waitedTime = 0;
  
  while (waitedTime < maxWaitTime && !pdfInfo) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    waitedTime += checkInterval;
    console.log(`[Tab Copy] 等待中... ${waitedTime}ms/${maxWaitTime}ms`);
  }
  
  // 检查是否收到了自定义事件的响应
  if (pdfInfo) {
    console.log('[Tab Copy] ✅ 收到PDF.js的tab-copy-pdf-info响应!');
    console.log('[Tab Copy] 响应数据:', pdfInfo);
    console.log('[Tab Copy] - 当前页:', pdfInfo.currentPage);
    console.log('[Tab Copy] - 总页数:', pdfInfo.totalPages);
    console.log('[Tab Copy] - 文件名:', pdfInfo.fileName);
    return generatePDFResult(pdfInfo);
  }
  
  console.log('[Tab Copy] ❌ 未收到PDF.js响应，postMessage通信失败');
  console.log('[Tab Copy] 可能的原因:');
  console.log('[Tab Copy] 1. PDF.js未正确修改或未加载');
  console.log('[Tab Copy] 2. PDF.js在iframe中且无法接收postMessage');
  console.log('[Tab Copy] 3. PDF.js初始化延迟');
  
  return null;
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getTabInfo') {
    console.log('[Tab Copy] 收到getTabInfo请求');
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    console.log('[Tab Copy] 当前hostname:', hostname);
    console.log('[Tab Copy] 当前protocol:', protocol);
    
    // 优先检查是否是file://协议的PDF文件
    if (protocol === 'file:' && window.location.href.toLowerCase().includes('.pdf')) {
      console.log('[Tab Copy] 检测到本地PDF文件');
      
      // 异步处理PDF解析
      parsePDFFile().then(customText => {
        console.log('[Tab Copy] PDF解析完成，自定义文本:', customText);
        console.log('[Tab Copy] 页面标题:', document.title);
        console.log('[Tab Copy] 页面URL:', window.location.href);
        
        sendResponse({
          customText: customText,
          title: document.title,
          url: window.location.href
        });
      }).catch(error => {
        console.error('[Tab Copy] PDF解析失败:', error);
        sendResponse({
          customText: null,
          title: document.title,
          url: window.location.href
        });
      });
      
      // 返回true表示将异步发送响应
      return true;
    } else {
      let customText = null;
      let matchedDomain = null;
      
      // 检查是否有对应的解析器
      for (const domain in parsers) {
        console.log('[Tab Copy] 检查域名:', domain);
        if (hostname.includes(domain)) {
          console.log('[Tab Copy] 匹配到域名:', domain);
          matchedDomain = domain;
          customText = parsers[domain]();
          break;
        }
      }
      
      if (!matchedDomain) {
        console.log('[Tab Copy] 未找到匹配的解析器，使用默认格式');
      }
      
      console.log('[Tab Copy] 自定义文本:', customText);
      console.log('[Tab Copy] 页面标题:', document.title);
      console.log('[Tab Copy] 页面URL:', window.location.href);
      
      sendResponse({
        customText: customText,
        title: document.title,
        url: window.location.href
      });
    }
  }
  
  return true;
});