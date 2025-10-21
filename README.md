# 条形码和二维码生成器 - Chrome 浏览器扩展

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/Chrome-Extension-orange)

一个随意的本地条形码和二维码生成工具，无需网络连接，保护您的数据隐私。

</div>

---

## 📋 目录

- [功能特性](#-功能特性)
- [项目截图](#-项目截图)
- [快速开始](#-快速开始)
- [使用指南](#-使用指南)
- [项目结构](#-项目结构)
- [技术栈](#-技术栈)

---

## ✨ 功能特性

### 条形码生成
- ✅ 支持 9 种条形码格式：
  - CODE128（支持字母和数字）
  - CODE39（支持字母和数字）
  - EAN13（13位数字）
  - EAN8（8位数字）
  - UPC（12位数字）
  - ITF14（14位数字）
  - MSI（数字）
  - Pharmacode（药品码）
  - Codabar（图书馆码）
- ✅ 可自定义线条宽度（1-5）
- ✅ 可调节条形码高度（30-150px）
- ✅ 可选择是否显示文本
- ✅ 支持 PNG 和 SVG 格式导出

### 二维码生成
- ✅ 支持任意文本内容
- ✅ 可自定义尺寸（128-512px）
- ✅ 4 种容错级别：L/M/Q/H
- ✅ 自定义前景色和背景色
- ✅ 内置快速模板：
  - 🔗 网址链接
  - 📶 WiFi 配置
  - 👤 电子名片（vCard）
  - 💬 短信内容
  - 📧 邮件地址

### 通用功能
- ✅ 完全本地运行，无需网络连接
- ✅ 数据不上传，保护隐私安全
- ✅ 一键下载（PNG/SVG）
- ✅ 一键复制到剪贴板
- ✅ 现代化 UI 设计
- ✅ 响应式界面
- ✅ 实时预览

---

## 📸 项目截图

### 条形码生成界面
<img width="495" height="600" alt="image" src="https://github.com/user-attachments/assets/6023e3d0-7b46-448e-bc5f-5de3872c9dd5" /><img width="495" height="600" alt="image" src="https://github.com/user-attachments/assets/50a778ca-9a83-4700-8d3c-da116b288758" />


---
## 🚀 快速开始

### 前置要求

- Google Chrome 浏览器（版本 88 及以上）
- 或其他基于 Chromium 的浏览器（Edge, Brave 等）

### 一键安装

1. 下载项目压缩包并解压
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹
6. 完成！点击浏览器工具栏上的扩展图标即可使用

---
##  📖 使用指南
- 生成条形码
  - 点击浏览器工具栏上的扩展图标
  - 默认显示"条形码"标签页
  - 在"输入内容"框中输入要编码的文本或数字
  - 选择条形码格式（如 CODE128、EAN13 等）
  - 调整线条宽度和高度（可选）
  - 点击"生成条形码"按钮
  - 使用下方按钮下载或复制
  - 注意事项：

    - EAN13 需要输入 13 位数字
    - EAN8 需要输入 8 位数字
    - UPC 需要输入 12 位数字
    - CODE128 和 CODE39 支持字母和数字
- 生成二维码
  - 点击"🔲 二维码"标签切换到二维码模式
  - 在文本框中输入内容（支持多行）
  - 调整二维码大小（128-512px）
  - 选择容错级别（建议使用 M 或 Q）
  - 自定义颜色（可选）
  - 点击"生成二维码"按钮
  - 使用下方按钮下载或复制

---
## 📁 项目结构
barcode-qrcode-generator/  
│  
├── manifest.json           # Chrome 扩展配置文件  
├── popup.html             # 主界面 HTML  
├── popup.css              # 样式表  
├── popup.js               # 主要逻辑脚本  
│  
├── icon16.png             # 16x16 图标  
├── icon48.png             # 48x48 图标  
├── icon128.png            # 128x128 图标  
│  
├── libs/                  # 第三方库  
│   ├── JsBarcode.min.js   # 条形码生成库  
│   └── qrcode.min.js      # 二维码生成库  
│  
└── README.md              # 项目文档（本文件）  


### 核心文件说明
| 文件 | 说明 | 大小 |
|------|------|------|
| `manifest.json` | 扩展配置，定义名称、版本、权限等 | ~500B |
| `popup.html` | 用户界面结构 | ~4KB |
| `popup.css` | 界面样式，包含渐变、动画等 | ~5KB |
| `popup.js` | 核心逻辑，处理生成、下载、复制等功能 | ~8KB |
| `JsBarcode.min.js` | 条形码生成库 | ~45KB |
| `qrcode.min.js` | 二维码生成库 | ~12KB |

---
## 🛠 技术栈

### 前端技术
- HTML5 - 结构
- CSS3 - 样式（渐变、动画、Flexbox）
- JavaScript (ES6+) - 逻辑

### 核心库
- JsBarcode (v3.11.5) - 条形码生成

  - 支持多种条形码格式
  - SVG 输出
  - 高度可定制
- QRCode.js (v1.0.0) - 二维码生成

  - Canvas 渲染
  - 支持容错级别
  - 颜色自定义

### 浏览器 API
- Chrome Extension API (Manifest V3)
- Canvas API - 图像处理
- Clipboard API - 剪贴板操作
- Blob API - 文件下载
