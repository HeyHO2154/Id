package Main.User.LikeFeed;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "LikeFeed")
public class LikeFeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가 ID
    private Long likeFeedId;

    @Column(name = "UserID", nullable = false)
    private String userId;

    @Column(name = "FeedID", nullable = false)
    private String feedId;

    @Column(name = "selection_status", nullable = false)
    private int selectionStatus; // 비트마스크 사용

    public LikeFeed() {} // 기본 생성자 필수

    public LikeFeed(String userId, String feedId, int selectionStatus) {
        this.userId = userId;
        this.feedId = feedId;
        this.selectionStatus = selectionStatus;
    }

    // Getter & Setter
    public Long getLikeFeedId() {
        return likeFeedId;
    }

    public String getUserId() {
        return userId;
    }

    public String getFeedId() {
        return feedId;
    }

    public int getSelectionStatus() {
        return selectionStatus;
    }

    public void setSelectionStatus(int selectionStatus) {
        this.selectionStatus = selectionStatus;
    }
}
