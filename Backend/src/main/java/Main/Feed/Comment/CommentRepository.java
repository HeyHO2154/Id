package Main.Feed.Comment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByFeedId(String feedId); // ✅ 특정 피드의 댓글 목록 조회
}
