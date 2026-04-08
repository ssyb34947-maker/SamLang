export const layoutStyles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--api-bg-primary)',
  },
  sidebar: {
    position: 'fixed' as const,
    left: 0,
    top: 64,
    bottom: 0,
    backgroundColor: 'var(--api-bg-primary)',
    borderRight: '1px solid var(--api-border-color)',
    overflow: 'hidden',
    zIndex: 100,
  },
  content: {
    flex: 1,
    marginLeft: 280,
    padding: '24px 48px',
    maxWidth: 1200,
    minHeight: 'calc(100vh - 64px)',
  },
  contentMobile: {
    marginLeft: 0,
    padding: '16px 24px',
  },
  toc: {
    position: 'fixed' as const,
    right: 24,
    top: 88,
    width: 200,
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto' as const,
  },
};

export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
};
