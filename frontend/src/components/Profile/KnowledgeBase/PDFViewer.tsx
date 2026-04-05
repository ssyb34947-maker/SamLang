/**
 * PDF 阅读器组件
 * 支持在知识库中直接阅读 PDF 文件
 */

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// 设置 PDF.js worker
// 使用 CDN 加载 worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  fileName,
  onClose
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 加载成功回调
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  // 加载失败回调
  function onDocumentLoadError(error: Error) {
    console.error('PDF 加载失败:', error);
    setError('PDF 文件加载失败，请检查文件是否有效');
    setLoading(false);
  }

  // 上一页
  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  // 下一页
  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  // 放大
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  // 缩小
  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  // 下载 PDF
  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, pageNumber]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="关闭 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-white font-medium truncate max-w-md" title={fileName}>
            {fileName}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* 缩放控制 */}
          <button
            onClick={zoomOut}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-gray-400 text-sm w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-600 mx-2" />

          {/* 下载按钮 */}
          <button
            onClick={downloadPDF}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="下载 PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF 内容区域 */}
      <div className="flex-1 overflow-auto bg-gray-900 flex justify-center p-8">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-lg mb-2">{error}</p>
            <p className="text-sm">请确保文件路径正确且文件可访问</p>
          </div>
        )}

        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-2xl"
          />
        </Document>
      </div>

      {/* 底部页码控制 */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 bg-gray-800 border-t border-gray-700">
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="上一页 (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-gray-300">
          <span className="font-medium">{pageNumber}</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-500">{numPages}</span>
        </div>

        <button
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="下一页 (→)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
