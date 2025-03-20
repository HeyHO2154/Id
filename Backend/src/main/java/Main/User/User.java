package Main.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "User") //
public class User {

    @Id
    @Column(length = 100, nullable = false, unique = true)
    private String id; // OAuth에서 제공하는 고유 ID
    
    private String Token; // OAuth 토큰

    @Column(length = 100)
    private String nickname; // 사용자 닉네임

    @Column(columnDefinition = "TEXT")
    private String profileImage; // 프로필 이미지 URL

    @Column(length = 10, nullable = true)
    private String ageRange; // 연령대 (예: "20-29")

    @Column(length = 1, nullable = true)
    private String gender; // 성별 (M: 남성, F: 여성, U: 기타)

    @Column(length = 255)
    private String email; // 이메일 (중복 방지)

    @Column(length = 20, nullable = true)
    private String mobile; // 휴대폰 번호

    @Column(length = 20, nullable = true)
    private String mobileE164; // 국제 표준화된 휴대폰 번호 (+82)

    @Column(length = 100, nullable = true)
    private String name; // 실명

    @Column(length = 10, nullable = true)
    private String birthday; // 생일 (월-일, 예: "10-13")

    @Column(length = 4, nullable = true)
    private String birthyear; // 태어난 연도 (예: "1997")

    @Column(length = 255, nullable = true)
    private String password; // 비밀번호 필드 추가

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	public String getProfileImage() {
		return profileImage;
	}

	public void setProfileImage(String profileImage) {
		this.profileImage = profileImage;
	}

	public String getAgeRange() {
		return ageRange;
	}

	public void setAgeRange(String ageRange) {
		this.ageRange = ageRange;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}

	public String getMobileE164() {
		return mobileE164;
	}

	public void setMobileE164(String mobileE164) {
		this.mobileE164 = mobileE164;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getBirthday() {
		return birthday;
	}

	public void setBirthday(String birthday) {
		this.birthday = birthday;
	}

	public String getBirthyear() {
		return birthyear;
	}

	public void setBirthyear(String birthyear) {
		this.birthyear = birthyear;
	}

	public String getToken() {
		return Token;
	}

	public void setToken(String token) {
		Token = token;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
    
    // 내부 클래스로 LoginRequest 정의
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
