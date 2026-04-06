"""
数据库迁移脚本：为现有用户生成 UUID
运行方式：python scripts/migrate_add_user_uuid.py
"""

import sqlite3
import uuid
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.db.user import DB_PATH


def migrate_add_uuid_to_existing_users():
    """为所有没有 UUID 的现有用户生成 UUID"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # 检查 uuid 列是否存在
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'uuid' not in columns:
            print("添加 uuid 列到 users 表...")
            # SQLite 不支持直接添加 UNIQUE 列，先添加列，再创建索引
            cursor.execute('ALTER TABLE users ADD COLUMN uuid TEXT DEFAULT NULL')
            conn.commit()
            print("✅ uuid 列添加成功")

            # 创建唯一索引
            print("创建 uuid 唯一索引...")
            cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid)')
            conn.commit()
            print("✅ uuid 唯一索引创建成功")
        else:
            print("✅ uuid 列已存在")

        # 查找所有没有 UUID 的用户
        cursor.execute('SELECT id, username FROM users WHERE uuid IS NULL')
        users_without_uuid = cursor.fetchall()

        if not users_without_uuid:
            print("✅ 所有用户已有 UUID，无需迁移")
            return

        print(f"\n发现 {len(users_without_uuid)} 个用户需要生成 UUID:")

        # 为每个用户生成 UUID
        for user_id, username in users_without_uuid:
            user_uuid = str(uuid.uuid4())
            cursor.execute(
                'UPDATE users SET uuid = ? WHERE id = ?',
                (user_uuid, user_id)
            )
            print(f"  - 用户 {username} (ID: {user_id}) -> UUID: {user_uuid}")

        conn.commit()
        print(f"\n✅ 成功为 {len(users_without_uuid)} 个用户生成 UUID")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ 迁移失败: {e}")
        raise
    finally:
        conn.close()


def verify_migration():
    """验证迁移结果"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute('''
            SELECT id, uuid, username, email
            FROM users
            ORDER BY id
        ''')
        users = cursor.fetchall()

        print("\n📋 用户列表（验证）:")
        print("-" * 80)
        print(f"{'ID':<5} {'UUID':<36} {'Username':<15} {'Email'}")
        print("-" * 80)

        for user in users:
            user_id, user_uuid, username, email = user
            uuid_display = user_uuid[:8] + "..." if user_uuid else "NULL"
            print(f"{user_id:<5} {uuid_display:<36} {username:<15} {email}")

        print("-" * 80)

        # 检查是否有用户没有 UUID
        cursor.execute('SELECT COUNT(*) FROM users WHERE uuid IS NULL')
        null_count = cursor.fetchone()[0]

        if null_count == 0:
            print(f"✅ 所有 {len(users)} 个用户都有 UUID")
        else:
            print(f"⚠️ 还有 {null_count} 个用户没有 UUID")

    finally:
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("数据库迁移：为现有用户生成 UUID")
    print("=" * 60)
    print(f"数据库路径: {DB_PATH}")
    print()

    migrate_add_uuid_to_existing_users()
    verify_migration()

    print("\n" + "=" * 60)
    print("迁移完成！")
    print("=" * 60)
