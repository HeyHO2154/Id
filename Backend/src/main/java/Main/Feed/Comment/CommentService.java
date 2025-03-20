package Main.Feed.Comment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    // ✅ 댓글 추가 (닉네임 포함)
    public Comment addComment(String feedId, String userId, String nickname, String content) {
        Comment comment = new Comment(feedId, userId, nickname, content);
        return commentRepository.save(comment);
    }

    // ✅ 특정 피드의 모든 댓글 가져오기
    public List<Comment> getCommentsByFeed(String feedId) {
        return commentRepository.findByFeedId(feedId);
    }

    // ✅ 댓글 삭제 (작성자만 삭제 가능)
    public boolean deleteComment(Long commentId, String userId) {
        return commentRepository.findById(commentId).map(comment -> {
            if (comment.getUserId().equals(userId)) {
                commentRepository.delete(comment);
                return true;
            }
            return false;
        }).orElse(false);
    }
}
