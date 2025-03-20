package Main.User;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/oauth")
@CrossOrigin(origins = "${Front_URL}")
public class TokenController {

	@Value("${oauth.kakao.client-id}")
    private String kakaoClientId;

    @Value("${oauth.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    @Value("${oauth.naver.client-id}")
    private String naverClientId;

    @Value("${oauth.naver.redirect-uri}")
    private String naverRedirectUri;

    @GetMapping("/kakao")
    public void redirectToKakao(HttpServletResponse response) throws IOException {
        String kakaoAuthUrl = "https://kauth.kakao.com/oauth/authorize?response_type=code"
                + "&client_id=" + kakaoClientId
                + "&redirect_uri=" + kakaoRedirectUri;
        response.sendRedirect(kakaoAuthUrl);
    }

    @GetMapping("/naver")
    public void redirectToNaver(HttpServletResponse response) throws IOException {
        String naverAuthUrl = "https://nid.naver.com/oauth2.0/authorize?response_type=code"
                + "&client_id=" + naverClientId
                + "&state=random_string"
                + "&redirect_uri=" + naverRedirectUri;
        response.sendRedirect(naverAuthUrl);
    }
}
