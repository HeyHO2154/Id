package Main.User.LikeBong;

import jakarta.persistence.*;

@Entity
@Table(name = "LikeBong")
public class LikeBong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 🔥 자동 증가 ID
    private Long likeBongId;

    @Column(name = "UserID", nullable = false)
    private String userId;

    @Column(name = "BongID", nullable = false)
    private String bongId;

    @Column(name = "selection_status", nullable = false)
    private int selectionStatus; // 비트마스크

    public LikeBong() {} // 기본 생성자 필수

    public LikeBong(String userId, String bongId, int selectionStatus) {
        this.userId = userId;
        this.bongId = bongId;
        this.selectionStatus = selectionStatus;
    }

    // Getter & Setter
    public Long getLikeBongId() {
        return likeBongId;
    }

    public String getUserId() {
        return userId;
    }

    public String getBongId() {
        return bongId;
    }

    public int getSelectionStatus() {
        return selectionStatus;
    }

    public void setSelectionStatus(int selectionStatus) {
        this.selectionStatus = selectionStatus;
    }
}
