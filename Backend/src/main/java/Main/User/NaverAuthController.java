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
public class NaverAuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/naver/callback")
    public ResponseEntity<?> handleNaverCallback(@RequestBody Map<String, String> requestBody) {
        String code = requestBody.get("code");
        String state = requestBody.get("state");

        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing or invalid 'code' parameter");
        }

        // 1️⃣ 액세스 토큰 요청
        String accessToken = getNaverAccessToken(code, state);

        // 2️⃣ 사용자 정보 요청
        User userInfo = getNaverUserInfo(accessToken);

        // 3️⃣ 사용자 정보를 User 엔티티로 변환 후 저장
        User user = new User();
        user.setId(userInfo.getId());
        user.setNickname(userInfo.getNickname());
        user.setEmail(userInfo.getEmail());
        user.setToken(accessToken);

        // DB에 저장 (이미 존재하면 덮어쓰지 않도록 체크)
        if (!userRepository.existsById(user.getId())) {
            userRepository.save(user);
        }
  
        //네이버 연동 해제(임시)
//        boolean isUnlinked = unlinkFromNaver(accessToken);
//        if (isUnlinked) {
//            return ResponseEntity.ok("네이버 연동이 성공적으로 해제되었습니다.");
//        } else {
//            return ResponseEntity.status(500).body("네이버 연동 해제 실패");
//        }

        return ResponseEntity.ok(userInfo); // 사용자 정보 반환
    }

    // ✅ 1️⃣ 네이버에서 액세스 토큰 요청
    private String getNaverAccessToken(String code, String state) {
        String tokenUrl = "https://nid.naver.com/oauth2.0/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", "entZ4xGkP03kyHMWooKS"); // 네이버 Client ID
        params.add("client_secret", "UKKbQBF7fb"); // 네이버 Client Secret
        params.add("redirect_uri", "https://praven.kro.kr/auth/callback/naver"); // 네이버에 등록된 리디렉트 URI
        params.add("code", code);
        params.add("state", state);

        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("access_token")) {
                return response.getBody().get("access_token").toString();
            } else {
                throw new RuntimeException("네이버에서 액세스 토큰을 받지 못함. 응답: " + response.getBody());
            }
        } catch (Exception e) {
            throw new RuntimeException("네이버 액세스 토큰 요청 실패: " + e.getMessage(), e);
        }
    }

    // ✅ 2️⃣ 네이버 API에서 사용자 정보 요청
    private User getNaverUserInfo(String accessToken) {
        String userInfoUrl = "https://openapi.naver.com/v1/nid/me";

        // 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        // HTTP 요청 보내기
        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<Void> request = new HttpEntity<>(headers);

        Map<String, Object> response = restTemplate.postForObject(userInfoUrl, request, Map.class);
        if (response != null && response.containsKey("response")) {
            Map<String, Object> userResponse = (Map<String, Object>) response.get("response");

            User user = new User();
            user.setId(userResponse.get("id").toString());
            user.setEmail((String) userResponse.get("email"));
            user.setNickname((String) userResponse.get("nickname"));
            user.setName((String) userResponse.get("name"));
            user.setGender((String) userResponse.get("gender"));
            user.setBirthday((String) userResponse.get("birthday"));
            user.setProfileImage((String) userResponse.get("profile_image"));
            user.setMobile((String) userResponse.get("mobile"));
            return user;
        } else {
            throw new RuntimeException("Failed to retrieve user info");
        }
    }
    
 // ✅ 네이버 연동 해제 메서드 추가
    private boolean unlinkFromNaver(String accessToken) {
        String unlinkUrl = "https://nid.naver.com/oauth2.0/token";

        // 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 요청 파라미터 설정
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "delete");
        params.add("grant_type", "authorization_code");
        params.add("client_id", "entZ4xGkP03kyHMWooKS"); // 네이버 Client ID
        params.add("access_token", accessToken);
        params.add("service_provider", "NAVER");

        // HTTP 요청 보내기
        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(unlinkUrl, request, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("result") &&
                response.getBody().get("result").equals("success")) {
                return true; // 성공적으로 연동 해제됨
            } else {
                System.out.println("❌ 네이버 연동 해제 실패: " + response.getBody());
                return false;
            }
        } catch (Exception e) {
            System.out.println("❌ 네이버 연동 해제 중 오류 발생: " + e.getMessage());
            return false;
        }
    }

}
