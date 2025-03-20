package Main.Feed.Comment;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Comment")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ✅ 자동 증가 ID
    private Long commentId;

    @Column(name = "FeedID", nullable = false)
    private String feedId;

    @Column(name = "UserID", nullable = false)
    private String userId;

    @Column(name = "nickname", nullable = true) // ✅ 닉네임 추가 (nullable 허용)
    private String nickname;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Comment() {} // 기본 생성자 필수

    public Comment(String feedId, String userId, String nickname, String content) {
        this.feedId = feedId;
        this.userId = userId;
        this.nickname = nickname;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    // ✅ Getter & Setter
    public Long getCommentId() {
        return commentId;
    }

    public String getFeedId() {
        return feedId;
    }

    public String getUserId() {
        return userId;
    }

    public String getNickname() {
        return nickname;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
}
