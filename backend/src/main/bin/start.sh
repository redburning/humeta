#!/usr/bin/env bash
#
# Humeta 启动脚本。
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
LIB_DIR="$LI_HOME/lib"
CONF_DIR="$LI_HOME/conf"
TMP_DIR="$LI_HOME/tmp"
LOG_DIR="$LI_HOME/logs"
LOG_FILE="$LOG_DIR/humeta.log"
PID_FILE="$LOG_DIR/humeta.pid"
MEM="${HUMETA_MEM:-500m}"

# ---------------------------------------------------------------------------
# 查找可执行 jar（忽略 sources/javadoc 包）
# ---------------------------------------------------------------------------
JAR_FILE=""
for candidate in "$LIB_DIR"/humeta-*.jar; do
    [ -f "$candidate" ] || continue
    case "$candidate" in
        *-sources.jar|*-javadoc.jar) continue ;;
    esac
    JAR_FILE="$candidate"
    break
done

if [ -z "$JAR_FILE" ]; then
    echo "Error: no humeta-*.jar found in $LIB_DIR" >&2
    echo "       application home resolved to: $LI_HOME" >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# 防止重复启动
# ---------------------------------------------------------------------------
if [ -f "$PID_FILE" ]; then
    RUNNING_PID="$(cat "$PID_FILE" 2>/dev/null)"
    if [ -n "$RUNNING_PID" ] && kill -0 "$RUNNING_PID" 2>/dev/null; then
        echo "Humeta is already running (PID: $RUNNING_PID). Run stop.sh first." >&2
        exit 1
    fi
    echo "Removing stale PID file: $PID_FILE"
    rm -f "$PID_FILE"
fi

mkdir -p "$TMP_DIR" "$LOG_DIR" || exit 1

# 关键：JVM 工作目录必须是应用根目录，否则 Spring 的 file:./assets/ 等相对路径会解析错
cd "$LI_HOME" || { echo "Error: cannot cd to $LI_HOME" >&2; exit 1; }

echo "Starting HUMETA application in background..."
echo "Home     : $LI_HOME"
echo "JAR file : $JAR_FILE"
echo "Log file : $LOG_FILE"
echo "PID file : $PID_FILE"

# conf/ 里的 application.properties 作为外部配置覆盖 jar 内打包的那份
nohup java \
    -Xms"$MEM" -Xmx"$MEM" \
    -Dfile.encoding=UTF-8 \
    -Djna.tmpdir="$TMP_DIR" \
    -Dhumeta.home="$LI_HOME" \
    "-Dspring.config.additional-location=optional:file:$CONF_DIR/" \
    -jar "$JAR_FILE" >> "$LOG_FILE" 2>&1 &

APP_PID=$!
echo "$APP_PID" > "$PID_FILE"

# 等两秒确认没有立刻退出，避免"看起来启动成功实际已经挂了"
sleep 2
if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "Error: process exited right after start. Last log lines:" >&2
    tail -n 20 "$LOG_FILE" >&2 2>/dev/null
    rm -f "$PID_FILE"
    exit 1
fi

echo "Application started successfully!"
echo "Process ID: $APP_PID"
echo "To view logs       : tail -f $LOG_FILE"
echo "To stop application: $SCRIPT_DIR/stop.sh"
