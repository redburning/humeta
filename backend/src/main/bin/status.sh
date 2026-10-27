#!/bin/bash

# 获取脚本所在目录的上级目录作为主目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LI_HOME="$(dirname "$SCRIPT_DIR")/"
PID_FILE="${LI_HOME}logs/smol.pid"
LOG_FILE="${LI_HOME}logs/smol.log"

echo "SMOL Application Status"
echo "======================"

# 检查 PID 文件是否存在
if [[ ! -f "$PID_FILE" ]]; then
    echo "Status: NOT RUNNING (no PID file found)"
    echo "PID file: $PID_FILE"
    exit 1
fi

# 读取进程ID
APP_PID=$(cat "$PID_FILE")
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
    if [[ -f "$LOG_FILE" ]]; then
        echo ""
        echo "Recent logs (last 10 lines):"
        echo "----------------------------"
        tail -n 10 "$LOG_FILE"
        echo ""
        echo "To view full logs: tail -f $LOG_FILE"
    fi
else
    echo "Status: NOT RUNNING (process not found)"
    echo "Cleaning up stale PID file..."
    rm -f "$PID_FILE"
    exit 1
fi
