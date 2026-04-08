#!/usr/bin/env python3
"""
从CSV文件批量初始化管理员账号

使用方法:
    python scripts/init_admins_from_csv.py --csv scripts/admins.csv

CSV格式:
    username,password,nickname,role
    admin,admin123,系统管理员,super_admin
    manager,manager123,运营管理员,admin

参数说明:
    --csv: CSV文件路径（默认：scripts/admins.csv）
    --skip-existing: 跳过已存在的账号（默认：False）
"""

import argparse
import csv
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.db.admin import init_admin_tables, create_admin


def parse_arguments():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description='从CSV文件批量初始化管理员账号',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python scripts/init_admins_from_csv.py
  python scripts/init_admins_from_csv.py --csv scripts/admins.csv
  python scripts/init_admins_from_csv.py --csv scripts/admins.csv --skip-existing
        """
    )

    parser.add_argument(
        '--csv',
        default='scripts/admins.csv',
        help='CSV文件路径（默认：scripts/admins.csv）'
    )

    parser.add_argument(
        '--skip-existing',
        action='store_true',
        help='跳过已存在的账号'
    )

    return parser.parse_args()


def validate_csv_row(row: dict, row_num: int) -> tuple[bool, str]:
    """验证CSV行数据"""
    username = row.get('username', '').strip()
    password = row.get('password', '').strip()
    role = row.get('role', 'admin').strip()

    if not username:
        return False, f"第{row_num}行: 用户名不能为空"

    if len(username) < 3 or len(username) > 50:
        return False, f"第{row_num}行: 用户名长度必须在3-50个字符之间"

    if not password:
        return False, f"第{row_num}行: 密码不能为空"

    if len(password) < 6 or len(password) > 50:
        return False, f"第{row_num}行: 密码长度必须在6-50个字符之间"

    if role not in ['super_admin', 'admin']:
        return False, f"第{row_num}行: 角色必须是 super_admin 或 admin"

    return True, ""


def import_from_csv(csv_path: str, skip_existing: bool = False) -> dict:
    """从CSV文件导入管理员账号"""
    results = {
        'success': [],
        'failed': [],
        'skipped': []
    }

    # 检查文件是否存在
    if not os.path.exists(csv_path):
        print(f"❌ 错误: 文件不存在 {csv_path}")
        return results

    # 读取CSV文件
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"📄 读取到 {len(rows)} 条记录")
    print("-" * 50)

    for i, row in enumerate(rows, start=2):  # 从2开始，因为第1行是表头
        # 验证数据
        is_valid, error_msg = validate_csv_row(row, i)
        if not is_valid:
            results['failed'].append({
                'row': i,
                'username': row.get('username', 'unknown'),
                'error': error_msg
            })
            print(f"❌ 第{i}行验证失败: {error_msg}")
            continue

        username = row['username'].strip()
        password = row['password'].strip()
        nickname = row.get('nickname', '').strip() or None
        role = row.get('role', 'admin').strip()

        try:
            admin_id = create_admin(
                username=username,
                password=password,
                nickname=nickname,
                role=role
            )
            results['success'].append({
                'row': i,
                'id': admin_id,
                'username': username,
                'role': role
            })
            print(f"✅ 第{i}行: 创建成功 - {username} ({role})")

        except ValueError as e:
            if "已存在" in str(e) and skip_existing:
                results['skipped'].append({
                    'row': i,
                    'username': username,
                    'reason': str(e)
                })
                print(f"⏭️  第{i}行: 跳过 - {username} 已存在")
            else:
                results['failed'].append({
                    'row': i,
                    'username': username,
                    'error': str(e)
                })
                print(f"❌ 第{i}行创建失败: {e}")

    return results


def main():
    """主函数"""
    args = parse_arguments()

    # 获取CSV文件的绝对路径
    csv_path = os.path.abspath(args.csv)

    print("=" * 50)
    print("🚀 管理员账号批量导入工具")
    print("=" * 50)
    print(f"📂 CSV文件: {csv_path}")
    print(f"⏭️  跳过已存在: {'是' if args.skip_existing else '否'}")
    print("=" * 50)

    try:
        # 初始化数据库表
        print("\n📦 初始化管理员数据库表...")
        init_admin_tables()
        print("✅ 数据库表初始化完成\n")

        # 导入数据
        results = import_from_csv(csv_path, args.skip_existing)

        # 打印汇总
        print("\n" + "=" * 50)
        print("📊 导入结果汇总")
        print("=" * 50)
        print(f"✅ 成功: {len(results['success'])} 个")
        print(f"⏭️  跳过: {len(results['skipped'])} 个")
        print(f"❌ 失败: {len(results['failed'])} 个")

        if results['success']:
            print("\n成功创建的账号:")
            for item in results['success']:
                print(f"  - {item['username']} (ID: {item['id']}, 角色: {item['role']})")

        if results['failed']:
            print("\n失败的记录:")
            for item in results['failed']:
                print(f"  - 第{item['row']}行 ({item['username']}): {item['error']}")

        print("=" * 50)

        # 如果有失败，返回非零退出码
        if results['failed']:
            sys.exit(1)

    except Exception as e:
        print(f"\n❌ 系统错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
