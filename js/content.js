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

// 专门处理PDF文件的函数
function parsePDFFile() {
  console.log('[Tab Copy] PDF文件解析开始');
  console.log('[Tab Copy] 当前URL:', window.location.href);
  
  // 检查是否是PDF文件
  if (!window.location.href.toLowerCase().includes('.pdf')) {
    console.log('[Tab Copy] 不是PDF文件');
    return null;
  }
  
  // 尝试使用更激进的方法来获取页码信息
  // 对于closed shadow DOM，我们需要尝试其他方法
  console.log('[Tab Copy] 尝试多种方法获取页码信息');
  
  // 方法1: 检查是否存在PDF.js的全局变量或API
  if (window.PDFViewerApplication) {
    console.log('[Tab Copy] 找到PDFViewerApplication');
    try {
      const pdfApp = window.PDFViewerApplication;
      if (pdfApp.pagesCount && pdfApp.page) {
        const currentPage = pdfApp.page;
        const totalPages = pdfApp.pagesCount;
        console.log('[Tab Copy] 从PDFViewerApplication获取:', { currentPage, totalPages });
        
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const fileNameWithoutExt = fileName.replace('.pdf', '');
        
        const baseUrl = window.location.href.split('#')[0];
        const newUrl = `${baseUrl}#page=${currentPage}`;
        const result = `[${fileNameWithoutExt} p${currentPage}/${totalPages}](${newUrl})`;
        console.log('[Tab Copy] 从PDFViewerApplication生成结果:', result);
        return result;
      }
    } catch (e) {
      console.log('[Tab Copy] PDFViewerApplication访问失败:', e);
    }
  }
  
  // 方法2: 尝试通过postMessage与PDF.js通信
  try {
    // 监听来自PDF.js的消息
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'pageInfo') {
        console.log('[Tab Copy] 收到PDF.js页码信息:', event.data);
      }
    });
    
    // 向PDF.js发送获取页码的请求
    const targetOrigin = window.location.origin;
    window.postMessage({ type: 'getPageInfo' }, targetOrigin);
  } catch (e) {
    console.log('[Tab Copy] postMessage通信失败:', e);
  }
  
  let pageElement = null;
  let currentPage = null;
  let totalPages = null;
  
  // 首先尝试直接在当前页面查找页码元素
  pageElement = document.querySelector('#numPages');
  console.log('[Tab Copy] 在主页面找到的页码元素:', pageElement);
  
  // 如果在主页面没找到，尝试在iframe中查找（包括Shadow DOM）
  if (!pageElement) {
    console.log('[Tab Copy] 在主页面未找到页码元素，尝试查找iframe');
    
    // 首先查找常规iframe
    let iframes = document.querySelectorAll('iframe');
    console.log('[Tab Copy] 找到的常规iframe数量:', iframes.length);
    
    // 尝试在Shadow DOM中查找iframe
    function findIframesInShadowDOM(element) {
      let foundIframes = [];
      
      // 检查当前元素的shadow root
      if (element.shadowRoot) {
        console.log('[Tab Copy] 发现open shadow root:', element);
        const shadowIframes = element.shadowRoot.querySelectorAll('iframe');
        foundIframes = foundIframes.concat(Array.from(shadowIframes));
      }
      
      // 递归检查子元素
      for (let child of element.children) {
        foundIframes = foundIframes.concat(findIframesInShadowDOM(child));
      }
      
      return foundIframes;
    }
    
    // 查找Shadow DOM中的iframe
    const shadowIframes = findIframesInShadowDOM(document.body);
    console.log('[Tab Copy] 在Shadow DOM中找到的iframe数量:', shadowIframes.length);
    
    // 合并所有iframe
    const allIframes = Array.from(iframes).concat(shadowIframes);
    console.log('[Tab Copy] 总iframe数量:', allIframes.length);
    
    // 由于closed shadow root无法直接访问，我们尝试另一种方法
    // 使用getComputedStyle和其他技巧来检测
    if (allIframes.length === 0) {
      console.log('[Tab Copy] 尝试检测closed shadow DOM中的iframe');
      
      // 检查body下是否有shadow host元素
      for (let child of document.body.children) {
        console.log('[Tab Copy] 检查body子元素:', child.tagName, child);
        
        // 某些元素可能是shadow host
        if (child.shadowRoot === null && child.attachShadow) {
          console.log('[Tab Copy] 可能的closed shadow host:', child);
        }
      }
      
      // 尝试通过其他方式检测iframe的存在
      // 检查是否有PDF.js的特征元素或样式
      const pdfViewerElements = document.querySelectorAll('[class*="pdf"], [id*="pdf"], [class*="viewer"]');
      console.log('[Tab Copy] 找到的PDF相关元素:', pdfViewerElements.length);
    }
    
    for (let i = 0; i < allIframes.length; i++) {
      const iframe = allIframes[i];
      console.log(`[Tab Copy] 检查iframe ${i}:`, iframe.src);
      
      try {
        // 尝试访问iframe内容
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          pageElement = iframeDoc.querySelector('#numPages');
          console.log(`[Tab Copy] 在iframe ${i}中找到的页码元素:`, pageElement);
          if (pageElement) {
            console.log('[Tab Copy] 成功在iframe中找到页码元素');
            break;
          }
        }
      } catch (e) {
        console.log(`[Tab Copy] 无法访问iframe ${i}内容:`, e.message);
        // 由于跨域限制，可能无法直接访问iframe内容
        // 尝试其他方法获取页码信息
      }
    }
  }
  
  // 如果找到了页码元素，提取页码信息
  if (pageElement) {
    const dataArgs = pageElement.getAttribute('data-l10n-args');
    console.log('[Tab Copy] data-l10n-args:', dataArgs);
    
    if (dataArgs) {
      try {
        const args = JSON.parse(dataArgs);
        currentPage = args.pageNumber;
        totalPages = args.pagesCount;
        
        console.log('[Tab Copy] 从DOM提取的页码信息:');
        console.log('  - 当前页:', currentPage);
        console.log('  - 总页数:', totalPages);
        
      } catch (e) {
        console.log('[Tab Copy] 解析data-l10n-args失败:', e);
      }
    }
  }
  
  // 优先从URL中提取页码信息（这是最可靠的方法）
  const urlMatch = window.location.href.match(/#page=(\d+)/);
  if (urlMatch) {
    currentPage = urlMatch[1];
    console.log('[Tab Copy] 从URL提取的页码:', currentPage);
  }
  
  // 如果URL中没有页码信息且DOM也没有，设置默认值
  if (!currentPage) {
    currentPage = '1';
    console.log('[Tab Copy] 使用默认页码: 1');
  }
  
  // 尝试从shadow DOM或iframe中获取更多信息（backup方法）
  if (!totalPages) {
    console.log('[Tab Copy] 尝试其他方法获取总页数');
    
    // 检查所有可能的iframe（包括可能在shadow DOM中的）
    // 使用document.querySelectorAll('*')来遍历所有元素，包括可能的shadow host
    const allElements = document.querySelectorAll('*');
    for (let element of allElements) {
      // 尝试检测shadow DOM
      if (element.shadowRoot) {
        console.log('[Tab Copy] 发现open shadow root，查找iframe');
        const shadowIframes = element.shadowRoot.querySelectorAll('iframe');
        for (let iframe of shadowIframes) {
          console.log('[Tab Copy] Shadow iframe src:', iframe.src);
        }
      }
    }
  }
  
  if (currentPage) {
    // 获取文件名
    const url = new URL(window.location.href);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const fileNameWithoutExt = fileName.replace('.pdf', '');
    
    console.log('[Tab Copy] 文件名:', fileName);
    console.log('[Tab Copy] 去扩展名文件名:', fileNameWithoutExt);
    
    // 生成新的URL，确保页码正确
    const baseUrl = window.location.href.split('#')[0];
    const newUrl = `${baseUrl}#page=${currentPage}`;
    
    let result;
    if (totalPages) {
      result = `[${fileNameWithoutExt} p${currentPage}/${totalPages}](${newUrl})`;
    } else {
      result = `[${fileNameWithoutExt} p${currentPage}](${newUrl})`;
    }
    
    console.log('[Tab Copy] PDF最终结果:', result);
    return result;
  }
  
  console.log('[Tab Copy] PDF解析失败 - 未找到页码信息');
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
    
    let customText = null;
    let matchedDomain = null;
    
    // 优先检查是否是file://协议的PDF文件
    if (protocol === 'file:' && window.location.href.toLowerCase().includes('.pdf')) {
      console.log('[Tab Copy] 检测到本地PDF文件');
      customText = parsePDFFile();
      matchedDomain = 'file-pdf';
    } else {
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
  
  return true;
});