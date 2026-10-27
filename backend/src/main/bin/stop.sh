#!/bin/bash

# 获取脚本所在目录的上级目录作为主目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LI_HOME="$(dirname "$SCRIPT_DIR")/"
PID_FILE="${LI_HOME}logs/smol.pid"

# 检查 PID 文件是否存在
if [[ ! -f "$PID_FILE" ]]; then
    echo "PID file not found: $PID_FILE"
    echo "Application may not be running or was not started with start.sh"
    exit 1
fi

# 读取进程ID
APP_PID=$(cat "$PID_FILE")

# 检查进程是否存在
if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "Process $APP_PID is not running"
    rm -f "$PID_FILE"
    exit 1
fi

echo "Stopping SMOL application (PID: $APP_PID)..."

# 尝试优雅关闭
kill "$APP_PID"

# 等待进程结束
for i in {1..30}; do
    if ! kill -0 "$APP_PID" 2>/dev/null; then
        echo "Application stopped successfully"
        rm -f "$PID_FILE"
        exit 0
    fi
    echo "Waiting for application to stop... ($i/30)"
    sleep 1
done

# 如果优雅关闭失败，强制终止
echo "Application did not stop gracefully, forcing termination..."
kill -9 "$APP_PID" 2>/dev/null

# 再次检查
if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "Application forcefully terminated"
    rm -f "$PID_FILE"
    exit 0
else
    echo "Failed to stop application"
    exit 1
fi
