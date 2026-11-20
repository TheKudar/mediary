package studio.mediary.controller;

import static studio.mediary.security.SessionAccess.check;
import static studio.mediary.security.SessionAccess.required;
import static studio.mediary.security.SessionAccess.user;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import studio.mediary.dto.LibraryUpdate;
import studio.mediary.service.LibraryCommandService;
import studio.mediary.service.LibraryQueryService;
import studio.mediary.storage.LibraryDocuments;

@RestController
public class LibraryController {
    private final LibraryQueryService library;
    private final LibraryCommandService commands;
    private final JdbcTemplate db;
    private final LibraryDocuments documents;

    LibraryController(
            LibraryQueryService library,
            LibraryCommandService commands,
            JdbcTemplate db,
            LibraryDocuments documents) {
        this.library = library;
        this.commands = commands;
        this.db = db;
        this.documents = documents;
    }

    @GetMapping("/api/state")
    Map<String, Object> state(HttpSession session) {
        return library.state(session);
    }

    @PutMapping("/api/library")
    Map<String, Long> save(@RequestBody LibraryUpdate update, HttpSession session) {
        return commands.save(update, required(session));
    }

    @GetMapping("/api/groups/{id}")
    JsonNode shared(@PathVariable UUID id, HttpSession session) {
        var rows =
                db.queryForList(
                        "select g::text from member m cross join lateral"
                                + " jsonb_array_elements(m.doc->'groups') g where g->>'id'=? and"
                                + " (m.id::text=? or g->>'visibility' in ('Публичный','Доступ по"
                                + " ссылке'))",
                        String.class,
                        id.toString(),
                        Objects.toString(user(session), "guest"));
        check(!rows.isEmpty(), HttpStatus.NOT_FOUND);
        return documents.read(rows.get(0));
    }
}
