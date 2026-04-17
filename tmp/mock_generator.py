import argparse
import csv
import random
import os
import uuid

HEADERS = ["手机号", "姓名", "客户等级", "备用微信号", "测试", "国家", "省份"]
LEVELS = ["普通客户", "潜在客户", "高意向客户", "VIP客户", "成单客户"]
PROVINCES = ["广东", "浙江", "江苏", "山东", "北京", "上海", "四川"]

def generate_phone():
    return "+861" + str(random.randint(3, 9)) + "".join([str(random.randint(0, 9)) for _ in range(9)])

def generate_row(phone=None, extra_cols=0):
    if not phone:
        phone = generate_phone()
    row = {
        "手机号": phone,
        "姓名": "用户_" + str(uuid.uuid4())[:6],
        "客户等级": random.choice(LEVELS),
        "备用微信号": "wx_" + str(random.randint(1000, 9999)),
        "测试": "测试特征_" + str(random.randint(1, 100)),
        "国家": "中国",
        "省份": random.choice(PROVINCES)
    }
    for i in range(extra_cols):
        row[f"随机扩容列_{i+1}"] = "数据_" + str(uuid.uuid4())[:4]
    return row

def main():
    parser = argparse.ArgumentParser(description="CRM 极限测试 CSV 数据生成器")
    parser.add_argument("--db", type=str, default="crm_mock_database.csv", help="后端基准数据文件，代表数据库里已经存在的数据")
    parser.add_argument("--out", type=str, default=None, help="最终生成拿来上传的 CSV 文件，不填则自动生成中文描述名")
    parser.add_argument("--new", type=int, default=10000, help="新增行数（数据库里不存在的全新手机号）")
    parser.add_argument("--dup", type=int, default=20000, help="重复跳过行数（与数据库里完全一致）")
    parser.add_argument("--mod", type=int, default=20000, help="更新行数（相同手机号，但修改了姓名或等级）")
    parser.add_argument("--wide", type=int, default=0, help="注入额外的随机冗余列列数（最高支持50）测试巨型数据矩阵")

    args = parser.parse_args()
    
    dynamic_headers = list(HEADERS)
    for i in range(args.wide):
        dynamic_headers.append(f"随机扩容列_{i+1}")

    total_rows = args.new + args.dup + args.mod
    actual_out = args.out if args.out else f"压测_{total_rows}行_{len(dynamic_headers)}列_新{args.new}_复{args.dup}_改{args.mod}.csv"

    required_old = args.dup + args.mod
    db_records = {}

    print(f"[*] 检查基准库: {args.db}")
    if os.path.exists(args.db):
        with open(args.db, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                db_records[row["手机号"]] = row
        print(f"[*] 已成功加载基准数据: {len(db_records)} 行")

    # 如果基准库不够用，自动扩容
    if len(db_records) < required_old:
        shortage = required_old - len(db_records)
        print(f"[*] 基准数据不足已支持生成的重复/修改量，正在自动向 {args.db} 扩容 {shortage} 行数据...")
        with open(args.db, "a", encoding="utf-8", newline='') as f:
            writer = csv.DictWriter(f, fieldnames=HEADERS)
            if len(db_records) == 0:
                writer.writeheader()
            for _ in range(shortage):
                row = generate_row(extra_cols=0) # 数据库只有标准列
                while row["手机号"] in db_records:
                    row["手机号"] = generate_phone()
                db_records[row["手机号"]] = row
                writer.writerow(row)
        print(f"[*] 基准库扩容完毕，当前总计拥有 {len(db_records)} 条基础资源。")

    print(f"\n[*] 正在生成用于测试导入的 payload 文件 {actual_out} ...")
    
    # 随机抓取用于复制和修改的基准数据池
    existing_phones = list(db_records.keys())
    random.shuffle(existing_phones)
    
    dup_phones = existing_phones[:args.dup]
    mod_phones = existing_phones[args.dup : args.dup + args.mod]

    output_rows = []

    # 1. 组装：新增数据 (NEW)
    print(f"  -> 生成 [有效新增] 数据: {args.new} 行")
    for _ in range(args.new):
        row = generate_row(extra_cols=args.wide)
        while row["手机号"] in db_records:
            row["手机号"] = generate_phone()
        output_rows.append(row)

    # 2. 组装：重复数据 (DUP)
    print(f"  -> 生成 [重复跳过] 数据: {args.dup} 行")
    for phone in dup_phones:
        row = db_records[phone].copy()
        for i in range(args.wide):
            row[f"随机扩容列_{i+1}"] = "数据_" + str(uuid.uuid4())[:4]
        output_rows.append(row)

    # 3. 组装：修改数据 (MOD)
    print(f"  -> 生成 [系统更新] 数据: {args.mod} 行")
    for phone in mod_phones:
        mod_row = db_records[phone].copy()
        for i in range(args.wide):
            mod_row[f"随机扩容列_{i+1}"] = "数据_" + str(uuid.uuid4())[:4]
        # 随机修改姓名或客户等级来制造差异
        change_col = random.choice(["姓名", "客户等级", "省份"])
        if change_col == "姓名":
            mod_row["姓名"] += "_修改版"
        elif change_col == "客户等级":
            val = mod_row["客户等级"]
            available = [l for l in LEVELS if l != val]
            mod_row["客户等级"] = random.choice(available)
        elif change_col == "省份":
            val = mod_row["省份"]
            available = [p for p in PROVINCES if p != val]
            mod_row["省份"] = random.choice(available)
        output_rows.append(mod_row)

    # 打乱输出文件顺序更逼真
    random.shuffle(output_rows)

    with open(actual_out, "w", encoding="utf-8", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=dynamic_headers)
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"=================================")
    print(f"✅ 生成完毕！")
    print(f"总计创建行数 : {len(output_rows)} (不含表头)")
    print(f"生成文件路径 : {os.path.abspath(actual_out)}")
    print(f"请将该文件拖入前端上传。您应当看到:")
    print(f" - 有效新增: {args.new}")
    print(f" - 数据更新: {args.mod}")
    print(f" - 重复跳过: {args.dup}")
    print(f"=================================")

if __name__ == "__main__":
    main()
