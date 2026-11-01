package redburning.github.io.humeta.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SpringMvcConfig implements WebMvcConfigurer {

    /**
     * 允许跨域访问 /api/** 的来源，逗号分隔。
     *
     * <p>浏览器对 POST 请求即使是同源也会带 Origin 头，Spring 的 CORS 拦截器
     * 会按此白名单校验；不在名单内直接返回 403 “Invalid CORS request”。
     * 因此本地开发地址和线上域名都要列出来。</p>
     */
    @Value("${humeta.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173,https://humeta.org.cn,https://www.humeta.org.cn}")
    private String allowedOrigins;

	@Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
    }

    /**
     * 本地开发与线上域名都列入白名单，避免同源 POST 带 Origin 时被拒。
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);

        if (origins.length == 0) {
            return;
        }

        registry.addMapping("/api/**")
                .allowedOrigins(origins)
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
