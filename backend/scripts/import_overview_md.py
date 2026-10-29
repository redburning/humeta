# -*- coding: utf-8 -*-
"""把 md Overview 目录中的中英文介绍导入 MySQL。

目录中每个 .md 以 Humeta 编号命名（例如 IPTM00263E.md），内容为两段：

    第一行：中文介绍
    第二行：英文介绍（两段之间可能有空行）

脚本按 id 写入 metabolite_desc 表（id, desc_cn, desc_en），已存在则更新。

用法:
    pip install pymysql
    # 先填写下方 DB_HOST / DB_USER / DB_PASSWORD（或设置 HUMETA_DB_* 环境变量）
    python scripts/import_overview_md.py --dry-run   # 只解析预览，不连数据库
    python scripts/import_overview_md.py             # 写入数据库
    python scripts/import_overview_md.py --dir "D:/data/md Overview"

依赖: pymysql
"""
import argparse
import os
import re
import sys
import time
from pathlib import Path

try:
    import pymysql
except ImportError:  # --dry-run 不需要 pymysql
    pymysql = None


DEFAULT_MD_DIR = r"F:\MyProjects\humeta\资料\Humeta-V1_8160交付材料\md Overview"

# ===== 数据库连接信息（请填写） =====
DB_HOST = "81.70.215.151"          # 例如 "127.0.0.1"
DB_PORT = 3306
DB_USER = "root"          # 例如 "root"
DB_PASSWORD = "Abc123+-*/"      # 数据库密码
DB_NAME = "humeta"
DB_TABLE = "metabolite_desc"

# 也可以用环境变量覆盖上面的值，避免把密码写进脚本
DB_HOST = os.environ.get("HUMETA_DB_HOST", DB_HOST)
DB_PORT = int(os.environ.get("HUMETA_DB_PORT", DB_PORT))
DB_USER = os.environ.get("HUMETA_DB_USER", DB_USER)
DB_PASSWORD = os.environ.get("HUMETA_DB_PASSWORD", DB_PASSWORD)
DB_NAME = os.environ.get("HUMETA_DB_NAME", DB_NAME)
DB_TABLE = os.environ.get("HUMETA_DB_TABLE", DB_TABLE)

CHINESE_RE = re.compile(r"[\u4e00-\u9fff]")
TABLE_NAME_RE = re.compile(r"^[A-Za-z0-9_]+$")


def configure_stdout():
    """Windows 控制台默认不是 UTF-8，避免打印中文时抛异常。"""
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def parse_args():
    parser = argparse.ArgumentParser(
        description="把 md Overview 目录中的中英文介绍导入 MySQL 的 metabolite_desc 表。"
    )
    parser.add_argument(
        "--dir",
        default=DEFAULT_MD_DIR,
        help="md 文件目录（默认使用脚本顶部的 DEFAULT_MD_DIR）",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="只解析并打印预览，不写入数据库",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="最多处理多少个文件（调试用，0 表示全部）",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=200,
        help="批量写入条数，默认 200",
    )
    return parser.parse_args()


def has_chinese(text):
    return bool(CHINESE_RE.search(text or ""))


def extract_descriptions(text):
    """返回 (desc_cn, desc_en)。

    约定第一非空行为中文、其余为英文；如果第一行是英文而后续内容是中文，
    则自动交换，兼容个别顺序相反的文件。
    """
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return "", ""

    if len(lines) == 1:
        line = lines[0]
        return (line, "") if has_chinese(line) else ("", line)

    first = lines[0]
    rest = "\n".join(lines[1:]).strip()
    if not has_chinese(first) and has_chinese(rest):
        return rest, first

    return first, rest


def load_records(directory, limit, warnings):
    paths = sorted(Path(directory).glob("*.md"))
    records = []
    started = time.time()

    for index, path in enumerate(paths, 1):
        try:
            text = path.read_text(encoding="utf-8-sig")
        except UnicodeDecodeError as exc:
            warnings.append("%s: 不是 UTF-8 编码，已跳过（%s）" % (path.name, exc))
            continue

        desc_cn, desc_en = extract_descriptions(text)
        if not desc_cn and not desc_en:
            warnings.append("%s: 内容为空，已跳过" % path.name)
            continue
        if not desc_cn:
            warnings.append("%s: 缺少中文介绍" % path.name)
        if not desc_en:
            warnings.append("%s: 缺少英文介绍" % path.name)

        records.append((path.stem, desc_cn, desc_en))

        if index % 500 == 0:
            print("  已解析 %d/%d 个文件..." % (index, len(paths)))
        if limit and len(records) >= limit:
            break

    print("解析完成，用时 %.2fs" % (time.time() - started))
    return records


def check_db_config():
    missing = [
        name
        for name, value in (
            ("DB_HOST", DB_HOST),
            ("DB_USER", DB_USER),
            ("DB_NAME", DB_NAME),
            ("DB_TABLE", DB_TABLE),
        )
        if not str(value).strip()
    ]
    if missing:
        print("请先在脚本顶部填写数据库连接信息：" + "、".join(missing))
        print(
            "也可以设置环境变量：HUMETA_DB_HOST / HUMETA_DB_USER / "
            "HUMETA_DB_PASSWORD / HUMETA_DB_NAME / HUMETA_DB_TABLE"
        )
        return False

    if not TABLE_NAME_RE.fullmatch(DB_TABLE):
        print("DB_TABLE 不合法：%r（只允许字母、数字、下划线）" % DB_TABLE)
        return False
    return True


def write_to_mysql(records, batch_size):
    if pymysql is None:
        print("缺少 pymysql，请先执行：pip install pymysql")
        return 0

    print("连接 MySQL %s:%s/%s ..." % (DB_HOST, DB_PORT, DB_NAME))
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        autocommit=False,
        connect_timeout=10,
    )

    sql = (
        f"INSERT INTO `{DB_TABLE}` (`id`, `desc_cn`, `desc_en`) "
        "VALUES (%s, %s, %s) "
        "ON DUPLICATE KEY UPDATE `desc_cn` = %s, `desc_en` = %s"
    )

    written = 0
    try:
        with connection.cursor() as cursor:
            cursor.execute("SHOW COLUMNS FROM `%s`" % DB_TABLE)
            columns = {row[0].lower() for row in cursor.fetchall()}
            missing = {"id", "desc_cn", "desc_en"} - columns
            if missing:
                print("表 %s 缺少字段：%s" % (DB_TABLE, "、".join(sorted(missing))))
                return 0

            for start in range(0, len(records), batch_size):
                batch = records[start:start + batch_size]
                # 逐条 execute：PyMySQL 的 executemany 对带重复占位符的
                # ON DUPLICATE KEY UPDATE 语句支持不稳定，逐条执行更可靠。
                for record_id, desc_cn, desc_en in batch:
                    cursor.execute(
                        sql,
                        (record_id, desc_cn, desc_en, desc_cn, desc_en),
                    )
                connection.commit()
                written += len(batch)
                print("  已写入 %d/%d 条" % (written, len(records)))
    except pymysql.MySQLError as exc:
        connection.rollback()
        print("写入失败：%s" % exc)
        return 0
    finally:
        connection.close()

    return written


def main():
    configure_stdout()
    args = parse_args()
    directory = Path(args.dir)

    print("=" * 72)
    print("md Overview -> MySQL 导入")
    print("目录：%s" % directory)
    print("=" * 72)

    if not directory.is_dir():
        print("目录不存在：%s" % directory)
        return 1

    paths = sorted(directory.glob("*.md"))
    if not paths:
        print("目录下没有 .md 文件")
        return 1

    print("找到 %d 个 md 文件" % len(paths))
    warnings = []
    records = load_records(directory, args.limit, warnings)

    if warnings:
        print("警告 %d 条：" % len(warnings))
        for warning in warnings[:10]:
            print("  - " + warning)
        if len(warnings) > 10:
            print("  ... 其余 %d 条省略" % (len(warnings) - 10))

    print("可写入记录：%d 条" % len(records))
    if not records:
        print("没有可写入的数据")
        return 1

    if args.dry_run:
        for record_id, desc_cn, desc_en in records[:3]:
            print("-" * 72)
            print("id      : %s" % record_id)
            print("desc_cn : %s%s" % (desc_cn[:120], "..." if len(desc_cn) > 120 else ""))
            print("desc_en : %s%s" % (desc_en[:120], "..." if len(desc_en) > 120 else ""))
        print("-" * 72)
        print("dry-run：未写入数据库")
        return 0

    if not check_db_config():
        return 1

    written = write_to_mysql(records, max(1, args.batch_size))
    if written == 0:
        return 1

    print("=" * 72)
    print("完成：写入/更新 %d 条 -> %s.%s" % (written, DB_NAME, DB_TABLE))
    return 0


if __name__ == "__main__":
    sys.exit(main())
