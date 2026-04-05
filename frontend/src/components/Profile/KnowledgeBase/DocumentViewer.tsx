/**
 * 文档查看器组件（内嵌式）
 * 支持 PDF 和 Word 文档在内容区域直接查看
 */

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// 设置 PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  fileUrl: string;
  fileType: 'pdf' | 'doc';
  fileName: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  fileUrl,
  fileType,
  fileName
}) => {
  if (fileType === 'pdf') {
    return <PDFViewer fileUrl={fileUrl} fileName={fileName} />;
  }

  if (fileType === 'doc') {
    return <WordViewer fileUrl={fileUrl} fileName={fileName} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <FileText className="w-16 h-16 mb-4" />
      <p>不支持的文件类型</p>
    </div>
  );
};

// PDF 查看器（内嵌式）
const PDFViewer: React.FC<{ fileUrl: string; fileName: string }> = ({ fileUrl, fileName }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF 加载失败:', error);
    setError('PDF 文件加载失败');
    setLoading(false);
  }

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF 内容 */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        {loading && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <p>{error}</p>
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
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
};

// Word 查看器
const WordViewer: React.FC<{ fileUrl: string; fileName: string }> = ({ fileUrl, fileName }) => {
  // 使用 Microsoft Office Online Viewer 或 Google Docs Viewer
  // 这里使用 iframe 嵌入在线查看器

  // 方案1: Microsoft Office Online (需要公开可访问的URL)
  const officeOnlineUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

  // 方案2: Google Docs Viewer
  const googleDocsUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}`;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* 提示信息 */}
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Word 文档使用在线预览服务。如果无法显示，请下载后查看。
        </p>
      </div>

      {/* Word 预览 iframe */}
      <div className="flex-1">
        <iframe
          src={googleDocsUrl}
          className="w-full h-full border-0"
          title={fileName}
        />
      </div>
    </div>
  );
};
