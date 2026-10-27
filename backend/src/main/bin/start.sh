#!/bin/bash

# 设置基本路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LI_HOME="$(dirname "$SCRIPT_DIR")/"
LB_CONF_PATH="${LI_HOME}conf/application.properties"
JNA_TMP_DIR="${LI_HOME}tmp/"
MEM="500m"

# 查找 jar 文件
BFC_RUNNER=""
for jar_file in "${LI_HOME}lib"/smol-*.jar; do
    if [[ -f "$jar_file" ]]; then
        BFC_RUNNER="$jar_file"
        break
    fi
done

# 检查文件是否存在
if [[ -z "$BFC_RUNNER" ]]; then
    echo "Error: No smol-*.jar file found in ${LI_HOME}lib/"
    exit 1
fi

# 确保临时目录和日志目录存在
mkdir -p "$JNA_TMP_DIR"
mkdir -p "${LI_HOME}logs"

# 设置日志文件路径
LOG_FILE="${LI_HOME}logs/smol.log"
PID_FILE="${LI_HOME}logs/smol.pid"

echo "Starting SMOL application in background..."
echo "JAR file: $BFC_RUNNER"
echo "Log file: $LOG_FILE"
echo "PID file: $PID_FILE"

# 以 nohup 方式启动应用程序，重定向输出到日志文件
nohup java -Xms"$MEM" -Xmx"$MEM" -Djna.tmpdir="$JNA_TMP_DIR" -Dsmol.home="$LI_HOME" -jar "$BFC_RUNNER" > "$LOG_FILE" 2>&1 &

# 获取进程ID并保存到文件
APP_PID=$!
echo $APP_PID > "$PID_FILE"

echo "Application started successfully!"
echo "Process ID: $APP_PID"
echo "To view logs: tail -f $LOG_FILE"
echo "To stop application: kill $APP_PID or use stop.sh"
