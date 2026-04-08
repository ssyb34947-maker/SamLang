#!/usr/bin/env python3
"""
检查管理员账号状态
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.db.admin import init_admin_tables, get_admin_by_id, list_admins, authenticate_admin

def main():
    print("=" * 50)
    print("🔍 管理员账号检查工具")
    print("=" * 50)
    
    # 初始化表
    print("\n📦 初始化数据库表...")
    init_admin_tables()
    print("✅ 数据库表已初始化")
    
    # 列出所有管理员
    print("\n📋 当前管理员列表:")
    admins = list_admins()
    
    if not admins:
        print("❌ 没有找到任何管理员账号")
        print("\n💡 请运行以下命令创建管理员:")
        print("   python scripts/init_admins_from_csv.py")
        print("   或")
        print("   python scripts/init_admin.py --username admin --password your_password")
    else:
        print(f"✅ 找到 {len(admins)} 个管理员账号:\n")
        for admin in admins:
            print(f"   ID: {admin['id']}")
            print(f"   UUID: {admin['uuid']}")
            print(f"   账号: {admin['username']}")
            print(f"   昵称: {admin.get('nickname', 'N/A')}")
            print(f"   角色: {admin['role']}")
            print(f"   状态: {admin['status']}")
            print(f"   创建时间: {admin['created_at']}")
            print("-" * 40)
    
    # 测试登录
    if admins:
        print("\n🧪 测试登录功能:")
        test_admin = admins[0]
        print(f"   尝试登录: {test_admin['username']}")
        
        # 这里需要密码，我们尝试一个错误的密码来测试错误处理
        result = authenticate_admin(test_admin['username'], "wrong_password")
        if result is None:
            print("   ✅ 错误密码被拒绝（符合预期）")
        else:
            print("   ❌ 错误密码被接受（有问题！）")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()
