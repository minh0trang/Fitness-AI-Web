package com.fitness.userservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Disabled in local unit test phase without live PostgreSQL database")
class UserserviceApplicationTests {

    @Test
    void contextLoads() {
    }

}
