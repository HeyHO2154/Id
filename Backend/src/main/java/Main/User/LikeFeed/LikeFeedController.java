package Main.User.LikeFeed;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "${Front_URL}")
public class LikeFeedController {

    @Autowired
    private LikeFeedService likeFeedService;

    // ✅ 좋아요 추가 또는 취소
    @PostMapping("/like")
    public ResponseEntity<?> likeFeed(@RequestParam String userId, @RequestParam String feedId, @RequestParam int action) {
        LikeFeed likeFeed = likeFeedService.updateSelection(userId, feedId, action);
        return ResponseEntity.ok("{\"likeFeed\": " + likeFeed + "}");
    }

    // ✅ 특정 사용자가 해당 피드에 좋아요를 눌렀는지 확인
    @GetMapping("/like-status")
    public ResponseEntity<?> checkLikeStatus(@RequestParam String userId, @RequestParam String feedId) {
        boolean isLiked = likeFeedService.isUserLikedFeed(userId, feedId);
        return ResponseEntity.ok().body("{\"isLiked\": " + isLiked + "}");
    }
}
