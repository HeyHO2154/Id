package Main.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

import Main.Bong.Bong;
import Main.Feed.Feed;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender emailSender;

    // 인증번호 저장을 위한 임시 저장소 (실제로는 Redis 등을 사용하는 것이 좋습니다)
    private Map<String, VerificationData> verificationCodes = new ConcurrentHashMap<>();

    // 인증 정보를 담는 클래스
    private static class VerificationData {
        private String code;
        private LocalDateTime expireTime;
        private String newPassword;  // 사용자가 입력한 새 비밀번호

        public VerificationData(String code) {
            this.code = code;
            this.expireTime = LocalDateTime.now().plusMinutes(5); // 5분 유효
        }
    }

    public User registerUser(User user) {
        // 이메일 중복 체크
        if (userRepository.findById(user.getEmail()).isPresent()) {
            throw new RuntimeException("이미 등록된 이메일입니다.");
        }

        // ID를 이메일로 설정
        user.setId(user.getEmail());

        // 사용자 저장
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        // 이메일로 사용자 찾기 (이메일이 ID로 사용됨)
        User user = userRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다."));

        // 비밀번호 검증
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        // 민감한 정보 제거
        user.setPassword(null);  // 클라이언트에게 비밀번호 정보를 보내지 않음
        
        return user;
    }

    // 회원가입용 이메일 인증 메서드
    public void sendVerificationCodeForRegistration(String email) {
        // 이메일 중복 체크를 하지 않음
        String verificationCode = generateVerificationCode();
        verificationCodes.put(email, new VerificationData(verificationCode));
        sendVerificationEmail(email, verificationCode, true); // true: 회원가입용
    }

    // 비밀번호 재설정용 이메일 인증 메서드 (기존 메서드 수정)
    public void sendVerificationCodeForPasswordReset(String email) {
        User user = userRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("해당 이메일로 등록된 계정을 찾을 수 없습니다."));

        String verificationCode = generateVerificationCode();
        verificationCodes.put(email, new VerificationData(verificationCode));
        sendVerificationEmail(email, verificationCode, false); // false: 비밀번호 재설정용
    }

    private String generateVerificationCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }

    private void sendVerificationEmail(String email, String code, boolean isRegistration) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply@praven.kro.kr", "봉틈이");
            helper.setTo(email);
            
            if (isRegistration) {
                helper.setSubject("[봉틈이] 회원가입 인증번호");
                helper.setText("안녕하세요.\n\n"
                    + "회원가입을 위한 인증번호입니다: " + code + "\n\n"
                    + "인증번호는 5분간 유효합니다.\n\n"
                    + "감사합니다.");
            } else {
                helper.setSubject("[봉틈이] 비밀번호 재설정 인증번호");
                helper.setText("안녕하세요.\n\n"
                    + "비밀번호 재설정을 위한 인증번호입니다: " + code + "\n\n"
                    + "인증번호는 5분간 유효합니다.\n\n"
                    + "본인이 요청하지 않았다면 이 메일을 무시해주세요.\n\n"
                    + "감사합니다.");
            }
            
            emailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("이메일 전송에 실패했습니다: " + e.getMessage());
        }
    }

    public User verifyAndResetPassword(String email, String code, String newPassword) {
        VerificationData data = verificationCodes.get(email);
        if (data == null) {
            throw new RuntimeException("인증번호를 먼저 요청해주세요.");
        }

        if (LocalDateTime.now().isAfter(data.expireTime)) {
            verificationCodes.remove(email);
            throw new RuntimeException("인증번호가 만료되었습니다. 다시 요청해주세요.");
        }

        if (!data.code.equals(code)) {
            throw new RuntimeException("인증번호가 일치하지 않습니다.");
        }

        // 비밀번호 변경
        User user = userRepository.findById(email)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        user.setPassword(newPassword);
        userRepository.save(user);

        // 인증 정보 삭제
        verificationCodes.remove(email);

        // 로그인 처리를 위해 민감한 정보를 제거한 사용자 정보 반환
        user.setPassword(null);
        return user;
    }

    // 인증번호 확인만 하는 메서드 추가
    public void verifyCode(String email, String code) {
        VerificationData data = verificationCodes.get(email);
        if (data == null) {
            throw new RuntimeException("인증번호를 먼저 요청해주세요.");
        }

        if (LocalDateTime.now().isAfter(data.expireTime)) {
            verificationCodes.remove(email);
            throw new RuntimeException("인증번호가 만료되었습니다. 다시 요청해주세요.");
        }

        if (!data.code.equals(code)) {
            throw new RuntimeException("인증번호가 일치하지 않습니다.");
        }
    }

    // 작성한 봉사 공고 조회
    public List<Bong> getWrittenBongs(String userId) {
        return userRepository.findWrittenBongs(userId);
    }

    // 좋아요/신청한 봉사 공고 조회
    public List<Bong> getLikedBongs(String userId) {
        return userRepository.findLikedBongs(userId);
    }

    // 작성한 피드 조회
    public List<Feed> getWrittenFeeds(String userId) {
        return userRepository.findWrittenFeeds(userId);
    }

    // 좋아요한 피드 조회
    public List<Feed> getLikedFeeds(String userId) {
        return userRepository.findLikedFeeds(userId);
    }
}
