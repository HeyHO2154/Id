package Main.Feed;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedRepository extends JpaRepository<Feed, String> {

	@Query(value = "SELECT * FROM Feed ORDER BY RAND() LIMIT 1", nativeQuery = true)
	Feed findRandomFeed();
	
	@Query(value = "SELECT * FROM Feed ORDER BY created_at DESC", nativeQuery = true)
	List<Feed> findAllFeed();

	// 카테고리별 피드 조회 추가
	@Query(value = "SELECT * FROM Feed WHERE category = :category ORDER BY created_at DESC", nativeQuery = true)
	List<Feed> findByCategory(int category);
}
