@echo off
setlocal
chcp 65001 >nul 2>&1

rem ---------------------------------------------------------------------------
rem Resolve the application home from this script's own location
rem (%~dp0 always ends with a backslash), so the script works from any cwd.
rem ---------------------------------------------------------------------------
for %%I in ("%~dp0..") do set "LI_HOME=%%~fI"
set "LIB_DIR=%LI_HOME%\lib"
set "CONF_DIR=%LI_HOME%\conf"
set "JNA_TMP_DIR=%LI_HOME%\tmp"
set "MEM=500m"

rem Locate the runnable jar (must exist, otherwise the literal wildcard would
rem have been used as the jar path)
set "JAR_FILE="
for %%f in ("%LIB_DIR%\humeta-*.jar") do (
    if exist "%%~f" if not defined JAR_FILE set "JAR_FILE=%%~f"
)

if not defined JAR_FILE (
    echo Error: no humeta-*.jar found in %LIB_DIR%
    echo        application home resolved to: %LI_HOME%
    pause
    exit /b 1
)

if not exist "%JNA_TMP_DIR%" mkdir "%JNA_TMP_DIR%"

rem The JVM working directory must be the application home, otherwise relative
rem paths such as file:./assets/ would be resolved against the wrong directory.
pushd "%LI_HOME%"

echo Starting HUMETA application...
echo Home     : %LI_HOME%
echo JAR file : %JAR_FILE%
echo.
echo Press Ctrl+C or close this window to stop the application.

rem conf\application.properties overrides the copy packaged inside the jar
java -Xms%MEM% -Xmx%MEM% -Dfile.encoding=UTF-8 -Djna.tmpdir="%JNA_TMP_DIR%" -Dhumeta.home="%LI_HOME%" "-Dspring.config.additional-location=optional:file:./conf/" -jar "%JAR_FILE%"

set "EXIT_CODE=%ERRORLEVEL%"

popd
endlocal & exit /b %EXIT_CODE%
