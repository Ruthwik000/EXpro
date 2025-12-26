// Color Finder Feature - Advanced Color Picker & Analyzer
export function initColorFinder() {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let panel = null;
  let eyedropperActive = false;
  let currentColor = { r: 0, g: 0, b: 0, a: 1 };
  let colorHistory = [];
  let pickedColors = [];

  // Dragging state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelStartX = 0;
  let panelStartY = 0;

  // Resizing state
  let isResizing = false;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let panelStartWidth = 0;
  let panelStartHeight = 0;

  // Color conversion functions
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h, s = max === 0 ? 0 : d / max;
    const v = max;

    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  const rgbToCmyk = (r, g, b) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    
    if (k === 1) {
      c = m = y = 0;
    } else {
      c = (c - k) / (1 - k);
      m = (m - k) / (1 - k);
      y = (y - k) / (1 - k);
    }

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  const getColorName = (r, g, b) => {
    const colors = [
      { name: 'Red', rgb: [255, 0, 0] },
      { name: 'Orange', rgb: [255, 165, 0] },
      { name: 'Yellow', rgb: [255, 255, 0] },
      { name: 'Green', rgb: [0, 128, 0] },
      { name: 'Blue', rgb: [0, 0, 255] },
      { name: 'Purple', rgb: [128, 0, 128] },
      { name: 'Pink', rgb: [255, 192, 203] },
      { name: 'Brown', rgb: [165, 42, 42] },
      { name: 'Black', rgb: [0, 0, 0] },
      { name: 'White', rgb: [255, 255, 255] },
      { name: 'Gray', rgb: [128, 128, 128] },
      { name: 'Cyan', rgb: [0, 255, 255] },
      { name: 'Magenta', rgb: [255, 0, 255] }
    ];

    let minDistance = Infinity;
    let closestColor = 'Unknown';

    colors.forEach(color => {
      const distance = Math.sqrt(
        Math.pow(r - color.rgb[0], 2) +
        Math.pow(g - color.rgb[1], 2) +
        Math.pow(b - color.rgb[2], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color.name;
      }
    });

    return closestColor;
  };

  const generateComplementary = (r, g, b) => {
    return { r: 255 - r, g: 255 - g, b: 255 - b };
  };

  const generateAnalogous = (r, g, b) => {
    const hsl = rgbToHsl(r, g, b);
    const colors = [];
    
    for (let offset of [-30, 30]) {
      const newH = (hsl.h + offset + 360) % 360;
      colors.push(hslToRgb(newH, hsl.s, hsl.l));
    }
    
    return colors;
  };

  const generateTriadic = (r, g, b) => {
    const hsl = rgbToHsl(r, g, b);
    const colors = [];
    
    for (let offset of [120, 240]) {
      const newH = (hsl.h + offset) % 360;
      colors.push(hslToRgb(newH, hsl.s, hsl.l));
    }
    
    return colors;
  };

  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showNotification(`Copied ${label}!`);
  };

  const showNotification = (message) => {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = `
      position: fixed;
      left: 50%;
      top: 20px;
      transform: translateX(-50%);
      background: #10B981;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
  };

  // Create panel
  panel = document.createElement('div');
  panel.id = 'color-finder-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 380px;
    min-width: 350px;
    min-height: 480px;
    background: linear-gradient(135deg, #4A5568 0%, #3A4556 100%);
    border-radius: 16px;
    border: 1px solid #2D3748;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #E5E7EB;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 16px;
  `;

  panel.innerHTML = `
    <div id="color-header" style="display: flex; align-items: center; justify-content: flex-end; margin-bottom: 12px; cursor: move; user-select: none; padding: 4px 0;">
      <button id="close-color-panel" style="background: rgba(255,255,255,0.1); border: none; color: #CBD5E0; cursor: pointer; font-size: 20px; padding: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;">×</button>
    </div>

    <!-- Pick Buttons -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
      <button id="pick-from-web-btn" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 14px 10px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 6px; color: #E5E7EB; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 17L17 7M17 7H7M17 7V17"/>
        </svg>
        Pick from Web
      </button>
      <button id="pick-from-image-btn" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 14px 10px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 6px; color: #E5E7EB; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15L16 10L5 21"/>
        </svg>
        Pick from Image
      </button>
    </div>

    <!-- Color Gradient Slider -->
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
      <button id="save-color-btn" style="width: 40px; height: 40px; background: linear-gradient(135deg, #FF6B35, #F7931E); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 12px rgba(255,107,53,0.4); flex-shrink: 0;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
      </button>
      <div style="flex: 1; position: relative; height: 32px;">
        <div id="color-gradient" style="width: 100%; height: 100%; border-radius: 16px; background: linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000); position: relative; cursor: pointer; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
          <div id="color-slider-thumb" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 24px; height: 24px; background: white; border: 3px solid #2D3748; border-radius: 50%; cursor: grab; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
        </div>
      </div>
    </div>

    <!-- Color Format Values -->
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
      <div class="color-value-row" data-format="hex" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
        <span id="hex-value" style="font-size: 15px; font-weight: 600; color: #E5E7EB; font-family: 'Courier New', monospace;">#20A5AC</span>
        <button class="copy-btn" data-format="hex" style="background: rgba(255,255,255,0.1); border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>

      <div class="color-value-row" data-format="rgb" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
        <span id="rgb-value" style="font-size: 15px; font-weight: 600; color: #E5E7EB; font-family: 'Courier New', monospace;">rgb(32, 165, 172)</span>
        <button class="copy-btn" data-format="rgb" style="background: rgba(255,255,255,0.1); border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>

      <div class="color-value-row" data-format="hsl" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
        <span id="hsl-value" style="font-size: 15px; font-weight: 600; color: #E5E7EB; font-family: 'Courier New', monospace;">hsl(183, 69%, 40%)</span>
        <button class="copy-btn" data-format="hsl" style="background: rgba(255,255,255,0.1); border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>

      <div class="color-value-row" data-format="hsv" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
        <span id="hsv-value" style="font-size: 15px; font-weight: 600; color: #E5E7EB; font-family: 'Courier New', monospace;">hsv(183, 81%, 67%)</span>
        <button class="copy-btn" data-format="hsv" style="background: rgba(255,255,255,0.1); border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>

      <div class="color-value-row" data-format="cmyk" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
        <span id="cmyk-value" style="font-size: 15px; font-weight: 600; color: #E5E7EB; font-family: 'Courier New', monospace;">cmyk(81%, 4%, 0%, 33%)</span>
        <button class="copy-btn" data-format="cmyk" style="background: rgba(255,255,255,0.1); border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Recent Colors -->
    <div style="text-align: center; margin-bottom: 10px;">
      <h3 style="font-size: 11px; font-weight: 600; color: #CBD5E0; text-transform: uppercase; letter-spacing: 1px;">Recent Colors</h3>
    </div>
    <div id="color-history" style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
      <div style="width: 38px; height: 38px; background: #00CED1; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;"></div>
      <div style="width: 38px; height: 38px; background: #FF00FF; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;"></div>
      <div style="width: 38px; height: 38px; background: #00FF7F; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;"></div>
      <div style="width: 38px; height: 38px; background: #FF0000; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;"></div>
      <div style="width: 38px; height: 38px; background: #FFFFFF; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;"></div>
      <div style="width: 38px; height: 38px; background: #FFA500; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;"></div>
      <div style="width: 38px; height: 38px; background: #0000FF; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;"></div>
    </div>
  `;

  document.body.appendChild(panel);

  // Add resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'resize-handle-color';
  resizeHandle.style.cssText = `
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize;
    background: linear-gradient(135deg, transparent 50%, #2D3748 50%);
    border-radius: 0 0 16px 0;
    z-index: 10;
  `;
  panel.appendChild(resizeHandle);

  // Update color display
  function updateColorDisplay(r, g, b, a = 1) {
    currentColor = { r, g, b, a };
    
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    // Update formats
    document.getElementById('hex-value').textContent = hex;
    document.getElementById('rgb-value').textContent = `rgb(${r}, ${g}, ${b})`;
    document.getElementById('hsl-value').textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    document.getElementById('hsv-value').textContent = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
    document.getElementById('cmyk-value').textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    // Update slider thumb color
    const thumb = document.getElementById('color-slider-thumb');
    thumb.style.background = `rgb(${r}, ${g}, ${b})`;
    thumb.style.borderColor = '#2D3748';
  }

  function addToHistory(r, g, b) {
    const hex = rgbToHex(r, g, b);
    
    // Avoid duplicates
    if (pickedColors.some(c => c.hex === hex)) return;
    
    pickedColors.unshift({ r, g, b, hex });
    if (pickedColors.length > 8) pickedColors.pop();
    
    updateHistoryDisplay();
  }

  function updateHistoryDisplay() {
    const container = document.getElementById('color-history');
    
    if (pickedColors.length === 0) {
      // Show default colors
      container.innerHTML = `
        <div style="width: 50px; height: 50px; background: #00CED1; border-radius: 50%; border: 3px solid #2D3748; cursor: pointer;"></div>
        <div style="width: 50px; height: 50px; background: #FF00FF; border-radius: 50%; border: 3px solid #2D3748; cursor: pointer;"></div>
        <div style="width: 50px; height: 50px; background: #00FF7F; border-radius: 50%; border: 3px solid #2D3748; cursor: pointer;"></div>
        <div style="width: 50px; height: 50px; background: #FF0000; border-radius: 50%; border: 3px solid #2D3748; cursor: pointer;"></div>
        <div style="width: 50px; height: 50px; background: #FFFFFF; border-radius: 50%; border: 3px solid #2D3748; cursor: pointer;"></div>
        <div style="width: 50px; height: 50px; background: #FFA500; border-radius: 50%; border: 3px solid #2D3748; cursor: pointer;"></div>
        <div style="width: 50px; height: 50px; background: #0000FF; border-radius: 50%; border: 3px solid #2D3748; cursor: pointer;"></div>
        <div style="width: 50px; height: 50px; background: #FF1493; border-radius: 50%; border: 3px solid #2D3748; cursor: pointer;"></div>
      `;
      return;
    }

    container.innerHTML = pickedColors.map(color => `
      <div class="history-color" data-rgb="${color.r},${color.g},${color.b}" style="width: 50px; height: 50px; background: rgb(${color.r}, ${color.g}, ${color.b}); border-radius: 50%; border: 3px solid #2D3748; cursor: pointer; transition: all 0.2s;"></div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.history-color').forEach(el => {
      el.addEventListener('click', () => {
        const rgb = el.dataset.rgb.split(',').map(Number);
        updateColorDisplay(rgb[0], rgb[1], rgb[2]);
      });

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)';
        el.style.borderColor = '#60A5FA';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.borderColor = '#2D3748';
      });
    });
  }

  // Color gradient slider
  let isDraggingSlider = false;
  const gradient = document.getElementById('color-gradient');
  const thumb = document.getElementById('color-slider-thumb');

  const updateColorFromSlider = (x) => {
    const rect = gradient.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    
    // Calculate color from gradient position
    const hue = percent * 360;
    const rgb = hslToRgb(hue, 100, 50);
    
    updateColorDisplay(rgb.r, rgb.g, rgb.b);
    
    // Update thumb position
    thumb.style.left = (percent * 100) + '%';
  };

  gradient.addEventListener('mousedown', (e) => {
    isDraggingSlider = true;
    updateColorFromSlider(e.clientX);
  });

  thumb.addEventListener('mousedown', (e) => {
    isDraggingSlider = true;
    e.stopPropagation();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDraggingSlider) {
      updateColorFromSlider(e.clientX);
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDraggingSlider) {
      isDraggingSlider = false;
      thumb.style.cursor = 'grab';
    }
  });

  thumb.addEventListener('mousedown', () => {
    thumb.style.cursor = 'grabbing';
  });

  // Eyedropper functionality - Pick from Web
  const handleEyedropper = (e) => {
    if (!eyedropperActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || element.closest('#color-finder-panel')) return;

    // Try to get color from element or image
    const computedStyle = window.getComputedStyle(element);
    let color = computedStyle.backgroundColor;
    
    // If transparent, try text color
    if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
      color = computedStyle.color;
    }

    const rgbMatch = color.match(/\d+/g);
    if (rgbMatch && rgbMatch.length >= 3) {
      const r = parseInt(rgbMatch[0]);
      const g = parseInt(rgbMatch[1]);
      const b = parseInt(rgbMatch[2]);
      
      updateColorDisplay(r, g, b);
      addToHistory(r, g, b);
      
      eyedropperActive = false;
      document.body.style.cursor = 'default';
      const btn = document.getElementById('pick-from-web-btn');
      btn.style.background = '#5A6C7D';
      btn.style.borderColor = '#718096';
    }
  };

  // Make panel draggable
  const header = document.getElementById('color-header');
  
  header.addEventListener('mousedown', (e) => {
    if (e.target.id === 'close-color-panel' || e.target.closest('#close-color-panel')) {
      return;
    }
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = panel.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    
    panel.style.transform = 'none';
    panel.style.left = panelStartX + 'px';
    panel.style.top = panelStartY + 'px';
    
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // Make panel resizable
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    
    panelStartWidth = panel.offsetWidth;
    panelStartHeight = panel.offsetHeight;
    
    e.preventDefault();
    e.stopPropagation();
  });

  // Mouse move handler
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      
      let newX = panelStartX + deltaX;
      let newY = panelStartY + deltaY;
      
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      
      panel.style.left = newX + 'px';
      panel.style.top = newY + 'px';
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStartX;
      const deltaY = e.clientY - resizeStartY;
      
      let newWidth = panelStartWidth + deltaX;
      let newHeight = panelStartHeight + deltaY;
      
      newWidth = Math.max(350, Math.min(newWidth, window.innerWidth * 0.9));
      newHeight = Math.max(480, Math.min(newHeight, window.innerHeight * 0.9));
      
      panel.style.width = newWidth + 'px';
      panel.style.height = newHeight + 'px';
    }
  });

  // Mouse up handler
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'move';
    }
    if (isResizing) {
      isResizing = false;
    }
  });

  // Pick from Web button
  document.getElementById('pick-from-web-btn').addEventListener('click', function() {
    eyedropperActive = !eyedropperActive;
    
    if (eyedropperActive) {
      document.body.style.cursor = 'crosshair';
      this.style.background = '#10B981';
      this.style.borderColor = '#059669';
      document.addEventListener('click', handleEyedropper, true);
    } else {
      document.body.style.cursor = 'default';
      this.style.background = '#5A6C7D';
      this.style.borderColor = '#718096';
      document.removeEventListener('click', handleEyedropper, true);
    }
  });

  // Pick from Image button
  document.getElementById('pick-from-image-btn').addEventListener('click', function() {
    showNotification('Image picker coming soon!');
  });

  // Save color button
  document.getElementById('save-color-btn').addEventListener('click', () => {
    const { r, g, b } = currentColor;
    addToHistory(r, g, b);
    showNotification('Color saved to history!');
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const format = btn.dataset.format;
      const value = document.getElementById(`${format}-value`).textContent;
      copyToClipboard(value, format.toUpperCase());
    });

    // Hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#60A5FA';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#718096';
    });
  });

  // Value row hover effects
  document.querySelectorAll('.color-value-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.borderColor = '#60A5FA';
      row.style.transform = 'translateX(4px)';
    });
    row.addEventListener('mouseleave', () => {
      row.style.borderColor = '#718096';
      row.style.transform = 'translateX(0)';
    });
  });

  // Button hover effects
  const pickWebBtn = document.getElementById('pick-from-web-btn');
  const pickImageBtn = document.getElementById('pick-from-image-btn');
  
  [pickWebBtn, pickImageBtn].forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      if (!eyedropperActive || this !== pickWebBtn) {
        this.style.background = 'rgba(255,255,255,0.15)';
        this.style.borderColor = '#60A5FA';
      }
    });
    btn.addEventListener('mouseleave', function() {
      if (!eyedropperActive || this !== pickWebBtn) {
        this.style.background = 'rgba(255,255,255,0.08)';
        this.style.borderColor = 'rgba(255,255,255,0.15)';
      }
    });
  });

  // Close panel
  document.getElementById('close-color-panel').addEventListener('click', () => {
    panel.remove();
    document.body.style.cursor = 'default';
    document.removeEventListener('click', handleEyedropper, true);
    browserAPI.storage.sync.set({ colorFinder: false });
  });

  // Hover effects for close button
  const closeBtn = document.getElementById('close-color-panel');
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(255,255,255,0.2)';
    closeBtn.style.color = '#fff';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'rgba(255,255,255,0.1)';
    closeBtn.style.color = '#CBD5E0';
  });

  // Initialize with a nice teal color
  updateColorDisplay(32, 165, 172);
  updateHistoryDisplay();

  return {
    cleanup: () => {
      panel.remove();
      document.body.style.cursor = 'default';
      document.removeEventListener('click', handleEyedropper, true);
    }
  };
}
