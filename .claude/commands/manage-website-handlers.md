# 网站处理器管理

## 概述
网站处理器用于为不同网站提供自定义的标题格式化逻辑。

## 位置
- 文件：`js/content.js`
- 对象：`parsers`（第72-155行）
- 调用逻辑：第283-292行

## 当前支持的网站
- GitHub (`github.com`)
- Stack Overflow (`stackoverflow.com`)
- Medium (`medium.com`)
- 豆瓣读书 (`book.douban.com`)

## 处理器结构
```javascript
'domain.com': function() {
  // 自定义逻辑
  const title = document.querySelector('selector');
  if (title) {
    return `[格式化标题](${window.location.href})`;
  }
  return null;
}
```

## 最近修改
- 移除了YouTube处理器（用户希望使用HTML标题而不是特殊处理）
- 原因：YouTube的`[YouTube - ]`前缀不需要，直接使用HTML标题更简洁

## 如何修改
1. **添加处理器**：在`parsers`对象中添加新的域名处理函数
2. **移除处理器**：删除对应的处理器函数（系统会使用默认HTML标题）
3. **修改处理器**：更新现有的处理器函数逻辑

## 注意事项
- 如果处理器返回`null`，系统使用默认格式
- 域名匹配使用`hostname.includes(domain)`
- 处理器按声明顺序检查，第一个匹配的生效