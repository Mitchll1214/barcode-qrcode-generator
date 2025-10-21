// ============ 全局变量 ============
let currentMode = 'barcode'; // 当前模式：barcode 或 qrcode
let qrcodeInstance = null;

// ============ DOM 元素 ============
// 标签页
const tabs = document.querySelectorAll('.tab-btn');
const barcodePanelEl = document.getElementById('barcode-panel');
const qrcodePanelEl = document.getElementById('qrcode-panel');

// 条形码元素
const barcodeText = document.getElementById('barcodeText');
const barcodeFormat = document.getElementById('barcodeFormat');
const displayValue = document.getElementById('displayValue');
const barcodeWidth = document.getElementById('barcodeWidth');
const barcodeHeight = document.getElementById('barcodeHeight');
const widthValue = document.getElementById('widthValue');
const heightValue = document.getElementById('heightValue');
const generateBarcodeBtn = document.getElementById('generateBarcodeBtn');
const barcodeSvg = document.getElementById('barcode');

// 二维码元素
const qrcodeText = document.getElementById('qrcodeText');
const qrcodeSize = document.getElementById('qrcodeSize');
const qrcodeLevel = document.getElementById('qrcodeLevel');
const qrcodeFgColor = document.getElementById('qrcodeFgColor');
const qrcodeBgColor = document.getElementById('qrcodeBgColor');
const sizeValue = document.getElementById('sizeValue');
const generateQRCodeBtn = document.getElementById('generateQRCodeBtn');
const qrcodeDiv = document.getElementById('qrcode');
const templateBtns = document.querySelectorAll('.template-btn');

// 显示容器
const barcodeContainer = document.getElementById('barcodeContainer');
const qrcodeContainer = document.getElementById('qrcodeContainer');

// 公共元素
const errorMsg = document.getElementById('errorMsg');
const actionButtons = document.getElementById('actionButtons');
const downloadBtn = document.getElementById('downloadBtn');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const copyBtn = document.getElementById('copyBtn');

// ============ 标签页切换 ============
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  currentMode = tabName;
  
  // 更新标签按钮状态
  tabs.forEach(t => {
    if (t.dataset.tab === tabName) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
  
  // 更新面板显示
  if (tabName === 'barcode') {
    barcodePanelEl.classList.add('active');
    qrcodePanelEl.classList.remove('active');
    barcodeContainer.style.display = 'block';
    qrcodeContainer.style.display = 'none';
  } else {
    barcodePanelEl.classList.remove('active');
    qrcodePanelEl.classList.add('active');
    barcodeContainer.style.display = 'none';
    qrcodeContainer.style.display = 'block';
  }
  
  hideError();
  actionButtons.style.display = 'none';
}

// ============ 条形码功能 ============
// 更新滑块显示值
barcodeWidth.addEventListener('input', (e) => {
  widthValue.textContent = e.target.value;
});

barcodeHeight.addEventListener('input', (e) => {
  heightValue.textContent = e.target.value;
});

// 生成条形码
function generateBarcode() {
  const text = barcodeText.value.trim();
  const format = barcodeFormat.value;
  
  if (!text) {
    showError('请输入要生成条形码的内容');
    return;
  }

  try {
    hideError();
    
    JsBarcode(barcodeSvg, text, {
      format: format,
      width: parseFloat(barcodeWidth.value),
      height: parseInt(barcodeHeight.value),
      displayValue: displayValue.checked,
      margin: 10,
      background: '#ffffff',
      lineColor: '#000000'
    });

    actionButtons.style.display = 'flex';
    downloadSvgBtn.style.display = 'inline-block';
  } catch (error) {
    showError('生成失败：' + error.message);
    actionButtons.style.display = 'none';
  }
}

generateBarcodeBtn.addEventListener('click', generateBarcode);

barcodeText.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    generateBarcode();
  }
});

// ============ 二维码功能 ============
// 更新大小显示
qrcodeSize.addEventListener('input', (e) => {
  sizeValue.textContent = e.target.value;
});

// 生成二维码
function generateQRCode() {
  const text = qrcodeText.value.trim();
  
  if (!text) {
    showError('请输入要生成二维码的内容');
    return;
  }

  try {
    hideError();
    
    // 清空之前的二维码
    qrcodeDiv.innerHTML = '';
    
    // 创建新的二维码实例
    qrcodeInstance = new QRCode(qrcodeDiv, {
      text: text,
      width: parseInt(qrcodeSize.value),
      height: parseInt(qrcodeSize.value),
      colorDark: qrcodeFgColor.value,
      colorLight: qrcodeBgColor.value,
      correctLevel: QRCode.CorrectLevel[qrcodeLevel.value]
    });

    actionButtons.style.display = 'flex';
    downloadSvgBtn.style.display = 'none'; // 二维码不支持SVG下载
  } catch (error) {
    showError('生成失败：' + error.message);
    actionButtons.style.display = 'none';
  }
}

generateQRCodeBtn.addEventListener('click', generateQRCode);

qrcodeText.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    generateQRCode();
  }
});

// ============ 快速模板功能 ============
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
  
  qrcodeText.value = content;
  generateQRCode();
}

// ============ 下载和复制功能 ============
// 下载PNG
downloadBtn.addEventListener('click', () => {
  if (currentMode === 'barcode') {
    downloadBarcodePNG();
  } else {
    downloadQRCodePNG();
  }
});

// 下载SVG（仅条形码）
downloadSvgBtn.addEventListener('click', () => {
  if (currentMode === 'barcode') {
    downloadBarcodeSVG();
  }
});

// 复制到剪贴板
copyBtn.addEventListener('click', () => {
  if (currentMode === 'barcode') {
    copyBarcodeToClipboard();
  } else {
    copyQRCodeToClipboard();
  }
});

// 条形码下载PNG
function downloadBarcodePNG() {
  const svg = barcodeSvg;
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
    });
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

// 条形码下载SVG
function downloadBarcodeSVG() {
  const svg = barcodeSvg;
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `barcode_${Date.now()}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

// 条形码复制到剪贴板
async function copyBarcodeToClipboard() {
  const svg = barcodeSvg;
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
      showError('复制失败：' + err.message);
    }
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

// 二维码下载PNG
function downloadQRCodePNG() {
  const canvas = qrcodeDiv.querySelector('canvas');
  if (!canvas) {
    showError('请先生成二维码');
    return;
  }

  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode_${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// 二维码复制到剪贴板
async function copyQRCodeToClipboard() {
  const canvas = qrcodeDiv.querySelector('canvas');
  if (!canvas) {
    showError('请先生成二维码');
    return;
  }

  try {
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    
    showCopySuccess();
  } catch (err) {
    showError('复制失败：' + err.message);
  }
}

// ============ 工具函数 ============
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
}

function hideError() {
  errorMsg.classList.remove('show');
}

function showCopySuccess() {
  const originalText = copyBtn.textContent;
  copyBtn.textContent = '✓ 已复制';
  copyBtn.style.background = '#4CAF50';
  copyBtn.style.color = 'white';
  copyBtn.style.borderColor = '#4CAF50';
  
  setTimeout(() => {
    copyBtn.textContent = originalText;
    copyBtn.style.background = '';
    copyBtn.style.color = '';
    copyBtn.style.borderColor = '';
  }, 2000);
}

// ============ 页面加载初始化 ============
window.addEventListener('DOMContentLoaded', () => {
  // 默认生成一个条形码
  generateBarcode();
});
