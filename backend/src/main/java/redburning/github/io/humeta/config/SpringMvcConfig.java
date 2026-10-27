package redburning.github.io.humeta.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SpringMvcConfig implements WebMvcConfigurer {

	@Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
    }

    /**
     * 允许 Vite 开发服务器直接访问 /api/**（使用 Vite 代理时不是必需的，
     * 但便于前后端分开启动调试）。
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
	
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射 /assets/** 到多个位置，按顺序查找：
        // 1. 项目根目录的 assets/（数据文件：img、mol、db等）
        // 2. classpath 的 static/assets/（前端资源：bioactivity、fonts、image等）
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("file:./assets/", "classpath:/static/assets/");
    }
}
