const HTML_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>图片背景去除工具</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      padding: 40px;
      max-width: 600px;
      width: 100%;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 8px;
      font-size: 28px;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 20px;
    }
    .upload-area:hover { border-color: #667eea; background: #f8f9ff; }
    .upload-area.dragover { border-color: #667eea; background: #f0f3ff; }
    .upload-icon { font-size: 48px; margin-bottom: 12px; }
    .upload-text { color: #666; font-size: 16px; }
    .upload-hint { color: #999; font-size: 12px; margin-top: 8px; }
    input[type="file"] { display: none; }
    
    .btn {
      display: block;
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-download {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      margin-top: 20px;
      display: none;
    }
    .btn-download:hover { box-shadow: 0 8px 20px rgba(56, 239, 125, 0.4); }
    
    .status {
      text-align: center;
      margin: 20px 0;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
    }
    .status-idle { color: #999; }
    .status-processing { background: #fff3cd; color: #856404; }
    .status-success { background: #d4edda; color: #155724; }
    .status-error { background: #f8d7da; color: #721c24; }
    
    .preview {
      display: none;
      margin-top: 30px;
      text-align: center;
    }
    .preview img {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
      border: 1px solid #eee;
      background: repeating-conic-gradient(#eee 0% 25%, transparent 0% 50%) 50% / 20px 20px;
    }
    .preview-label {
      color: #666;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    footer {
      text-align: center;
      margin-top: 30px;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🖼️ 图片背景去除</h1>
    <p class="subtitle">AI 智能去除图片背景，一键生成透明背景图</p>
    
    <div class="upload-area" id="uploadArea">
      <div class="upload-icon">📁</div>
      <div class="upload-text">点击或拖拽图片到这里</div>
      <div class="upload-hint">支持 JPG, PNG, WEBP，最大 10MB</div>
      <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp">
    </div>
    
    <button class="btn" id="uploadBtn" disabled>上传图片</button>
    
    <div class="status status-idle" id="status">请先选择图片</div>
    
    <div class="preview" id="preview">
      <div class="preview-label">处理结果：</div>
      <img id="previewImg" alt="处理结果">
      <a id="downloadLink" class="btn btn-download" download="removed-bg.png">下载图片</a>
    </div>
    
    <footer>
      Powered by Remove.bg API · 免费使用
    </footer>
  </div>

  <script>
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const status = document.getElementById('status');
    const preview = document.getElementById('preview');
    const previewImg = document.getElementById('previewImg');
    const downloadLink = document.getElementById('downloadLink');

    let selectedFile = null;

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    function handleFile(file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        updateStatus('请上传 JPG, PNG 或 WEBP 格式的图片', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        updateStatus('图片大小不能超过 10MB', 'error');
        return;
      }
      selectedFile = file;
      uploadBtn.disabled = false;
      updateStatus('已选择: ' + file.name + ' (' + (file.size / 1024 / 1024).toFixed(2) + 'MB)', 'idle');
      preview.style.display = 'none';
    }

    async function uploadImage() {
      if (!selectedFile) return;
      
      uploadBtn.disabled = true;
      updateStatus('正在上传并处理图片，请稍候...', 'processing');
      
      try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        const response = await fetch('/', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || '处理失败');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        previewImg.src = url;
        downloadLink.href = url;
        preview.style.display = 'block';
        downloadLink.style.display = 'block';
        
        updateStatus('✅ 处理完成！', 'success');
      } catch (err) {
        updateStatus('❌ ' + err.message, 'error');
        uploadBtn.disabled = false;
      }
    }

    function updateStatus(text, type) {
      status.textContent = text;
      status.className = 'status status-' + type;
    }

    uploadBtn.addEventListener('click', uploadImage);
  </script>
</body>
</html>`;

export default {
  async fetch(request, env): Promise<Response> {
    // 处理 CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET 请求返回 HTML 页面
    if (request.method === "GET") {
      return new Response(HTML_PAGE, {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      });
    }

    // POST 请求处理图片
    if (request.method === "POST") {
      try {
        const contentType = request.headers.get("Content-Type") || "";
        
        if (!contentType.includes("multipart/form-data")) {
          return new Response(
            JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const formData = await request.formData();
        const image = formData.get("image");

        if (!image || !(image instanceof File)) {
          return new Response(
            JSON.stringify({ error: "No image file provided" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // 检查文件大小 (10MB)
        if (image.size > 10 * 1024 * 1024) {
          return new Response(
            JSON.stringify({ error: "Image size must be less than 10MB" }),
            { status: 413, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // 调用 Remove.bg API
        const apiKey = env.REMOVE_BG_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "REMOVE_BG_API_KEY not configured" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const apiFormData = new FormData();
        apiFormData.append("image_file", image, image.name);
        apiFormData.append("size", "auto");

        const apiResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: { "X-Api-Key": apiKey },
          body: apiFormData,
        });

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          return new Response(
            JSON.stringify({ error: "Remove.bg API error", details: errorText }),
            { status: apiResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // 返回处理后的图片
        const resultBlob = await apiResponse.blob();
        return new Response(resultBlob, {
          headers: {
            "Content-Type": "image/png",
            "Content-Disposition": 'attachment; filename="removed-bg.png"',
            ...corsHeaders,
          },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Internal error", details: String(err) }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    return new Response("Method not allowed", { status: 405 });
  },
} satisfies ExportedHandler;
