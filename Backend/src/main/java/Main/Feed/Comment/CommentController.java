package Main.Feed.Comment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "${Front_URL}")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // ✅ 댓글 작성 (닉네임 포함)
    @PostMapping("/comment")
    public ResponseEntity<?> addComment(@RequestBody Map<String, String> request) {
        String feedId = request.get("feedId");
        String userId = request.get("userId");
        String nickname = request.get("nickname"); // ✅ 닉네임 추가
        String content = request.get("content");

        if (feedId == null || userId == null || nickname == null || content == null) {
            return ResponseEntity.badRequest().body("필수 값이 누락되었습니다.");
        }

        Comment comment = commentService.addComment(feedId, userId, nickname, content);
        return ResponseEntity.ok(comment);
    }

    // ✅ 특정 피드의 모든 댓글 조회
    @GetMapping("/comments")
    public ResponseEntity<List<Comment>> getComments(@RequestParam String feedId) {
        return ResponseEntity.ok(commentService.getCommentsByFeed(feedId));
    }

    // ✅ 댓글 삭제
    @DeleteMapping("/comment")
    public ResponseEntity<?> deleteComment(@RequestParam Long commentId, @RequestParam String userId) {
        boolean deleted = commentService.deleteComment(commentId, userId);
        if (deleted) {
            return ResponseEntity.ok().body("댓글이 삭제되었습니다.");
        }
        return ResponseEntity.status(403).body("댓글을 삭제할 권한이 없습니다.");
    }
}
