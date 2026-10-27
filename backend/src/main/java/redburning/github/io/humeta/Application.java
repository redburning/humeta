package redburning.github.io.humeta;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;


@SpringBootApplication
@EnableAsync(proxyTargetClass = true)
@ComponentScan(basePackages = {"redburning.github.io.humeta"})
public class Application {

	private static final Logger logger = LoggerFactory.getLogger(Application.class);
	
	private static final String APP_HOME = "humeta.home";
	
	private static String home;
	
	/**
	 * 应用主目录，用于解析 assets、conf 等相对路径。
	 * 未通过 -Dhumeta.home 指定时使用当前工作目录。
	 */
	public static synchronized String home() {
		if (home == null) {
			String configured = System.getProperty(APP_HOME);
			if (configured == null || configured.trim().isEmpty()) {
				logger.info("{} not pre-defined, using the <user.dir> path as the home path.", APP_HOME);
				configured = System.getProperty("user.dir");
			}
			home = new java.io.File(configured).getAbsolutePath();
			System.setProperty(APP_HOME, home);
		}
		return home;
	}
	
	public static void main(String[] args) {
		home();
		SpringApplication.run(Application.class, args);
	}
}
