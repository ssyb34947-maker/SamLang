import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { TableOfContents } from './components/TableOfContents';
import { useToc } from './hooks';
import { DOC_CATEGORIES } from './constants';
import './api-docs.css';

interface DocItem {
  id: string;
  title: string;
  file: string;
}

interface DocCategory {
  id: string;
  title: string;
  children: DocItem[];
}

export const ApiDocs: React.FC = () => {
  const navigate = useNavigate();
  const [currentDoc, setCurrentDoc] = useState<string>('overview');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['getting-started']);
  
  // 使用目录 hook
  const { toc, activeId, scrollToHeading } = useToc(content);

  const categories: DocCategory[] = DOC_CATEGORIES as unknown as DocCategory[];

  const findDocFile = useCallback((docId: string): string => {
    for (const category of categories) {
      const doc = category.children.find(child => child.id === docId);
      if (doc) return doc.file;
    }
    return 'overview.md';
  }, [categories]);

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      try {
        const file = findDocFile(currentDoc);
        const response = await fetch(`/docs/${file}`);
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          setContent('# 文档加载失败\n\n请稍后重试。');
        }
      } catch {
        setContent('# 文档加载失败\n\n请稍后重试。');
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [currentDoc, findDocFile]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectDoc = (docId: string) => {
    setCurrentDoc(docId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="api-docs">
      {/* 移动端菜单按钮 */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 侧边栏 */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="back-btn"
            onClick={() => navigate('/home')}
            title="返回主页"
          >
            <ArrowLeft size={18} />
            <span>返回主页</span>
          </button>
          <h2>API 文档</h2>
        </div>
        <nav className="sidebar-nav">
          {categories.map(category => (
            <div key={category.id} className="category">
              <button
                className="category-title"
                onClick={() => toggleCategory(category.id)}
              >
                <span>{category.title}</span>
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              {expandedCategories.includes(category.id) && (
                <ul className="doc-list">
                  {category.children.map(doc => (
                    <li key={doc.id}>
                      <button
                        className={`doc-link ${currentDoc === doc.id ? 'active' : ''}`}
                        onClick={() => selectDoc(doc.id)}
                      >
                        {doc.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* 遮罩层 */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 主内容区 */}
      <main className="main-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </main>

      {/* 右侧目录 */}
      <TableOfContents
        items={toc}
        activeId={activeId}
        onItemClick={scrollToHeading}
      />
    </div>
  );
};
