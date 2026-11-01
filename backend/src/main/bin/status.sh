#!/usr/bin/env bash
#
# Humeta 运行状态查询。任意工作目录下执行结果一致：
#   ./bin/status.sh   |   cd bin && ./status.sh   |   sh status.sh
#

if [ -z "${BASH_VERSION:-}" ]; then
    exec bash "$0" "$@"
fi

# ---------------------------------------------------------------------------
# 解析脚本真实所在目录（跟随软链接），再取上一级作为应用根目录
# ---------------------------------------------------------------------------
SCRIPT_SOURCE="${BASH_SOURCE[0]:-$0}"
while [ -L "$SCRIPT_SOURCE" ]; do
    LINK_DIR="$(cd -P "$(dirname "$SCRIPT_SOURCE")" >/dev/null 2>&1 && pwd)"
    SCRIPT_SOURCE="$(readlink "$SCRIPT_SOURCE")"
    case "$SCRIPT_SOURCE" in
        /*) ;;
        *) SCRIPT_SOURCE="$LINK_DIR/$SCRIPT_SOURCE" ;;
    esac
done
SCRIPT_DIR="$(cd -P "$(dirname "$SCRIPT_SOURCE")" >/dev/null 2>&1 && pwd)"

if [ -z "$SCRIPT_DIR" ]; then
    echo "Error: unable to resolve the script directory (invoked as: $0)" >&2
    exit 1
fi

LI_HOME="$(cd -P "$SCRIPT_DIR/.." >/dev/null 2>&1 && pwd)"
PID_FILE="$LI_HOME/logs/humeta.pid"
LOG_FILE="$LI_HOME/logs/humeta.log"

echo "HUMETA Application Status"
echo "======================"

# 检查 PID 文件是否存在
if [ ! -f "$PID_FILE" ]; then
    echo "Status: NOT RUNNING (no PID file found)"
    echo "PID file: $PID_FILE"
    exit 1
fi

# 读取并校验进程ID
APP_PID="$(cat "$PID_FILE" 2>/dev/null)"
case "$APP_PID" in
    ''|*[!0-9]*)
        echo "Status: NOT RUNNING (invalid PID in $PID_FILE)"
        rm -f "$PID_FILE"
        exit 1
        ;;
esac

echo "PID file: $PID_FILE"
echo "Process ID: $APP_PID"

# 检查进程是否存在
if kill -0 "$APP_PID" 2>/dev/null; then
    echo "Status: RUNNING"

    # 显示进程信息
    echo ""
    echo "Process Information:"
    ps -p "$APP_PID" -o pid,ppid,cmd,etime,pcpu,pmem 2>/dev/null || echo "Unable to get process details"

    # 显示最近的日志
    if [ -f "$LOG_FILE" ]; then
        echo ""
        echo "Recent logs (last 10 lines):"
        echo "----------------------------"
        tail -n 10 "$LOG_FILE"
        echo ""
        echo "To view full logs: tail -f $LOG_FILE"
    fi
    exit 0
else
    echo "Status: NOT RUNNING (process not found)"
    echo "Cleaning up stale PID file..."
    rm -f "$PID_FILE"
    exit 1
fi
