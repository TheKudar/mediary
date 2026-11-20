package studio.mediary.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificationOutbox {
    private final JdbcTemplate db;
    private final ObjectMapper json;

    NotificationOutbox(JdbcTemplate db, ObjectMapper json) {
        this.db = db;
        this.json = json;
    }

    public void enqueue(UUID recipient, String message) {
        UUID id = UUID.randomUUID();
        var payload =
                json.createObjectNode()
                        .put("id", id.toString())
                        .put("recipient", recipient.toString())
                        .put("message", message);
        db.update("insert into outbox values(?,?)", id, payload.toString());
    }
}
