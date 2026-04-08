import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react';
import { DocCategory } from '../hooks';
import { sidebarVariants, menuItemVariants } from '../animations';
import { componentStyles } from '../styles';

interface SidebarProps {
  categories: DocCategory[];
  currentDoc: string;
  isExpanded: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
  expandedCategories: string[];
  onToggle: () => void;
  onExpandCategory: (id: string) => void;
  onSelectDoc: (id: string) => void;
  onCloseMobile: () => void;
}

const IconMap: Record<string, React.ReactNode> = {
  Rocket: '🚀',
  Code: '💻',
  FileText: '📄',
  Settings: '⚙️',
};

export const Sidebar = ({
  categories,
  currentDoc,
  isExpanded,
  isMobile,
  mobileOpen,
  expandedCategories,
  onToggle,
  onExpandCategory,
  onSelectDoc,
  onCloseMobile,
}: SidebarProps) => {
  if (isMobile) {
    return (
      <>
        <button
          onClick={onToggle}
          style={{
            position: 'fixed',
            left: 16,
            top: 80,
            zIndex: 101,
            padding: 8,
            background: 'var(--api-bg-primary)',
            border: '1px solid var(--api-border-color)',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            style={{
              position: 'fixed',
              left: 0,
              top: 64,
              bottom: 0,
              width: 280,
              background: 'var(--api-bg-primary)',
              borderRight: '1px solid var(--api-border-color)',
              zIndex: 100,
              overflow: 'auto',
              padding: '16px 0',
            }}
          >
            <SidebarContent
              categories={categories}
              currentDoc={currentDoc}
              expandedCategories={expandedCategories}
              onExpandCategory={onExpandCategory}
              onSelectDoc={(id) => {
                onSelectDoc(id);
                onCloseMobile();
              }}
            />
          </motion.div>
        )}
      </>
    );
  }

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="expanded"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      style={{
        position: 'fixed',
        left: 0,
        top: 64,
        bottom: 0,
        background: 'var(--api-bg-primary)',
        borderRight: '1px solid var(--api-border-color)',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: 8,
          top: 8,
          padding: 4,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--api-text-tertiary)',
        }}
      >
        {isExpanded ? <ChevronRight size={16} /> : <Menu size={16} />}
      </button>
      
      <div style={{ padding: '16px 0', overflow: 'auto', height: '100%' }}>
        {isExpanded ? (
          <SidebarContent
            categories={categories}
            currentDoc={currentDoc}
            expandedCategories={expandedCategories}
            onExpandCategory={onExpandCategory}
            onSelectDoc={onSelectDoc}
          />
        ) : (
          <CollapsedSidebar
            categories={categories}
            currentDoc={currentDoc}
            onSelectDoc={onSelectDoc}
          />
        )}
      </div>
    </motion.aside>
  );
};

interface SidebarContentProps {
  categories: DocCategory[];
  currentDoc: string;
  expandedCategories: string[];
  onExpandCategory: (id: string) => void;
  onSelectDoc: (id: string) => void;
}

const SidebarContent = ({
  categories,
  currentDoc,
  expandedCategories,
  onExpandCategory,
  onSelectDoc,
}: SidebarContentProps) => {
  return (
    <nav>
      {categories.map((category) => (
        <div key={category.id}>
          <button
            onClick={() => onExpandCategory(category.id)}
            style={{
              ...componentStyles.categoryTitle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>{category.title}</span>
            {expandedCategories.includes(category.id) ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
          
          {expandedCategories.includes(category.id) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {category.children.map((doc) => (
                <motion.button
                  key={doc.id}
                  variants={menuItemVariants}
                  initial="initial"
                  animate={currentDoc === doc.id ? 'active' : 'initial'}
                  whileHover="hover"
                  onClick={() => onSelectDoc(doc.id)}
                  style={{
                    ...componentStyles.menuItem,
                    width: 'calc(100% - 16px)',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    ...(currentDoc === doc.id ? componentStyles.menuItemActive : {}),
                  }}
                >
                  {doc.title}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      ))}
    </nav>
  );
};

interface CollapsedSidebarProps {
  categories: DocCategory[];
  currentDoc: string;
  onSelectDoc: (id: string) => void;
}

const CollapsedSidebar = ({
  categories,
  currentDoc,
  onSelectDoc,
}: CollapsedSidebarProps) => {
  const allDocs = categories.flatMap(c => c.children);
  
  return (
    <div style={{ padding: '8px 0' }}>
      {allDocs.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelectDoc(doc.id)}
          style={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: currentDoc === doc.id ? 'rgba(22, 119, 255, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: 8,
            margin: '4px 8px',
            cursor: 'pointer',
            color: currentDoc === doc.id ? 'var(--api-primary)' : 'var(--api-text-secondary)',
          }}
          title={doc.title}
        >
          <span style={{ fontSize: 18 }}>{doc.title.charAt(0)}</span>
        </button>
      ))}
    </div>
  );
};
