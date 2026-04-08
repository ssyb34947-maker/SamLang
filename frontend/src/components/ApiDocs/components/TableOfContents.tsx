import { motion } from 'framer-motion';
import { TocItem } from '../hooks';
import { tocItemVariants } from '../animations';

interface TableOfContentsProps {
  items: TocItem[];
  activeId: string;
  onItemClick: (id: string) => void;
}

export const TableOfContents = ({
  items,
  activeId,
  onItemClick,
}: TableOfContentsProps) => {
  if (items.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="toc-nav"
    >
      <h4 className="toc-title">
        目录
      </h4>
      
      <ul className="toc-list">
        {items.map((item) => (
          <motion.li
            key={item.id}
            variants={tocItemVariants}
            initial="initial"
            animate={activeId === item.id ? 'active' : 'initial'}
            whileHover="hover"
            className="toc-item"
          >
            <button
              onClick={() => onItemClick(item.id)}
              className={`toc-link ${activeId === item.id ? 'active' : ''}`}
              style={{ paddingLeft: `${12 + (item.level - 1) * 12}px` }}
            >
              {item.text}
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
};
