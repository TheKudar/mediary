package studio.mediary.service;

import static studio.mediary.security.SessionAccess.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.servlet.http.HttpSession;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import studio.mediary.security.VideoAccess;
import studio.mediary.storage.LibraryDocuments;
import studio.mediary.storage.MediaFiles;

@Service
public class LibraryQueryService {
    private final JdbcTemplate db;
    private final ObjectMapper json;
    private final MediaFiles files;
    private final LibraryDocuments documents;

    LibraryQueryService(
            JdbcTemplate db, ObjectMapper json, MediaFiles files, LibraryDocuments documents) {
        this.db = db;
        this.json = json;
        this.files = files;
        this.documents = documents;
    }

    public Map<String, Object> state(HttpSession session) {
        String viewer = Objects.toString(user(session), "guest");
        ObjectNode model = json.createObjectNode();
        for (String field :
                List.of(
                        "accounts",
                        "clips",
                        "groups",
                        "visits",
                        "saved",
                        "likes",
                        "dislikes",
                        "follows",
                        "comments",
                        "posts",
                        "chat")) model.putArray(field);
        for (String field : List.of("folders", "branding", "notices", "jobs"))
            model.putObject(field);
        long version = 0;
        Set<Long> visibleClipIds = new HashSet<>(List.of(91L, 92L));
        var members =
                db.queryForList(
                        "select id,name,email,doc::text as data,version from member order by id");
        for (var row : members) {
            String id = row.get("id").toString();
            boolean isOwner = id.equals(viewer);
            var document = documents.read((String) row.get("data"));
            var profile =
                    model.withArray("accounts")
                            .addObject()
                            .put("id", id)
                            .put("name", row.get("name").toString());
            if (isOwner) {
                profile.put("email", row.get("email").toString());
                profile.set("interests", document.path("interests"));
                version = ((Number) row.get("version")).longValue();
            }
            for (var collection : document.path("groups")) {
                if (isOwner || collection.path("visibility").asText().equals("Публичный")) {
                    model.withArray("groups").add(collection);
                }
            }
            appendVisibleClips(model, document, viewer, isOwner, visibleClipIds);
            for (var post : document.path("posts")) model.withArray("posts").add(post);
            if (document.has("brand"))
                ((ObjectNode) model.get("branding")).set(id, document.get("brand"));
            if (isOwner) {
                for (String field : List.of("visits", "saved", "dislikes", "follows"))
                    if (document.has(field)) model.set(field, document.get(field));
                if (document.has("folderList"))
                    ((ObjectNode) model.get("folders")).set(id, document.get("folderList"));
            }
        }
        for (var row : members) {
            var document = documents.read((String) row.get("data"));
            appendCommunityActivity(model, document, viewer, visibleClipIds);
        }
        if (user(session) != null)
            ((ObjectNode) model.get("notices"))
                    .set(
                            viewer,
                            json.valueToTree(
                                    db.queryForList(
                                            "select message from notice where recipient=? order by"
                                                    + " created desc limit 100",
                                            String.class,
                                            user(session))));
        return Map.of("user", viewer, "model", model, "version", version);
    }

    private void appendVisibleClips(
            ObjectNode model,
            ObjectNode document,
            String viewer,
            boolean isOwner,
            Set<Long> visibleClipIds) {
        for (var clip : document.path("clips"))
            if (VideoAccess.canWatch(clip, viewer)) {
                visibleClipIds.add(clip.path("id").asLong());
                var copy = (ObjectNode) clip.deepCopy();
                copy.put(
                        "qualityAvailable",
                        Files.exists(files.rendition(clip.path("id").asLong())));
                if (!isOwner) {
                    copy.remove("invites");
                    if (clip.path("privacy").asText().equals("По приглашению"))
                        copy.withArray("invites").add(viewer);
                }
                copy.withArray("invites");
                model.withArray("clips").add(copy);
            }
    }

    private void appendCommunityActivity(
            ObjectNode model, ObjectNode document, String viewer, Set<Long> visibleClipIds) {
        for (var comment : document.path("comments"))
            if (visibleClipIds.contains(comment.path("id").asLong()))
                model.withArray("comments").add(comment);
        for (String field : List.of("likes", "dislikes"))
            for (var reaction : document.path(field)) {
                String pair = reaction.asText();
                int separator = pair.lastIndexOf(':');
                if (separator < 0) continue;
                try {
                    if (visibleClipIds.contains(Long.parseLong(pair.substring(separator + 1)))) {
                        if (field.equals("likes") || !pair.startsWith(viewer + ":"))
                            model.withArray(field).add(pair);
                    }
                } catch (NumberFormatException ignored) {
                }
            }
    }
}
