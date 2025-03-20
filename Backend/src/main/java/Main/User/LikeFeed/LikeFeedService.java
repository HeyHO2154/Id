package Main.User.LikeFeed;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import Main.Feed.Feed;
import Main.Feed.FeedRepository;

@Service
public class LikeFeedService {

    @Autowired
    private LikeFeedRepository likeFeedRepository;
    @Autowired
    private FeedRepository feedRepository;

    public LikeFeed updateSelection(String userId, String feedId, int action) {
        Optional<LikeFeed> existingLike = likeFeedRepository.findByUserIdAndFeedId(userId, feedId);
        LikeFeed likeFeed;
        int likesChange = 0; // ✅ 좋아요 개수 변화 저장 변수

        if (existingLike.isPresent()) {
            likeFeed = existingLike.get();
            if (action == 0) {
                // ✅ 좋아요 취소 (DB에서 삭제)
                likeFeedRepository.delete(likeFeed);
                likesChange = -1; // ✅ 좋아요 감소
                likeFeed = null; // ✅ 좋아요 객체 제거 (하지만 아래 코드 실행 후 반환)
            } else {
                // ✅ 기존 좋아요 상태 업데이트
                likeFeed.setSelectionStatus(action);
                likeFeedRepository.save(likeFeed);
            }
        } else {
            if (action == 0) return null; // ✅ 이미 좋아요가 없는 상태에서 취소 요청이면 무시
            likeFeed = new LikeFeed(userId, feedId, action);
            likeFeedRepository.save(likeFeed);
            likesChange = 1; // ✅ 좋아요 추가
        }

        // ✅ 좋아요 개수 업데이트 (삭제된 경우에도 실행되도록 `return null;`을 뒤로 미룸)
        Optional<Feed> optionalFeed = feedRepository.findById(feedId);
        if (optionalFeed.isPresent()) {
            Feed feed = optionalFeed.get();
            int updatedLikes = Math.max(0, feed.getLikes() + likesChange); // ✅ 최소 0 유지
            feed.setLikes(updatedLikes);
            feedRepository.save(feed);
        }

        return likeFeed; // ✅ 좋아요 삭제된 경우에도 `likes`가 업데이트된 후 null 반환
    }


    // ✅ 사용자가 특정 피드에 좋아요를 눌렀는지 확인
    public boolean isUserLikedFeed(String userId, String feedId) {
        return likeFeedRepository.findByUserIdAndFeedId(userId, feedId).isPresent();
    }
}
