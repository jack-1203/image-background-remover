"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("请上传 JPG, PNG 或 WEBP 格式的图片");
      setStatus("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("图片大小不能超过 10MB");
      setStatus("error");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setStatus("idle");
    setErrorMessage("");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      // 注意：部署后将这里替换为你的 Cloudflare Workers 域名
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "处理失败");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "处理失败，请重试");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "removed-bg.png";
    link.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setStatus("idle");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🖼️ 图片背景去除
          </h1>
          <p className="text-gray-500 text-sm">
            AI 智能去除图片背景，一键生成透明背景图
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 mb-6
            ${dragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
            }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          {previewUrl ? (
            <div className="relative w-48 h-48 mx-auto">
              <Image
                src={previewUrl}
                alt="预览"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <>
              <div className="text-5xl mb-3">📁</div>
              <p className="text-gray-600">点击或拖拽图片到这里</p>
              <p className="text-gray-400 text-xs mt-2">
                支持 JPG, PNG, WEBP，最大 10MB
              </p>
            </>
          )}
        </div>

        {/* File Info & Actions */}
        {selectedFile && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>已选择: {selectedFile.name}</span>
              <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={status === "uploading" || status === "processing"}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold
                  hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {status === "uploading" || status === "processing"
                  ? "处理中..."
                  : "上传图片"}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        )}

        {/* Status */}
        {status !== "idle" && (
          <div
            className={`p-4 rounded-lg text-center text-sm mb-6
              ${status === "uploading" || status === "processing"
                ? "bg-yellow-50 text-yellow-700"
                : status === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
              }`}
          >
            {status === "uploading" && "正在上传并处理图片，请稍候..."}
            {status === "processing" && "AI 正在处理图片..."}
            {status === "success" && "✅ 处理完成！"}
            {status === "error" && `❌ ${errorMessage}`}
          </div>
        )}

        {/* Result */}
        {resultUrl && (
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">处理结果：</p>
            <div className="relative w-full h-64 mb-4 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-repeat rounded-lg overflow-hidden">
              <Image
                src={resultUrl}
                alt="处理结果"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold
                hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              下载图片
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-xs">
          Powered by Remove.bg API · 免费使用
        </div>
      </div>
    </div>
  );
}
