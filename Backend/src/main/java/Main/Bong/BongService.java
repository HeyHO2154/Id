package Main.Bong;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class BongService {

    @Autowired
    private BongRepository bongRepository;

    public List<Bong> getAllBong() {
    	List<Bong> bong = bongRepository.findAllBong();
		return bong;
	}
    
    public Bong getRandomBong() {
        Bong bong = bongRepository.findRandomBong();
        if (bong == null) {
            throw new RuntimeException("랜덤으로 선택된 공고가 없습니다.");
        }

        return bong;
    }

	public ResponseEntity<Bong> getInfoBong(String progrmRegistNo) {
		Optional<Bong> bong = bongRepository.findById(progrmRegistNo);
        if (bong.isPresent()) {
            return ResponseEntity.ok(bong.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
	}
	
    public Bong saveBong(Bong bongDto) {
        Bong bong = new Bong();
        bong.setProgrmRegistNo(bongDto.getProgrmRegistNo());
        bong.setProgrmSj(bongDto.getProgrmSj());
        bong.setProgrmSttusSe(bongDto.getProgrmSttusSe());
        bong.setProgrmBgnde(bongDto.getProgrmBgnde());
        bong.setProgrmEndde(bongDto.getProgrmEndde());
        bong.setActBeginTm(bongDto.getActBeginTm());
        bong.setActEndTm(bongDto.getActEndTm());
        bong.setNoticeBgnde(bongDto.getNoticeBgnde());
        bong.setNoticeEndde(bongDto.getNoticeEndde());
        bong.setRcritNmpr(bongDto.getRcritNmpr());
        bong.setActWkdy(bongDto.getActWkdy());
        bong.setSrvcClCode(bongDto.getSrvcClCode());
        bong.setAdultPosblAt(bongDto.getAdultPosblAt());
        bong.setYngbgsPosblAt(bongDto.getYngbgsPosblAt());
        bong.setGrpPosblAt(bongDto.getGrpPosblAt());
        bong.setMnnstNm(bongDto.getMnnstNm());
        bong.setNanmmbyNm(bongDto.getNanmmbyNm());
        bong.setActPlace(bongDto.getActPlace());
        bong.setNanmmbyNmAdmn(bongDto.getNanmmbyNmAdmn());
        bong.setTelno(bongDto.getTelno());
        bong.setFxnum(bongDto.getFxnum());
        bong.setPostAdres(bongDto.getPostAdres());
        bong.setEmail(bongDto.getEmail());
        bong.setProgrmCn(bongDto.getProgrmCn());
        bong.setSidoCd(bongDto.getSidoCd());
        bong.setGugunCd(bongDto.getGugunCd());
        return bongRepository.save(bong);
    }

	public String uploadImages(String progrmRegistNo, MultipartFile[] files) {
		String uploadPath = "/home/junma97/Desktop/DB/Image/" + progrmRegistNo;
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        try {
            for (int i = 0; i < files.length && i < 3; i++) { // 최대 3개 제한
                MultipartFile file = files[i];
                String filePath = uploadPath + "/Image_" + (i+1) + ".jpg";
                file.transferTo(new File(filePath));
            }
            return "이미지 업로드 성공";
        } catch (IOException e) {
            return "이미지 업로드 실패: " + e.getMessage();
        }
	}
}

