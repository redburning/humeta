#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
读取 CSV 并批量写入 MySQL 表 metabolite

依赖：
    pip install pymysql

使用：
    1. 修改下方 CONFIG 区域（数据库连接、CSV 路径）
    2. python import_csv_to_mysql.py
"""

import csv
import sys
import time
from datetime import datetime

import pymysql
from pymysql.cursors import DictCursor


# ============================================================
# CONFIG —— 请在这里补充你的信息
# ============================================================

# ---- 数据库连接信息（TODO: 补充）----
DB_HOST     = "127.0.0.1"          # 例如 "127.0.0.1"
DB_PORT     = 3306
DB_USER     = "root"          # 例如 "root"
DB_PASSWORD = "aaa123+-*/"          # 例如 "xxxx"
DB_NAME     = "humeta"          # 例如 "your_database"
DB_CHARSET  = "utf8mb4"

# ---- CSV 文件绝对路径（TODO: 补充）----
CSV_PATH = r"F:\MyProjects\humeta\资料\Humeta-V1_8160交付材料\Humeta-V1 Final_8160.csv"            # 例如 r"D:\data\Humeta-V1 Final_8160.csv"

# ---- 目标表名 ----
TABLE_NAME = "metabolite"

# ---- 每批插入行数 ----
BATCH_SIZE = 500

# ---- 冲突策略：'ignore' | 'update' | 'error' ----
#   ignore：已存在 id 则跳过（INSERT IGNORE）
#   update：已存在 id 则更新（ON DUPLICATE KEY UPDATE）
#   error：遇到重复直接报错
ON_DUPLICATE = "ignore"


# ============================================================
# 列定义（必须与建表一致）
# ============================================================

COLUMNS = [
    "id",
    "preferred_detection_mode",
    "primary_biological_locations",
    "structural_hierarchy",
    "common_abbreviations",
    "chinese_synonyms",
    "metabolon_name_2022NC",
    "hmdb_name_2026V5",
    "name",
    "chinese_name",
    "hmdb",
    "pubchem",
    "monoisotopic_mass",
    "average_mass",
    "formula",
    "iupac_name",
    "inchikey",
    "smiles",
    "universal_smiles",
    "charge_state",
    "cas",
    "chebi",
    "kegg",
    "lipid_maps",
    "swiss_lipids",
    "common_synonyms",
    "human_metabolism_superclass",
    "biochemical_class",
    "metabolic_subpathway",
    "kingdom",
    "superclass",
    "class",
    "subclass",
    "parent_level_1",
    "parent_level_2",
    "parent_level_3",
    "parent_level_4",
    "parent_level_5",
    "parent_level_6",
    "alogp",
    "molecular_refractivity",
    "num_h_bond_donors",
    "num_h_bond_acceptors",
    "topological_psa",
    "fraction_csp3",
    "num_rotatable_bonds",
    "num_aromatic_rings",
    "number_of_heavy_atoms",
    "number_of_rings",
    "num_chiral_centers",
    "num_aliphatic_rings",
    "violations_of_lipinski_rule",
    "violations_of_veber_rule",
]

INT_COLUMNS = {
    "charge_state",
    "num_h_bond_donors",
    "num_h_bond_acceptors",
    "num_rotatable_bonds",
    "num_aromatic_rings",
    "number_of_heavy_atoms",
    "number_of_rings",
    "num_chiral_centers",
    "num_aliphatic_rings",
    "violations_of_lipinski_rule",
    "violations_of_veber_rule",
}

DECIMAL_COLUMNS = {
    "monoisotopic_mass",
    "average_mass",
    "alogp",
    "molecular_refractivity",
    "topological_psa",
    "fraction_csp3",
}

# 用于 ON DUPLICATE KEY UPDATE 的列（不含主键 id）
UPDATE_COLUMNS = [c for c in COLUMNS if c != "id"]


# ============================================================
# 数值/文本转换
# ============================================================

def convert_value(col, raw):
    """把 CSV 原始字符串转为 Python 值；无法解析或占位符返回 None。"""
    if raw is None:
        return None

    s = str(raw).strip()
    if s == "" or s == "/":
        return None

    if col in INT_COLUMNS:
        try:
            return int(float(s))
        except ValueError:
            return None

    if col in DECIMAL_COLUMNS:
        try:
            return float(s)
        except ValueError:
            return None

    return s


def parse_row(row):
    """把 CSV 一行转成按 COLUMNS 顺序的 tuple。"""
    return tuple(convert_value(col, row.get(col)) for col in COLUMNS)


# ============================================================
# SQL 构造
# ============================================================

def build_insert_sql():
    cols_sql = ", ".join(f"`{c}`" for c in COLUMNS)
    placeholders = ", ".join(["%s"] * len(COLUMNS))
    base = f"INSERT INTO `{TABLE_NAME}` ({cols_sql}) VALUES ({placeholders})"

    if ON_DUPLICATE == "ignore":
        return base.replace("INSERT INTO", "INSERT IGNORE INTO", 1)
    if ON_DUPLICATE == "update":
        update_sql = ", ".join(f"`{c}`=VALUES(`{c}`)" for c in UPDATE_COLUMNS)
        return base + f" ON DUPLICATE KEY UPDATE {update_sql}"
    return base


# ============================================================
# 校验配置
# ============================================================

def validate_config():
    missing = []
    if not DB_HOST:     missing.append("DB_HOST")
    if not DB_USER:     missing.append("DB_USER")
    if not DB_PASSWORD: missing.append("DB_PASSWORD")
    if not DB_NAME:     missing.append("DB_NAME")
    if not CSV_PATH:    missing.append("CSV_PATH")
    if missing:
        print("[ERROR] 请先补充以下配置:", ", ".join(missing))
        sys.exit(1)


# ============================================================
# 主流程
# ============================================================

def main():
    validate_config()

    start = time.time()
    insert_sql = build_insert_sql()

    print(f"[INFO] 开始导入")
    print(f"       CSV  : {CSV_PATH}")
    print(f"       表名 : {DB_NAME}.{TABLE_NAME}")
    print(f"       批次 : {BATCH_SIZE} 行/批")
    print(f"       冲突 : {ON_DUPLICATE}")
    print()

    # ---- 建立连接 ----
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset=DB_CHARSET,
            cursorclass=DictCursor,
            autocommit=False,
        )
    except pymysql.MySQLError as e:
        print(f"[ERROR] 数据库连接失败: {e}")
        sys.exit(1)

    total = 0
    batch = []

    try:
        with conn.cursor() as cur:
            # 快速连通性测试
            cur.execute("SELECT 1")

            with open(CSV_PATH, "r", encoding="utf-8-sig", newline="") as f:
                reader = csv.DictReader(f)

                if not reader.fieldnames:
                    print("[ERROR] CSV 没有表头")
                    sys.exit(1)

                missing_cols = [c for c in COLUMNS if c not in reader.fieldnames]
                if missing_cols:
                    print(f"[ERROR] CSV 缺少列: {', '.join(missing_cols)}")
                    sys.exit(1)

                for i, row in enumerate(reader, start=1):
                    batch.append(parse_row(row))

                    if len(batch) >= BATCH_SIZE:
                        cur.executemany(insert_sql, batch)
                        conn.commit()
                        total += len(batch)
                        batch = []
                        print(f"[INFO] 已提交 {total} 行")

                # 最后一批
                if batch:
                    cur.executemany(insert_sql, batch)
                    conn.commit()
                    total += len(batch)

        elapsed = time.time() - start
        print()
        print(f"[DONE] 导入完成")
        print(f"       总行数 : {total}")
        print(f"       耗时   : {elapsed:.2f} 秒")
        print(f"       完成于 : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    except pymysql.MySQLError as e:
        conn.rollback()
        print(f"[ERROR] 数据库错误: {e}")
        sys.exit(1)
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] 未知错误: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()