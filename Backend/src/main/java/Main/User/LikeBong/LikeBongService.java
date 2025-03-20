package Main.User.LikeBong;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikeBongService {
	
	@Autowired
    private LikeBongRepository likeBongRepository;

	// ✅ 단순히 새로운 값으로 덮어씌우거나, 새로 생성
    public LikeBong updateSelection(String userId, String bongId, int action) {
        Optional<LikeBong> existingLike = likeBongRepository.findByUserIdAndBongId(userId, bongId);
        LikeBong likeBong;

        if (existingLike.isPresent()) {
            likeBong = existingLike.get();
            likeBong.setSelectionStatus(action); // ✅ 덮어쓰기
        } else {
            likeBong = new LikeBong(userId, bongId, action); // ✅ 새로 생성
        }

        return likeBongRepository.save(likeBong);
    }

}
