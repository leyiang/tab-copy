# 项目结构

## 核心文件
- `js/content.js` - 主要逻辑文件，包含网站处理器和复制功能
- `manifest.json` - Chrome扩展配置文件
- `popup.html` - 扩展弹出窗口界面

## 主要功能模块

### 网站处理器（parsers）
- 位置：`js/content.js` 第72-155行
- 功能：为不同网站提供自定义标题格式化
- 管理：参考 `manage-website-handlers.md`

### 复制功能
- 位置：`js/content.js` 第283-292行
- 功能：检测域名并应用对应处理器
- 默认格式：`[HTML标题](URL)`

## 开发要点
- 修改网站处理器前先了解现有实现
- 删除处理器会使用默认HTML标题
- 调试信息通过console.log输出