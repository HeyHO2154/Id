package Main.User.ViewFeed;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewFeedRepository extends JpaRepository<ViewFeed, Long> {
    // 특정 피드의 총 조회수 조회
    @Query("SELECT COUNT(v) FROM ViewFeed v WHERE v.feedId = :feedId")
    int countByFeedId(@Param("feedId") String feedId);

    // 특정 유저가 특정 피드를 조회했는지 확인
    boolean existsByUserIdAndFeedId(String userId, String feedId);
} 