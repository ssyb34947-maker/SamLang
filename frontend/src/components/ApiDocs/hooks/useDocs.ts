import { useState, useEffect, useCallback } from 'react';
import { DOC_CATEGORIES, API_DOCS_CONFIG } from '../constants';

export interface DocItem {
  id: string;
  title: string;
  titleEn: string;
  file: string;
}

export interface DocCategory {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  children: DocItem[];
}

export const useDocs = () => {
  const [categories] = useState<DocCategory[]>(DOC_CATEGORIES as unknown as DocCategory[]);
  const [currentDoc, setCurrentDoc] = useState<string>(API_DOCS_CONFIG.defaultDoc);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findDocById = useCallback((id: string): DocItem | null => {
    for (const category of categories) {
      const doc = category.children.find(child => child.id === id);
      if (doc) return doc;
    }
    return null;
  }, [categories]);

  const getDocFilePath = useCallback((docId: string): string => {
    const doc = findDocById(docId);
    if (!doc) return '';
    return `${API_DOCS_CONFIG.docsPath}/${doc.file}`;
  }, [findDocById]);

  const loadDoc = useCallback(async (docId: string) => {
    setLoading(true);
    setError(null);

    try {
      const filePath = getDocFilePath(docId);
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`Failed to load document: ${response.status}`);
      }

      const text = await response.text();
      setContent(text);
      setCurrentDoc(docId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
      setContent('');
    } finally {
      setLoading(false);
    }
  }, [getDocFilePath]);

  useEffect(() => {
    loadDoc(currentDoc);
  }, [currentDoc, loadDoc]);

  return {
    categories,
    currentDoc,
    content,
    loading,
    error,
    setCurrentDoc,
    loadDoc,
    findDocById,
  };
};
