package Main.User.LikeBong;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LikeBongRepository extends JpaRepository<LikeBong, Long> {
    Optional<LikeBong> findByUserIdAndBongId(String userId, String bongId);
}
