package studio.mediary.controller;

import static studio.mediary.security.SessionAccess.check;
import static studio.mediary.security.SessionAccess.required;
import static studio.mediary.security.SessionAccess.user;

import jakarta.servlet.http.HttpSession;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import studio.mediary.repository.VideoCatalog;
import studio.mediary.storage.MediaFiles;

@RestController
public class MediaController {
    private final JdbcTemplate db;
    private final MediaFiles files;
    private final VideoCatalog catalog;

    MediaController(JdbcTemplate db, MediaFiles files, VideoCatalog catalog) {
        this.db = db;
        this.files = files;
        this.catalog = catalog;
    }

    @PostMapping("/api/media")
    @Transactional(rollbackFor = java.io.IOException.class)
    Map<String, Long> upload(@RequestParam MultipartFile file, HttpSession session)
            throws java.io.IOException {
        var uid = required(session);
        String mime = Objects.toString(file.getContentType(), "");
        check(
                Set.of(
                                        "video/mp4",
                                        "video/webm",
                                        "video/ogg",
                                        "video/quicktime",
                                        "video/x-matroska")
                                .contains(mime)
                        && !file.isEmpty(),
                HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        long id =
                db.queryForObject(
                        "insert into asset(owner,mime) values(?,?) returning id",
                        Long.class,
                        uid,
                        mime);
        files.store(id, file);
        return Map.of("id", id);
    }

    @GetMapping("/api/media/{id}")
    ResponseEntity<FileSystemResource> media(
            @PathVariable long id,
            @RequestParam(defaultValue = "original") String quality,
            HttpSession session) {
        var asset = catalog.requireVisible(id, Objects.toString(user(session), "guest"));
        boolean small = quality.equals("480");
        var path = small ? files.rendition(id) : files.original(id);
        check(Files.isRegularFile(path), HttpStatus.NOT_FOUND);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(small ? "video/mp4" : asset.mime()))
                .body(new FileSystemResource(path));
    }
}
