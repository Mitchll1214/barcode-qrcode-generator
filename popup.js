// ============ 全局变量 ============
let currentMode = 'barcode';
let qrcodeInstance = null;

// ============ DOM 元素 ============
const tabs = document.querySelectorAll('.tab-btn');
const barcodePanelEl = document.getElementById('barcode-panel');
const qrcodePanelEl = document.getElementById('qrcode-panel');

const barcodeText = document.getElementById('barcodeText');
const barcodeFormat = document.getElementById('barcodeFormat');
const displayValue = document.getElementById('displayValue');
const barcodeWidth = document.getElementById('barcodeWidth');
const barcodeHeight = document.getElementById('barcodeHeight');
const widthValue = document.getElementById('widthValue');
const heightValue = document.getElementById('heightValue');
const generateBarcodeBtn = document.getElementById('generateBarcodeBtn');
const barcodeSvg = document.getElementById('barcode');

const qrcodeText = document.getElementById('qrcodeText');
const qrcodeSize = document.getElementById('qrcodeSize');
const qrcodeLevel = document.getElementById('qrcodeLevel');
const qrcodeFgColor = document.getElementById('qrcodeFgColor');
const qrcodeBgColor = document.getElementById('qrcodeBgColor');
const sizeValue = document.getElementById('sizeValue');
const generateQRCodeBtn = document.getElementById('generateQRCodeBtn');
const qrcodeDiv = document.getElementById('qrcode');
const templateBtns = document.querySelectorAll('.template-btn');

const barcodeContainer = document.getElementById('barcodeContainer');
const qrcodeContainer = document.getElementById('qrcodeContainer');

const errorMsg = document.getElementById('errorMsg');
const actionButtons = document.getElementById('actionButtons');
const downloadBtn = document.getElementById('downloadBtn');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');

// ============ 数据持久化 ============
const defaultSettings = {
  mode: 'barcode',
  barcode: {
    text: '123456789012',
    format: 'CODE128',
    displayValue: true,
    width: 2,
    height: 80
  },
  qrcode: {
    text: 'https://www.example.com',
    size: 300,
    level: 'M',
    fgColor: '#000000',
    bgColor: '#ffffff'
  }
};

// 统一的存储接口（兼容 chrome.storage 和 localStorage）
const storage = {
  async set(data) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set(data);
      } else {
        localStorage.setItem('codeGeneratorSettings', JSON.stringify(data.settings));
      }
      console.log('✅ 设置已保存');
    } catch (error) {
      console.error('❌ 保存失败:', error);
      // 备用方案：使用 localStorage
      try {
        localStorage.setItem('codeGeneratorSettings', JSON.stringify(data.settings));
        console.log('✅ 使用 localStorage 保存成功');
      } catch (e) {
        console.error('❌ localStorage 保存也失败:', e);
      }
    }
  },
  
  async get(key) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return await chrome.storage.local.get(key);
      } else {
        const data = localStorage.getItem('codeGeneratorSettings');
        return { settings: data ? JSON.parse(data) : null };
      }
    } catch (error) {
      console.error('❌ 读取失败:', error);
      // 备用方案：使用 localStorage
      try {
        const data = localStorage.getItem('codeGeneratorSettings');
        return { settings: data ? JSON.parse(data) : null };
      } catch (e) {
        console.error('❌ localStorage 读取也失败:', e);
        return { settings: null };
      }
    }
  },
  
  async remove(key) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.remove(key);
      } else {
        localStorage.removeItem('codeGeneratorSettings');
      }
      console.log('🗑️ 设置已清除');
    } catch (error) {
      console.error('❌ 清除失败:', error);
      try {
        localStorage.removeItem('codeGeneratorSettings');
        console.log('✅ 使用 localStorage 清除成功');
      } catch (e) {
        console.error('❌ localStorage 清除也失败:', e);
      }
    }
  }
};

// 保存设置
async function saveSettings() {
  const settings = {
    mode: currentMode,
    barcode: {
      text: barcodeText.value,
      format: barcodeFormat.value,
      displayValue: displayValue.checked,
      width: parseFloat(barcodeWidth.value),
      height: parseInt(barcodeHeight.value)
    },
    qrcode: {
      text: qrcodeText.value,
      size: parseInt(qrcodeSize.value),
      level: qrcodeLevel.value,
      fgColor: qrcodeFgColor.value,
      bgColor: qrcodeBgColor.value
    }
  };
  
  await storage.set({ settings });
}

// 加载设置
async function loadSettings() {
  try {
    const result = await storage.get('settings');
    const settings = result.settings || defaultSettings;
    
    console.log('📂 加载的设置:', settings);
    
    currentMode = settings.mode || 'barcode';
    
    // 恢复条形码设置
    if (barcodeText) barcodeText.value = settings.barcode.text;
    if (barcodeFormat) barcodeFormat.value = settings.barcode.format;
    if (displayValue) displayValue.checked = settings.barcode.displayValue;
    if (barcodeWidth) barcodeWidth.value = settings.barcode.width;
    if (barcodeHeight) barcodeHeight.value = settings.barcode.height;
    if (widthValue) widthValue.textContent = settings.barcode.width;
    if (heightValue) heightValue.textContent = settings.barcode.height;
    
    // 恢复二维码设置
    if (qrcodeText) qrcodeText.value = settings.qrcode.text;
    if (qrcodeSize) qrcodeSize.value = settings.qrcode.size;
    if (qrcodeLevel) qrcodeLevel.value = settings.qrcode.level;
    if (qrcodeFgColor) qrcodeFgColor.value = settings.qrcode.fgColor;
    if (qrcodeBgColor) qrcodeBgColor.value = settings.qrcode.bgColor;
    if (sizeValue) sizeValue.textContent = settings.qrcode.size;
    
    // 切换到上次的标签页
    switchTab(currentMode);
    
    // 延迟生成，确保 DOM 完全加载
    setTimeout(() => {
      if (currentMode === 'barcode') {
        generateBarcode();
      } else {
        generateQRCode();
      }
    }, 100);
    
  } catch (error) {
    console.error('❌ 加载设置失败:', error);
    switchTab('barcode');
    setTimeout(() => generateBarcode(), 100);
  }
}

// 清除设置
async function clearSettings() {
  await storage.remove('settings');
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============ 标签页切换 ============
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    switchTab(tabName);
    saveSettings();
  });
});

function switchTab(tabName) {
  currentMode = tabName;
  
  // 切换标签按钮状态
  tabs.forEach(t => {
    if (t.dataset.tab === tabName) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
  
  // 切换面板显示
  if (tabName === 'barcode') {
    if (barcodePanelEl) barcodePanelEl.classList.add('active');
    if (qrcodePanelEl) qrcodePanelEl.classList.remove('active');
    if (barcodeContainer) barcodeContainer.style.display = 'flex';
    if (qrcodeContainer) qrcodeContainer.style.display = 'none';
  } else {
    if (barcodePanelEl) barcodePanelEl.classList.remove('active');
    if (qrcodePanelEl) qrcodePanelEl.classList.add('active');
    if (barcodeContainer) barcodeContainer.style.display = 'none';
    if (qrcodeContainer) qrcodeContainer.style.display = 'flex';
  }
  
  hideError();
  
  // 检查当前标签页是否有内容
  const codeContainer = document.querySelector('.code-container');
  if (codeContainer) {
    const hasBarcode = tabName === 'barcode' && barcodeSvg && barcodeSvg.querySelector('rect');
    const hasQRCode = tabName === 'qrcode' && qrcodeDiv && (qrcodeDiv.querySelector('canvas') || qrcodeDiv.querySelector('img'));
    
    if (hasBarcode || hasQRCode) {
      codeContainer.classList.add('has-content');
      if (actionButtons) actionButtons.style.display = 'flex';
      if (downloadSvgBtn) {
        downloadSvgBtn.style.display = tabName === 'barcode' ? 'inline-flex' : 'none';
      }
    } else {
      codeContainer.classList.remove('has-content');
      if (actionButtons) actionButtons.style.display = 'none';
    }
  }
}

// ============ 条形码功能 ============

function generateBarcode() {
  if (!barcodeText || !barcodeSvg) {
    console.error('条形码元素未找到');
    return;
  }
  
  const text = barcodeText.value.trim();
  const format = barcodeFormat.value;
  
  if (!text) {
    showError('请输入要生成条形码的内容');
    return;
  }

  try {
    hideError();
    
    // 添加加载状态
    const codeContainer = document.querySelector('.code-container');
    if (codeContainer) {
      codeContainer.classList.add('loading');
    }
    
    // 清空之前的内容
    barcodeSvg.innerHTML = '';
    
    // 计算最佳尺寸（基于容器）
    const containerWidth = barcodeContainer.offsetWidth - 40; // 减去padding
    const width = Math.min(parseFloat(barcodeWidth.value), 4); // 限制最大宽度
    const height = Math.min(parseInt(barcodeHeight.value), 120); // 限制最大高度
    
    JsBarcode(barcodeSvg, text, {
      format: format,
      width: width,
      height: height,
      displayValue: displayValue.checked,
      margin: 10,
      background: '#ffffff',
      lineColor: '#000000',
      fontSize: 16,
      textMargin: 5
    });

    // 设置SVG自适应
    barcodeSvg.style.width = 'auto';
    barcodeSvg.style.height = 'auto';
    barcodeSvg.style.maxWidth = '100%';
    barcodeSvg.style.maxHeight = '280px';

    // 移除加载状态，添加内容标记
    setTimeout(() => {
      if (codeContainer) {
        codeContainer.classList.remove('loading');
        codeContainer.classList.add('has-content');
      }
    }, 100);

    if (actionButtons) actionButtons.style.display = 'flex';
    if (downloadSvgBtn) downloadSvgBtn.style.display = 'inline-flex';
    
    saveSettings();
  } catch (error) {
    console.error('条形码生成失败:', error);
    showError('生成失败：' + error.message);
    if (actionButtons) actionButtons.style.display = 'none';
    
    const codeContainer = document.querySelector('.code-container');
    if (codeContainer) {
      codeContainer.classList.remove('loading');
      codeContainer.classList.remove('has-content');
    }
  }
}

// 条形码参数实时更新监听
if (barcodeWidth) {
  barcodeWidth.addEventListener('input', (e) => {
    if (widthValue) widthValue.textContent = e.target.value;
  });
  
  barcodeWidth.addEventListener('change', () => {
    saveSettings();
    // 如果已经生成过，自动重新生成
    if (barcodeSvg && barcodeSvg.querySelector('rect')) {
      generateBarcode();
    }
  });
}

if (barcodeHeight) {
  barcodeHeight.addEventListener('input', (e) => {
    if (heightValue) heightValue.textContent = e.target.value;
  });
  
  barcodeHeight.addEventListener('change', () => {
    saveSettings();
    // 如果已经生成过，自动重新生成
    if (barcodeSvg && barcodeSvg.querySelector('rect')) {
      generateBarcode();
    }
  });
}

if (displayValue) {
  displayValue.addEventListener('change', () => {
    saveSettings();
    // 如果已经生成过，自动重新生成
    if (barcodeSvg && barcodeSvg.querySelector('rect')) {
      generateBarcode();
    }
  });
}

if (barcodeFormat) {
  barcodeFormat.addEventListener('change', () => {
    saveSettings();
    // 如果已经生成过，自动重新生成
    if (barcodeSvg && barcodeSvg.querySelector('rect')) {
      generateBarcode();
    }
  });
}

if (barcodeText) {
  barcodeText.addEventListener('input', debounce(saveSettings, 500));
}

if (generateBarcodeBtn) {
  generateBarcodeBtn.addEventListener('click', generateBarcode);
}

if (barcodeText) {
  barcodeText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      generateBarcode();
    }
  });
}

// ============ 二维码功能 ============

function generateQRCode() {
  if (!qrcodeText || !qrcodeDiv) {
    console.error('二维码元素未找到');
    return;
  }
  
  const text = qrcodeText.value.trim();
  
  if (!text) {
    showError('请输入要生成二维码的内容');
    return;
  }

  try {
    hideError();
    
    // 添加加载状态
    const codeContainer = document.querySelector('.code-container');
    if (codeContainer) {
      codeContainer.classList.add('loading');
    }
    
    // 清空之前的实例
    if (qrcodeInstance) {
      qrcodeInstance.clear();
      qrcodeInstance = null;
    }
    
    // 完全清空容器
    qrcodeDiv.innerHTML = '';
    
    // 计算最佳尺寸（基于容器）
    const containerWidth = qrcodeContainer.offsetWidth - 40;
    const containerHeight = 280;
    const maxSize = Math.min(containerWidth, containerHeight, 400);
    let qrSize = Math.min(parseInt(qrcodeSize.value), maxSize);
    
    // 确保尺寸是偶数（避免模糊）
    qrSize = Math.floor(qrSize / 2) * 2;
    
    // 根据内容长度智能选择容错级别
    const textLength = text.length;
    let correctLevel = qrcodeLevel.value;
    
    // 如果内容较长，自动降低容错级别
    if (textLength > 500) {
      correctLevel = 'L'; // 超长内容使用最低容错
      console.log('⚠️ 内容较长，自动使用 L 级容错');
    } else if (textLength > 300) {
      correctLevel = correctLevel === 'H' ? 'M' : correctLevel; // 中等长度避免使用 H
      console.log('⚠️ 内容中等，避免使用 H 级容错');
    } else if (textLength > 150) {
      correctLevel = correctLevel === 'H' ? 'Q' : correctLevel; // 稍长内容避免使用 H
    }
    
    console.log(`📊 文本长度: ${textLength}, 使用容错级别: ${correctLevel}`);
    
    // 创建二维码
    qrcodeInstance = new QRCode(qrcodeDiv, {
      text: text,
      width: qrSize,
      height: qrSize,
      colorDark: qrcodeFgColor.value,
      colorLight: qrcodeBgColor.value,
      correctLevel: QRCode.CorrectLevel[correctLevel]
    });

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          // 只保留第一个 canvas
          const canvases = qrcodeDiv.querySelectorAll('canvas');
          const images = qrcodeDiv.querySelectorAll('img');
          
          // 删除所有 img
          images.forEach(img => img.remove());
          
          // 如果有多个 canvas，只保留第一个
          if (canvases.length > 1) {
            for (let i = 1; i < canvases.length; i++) {
              canvases[i].remove();
            }
          }
          
          // 设置 canvas 样式
          if (canvases.length > 0) {
            const canvas = canvases[0];
            canvas.style.display = 'block';
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '280px';
            canvas.style.width = 'auto';
            canvas.style.height = 'auto';
            canvas.style.objectFit = 'contain';
            
            // 断开观察
            observer.disconnect();
            
            // 移除加载状态
            setTimeout(() => {
              if (codeContainer) {
                codeContainer.classList.remove('loading');
                codeContainer.classList.add('has-content');
              }
              
              // 如果使用了降低的容错级别，给出提示
              if (correctLevel !== qrcodeLevel.value) {
                console.log(`ℹ️ 由于内容较长，容错级别已从 ${qrcodeLevel.value} 调整为 ${correctLevel}`);
              }
            }, 100);
          }
        }
      });
    });
    
    // 开始观察
    observer.observe(qrcodeDiv, { 
      childList: true, 
      subtree: true 
    });
    
    // 设置超时保护
    setTimeout(() => {
      observer.disconnect();
      const canvas = qrcodeDiv.querySelector('canvas');
      if (!canvas) {
        showError('二维码生成超时，请重试');
        if (codeContainer) {
          codeContainer.classList.remove('loading');
          codeContainer.classList.remove('has-content');
        }
        return;
      }
      
      // 确保只有一个元素
      const allElements = qrcodeDiv.children;
      if (allElements.length > 1) {
        Array.from(allElements).forEach(el => {
          if (el.tagName !== 'CANVAS') {
            el.remove();
          }
        });
      }
      
      if (codeContainer) {
        codeContainer.classList.remove('loading');
        codeContainer.classList.add('has-content');
      }
    }, 1000);

    if (actionButtons) actionButtons.style.display = 'flex';
    if (downloadSvgBtn) downloadSvgBtn.style.display = 'none';
    
    saveSettings();
  } catch (error) {
    console.error('二维码生成失败:', error);
    
    // 如果是容量溢出错误，尝试降低容错级别重试
    if (error.message && error.message.includes('overflow')) {
      console.log('🔄 检测到容量溢出，尝试使用最低容错级别重试...');
      
      // 临时保存原容错级别
      const originalLevel = qrcodeLevel.value;
      
      // 清空容器
      qrcodeDiv.innerHTML = '';
      if (qrcodeInstance) {
        qrcodeInstance.clear();
        qrcodeInstance = null;
      }
      
      // 使用最低容错级别重试
      try {
        const text = qrcodeText.value.trim();
        let qrSize = Math.min(parseInt(qrcodeSize.value), 400);
        qrSize = Math.floor(qrSize / 2) * 2;
        
        qrcodeInstance = new QRCode(qrcodeDiv, {
          text: text,
          width: qrSize,
          height: qrSize,
          colorDark: qrcodeFgColor.value,
          colorLight: qrcodeBgColor.value,
          correctLevel: QRCode.CorrectLevel.L // 使用最低容错
        });
        
        setTimeout(() => {
          const images = qrcodeDiv.querySelectorAll('img');
          images.forEach(img => img.remove());
          
          const canvas = qrcodeDiv.querySelector('canvas');
          if (canvas) {
            canvas.style.display = 'block';
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '280px';
            canvas.style.width = 'auto';
            canvas.style.height = 'auto';
          }
          
          const codeContainer = document.querySelector('.code-container');
          if (codeContainer) {
            codeContainer.classList.remove('loading');
            codeContainer.classList.add('has-content');
          }
          
          if (actionButtons) actionButtons.style.display = 'flex';
          
          // 显示降级提示
          showError(`内容过长，已自动降低容错级别至 L（从 ${originalLevel}）`);
          setTimeout(() => hideError(), 5000);
        }, 200);
        
        return;
      } catch (retryError) {
        console.error('重试失败:', retryError);
        showError('内容过长，无法生成二维码。请减少内容或增加二维码尺寸。');
      }
    } else {
      showError('生成失败：' + error.message);
    }
    
    if (actionButtons) actionButtons.style.display = 'none';
    
    const codeContainer = document.querySelector('.code-container');
    if (codeContainer) {
      codeContainer.classList.remove('loading');
      codeContainer.classList.remove('has-content');
    }
  }
}



// 二维码参数实时更新监听
if (qrcodeSize) {
  qrcodeSize.addEventListener('input', (e) => {
    if (sizeValue) sizeValue.textContent = e.target.value;
  });
  
  qrcodeSize.addEventListener('change', () => {
    saveSettings();
    // 如果已经生成过，自动重新生成
    if (qrcodeDiv && (qrcodeDiv.querySelector('canvas') || qrcodeDiv.querySelector('img'))) {
      generateQRCode();
    }
  });
}

if (qrcodeFgColor) {
  qrcodeFgColor.addEventListener('change', () => {
    saveSettings();
    // 如果已经生成过，自动重新生成
    if (qrcodeDiv && (qrcodeDiv.querySelector('canvas') || qrcodeDiv.querySelector('img'))) {
      generateQRCode();
    }
  });
}

if (qrcodeBgColor) {
  qrcodeBgColor.addEventListener('change', () => {
    saveSettings();
    // 如果已经生成过，自动重新生成
    if (qrcodeDiv && (qrcodeDiv.querySelector('canvas') || qrcodeDiv.querySelector('img'))) {
      generateQRCode();
    }
  });
}

if (qrcodeLevel) {
  qrcodeLevel.addEventListener('change', () => {
    saveSettings();
    // 如果已经生成过，自动重新生成
    if (qrcodeDiv && (qrcodeDiv.querySelector('canvas') || qrcodeDiv.querySelector('img'))) {
      generateQRCode();
    }
  });
}

if (qrcodeText) {
  qrcodeText.addEventListener('input', debounce(saveSettings, 500));
}

if (generateQRCodeBtn) {
  generateQRCodeBtn.addEventListener('click', generateQRCode);
}

if (qrcodeText) {
  qrcodeText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateQRCode();
    }
  });
}

// ============ 快速模板 ============
templateBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const template = btn.dataset.template;
    applyTemplate(template);
  });
});

function applyTemplate(template) {
  let content = '';
  
  switch(template) {
    case 'url':
      content = 'https://www.example.com';
      break;
    case 'wifi':
      content = 'WIFI:T:WPA;S:网络名称;P:密码;;';
      break;
    case 'vcard':
      content = `BEGIN:VCARD
VERSION:3.0
FN:张三
TEL:13800138000
EMAIL:zhangsan@example.com
END:VCARD`;
      break;
    case 'sms':
      content = 'SMSTO:13800138000:你好，这是一条短信';
      break;
    case 'email':
      content = 'mailto:example@example.com?subject=主题&body=邮件内容';
      break;
  }
  
  if (qrcodeText) qrcodeText.value = content;
  generateQRCode();
}

// ============ 下载和复制功能 ============
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    if (currentMode === 'barcode') {
      downloadBarcodePNG();
    } else {
      downloadQRCodePNG();
    }
  });
}

if (downloadSvgBtn) {
  downloadSvgBtn.addEventListener('click', () => {
    if (currentMode === 'barcode') {
      downloadBarcodeSVG();
    }
  });
}

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    if (currentMode === 'barcode') {
      copyBarcodeToClipboard();
    } else {
      copyQRCodeToClipboard();
    }
  });
}

function downloadBarcodePNG() {
  const svg = barcodeSvg;
  if (!svg || !svg.querySelector('rect')) {
    showError('请先生成条形码');
    return;
  }
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      // 显示下载成功提示
      showDownloadSuccess();
    });
  };

  img.onerror = function() {
    showError('下载失败，请重试');
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

function downloadBarcodeSVG() {
  const svg = barcodeSvg;
  if (!svg || !svg.querySelector('rect')) {
    showError('请先生成条形码');
    return;
  }
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `barcode_${Date.now()}.svg`;
  a.click();
  URL.revokeObjectURL(url);
  
  // 显示下载成功提示
  showDownloadSuccess();
}

async function copyBarcodeToClipboard() {
  const svg = barcodeSvg;
  if (!svg || !svg.querySelector('rect')) {
    showError('请先生成条形码');
    return;
  }
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = async function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showCopySuccess();
    } catch (err) {
      console.error('复制失败:', err);
      showError('复制失败：' + err.message);
    }
  };

  img.onerror = function() {
    showError('复制失败，请重试');
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

function downloadQRCodePNG() {
  const canvas = qrcodeDiv.querySelector('canvas');
  if (!canvas) {
    showError('请先生成二维码');
    return;
  }

  try {
    canvas.toBlob(function(blob) {
      if (!blob) {
        showError('下载失败，请重试');
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      // 显示下载成功提示
      showDownloadSuccess();
    });
  } catch (err) {
    console.error('下载失败:', err);
    showError('下载失败：' + err.message);
  }
}

async function copyQRCodeToClipboard() {
  const canvas = qrcodeDiv.querySelector('canvas');
  if (!canvas) {
    showError('请先生成二维码');
    return;
  }

  try {
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    if (!blob) {
      showError('复制失败，请重试');
      return;
    }
    
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    showCopySuccess();
  } catch (err) {
    console.error('复制失败:', err);
    showError('复制失败：' + err.message);
  }
}

// ============ 工具函数 ============
function showError(message) {
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
      hideError();
    }, 3000);
  }
}

function hideError() {
  if (errorMsg) {
    errorMsg.classList.remove('show');
  }
}

function showCopySuccess() {
  if (!copyBtn) return;
  
  const originalHTML = copyBtn.innerHTML;
  copyBtn.innerHTML = '✓ 已复制';
  copyBtn.style.background = '#28a745';
  copyBtn.style.color = 'white';
  copyBtn.style.borderColor = '#28a745';
  
  setTimeout(() => {
    copyBtn.innerHTML = originalHTML;
    copyBtn.style.background = '';
    copyBtn.style.color = '';
    copyBtn.style.borderColor = '';
  }, 2000);
}

function showDownloadSuccess() {
  if (!downloadBtn) return;
  
  const originalHTML = downloadBtn.innerHTML;
  downloadBtn.innerHTML = '✓ 已下载';
  downloadBtn.style.background = '#667eea';
  downloadBtn.style.color = 'white';
  downloadBtn.style.borderColor = '#667eea';
  
  setTimeout(() => {
    downloadBtn.innerHTML = originalHTML;
    downloadBtn.style.background = '';
    downloadBtn.style.color = '';
    downloadBtn.style.borderColor = '';
  }, 2000);
}

// ============ 重置功能 ============
if (resetBtn) {
  resetBtn.addEventListener('click', async () => {
    if (confirm('确定要重置所有设置吗？这将清除所有保存的数据。')) {
      await clearSettings();
      
      // 恢复默认条形码设置
      if (barcodeText) barcodeText.value = defaultSettings.barcode.text;
      if (barcodeFormat) barcodeFormat.value = defaultSettings.barcode.format;
      if (displayValue) displayValue.checked = defaultSettings.barcode.displayValue;
      if (barcodeWidth) barcodeWidth.value = defaultSettings.barcode.width;
      if (barcodeHeight) barcodeHeight.value = defaultSettings.barcode.height;
      if (widthValue) widthValue.textContent = defaultSettings.barcode.width;
      if (heightValue) heightValue.textContent = defaultSettings.barcode.height;
      
      // 恢复默认二维码设置
      if (qrcodeText) qrcodeText.value = defaultSettings.qrcode.text;
      if (qrcodeSize) qrcodeSize.value = defaultSettings.qrcode.size;
      if (qrcodeLevel) qrcodeLevel.value = defaultSettings.qrcode.level;
      if (qrcodeFgColor) qrcodeFgColor.value = defaultSettings.qrcode.fgColor;
      if (qrcodeBgColor) qrcodeBgColor.value = defaultSettings.qrcode.bgColor;
      if (sizeValue) sizeValue.textContent = defaultSettings.qrcode.size;
      
      // 清空预览区域
      if (barcodeSvg) barcodeSvg.innerHTML = '';
      if (qrcodeDiv) qrcodeDiv.innerHTML = '';
      
      // 移除内容标记
      const codeContainer = document.querySelector('.code-container');
      if (codeContainer) {
        codeContainer.classList.remove('has-content');
      }
      
      // 隐藏操作按钮
      if (actionButtons) actionButtons.style.display = 'none';
      
      // 切换到条形码标签页
      switchTab('barcode');
      
      // 显示重置成功提示
      const originalHTML = resetBtn.innerHTML;
      resetBtn.innerHTML = '✓ 已重置';
      resetBtn.style.background = '#28a745';
      resetBtn.style.color = 'white';
      resetBtn.style.borderColor = '#28a745';
      
      setTimeout(() => {
        resetBtn.innerHTML = originalHTML;
        resetBtn.style.background = '';
        resetBtn.style.color = '';
        resetBtn.style.borderColor = '';
      }, 2000);
    }
  });
}

// ============ 页面加载初始化 ============
window.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 页面开始加载...');
  
  // 检查必要的库是否加载
  if (typeof JsBarcode === 'undefined') {
    console.error('❌ JsBarcode 库未加载');
    showError('条形码库加载失败，请刷新页面重试');
    return;
  }
  
  if (typeof QRCode === 'undefined') {
    console.error('❌ QRCode 库未加载');
    showError('二维码库加载失败，请刷新页面重试');
    return;
  }
  
  console.log('✅ 所有库加载成功');
  
  // 加载保存的设置
  await loadSettings();
  
  console.log('✅ 初始化完成');
});

// ============ 错误处理 ============
window.addEventListener('error', (e) => {
  console.error('❌ 全局错误:', e.error);
  showError('发生错误：' + e.error.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ 未处理的 Promise 错误:', e.reason);
  showError('发生错误：' + e.reason);
});

// ============ 调试功能（可选） ============
// 添加键盘快捷键：Ctrl+Shift+D 查看当前设置
document.addEventListener('keydown', async (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    const result = await storage.get('settings');
    console.log('📊 当前保存的设置:', result.settings);
    console.log('📊 当前模式:', currentMode);
    console.log('📊 条形码是否已生成:', barcodeSvg && barcodeSvg.querySelector('rect'));
    console.log('📊 二维码是否已生成:', qrcodeDiv && (qrcodeDiv.querySelector('canvas') || qrcodeDiv.querySelector('img')));
    alert('设置已输出到控制台（按F12查看）');
  }
  
  // Ctrl+Shift+R 快速重新生成
  if (e.ctrlKey && e.shiftKey && e.key === 'R') {
    e.preventDefault();
    if (currentMode === 'barcode') {
      generateBarcode();
    } else {
      generateQRCode();
    }
    console.log('🔄 快速重新生成');
  }
  
  // Ctrl+Shift+C 快速复制
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    if (currentMode === 'barcode') {
      copyBarcodeToClipboard();
    } else {
      copyQRCodeToClipboard();
    }
    console.log('📋 快速复制');
  }
});

// ============ 性能监控（开发模式） ============
if (console.time) {
  console.time('⏱️ 页面加载耗时');
  window.addEventListener('load', () => {
    console.timeEnd('⏱️ 页面加载耗时');
  });
}
