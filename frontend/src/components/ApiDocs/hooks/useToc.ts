import { useState, useEffect, useCallback } from 'react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const useToc = (content: string) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  const extractToc = useCallback((markdown: string): TocItem[] => {
    const lines = markdown.split('\n');
    const items: TocItem[] = [];

    lines.forEach(line => {
      // 匹配 h1-h6 标题：行首的 1-6 个 # 后跟空格
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        // 生成 ID：转小写，移除非字母数字空格和连字符的字符，空格替换为连字符
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        items.push({ id, text, level });
      }
    });

    return items;
  }, []);

  useEffect(() => {
    if (content) {
      const items = extractToc(content);
      setToc(items);
      if (items.length > 0) {
        setActiveId(items[0].id);
      } else {
        setActiveId('');
      }
    } else {
      // 内容为空时清空目录
      setToc([]);
      setActiveId('');
    }
  }, [content, extractToc]);

  // 监听滚动，更新当前激活的标题
  useEffect(() => {
    const handleScroll = () => {
      // 只查询当前文档中的标题（markdown-body 内的标题）
      const markdownBody = document.querySelector('.markdown-body');
      if (!markdownBody) return;

      const headings = markdownBody.querySelectorAll('[data-heading]');
      let currentId = '';

      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentId = heading.getAttribute('data-heading') || '';
        }
      });

      if (currentId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]); // 依赖 content，切换文档时重新绑定

  const scrollToHeading = useCallback((id: string) => {
    const element = document.querySelector(`[data-heading="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    toc,
    activeId,
    scrollToHeading,
  };
};
