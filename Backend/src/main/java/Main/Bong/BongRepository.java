package Main.Bong;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BongRepository extends CrudRepository<Bong, String> {

	@Query(value = "SELECT * FROM Bong ORDER BY RAND() LIMIT 1", nativeQuery = true)
	Bong findRandomBong();

	@Query(value = "SELECT * FROM Bong ORDER BY RAND()", nativeQuery = true)
	List<Bong> findAllBong();

}
