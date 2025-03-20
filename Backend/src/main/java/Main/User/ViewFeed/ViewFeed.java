package Main.User.ViewFeed;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ViewFeed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long viewFeedID;
    
    private String userId;
    private String feedId;
	public String getFeedId() {
		return feedId;
	}
	public void setFeedId(String feedId) {
		this.feedId = feedId;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
} 