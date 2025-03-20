//package Main.Schedule;
//
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import Main.DTO.BongService;
//
//@Component
//public class TaskSchedulerConfig {
//	
//	@Autowired
//	BongService bongService;
//	
//    // 매 작업 완료 후, 1초 뒤 실행 (1000ms)
//    @Scheduled(fixedDelay = 6000000)
//    public void scheduleTask() {
//    	bongService.scrapeAndSaveVolunteerData();
//    }
//}
