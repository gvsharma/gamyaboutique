package com.gamyacouture;

import com.gamyacouture.shared.config.JwtProperties;
import com.gamyacouture.shared.config.MailProperties;
import com.gamyacouture.shared.config.S3StorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
@SpringBootApplication
@EntityScan(basePackages = "com.gamyacouture")
@EnableConfigurationProperties({JwtProperties.class, S3StorageProperties.class, MailProperties.class})
public class GamyaCoutureApplication {

    public static void main(String[] args) {
        SpringApplication.run(GamyaCoutureApplication.class, args);
    }
}
