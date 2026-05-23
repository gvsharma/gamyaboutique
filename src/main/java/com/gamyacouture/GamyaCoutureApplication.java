package com.gamyacouture;

import com.gamyacouture.shared.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EntityScan(basePackages = "com.gamyacouture")
@EnableConfigurationProperties(JwtProperties.class)
public class GamyaCoutureApplication {

    public static void main(String[] args) {
        SpringApplication.run(GamyaCoutureApplication.class, args);
    }
}
