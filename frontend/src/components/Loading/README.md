# 全局加载动画组件

## 功能特点

- 🎯 全局控制：使用Context API实现全局状态管理
- 📱 响应式设计：适配不同屏幕尺寸
- 🚀 性能优化：纯CSS动画，无第三方依赖
- 🔄 请求拦截器集成：自动显示/隐藏加载状态
- 🌐 全屏遮罩：使用createPortal挂载到body

## 安装与配置

### 1. 基本使用

在应用的最顶层包裹 `LoadingProvider`：

```tsx
// main.tsx
import { LoadingProvider } from './hooks/useLoading';

createRoot(document.getElementById('root')!).render(
  <LoadingProvider>
    {/* 应用内容 */}
  </LoadingProvider>
);
```

### 2. 手动控制加载状态

在组件中使用 `useLoading` 钩子：

```tsx
import { useLoading } from '../../hooks/useLoading';

const MyComponent = () => {
  const { isLoading, showLoading, hideLoading } = useLoading();

  const handleAction = async () => {
    try {
      showLoading();
      // 执行异步操作
      await someAsyncFunction();
    } finally {
      hideLoading();
    }
  };

  return (
    <div>
      <button onClick={handleAction} disabled={isLoading}>
        {isLoading ? '处理中...' : '执行操作'}
      </button>
    </div>
  );
};
```

### 3. API请求自动控制

已集成到 `apiService` 中，无需手动调用：

```tsx
import { apiService } from '../../services/api';

const MyComponent = () => {
  const handleSubmit = async () => {
    // API请求会自动显示加载动画
    try {
      const response = await apiService.sendMessage('Hello');
      console.log(response);
    } catch (error) {
      console.error(error);
    }
    // 请求完成后自动隐藏加载动画
  };

  return (
    <button onClick={handleSubmit}>发送消息</button>
  );
};
```

## 技术实现

### 组件结构

- `Loading.tsx`：核心组件，使用createPortal挂载到body
- `useLoading.tsx`：自定义钩子，提供全局状态管理
- API集成：通过请求回调实现自动控制

### 样式设计

- 全屏遮罩：半透明黑色背景
- 居中动画：蓝色旋转加载图标
- 响应式：在小屏幕上自动调整大小

### 性能优化

- 纯CSS动画：使用 `transform` 和 `opacity` 属性，避免重排
- 条件渲染：不可见时返回null，减少DOM节点
- 防抖处理：API请求自动管理，避免频繁显示/隐藏

## 自定义配置

### 修改加载文本

在 `Loading.tsx` 中修改 `loading-text` 元素的内容：

```tsx
<div className="loading-text">加载中...</div>
```

### 修改动画样式

在 `Loading.tsx` 中的 `style.textContent` 中调整CSS样式：

```css
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6; /* 调整颜色 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
```

## 浏览器兼容性

- 支持所有现代浏览器
- 使用CSS3动画，无需polyfill
- React 18+ 支持

## 示例场景

### 1. 表单提交

```tsx
const LoginForm = () => {
  const { showLoading, hideLoading } = useLoading();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showLoading();
      await apiService.login(formData.username, formData.password);
      // 登录成功处理
    } catch (error) {
      // 错误处理
    } finally {
      hideLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
};
```

### 2. 数据加载

```tsx
const DataList = () => {
  const { isLoading, showLoading, hideLoading } = useLoading();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading();
        const response = await apiService.request('/api/data');
        setData(response);
      } catch (error) {
        console.error(error);
      } finally {
        hideLoading();
      }
    };

    fetchData();
  }, [showLoading, hideLoading]);

  return (
    <div>
      {isLoading ? (
        <p>加载中...</p>
      ) : (
        <ul>
          {data.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```
