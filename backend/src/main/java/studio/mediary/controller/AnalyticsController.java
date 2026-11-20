package studio.mediary.controller;

import static studio.mediary.security.SessionAccess.required;
import static studio.mediary.security.SessionAccess.user;

import jakarta.servlet.http.HttpSession;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import studio.mediary.repository.VideoCatalog;

@RestController
public class AnalyticsController {
    private final JdbcTemplate db;
    private final VideoCatalog catalog;

    AnalyticsController(JdbcTemplate db, VideoCatalog catalog) {
        this.db = db;
        this.catalog = catalog;
    }

    @PostMapping("/api/views/{id}")
    void view(@PathVariable long id, HttpSession session) {
        if (VideoCatalog.isSample(id)) return;
        catalog.requireVisible(id, Objects.toString(user(session), "guest"));
        String viewer = Objects.toString(user(session), null);
        if (viewer == null) {
            if (session.getAttribute("viewer") == null)
                session.setAttribute("viewer", UUID.randomUUID().toString());
            viewer = (String) session.getAttribute("viewer");
        }
        db.update("insert into play_event(asset,viewer) values(?,?)", id, viewer);
    }

    @GetMapping("/api/stats")
    List<Map<String, Object>> stats(
            HttpSession session,
            @RequestParam(defaultValue = "28") int days,
            @RequestParam(defaultValue = "0") long video) {
        return db.queryForList(
                "select created::date as day,count(*) as views,count(distinct viewer) as viewers"
                    + " from play_event p join asset a on p.asset=a.id where owner=? and (?=0 or"
                    + " a.id=?) and created>=current_date-(?::integer-1) group by created::date"
                    + " order by day",
                required(session),
                video,
                video,
                Math.max(1, Math.min(days, 730)));
    }
}
