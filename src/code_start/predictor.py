"""
学生成绩预测器核心算法模块
基于LightGBM的多输出回归预测
"""

import joblib
import pandas as pd
from pathlib import Path
from typing import Tuple, Dict, List
from dataclasses import dataclass


@dataclass
class StudentProfile:
    """学生画像数据类"""
    gender: str
    grade: str
    daily_study_time: str
    math_recognition: str
    learning_autonomy: str
    learning_perseverance: str
    learning_curiosity: str
    current_goal: str


@dataclass
class PredictionResult:
    """预测结果数据类"""
    math_score: float
    reading_score: float
    science_score: float
    math_level: str
    reading_level: str
    science_level: str


class ScoreLevelMapper:
    """分数等级映射器"""
    
    LEVELS = [
        (80, "优秀"),
        (60, "良好"),
        (40, "中等"),
        (20, "较差"),
    ]
    DEFAULT_LEVEL = "差"
    
    @classmethod
    def score_to_level(cls, score: float) -> str:
        """将分数转换为等级"""
        for threshold, level in cls.LEVELS:
            if score >= threshold:
                return level
        return cls.DEFAULT_LEVEL


class StudentScorePredictor:
    """
    学生成绩预测器
    封装LightGBM模型和编码器的加载与预测逻辑
    """
    
    MODEL_FILENAME = "lgb_model.pkl"
    ENCODER_FILENAME = "encoder.pkl"
    
    COLUMN_MAPPING = {
        "gender": "性别",
        "daily_study_time": "每天学习时长",
        "math_recognition": "数学认可",
        "learning_autonomy": "学习自主性",
        "learning_perseverance": "学习坚持性",
        "learning_curiosity": "学习好奇心"
    }
    
    def __init__(self, model_dir: Path = None):
        """
        初始化预测器
        
        Args:
            model_dir: 模型文件所在目录，默认为当前文件所在目录
        """
        if model_dir is None:
            model_dir = Path(__file__).parent
        
        self.model_dir = model_dir
        self._model = None
        self._encoder = None
    
    def load(self) -> "StudentScorePredictor":
        """加载模型和编码器"""
        model_path = self.model_dir / self.MODEL_FILENAME
        encoder_path = self.model_dir / self.ENCODER_FILENAME
        
        self._model = joblib.load(model_path)
        self._encoder = joblib.load(encoder_path)
        
        return self
    
    @property
    def is_loaded(self) -> bool:
        """检查模型是否已加载"""
        return self._model is not None and self._encoder is not None
    
    def _build_dataframe(self, profile: StudentProfile) -> pd.DataFrame:
        """构建预测用的DataFrame"""
        return pd.DataFrame({
            self.COLUMN_MAPPING["gender"]: [profile.gender],
            self.COLUMN_MAPPING["daily_study_time"]: [profile.daily_study_time],
            self.COLUMN_MAPPING["math_recognition"]: [profile.math_recognition],
            self.COLUMN_MAPPING["learning_autonomy"]: [profile.learning_autonomy],
            self.COLUMN_MAPPING["learning_perseverance"]: [profile.learning_perseverance],
            self.COLUMN_MAPPING["learning_curiosity"]: [profile.learning_curiosity]
        })
    
    def predict(self, profile: StudentProfile) -> PredictionResult:
        """
        预测学生成绩
        
        Args:
            profile: 学生画像
            
        Returns:
            PredictionResult: 预测结果
            
        Raises:
            RuntimeError: 模型未加载时抛出
        """
        if not self.is_loaded:
            raise RuntimeError("模型未加载，请先调用load()")
        
        # 构建数据并编码
        df = self._build_dataframe(profile)
        encoded = self._encoder.transform(df)
        
        # 预测
        scores = self._model.predict(encoded)[0]
        math, reading, science = scores[0], scores[1], scores[2]
        
        # 转换为等级
        return PredictionResult(
            math_score=math,
            reading_score=reading,
            science_score=science,
            math_level=ScoreLevelMapper.score_to_level(math),
            reading_level=ScoreLevelMapper.score_to_level(reading),
            science_level=ScoreLevelMapper.score_to_level(science)
        )
    
    def predict_batch(self, profiles: List[StudentProfile]) -> List[PredictionResult]:
        """
        批量预测
        
        Args:
            profiles: 学生画像列表
            
        Returns:
            List[PredictionResult]: 预测结果列表
        """
        return [self.predict(p) for p in profiles]
