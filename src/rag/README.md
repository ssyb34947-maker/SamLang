## RAG模块

#### features

1. 存储大量标准教科书
2. 存储大量考题

#### tech-stack

1. 当前版本先依赖于milvus，实现快速demo搭建
> 后续版本可能会考虑使用postgresql+pgvector实现

2. collection结构：
|uid|vector|chunk|type|metadata|update_time|source|
|---|---|---|---|---|
|1|vector1|chunk1|book|{"name":"book1","author":"author1","description":"description1"}|2023-01-01|book1.pdf|
|2|vector2|chunk2|problem|{"name":"problem2","source":"problem2.pdf","description":"description2"}|2023-01-02|problem2.pdf|

3. 向量索引
小数据集，采用HNWS算法实现向量索引

4. embedding、rerank选型
使用硅基流动的qwen系列模型，实现向量相似度计算，优点是免费、简单

5. chunk策略
使用overlap方法,10% overlap

6. 检索策略
考虑到垂直业务场景环境，使用sim+bm25混合检索算法，权重初设置归一化后3:1

7. 文档加载器
支持主流所有文件格式，包括pdf、markdown、docx、xlsx、xls、txt、png、jpg、jpeg等。
并在这个基础上，对pdf和图片文件进行ocr识别，实现文本提取为markdown格式。

#### 数据来源
来源于上游提供，本模块存储端接收的数据均为已提供的数据，无需load处理。
上游有ocr模块，进行完成工作流。