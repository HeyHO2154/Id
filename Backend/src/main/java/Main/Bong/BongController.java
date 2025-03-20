package Main.Bong;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "${Front_URL}")
@RequestMapping("/api/bong")
public class BongController {

    @Autowired
    private BongService bongService;
 
    @GetMapping("/all")
    public List<Bong> getAllBong() {
        return bongService.getAllBong();
    }
    
    @GetMapping("/random")
    public Bong getRandomBong() {
        return bongService.getRandomBong();
    }
    
    @GetMapping("/info")
    public ResponseEntity<Bong> getBongInfo(@RequestParam String progrmRegistNo) {
        return bongService.getInfoBong(progrmRegistNo);
    }
    
    @PostMapping("/add")
    public Bong saveBong(@RequestBody Bong bongDto) {
        return bongService.saveBong(bongDto);
    }

    
    
    
    
    
    @PostMapping("/upload/{progrmRegistNo}")
    public String uploadImages(@PathVariable String progrmRegistNo, @RequestParam("images") MultipartFile[] files) {
        return bongService.uploadImages(progrmRegistNo, files);
    }
    
    @GetMapping("/image/{progrmRegistNo}/{imageIndex}")
    public ResponseEntity<Resource> getImage(
            @PathVariable String progrmRegistNo,
            @PathVariable int imageIndex
    ) {
        try {
            // 이미지 경로 설정
        	String basePath = "/home/junma97/Desktop/DB/Image";
            String[] extensions = {".jpg", ".jpeg", ".png", ".PNG"};
            Path imagePath = null;

            // 지원하는 확장자를 순차적으로 확인
            for (String ext : extensions) {
                Path tempPath = Paths.get(basePath, progrmRegistNo, "Image_" + imageIndex + ext);
                Resource resource = new UrlResource(tempPath.toUri());
                if (resource.exists() && resource.isReadable()) {
                    imagePath = tempPath;
                    break;
                }else {
                	imagePath = Paths.get(basePath, "0", "Bong.png");
                }
            }

            if (imagePath != null) {
                // 이미지 리소스를 로드
                Resource resource = new UrlResource(imagePath.toUri());
                String contentType = imagePath.toString().toLowerCase().endsWith(".png") ? MediaType.IMAGE_PNG_VALUE : MediaType.IMAGE_JPEG_VALUE;

                // 이미지 파일을 ResponseEntity로 반환
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + imagePath.getFileName().toString() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
