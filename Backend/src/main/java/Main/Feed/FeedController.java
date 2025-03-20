package Main.Feed;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import Main.Bong.Bong;

@RestController
@CrossOrigin(origins = "${Front_URL}")
@RequestMapping("/api/feed")
public class FeedController {

	@Autowired
    private FeedService feedService;

    @GetMapping("/all")
    public List<Feed> getAllBong() {
        return feedService.getAllFeed();
    }
	
    @GetMapping("/random")
    public List<Feed> getRandFeeds(@RequestParam int feedCount) {
        return feedService.getRandFeeds(feedCount);
    }
    
    @GetMapping("/info")
    public ResponseEntity<Feed> getBongInfo(@RequestParam String feedID) {
        return feedService.getInfoFeed(feedID);
    }
    
    @GetMapping("/category")
    public List<Feed> getFeedsByCategory(@RequestParam int category) {
        return feedService.getFeedsByCategory(category);
    }
    
    @PostMapping("/add")
    public Feed saveFeed(@RequestBody Feed feedDto) {
        return feedService.saveFeed(feedDto);
    }
}
