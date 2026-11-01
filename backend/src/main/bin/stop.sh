#!/usr/bin/env bash
#
# Humeta 停止脚本。任意工作目录下执行结果一致：
#   ./bin/stop.sh   |   cd bin && ./stop.sh   |   sh stop.sh
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

# 检查 PID 文件是否存在
if [ ! -f "$PID_FILE" ]; then
    echo "PID file not found: $PID_FILE"
    echo "Application may not be running, or was not started with start.sh"
    exit 1
fi

# 读取并校验进程ID
APP_PID="$(cat "$PID_FILE" 2>/dev/null)"
case "$APP_PID" in
    ''|*[!0-9]*)
        echo "Invalid PID in $PID_FILE: $APP_PID"
        rm -f "$PID_FILE"
        exit 1
        ;;
esac

# 检查进程是否存在
if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "Process $APP_PID is not running"
    rm -f "$PID_FILE"
    exit 1
fi

echo "Stopping HUMETA application (PID: $APP_PID)..."

# 尝试优雅关闭
kill "$APP_PID" 2>/dev/null

# 等待进程结束（POSIX 循环，sh/dash 下也不会出错）
i=1
while [ "$i" -le 30 ]; do
    if ! kill -0 "$APP_PID" 2>/dev/null; then
        echo "Application stopped successfully"
        rm -f "$PID_FILE"
        exit 0
    fi
    echo "Waiting for application to stop... ($i/30)"
    sleep 1
    i=$((i + 1))
done

# 优雅关闭失败则强制终止
echo "Application did not stop gracefully, forcing termination..."
kill -9 "$APP_PID" 2>/dev/null
sleep 1

if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "Application forcefully terminated"
    rm -f "$PID_FILE"
    exit 0
else
    echo "Failed to stop application (PID: $APP_PID)"
    exit 1
fi
