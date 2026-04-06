"""
冷启动预测API的Schema定义
"""

from pydantic import BaseModel, Field
from typing import Optional


class ColdStartRequest(BaseModel):
    """冷启动预测请求"""
    gender: str = Field(..., description="性别")
    grade: str = Field(..., description="年级")
    daily_study_time: str = Field(..., description="每天学习时长")
    math_recognition: str = Field(..., description="数学认可")
    learning_autonomy: str = Field(..., description="学习自主性")
    learning_perseverance: str = Field(..., description="学习坚持性")
    learning_curiosity: str = Field(..., description="学习好奇心")
    current_goal: str = Field(..., description="目前目标")
    
    class Config:
        json_schema_extra = {
            "example": {
                "gender": "男",
                "grade": "初中",
                "daily_study_time": "1小时以上",
                "math_recognition": "我认为数学十分有用且热爱学习数学",
                "learning_autonomy": "我高度自主且有强烈学习意愿",
                "learning_perseverance": "高度坚持，主动克服各种困难",
                "learning_curiosity": "高度好奇，热爱学习与探索未知",
                "current_goal": "重点高中"
            }
        }


class SubjectScore(BaseModel):
    """单科成绩"""
    score: float = Field(..., description="分数")
    level: str = Field(..., description="等级")


class ColdStartPrediction(BaseModel):
    """预测结果"""
    math: SubjectScore = Field(..., description="数学成绩")
    reading: SubjectScore = Field(..., description="阅读成绩")
    science: SubjectScore = Field(..., description="科学成绩")


class ColdStartResponse(BaseModel):
    """冷启动预测响应"""
    success: bool = Field(..., description="是否成功")
    data: ColdStartPrediction = Field(..., description="预测数据")
    persona_text: str = Field(..., description="用户画像自然文本，可用于存储到用户表")
    message: Optional[str] = Field(default=None, description="消息")
