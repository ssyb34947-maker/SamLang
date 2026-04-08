#!/usr/bin/env python3
"""
管理员账号初始化脚本
用于手动创建初始管理员账号

使用方法:
    python scripts/init_admin.py --username admin --password your_password --nickname "管理员" --role super_admin

参数说明:
    --username: 管理员账号（必填）
    --password: 密码（必填）
    --nickname: 显示名称（可选）
    --role: 角色，可选 super_admin 或 admin（默认：admin）
"""

import argparse
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.db.admin import init_admin_tables, create_admin


def parse_arguments():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description='初始化管理员账号',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python scripts/init_admin.py --username admin --password 123456
  python scripts/init_admin.py --username super --password 123456 --nickname "超级管理员" --role super_admin
        """
    )

    parser.add_argument(
        '--username',
        required=True,
        help='管理员账号（3-50字符）'
    )

    parser.add_argument(
        '--password',
        required=True,
        help='密码（6-50字符）'
    )

    parser.add_argument(
        '--nickname',
        default=None,
        help='显示名称（可选）'
    )

    parser.add_argument(
        '--role',
        default='admin',
        choices=['super_admin', 'admin'],
        help='管理员角色（默认：admin）'
    )

    return parser.parse_args()


def validate_inputs(username: str, password: str) -> tuple[bool, str]:
    """验证输入参数"""
    if len(username) < 3 or len(username) > 50:
        return False, "用户名长度必须在3-50个字符之间"

    if len(password) < 6 or len(password) > 50:
        return False, "密码长度必须在6-50个字符之间"

    return True, ""


def main():
    """主函数"""
    args = parse_arguments()

    # 验证输入
    is_valid, error_msg = validate_inputs(args.username, args.password)
    if not is_valid:
        print(f"❌ 验证失败: {error_msg}")
        sys.exit(1)

    try:
        # 初始化数据库表
        print("📦 初始化管理员数据库表...")
        init_admin_tables()
        print("✅ 数据库表初始化完成")

        # 创建管理员账号
        print(f"👤 创建管理员账号: {args.username}...")
        admin_id = create_admin(
            username=args.username,
            password=args.password,
            nickname=args.nickname,
            role=args.role
        )

        print(f"✅ 管理员账号创建成功！")
        print(f"   ID: {admin_id}")
        print(f"   账号: {args.username}")
        print(f"   角色: {args.role}")
        if args.nickname:
            print(f"   昵称: {args.nickname}")

    except ValueError as e:
        print(f"❌ 创建失败: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 系统错误: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
