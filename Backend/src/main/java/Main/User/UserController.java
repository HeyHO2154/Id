package Main.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@CrossOrigin(
    origins = "${Front_URL}",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE},
    allowCredentials = "true"
)
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService userService;

    // LoginRequest를 내부 클래스로 정의
    private static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // 필수 필드 검증
            if (user.getEmail() == null || user.getPassword() == null || 
                user.getName() == null || user.getNickname() == null) {
                return new ResponseEntity<>("필수 정보가 누락되었습니다.", HttpStatus.BAD_REQUEST);
            }

            // 이메일을 ID로 사용
            user.setId(user.getEmail());
            
            User savedUser = userService.registerUser(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("회원가입 처리 중 오류가 발생했습니다: " + e.getMessage(), 
                                     HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // 입력값 검증
            if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
                return new ResponseEntity<>("이메일과 비밀번호를 입력해주세요.", HttpStatus.BAD_REQUEST);
            }

            User user = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("로그인 처리 중 오류가 발생했습니다.", 
                                     HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/request-verification")
    public ResponseEntity<?> requestVerification(@RequestBody FindAccountRequest request) {
        try {
            userService.sendVerificationCodeForPasswordReset(request.getEmail());
            return new ResponseEntity<>("인증번호가 이메일로 전송되었습니다.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // 회원가입용 이메일 인증 엔드포인트 추가
    @PostMapping("/request-verification/register")
    public ResponseEntity<?> requestVerificationForRegister(@RequestBody FindAccountRequest request) {
        try {
            userService.sendVerificationCodeForRegistration(request.getEmail());
            return new ResponseEntity<>("인증번호가 이메일로 전송되었습니다.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyRequest request) {
        try {
            userService.verifyCode(request.getEmail(), request.getCode());
            return new ResponseEntity<>("인증이 완료되었습니다.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/verify-and-reset")
    public ResponseEntity<?> verifyAndResetPassword(@RequestBody VerifyRequest request) {
        try {
            User user = userService.verifyAndResetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // 작성한 봉사 공고 조회
    @GetMapping("/my-bongs")
    public ResponseEntity<?> getMyBongs(@RequestParam String userId) {
        try {
            return ResponseEntity.ok(userService.getWrittenBongs(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("작성한 봉사 공고 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 좋아요/신청한 봉사 공고 조회
    @GetMapping("/liked-bongs")
    public ResponseEntity<?> getLikedBongs(@RequestParam String userId) {
        try {
            return ResponseEntity.ok(userService.getLikedBongs(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("좋아요한 봉사 공고 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 작성한 피드 조회
    @GetMapping("/my-feeds")
    public ResponseEntity<?> getMyFeeds(@RequestParam String userId) {
        try {
            return ResponseEntity.ok(userService.getWrittenFeeds(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("작성한 피드 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 좋아요한 피드 조회
    @GetMapping("/liked-feeds")
    public ResponseEntity<?> getLikedFeeds(@RequestParam String userId) {
        try {
            return ResponseEntity.ok(userService.getLikedFeeds(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("좋아요한 피드 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    private static class FindAccountRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    private static class VerifyRequest {
        private String email;
        private String code;
        private String newPassword;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
