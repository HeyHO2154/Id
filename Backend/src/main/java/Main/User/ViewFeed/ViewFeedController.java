package Main.User.ViewFeed;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feed/view")
@CrossOrigin(origins = "${Front_URL}")
public class ViewFeedController {

    @Autowired
    private ViewFeedService viewFeedService;

    // 조회 기록 추가
    @PostMapping("/{feedId}")
    public ResponseEntity<Void> addView(
            @PathVariable String feedId,
            @RequestParam String userId) {
        viewFeedService.addView(userId, feedId);
        return ResponseEntity.ok().build();
    }

    // 특정 피드의 총 조회수 조회
    @GetMapping("/{feedId}/count")
    public ResponseEntity<Integer> getViewCount(@PathVariable String feedId) {
        int viewCount = viewFeedService.getViewCount(feedId);
        return ResponseEntity.ok(viewCount);
    }
} 