package com.fitness.gateway;


import com.fitness.gateway.user.RegisterRequest;
import com.fitness.gateway.user.UserService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
@Component
@Slf4j
@RequiredArgsConstructor
public class KeycloakUserSyncFilter implements WebFilter {
    private final UserService userService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-ID");

        // Chỉ thực hiện logic đồng bộ nếu request có Token
        if (token != null) {
            RegisterRequest registerRequest = getUserDetails(token);

            // Đảm bảo bóc tách JWT thành công
            if (registerRequest != null) {

                if (userId == null) {
                    userId = registerRequest.getKeycloakId();
                }

                if (userId != null) {
                    String finalUserId = userId;
                    return userService.validateUser(userId)
                            .flatMap(exist -> {
                                if (!exist) {
                                    // Đăng ký User mới
                                    return userService.registerUser(registerRequest)
                                            .then(Mono.empty());
                                } else {
                                    log.info("User already exist, Skipping sync.");
                                    return Mono.empty();
                                }
                            })
                            .then(Mono.defer(() -> {
                                // Gắn header X-User-ID để request đi tiếp
                                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                        .header("X-User-ID", finalUserId)
                                        .build();
                                return chain.filter(exchange.mutate().request(mutatedRequest).build());
                            }));
                }
            }
        }

        // Nếu không có Token (hoặc token lỗi), cứ cho Request đi tiếp
        // (Spring Security sẽ tự chặn lại nếu API đó yêu cầu bảo mật)
        return chain.filter(exchange);
    }

    private RegisterRequest getUserDetails(String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "").trim();
            SignedJWT signedJWT = SignedJWT.parse(tokenWithoutBearer);
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(claims.getStringClaim("email"));
            registerRequest.setKeycloakId(claims.getStringClaim("sub"));
            registerRequest.setPassword("dummy@123123");
            registerRequest.setFirstName(claims.getStringClaim("given_name"));
            registerRequest.setLastName(claims.getStringClaim("family_name"));
            return registerRequest;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
