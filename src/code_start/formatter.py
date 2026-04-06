"""
预测结果格式化模块
负责将预测结果格式化为可读文本或结构化数据
"""

from typing import Dict, Any
from src.code_start.predictor import StudentProfile, PredictionResult


class ResultFormatter:
    """预测结果格式化器"""
    
    @staticmethod
    def to_text(profile: StudentProfile, result: PredictionResult) -> str:
        """
        将预测结果格式化为可读文本
        
        Args:
            profile: 学生画像
            result: 预测结果
            
        Returns:
            str: 格式化后的文本
        """
        return (
            f"学生信息：\n"
            f"性别：{profile.gender}\n"
            f"年级：{profile.grade}\n"
            f"每天学习时长：{profile.daily_study_time}\n"
            f"数学认可：{profile.math_recognition}\n"
            f"学习自主性：{profile.learning_autonomy}\n"
            f"学习坚持性：{profile.learning_perseverance}\n"
            f"学习好奇心：{profile.learning_curiosity}\n"
            f"目前目标：{profile.current_goal}\n\n"
            f"预测成绩：\n"
            f"数学成绩：{result.math_score:.2f}分 【{result.math_level}】\n"
            f"阅读成绩：{result.reading_score:.2f}分 【{result.reading_level}】\n"
            f"科学成绩：{result.science_score:.2f}分 【{result.science_level}】"
        )
    
    @staticmethod
    def to_dict(profile: StudentProfile, result: PredictionResult) -> Dict[str, Any]:
        """
        将预测结果格式化为字典
        
        Args:
            profile: 学生画像
            result: 预测结果
            
        Returns:
            Dict[str, Any]: 结构化数据
        """
        return {
            "profile": {
                "gender": profile.gender,
                "grade": profile.grade,
                "daily_study_time": profile.daily_study_time,
                "math_recognition": profile.math_recognition,
                "learning_autonomy": profile.learning_autonomy,
                "learning_perseverance": profile.learning_perseverance,
                "learning_curiosity": profile.learning_curiosity,
                "current_goal": profile.current_goal
            },
            "prediction": {
                "math": {
                    "score": round(result.math_score, 2),
                    "level": result.math_level
                },
                "reading": {
                    "score": round(result.reading_score, 2),
                    "level": result.reading_level
                },
                "science": {
                    "score": round(result.science_score, 2),
                    "level": result.science_level
                }
            }
        }
    
    @staticmethod
    def to_simple_dict(result: PredictionResult) -> Dict[str, Any]:
        """
        仅返回预测分数（不含画像信息）

        Args:
            result: 预测结果

        Returns:
            Dict[str, Any]: 简化版结构化数据
        """
        return {
            "math_score": round(result.math_score, 2),
            "math_level": result.math_level,
            "reading_score": round(result.reading_score, 2),
            "reading_level": result.reading_level,
            "science_score": round(result.science_score, 2),
            "science_level": result.science_level
        }

    @staticmethod
    def to_persona_text(profile: StudentProfile, result: PredictionResult) -> str:
        """
        生成用户画像自然文本，用于存储到用户表的"用户画像"字段

        Args:
            profile: 学生画像
            result: 预测结果

        Returns:
            str: 自然语言描述的用户画像文本
        """
        study_time_map = {
            "1小时以上": "每天学习超过1小时",
            "30分钟-1小时": "每天学习30分钟到1小时",
            "小于30分钟": "每天学习不足30分钟"
        }
        study_time_desc = study_time_map.get(profile.daily_study_time, profile.daily_study_time)

        return (
            f"该学生为{profile.grade}{profile.gender}生，{study_time_desc}。"
            f"对数学的态度是：{profile.math_recognition}；"
            f"学习自主性方面：{profile.learning_autonomy}；"
            f"学习坚持性方面：{profile.learning_perseverance}；"
            f"学习好奇心方面：{profile.learning_curiosity}。"
            f"当前目标为{profile.current_goal}。"
            f"基于以上特征，系统预测该学生的学习能力如下："
            f"数学成绩预计{result.math_score:.1f}分（{result.math_level}），"
            f"阅读成绩预计{result.reading_score:.1f}分（{result.reading_level}），"
            f"科学成绩预计{result.science_score:.1f}分（{result.science_level}）。"
        )
