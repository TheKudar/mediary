package studio.mediary.service;

import static studio.mediary.security.SessionAccess.check;

import com.fasterxml.jackson.databind.node.ObjectNode;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import studio.mediary.dto.LibraryUpdate;
import studio.mediary.messaging.NotificationOutbox;
import studio.mediary.repository.VideoCatalog;
import studio.mediary.storage.LibraryDocuments;

@Service
public class LibraryCommandService {
    private final JdbcTemplate db;
    private final LibraryDocuments documents;
    private final VideoCatalog catalog;
    private final NotificationOutbox notifications;

    LibraryCommandService(
            JdbcTemplate db,
            LibraryDocuments documents,
            VideoCatalog catalog,
            NotificationOutbox notifications) {
        this.db = db;
        this.documents = documents;
        this.catalog = catalog;
        this.notifications = notifications;
    }

    @Transactional
    public Map<String, Long> save(LibraryUpdate update, UUID memberId) {
        long version = update.version();
        var previous =
                documents.read(
                        db.queryForObject(
                                "select doc::text from member where id=? for update",
                                String.class,
                                memberId));
        ObjectNode document = update.doc();
        String name = Objects.toString(update.name(), "").strip();
        check(document != null, HttpStatus.BAD_REQUEST);
        check(!name.isBlank() && name.length() <= 100, HttpStatus.BAD_REQUEST);
        LibraryValidation.validate(document);
        normalize(document, memberId, name);
        check(
                db.update(
                                "update member set doc=?::jsonb,name=?,version=version+1 where id=?"
                                        + " and version=?",
                                document.toString(),
                                name,
                                memberId,
                                version)
                        == 1,
                HttpStatus.CONFLICT);
        notifyChanges(previous, document, memberId, name);
        Set<Long> retainedIds = new HashSet<>();
        for (var video : document.path("clips")) retainedIds.add(video.path("id").asLong());
        for (var video : previous.path("clips"))
            if (!retainedIds.contains(video.path("id").asLong()))
                db.update(
                        "update asset set retired=true where owner=? and id=? and not retired",
                        memberId,
                        video.path("id").asLong());
        return Map.of("version", version + 1);
    }

    private void normalize(ObjectNode document, UUID memberId, String name) {
        String ownerId = memberId.toString();
        for (var clip : document.path("clips")) {
            long id = clip.path("id").asLong();
            check(
                    db.queryForObject(
                                    "select count(*) from asset where owner=? and id=? and not"
                                        + " retired",
                                    Integer.class,
                                    memberId,
                                    id)
                            == 1,
                    HttpStatus.FORBIDDEN);
            check(
                    clip.path("title").isTextual()
                            && !clip.path("title").asText().isBlank()
                            && clip.path("title").asText().length() <= 100,
                    HttpStatus.BAD_REQUEST);
            check(
                    Set.of("Публичное", "Приватное", "По приглашению")
                            .contains(clip.path("privacy").asText()),
                    HttpStatus.BAD_REQUEST);
            var video = (ObjectNode) clip;
            video.put("owner", ownerId)
                    .put("author", name)
                    .put("local", false)
                    .put("source", "/api/media/" + id);
        }
        for (String field : List.of("posts", "groups"))
            for (var entry : document.path(field)) ((ObjectNode) entry).put("owner", ownerId);
        for (String field : List.of("likes", "dislikes", "follows", "saved"))
            for (var entry : document.path(field))
                check(entry.asText().startsWith(ownerId + ":"), HttpStatus.BAD_REQUEST);
        for (var comment : document.path("comments"))
            ((ObjectNode) comment).put("authorId", ownerId).put("user", name);
        for (var visit : document.path("visits")) ((ObjectNode) visit).put("user", ownerId);
    }

    private void notifyChanges(
            ObjectNode previous, ObjectNode document, UUID memberId, String name) {
        String ownerId = memberId.toString();
        Set<String> previousCommentKeys = new HashSet<>();
        for (var comment : previous.path("comments"))
            previousCommentKeys.add(comment.path("key").asText());
        for (var comment : document.path("comments"))
            if (!previousCommentKeys.contains(comment.path("key").asText())) {
                long id = comment.path("id").asLong();
                if (VideoCatalog.isSample(id)) continue;
                UUID recipient = catalog.requireVisible(id, ownerId).owner();
                if (!memberId.equals(recipient))
                    notifications.enqueue(recipient, name + " оставил комментарий");
            }
        Set<String> previousSubscriptions = new HashSet<>();
        previous.path("follows").forEach(entry -> previousSubscriptions.add(entry.asText()));
        for (var entry : document.path("follows"))
            if (!previousSubscriptions.contains(entry.asText())) {
                var recipients =
                        db.queryForList(
                                "select id from member where id::text=?",
                                UUID.class,
                                entry.asText().substring(ownerId.length() + 1));
                if (!recipients.isEmpty())
                    notifications.enqueue(recipients.get(0), name + " подписался на канал");
            }
    }
}
