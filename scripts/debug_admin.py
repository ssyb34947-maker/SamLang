#!/usr/bin/env python3
"""
调试管理员登录问题
"""

import sys
import os
import hashlib

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.db.admin import init_admin_tables, get_admin_by_id, list_admins, authenticate_admin, hash_password

def main():
    print("=" * 60)
    print("🔍 管理员登录调试工具")
    print("=" * 60)
    
    # 初始化表
    print("\n📦 初始化数据库表...")
    init_admin_tables()
    print("✅ 数据库表已初始化")
    
    # 列出所有管理员
    print("\n📋 当前管理员列表:")
    admins = list_admins()
    
    if not admins:
        print("❌ 没有找到任何管理员账号")
        print("\n💡 请先运行: python scripts/init_admins_from_csv.py")
        return
    
    print(f"✅ 找到 {len(admins)} 个管理员账号:\n")
    
    # 测试每个账号
    test_passwords = ['shen123', 'dong123', 'wang123', 'shi123', 'xie123']
    
    for i, admin in enumerate(admins):
        print(f"\n{'='*60}")
        print(f"管理员: {admin['username']}")
        print(f"{'='*60}")
        
        # 获取期望的密码
        expected_password = test_passwords[i] if i < len(test_passwords) else 'unknown'
        print(f"期望密码: {expected_password}")
        
        # 计算哈希
        expected_hash = hash_password(expected_password)
        print(f"期望哈希: {expected_hash[:20]}...")
        
        # 尝试认证
        try:
            result = authenticate_admin(admin['username'], expected_password)
            if result:
                print(f"✅ 登录成功!")
                print(f"   UUID: {result['uuid']}")
                print(f"   角色: {result['role']}")
            else:
                print(f"❌ 登录失败 - 密码不匹配")
        except ValueError as e:
            print(f"❌ 登录失败 - {e}")
        except Exception as e:
            print(f"❌ 登录失败 - 错误: {e}")
    
    # 手动测试
    print(f"\n{'='*60}")
    print("手动测试")
    print(f"{'='*60}")
    
    username = input("\n输入账号 (默认: admin): ").strip() or "admin"
    password = input("输入密码 (默认: shen123): ").strip() or "shen123"
    
    print(f"\n测试登录: {username} / {password}")
    print(f"密码哈希: {hash_password(password)[:30]}...")
    
    try:
        result = authenticate_admin(username, password)
        if result:
            print(f"✅ 登录成功!")
            print(f"   UUID: {result['uuid']}")
        else:
            print(f"❌ 登录失败 - 账号或密码错误")
    except ValueError as e:
        print(f"❌ 登录失败 - {e}")
    except Exception as e:
        print(f"❌ 登录失败 - 错误: {e}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
