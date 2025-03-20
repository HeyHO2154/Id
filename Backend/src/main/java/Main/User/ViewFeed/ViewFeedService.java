package Main.User.ViewFeed;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ViewFeedService {
    
    @Autowired
    private ViewFeedRepository viewFeedRepository;

    // 조회 기록 추가
    public void addView(String userId, String feedId) {
        // 이미 조회한 기록이 있는지 확인
        if (!viewFeedRepository.existsByUserIdAndFeedId(userId, feedId)) {
            ViewFeed viewFeed = new ViewFeed();
            viewFeed.setUserId(userId);
            viewFeed.setFeedId(feedId);
            viewFeedRepository.save(viewFeed);
        }
    }

    // 특정 피드의 총 조회수 조회
    public int getViewCount(String feedId) {
        return viewFeedRepository.countByFeedId(feedId);
    }
} 