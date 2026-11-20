package studio.mediary.messaging;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import studio.mediary.storage.LibraryDocuments;

@Service
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
        name = "notifications.worker",
        havingValue = "true")
public class NotificationDelivery {
    private final JdbcTemplate db;
    private final LibraryDocuments documents;
    private final KafkaTemplate<String, String> kafka;

    NotificationDelivery(
            JdbcTemplate db, LibraryDocuments documents, KafkaTemplate<String, String> kafka) {
        this.db = db;
        this.documents = documents;
        this.kafka = kafka;
    }

    @Scheduled(fixedDelay = 2000)
    void publish() throws Exception {
        for (var event : db.queryForList("select id,payload from outbox limit 50")) {
            kafka.send(
                            "mediary.notifications",
                            event.get("id").toString(),
                            event.get("payload").toString())
                    .get(10, TimeUnit.SECONDS);
            db.update("delete from outbox where id=?", event.get("id"));
        }
    }

    @KafkaListener(topics = "mediary.notifications", groupId = "notice-storage")
    void consume(String value) {
        var notification = documents.read(value);
        db.update(
                "insert into notice(id,recipient,message) values(?,?,?) on conflict do nothing",
                UUID.fromString(notification.path("id").asText()),
                UUID.fromString(notification.path("recipient").asText()),
                notification.path("message").asText());
    }
}
