package Main.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Main.Bong.Bong;
import Main.Feed.Feed;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // userId로 nickname 조회
    @Query("SELECT u.nickname FROM User u WHERE u.id = :userId")
    String findNicknameById(@Param("userId") String userId);

    // 사용자가 작성한 봉사 공고 조회 (nickname으로 조회)
    @Query("SELECT b FROM Bong b WHERE b.nanmmbyNmAdmn = (SELECT u.nickname FROM User u WHERE u.id = :userId)")
    List<Bong> findWrittenBongs(@Param("userId") String userId);

    // 사용자가 좋아요/신청한 봉사 공고 조회
    @Query("SELECT b FROM Bong b WHERE b.progrmRegistNo IN " + "(SELECT lb.bongId FROM LikeBong lb WHERE lb.userId = :userId)")
    List<Bong> findLikedBongs(@Param("userId") String userId);

    // 사용자가 작성한 피드 조회 (nickname으로 조회)
    @Query("SELECT f FROM Feed f WHERE f.author = (SELECT u.nickname FROM User u WHERE u.id = :userId)")
    List<Feed> findWrittenFeeds(@Param("userId") String userId);

    // 사용자가 좋아요한 피드 조회
    @Query("SELECT f FROM Feed f WHERE f.feedID IN " + "(SELECT lf.feedId FROM LikeFeed lf WHERE lf.userId = :userId)")
    List<Feed> findLikedFeeds(@Param("userId") String userId);
}
