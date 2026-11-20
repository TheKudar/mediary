package studio.mediary.controller;

import static studio.mediary.security.SessionAccess.check;
import static studio.mediary.security.SessionAccess.required;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class LiveController {
    private final JdbcTemplate db;

    LiveController(JdbcTemplate db) {
        this.db = db;
    }

    @GetMapping("/api/live/key")
    String streamKey(HttpSession session) {
        return db.queryForObject(
                "select stream_key::text from member where id=?", String.class, required(session));
    }

    @PostMapping("/internal/live-auth")
    void liveAuth(@RequestBody JsonNode request) {
        String action = request.path("action").asText();
        if (action.equals("read") || action.equals("playback")) return;
        check(
                action.equals("publish")
                        && db.queryForObject(
                                        "select count(*) from member where id::text=? and"
                                                + " 'key='||stream_key::text=?",
                                        Integer.class,
                                        request.path("path").asText(),
                                        request.path("query").asText())
                                == 1,
                HttpStatus.FORBIDDEN);
    }

    @GetMapping("/api/live/{channel}/chat")
    List<Map<String, Object>> chat(@PathVariable UUID channel) {
        return db.queryForList(
                "select * from (select c.id,m.name,c.message from chat c join member m on"
                    + " c.author=m.id where channel=? order by c.id desc limit 100) t order by id",
                channel);
    }

    @PostMapping("/api/live/{channel}/chat")
    void sendChat(@PathVariable UUID channel, @RequestBody JsonNode body, HttpSession session) {
        String msg = body.path("message").asText("").strip();
        check(!msg.isEmpty() && msg.length() <= 2000, HttpStatus.BAD_REQUEST);
        db.update(
                "insert into chat(channel,author,message) values(?,?,?)",
                channel,
                required(session),
                msg);
    }
}
