#!/usr/bin/env python3
"""
检查数据库中的密码哈希
"""

import sys
import os
import sqlite3
import hashlib

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.db.user import DB_PATH

def hash_password(password: str) -> str:
    """哈希密码"""
    return hashlib.sha256(password.encode()).hexdigest()

def main():
    print("=" * 60)
    print("🔍 密码哈希检查工具")
    print("=" * 60)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 查询所有管理员
    cursor.execute('''
        SELECT id, username, password_hash, nickname, role, status, login_fail_count, locked_until
        FROM admins
    ''')
    
    rows = cursor.fetchall()
    
    if not rows:
        print("❌ 没有找到管理员账号")
        conn.close()
        return
    
    print(f"\n找到 {len(rows)} 个管理员:\n")
    
    test_passwords = {
        'admin': 'shen123',
        'dong': 'dong123',
        'wang': 'wang123',
        'shi': 'shi123',
        'xie': 'xie123',
    }
    
    for row in rows:
        admin_id, username, stored_hash, nickname, role, status, fail_count, locked_until = row
        
        print(f"{'='*60}")
        print(f"账号: {username}")
        print(f"{'='*60}")
        print(f"  ID: {admin_id}")
        print(f"  昵称: {nickname}")
        print(f"  角色: {role}")
        print(f"  状态: {status}")
        print(f"  失败次数: {fail_count}")
        print(f"  锁定时间: {locked_until}")
        print(f"  存储的哈希: {stored_hash}")
        
        # 测试期望的密码
        expected_password = test_passwords.get(username, '')
        if expected_password:
            expected_hash = hash_password(expected_password)
            print(f"  期望的哈希: {expected_hash}")
            print(f"  哈希匹配: {'✅ 是' if stored_hash == expected_hash else '❌ 否'}")
        
        print()
    
    # 手动验证
    print(f"{'='*60}")
    print("手动验证")
    print(f"{'='*60}")
    
    username = input("\n输入账号: ").strip()
    password = input("输入密码: ").strip()
    
    cursor.execute('SELECT password_hash FROM admins WHERE username = ?', (username,))
    row = cursor.fetchone()
    
    if not row:
        print(f"❌ 账号 '{username}' 不存在")
    else:
        stored_hash = row[0]
        input_hash = hash_password(password)
        
        print(f"\n输入的密码: {password}")
        print(f"输入的哈希: {input_hash}")
        print(f"存储的哈希: {stored_hash}")
        print(f"匹配结果: {'✅ 匹配' if stored_hash == input_hash else '❌ 不匹配'}")
    
    conn.close()
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
