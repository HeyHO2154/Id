package Main.User;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${Front_URL}")
public class KakaoAuthController {
	
	@Autowired
    private UserRepository userRepository;

    @PostMapping("/kakao/callback")
    public ResponseEntity<?> handleKakaoCallback(@RequestBody Map<String, String> requestBody) {
        String code = requestBody.get("code");
        String state = requestBody.get("state");
        
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing or invalid 'code' parameter");
        }

        // 액세스 토큰 요청
        String accessToken = getAccessToken(code);
        // 사용자 정보 요청
        User userInfo = getUserInfo(accessToken);
        
        // 사용자 정보를 User 엔티티로 변환 후 저장
        User user = new User();
        user.setId(userInfo.getId());
        user.setNickname(userInfo.getNickname());
        user.setEmail(userInfo.getEmail());
        user.setToken(accessToken);
        // DB에 저장 (이미 존재하면 덮어쓰지 않도록 체크)
        if (!userRepository.existsById(user.getId())) {
            userRepository.save(user);
        }
        
//        //카카오 연동 해제(임시)
//        boolean isUnlinked = unlinkFromKakao(accessToken);
//        if (!isUnlinked) {
//            System.out.println("실패");
//        }else {
//        	System.out.println("성공");
//        }

        return ResponseEntity.ok(userInfo); // 사용자 정보 반환
    }
    
    private String getAccessToken(String code) {
        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        // 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 요청 파라미터 설정
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", "aa593063067708935c526eedf855bc6e"); // 카카오 REST API 키
        params.add("redirect_uri", "https://praven.kro.kr/auth/callback/kakao");
        params.add("code", code);

        // HTTP 요청 보내기
        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        Map<String, Object> response = restTemplate.postForObject(tokenUrl, request, Map.class);
        if (response != null && response.containsKey("access_token")) {
            return response.get("access_token").toString();
        } else {
            throw new RuntimeException("Failed to retrieve access token");
        }
    }
    
    private User getUserInfo(String accessToken) {
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        // 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        // HTTP 요청 보내기
        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<Void> request = new HttpEntity<>(headers);

        Map<String, Object> response = restTemplate.postForObject(userInfoUrl, request, Map.class);
        if (response != null) {
            User user = new User();
            user.setId(response.get("id").toString());

            Map<String, Object> kakaoAccount = (Map<String, Object>) response.get("kakao_account");
            if (kakaoAccount != null) {
                user.setEmail((String) kakaoAccount.get("email"));
                user.setGender((String) kakaoAccount.get("gender"));
                user.setAgeRange((String) kakaoAccount.get("age_range"));
                user.setBirthday((String) kakaoAccount.get("birthday"));
            }

            Map<String, Object> properties = (Map<String, Object>) response.get("properties");
            if (properties != null) {
                user.setNickname((String) properties.get("nickname"));
                user.setProfileImage((String) properties.get("profile_image"));
            }

            return user;
        } else {
            throw new RuntimeException("Failed to retrieve user info");
        }
    }
    
    //카카오 연동해제
    private boolean unlinkFromKakao(String accessToken) {
        String unlinkUrl = "https://kapi.kakao.com/v1/user/unlink";

        // 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        // HTTP 요청 보내기
        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            restTemplate.postForObject(unlinkUrl, request, String.class);
            return true; // 성공
        } catch (Exception e) {
            e.printStackTrace();
            return false; // 실패
        }
    }


}
