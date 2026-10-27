@echo off
chcp 65001 >nul 2>&1

:: 设置基本路径
set "SCRIPT_DIR=%~dp0"
set "LI_HOME=%SCRIPT_DIR%..\"
set "LB_CONF_PATH=%LI_HOME%conf\application.properties"
set "JNA_TMP_DIR=%LI_HOME%tmp\"
set "MEM=500m"

:: 查找 jar 文件
set "BFC_RUNNER="
for %%f in ("%LI_HOME%lib\smol-*.jar") do (
    set "BFC_RUNNER=%%f"
    goto :found
)

:: 检查文件是否存在
echo Error: No smol-*.jar file found in %LI_HOME%lib\
pause
exit /b 1

:found
:: 确保临时目录存在
if not exist "%JNA_TMP_DIR%" mkdir "%JNA_TMP_DIR%"

:: 切换到应用程序根目录（确保相对路径 file:./assets/ 正确解析）
pushd "%LI_HOME%"

echo Starting SMOL application...
echo JAR file: %BFC_RUNNER%
echo.

:: 前台运行，日志输出到控制台，关闭窗口即可停止
java -Xms%MEM% -Xmx%MEM% -Djna.tmpdir="%JNA_TMP_DIR%" -Dsmol.home="%LI_HOME%" -jar "%BFC_RUNNER%"

popd 