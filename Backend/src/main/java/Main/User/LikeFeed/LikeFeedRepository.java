package Main.User.LikeFeed;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LikeFeedRepository extends JpaRepository<LikeFeed, Long> {
    Optional<LikeFeed> findByUserIdAndFeedId(String userId, String feedId);
}
