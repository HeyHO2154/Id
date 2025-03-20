package Main.Feed;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import Main.Bong.Bong;

@Service
public class FeedService {

	@Autowired
    private FeedRepository feedRepository;

    public List<Feed> getAllFeed() {
    	List<Feed> feed = feedRepository.findAllFeed();
		return feed;
	}
    
    public List<Feed> getRandFeeds(int feedCount) {
    	List<Feed> Feeds = new ArrayList<>();
    	for (int i = 0; i < feedCount; i++) {
    		Feeds.add(feedRepository.findRandomFeed());
		}
        return Feeds;
    }
    
    public ResponseEntity<Feed> getInfoFeed(String feedID) {
		Optional<Feed> feed = feedRepository.findById(feedID);
        if (feed.isPresent()) {
            return ResponseEntity.ok(feed.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
	}
    
    public List<Feed> getFeedsByCategory(int category) {
        if (category == 0) {
            return getAllFeed();
        }
        return feedRepository.findByCategory(category);
    }
    
    public Feed saveFeed(Feed feedDto) {
    	Feed feed = new Feed();
    	feed.setAuthor(feedDto.getAuthor());
    	feed.setContent(feedDto.getContent());
    	feed.setFeedID(feedDto.getFeedID());
    	feed.setTitle(feedDto.getTitle());
    	feed.setCategory(feedDto.getCategory());
        return feedRepository.save(feed);
    }


}
