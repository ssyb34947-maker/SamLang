/**
 * 用户引导页面常量
 */

// 步骤配置
export const STEPS = {
  BASIC_INFO: 0,
  LEARNING_TRAITS: 1,
  COMPLETE: 2,
} as const;

export const STEP_TITLES = [
  '基本信息',
  '学习特征',
  '完成',
] as const;

// 性别选项
export const GENDER_OPTIONS = [
  { value: '男', label: '男', icon: '👦' },
  { value: '女', label: '女', icon: '👧' },
] as const;

// 学生身份选项
export const IS_STUDENT_OPTIONS = [
  { value: true, label: '是', icon: '🎓' },
  { value: false, label: '否', icon: '💼' },
] as const;

// 学生年级选项
export const STUDENT_GRADE_OPTIONS = [
  { level: '小学', grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'] },
  { level: '初中', grades: ['一年级', '二年级', '三年级'] },
  { level: '高中', grades: ['一年级', '二年级', '三年级'] },
  { level: '本科', grades: ['一年级', '二年级', '三年级', '四年级'] },
  { level: '硕士研究生', grades: ['一年级', '二年级', '三年级'] },
  { level: '博士研究生', grades: ['一年级', '二年级', '三年级', '四年级'] },
] as const;

// 职业选项
export const OCCUPATION_OPTIONS = [
  '教师',
  '医生',
  '工程师',
  '设计师',
  '律师',
  '会计',
  '公务员',
  '企业管理人员',
  '自由职业',
  '其他',
] as const;

// 每天学习时长选项
export const STUDY_TIME_OPTIONS = [
  '小于30分钟',
  '30分钟-1小时',
  '1小时以上',
] as const;

// 数学认可选项
export const MATH_RECOGNITION_OPTIONS = [
  '我认为数学有一定作用且兴趣一般',
  '我认为数学比较有用且有学习兴趣',
  '我认为数学作用不大且兴趣很低',
  '我认为数学十分有用且热爱学习数学',
  '我认为数学没用且完全不想学数学',
] as const;

// 学习自主性选项
export const LEARNING_AUTONOMY_OPTIONS = [
  '我能主动完成学习任务',
  '我能自主规划并坚持学习',
  '我会主动学一点',
  '我几乎没有动力学习',
  '我高度自主且有强烈学习意愿',
] as const;

// 学习坚持性选项
export const LEARNING_PERSISTENCE_OPTIONS = [
  '能完成基本任务，遇到困难可坚持',
  '面对挑战能坚持，不易放弃',
  '遇到困难容易退缩，坚持度较低',
  '遇到困难立刻放弃，几乎不能坚持',
  '高度坚持，主动克服各种困难',
] as const;

// 学习好奇心选项
export const LEARNING_CURIOSITY_OPTIONS = [
  '对学习有一定兴趣，愿意了解新知',
  '对学习兴趣较低，很少主动探索',
  '好奇心较强，喜欢主动学习探索',
  '高度好奇，热爱学习与探索未知',
  '对学习毫无兴趣，不想探索新知识',
] as const;

// 学习目标选项
export const LEARNING_GOAL_OPTIONS = [
  '提高数学成绩',
  '培养学习兴趣',
  '养成良好学习习惯',
  '拓展知识面',
  '准备升学考试',
  '提升思维能力',
] as const;

// 动画时长配置
export const ANIMATION_DURATION = {
  STEP_TRANSITION: 400,
  CONTENT_FADE_IN: 300,
  BUTTON_HOVER: 200,
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  GENDER_REQUIRED: '请选择性别',
  STUDENT_STATUS_REQUIRED: '请选择是否是学生',
  STUDENT_GRADE_REQUIRED: '请选择学生年级',
  OCCUPATION_REQUIRED: '请选择职业',
  SAVE_FAILED: '保存失败，请稍后重试',
  NETWORK_ERROR: '网络连接失败',
} as const;
