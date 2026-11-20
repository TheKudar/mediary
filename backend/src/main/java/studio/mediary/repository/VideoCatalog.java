package studio.mediary.repository;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import studio.mediary.security.VideoAccess;
import studio.mediary.storage.LibraryDocuments;

@Repository
public class VideoCatalog {
    public static boolean isSample(long id) {
        return id == 91 || id == 92;
    }

    public record PublishedVideo(UUID owner, String mime) {}

    private final JdbcTemplate database;
    private final LibraryDocuments documents;

    VideoCatalog(JdbcTemplate database, LibraryDocuments documents) {
        this.database = database;
        this.documents = documents;
    }

    public PublishedVideo requireVisible(long id, String viewer) {
        return database
                .query(
                        """
                        select m.id,a.mime,clip::text as metadata from asset a
                        join member m on m.id=a.owner
                        cross join lateral jsonb_array_elements(m.doc->'clips') clip
                        where a.id=? and not a.retired and clip->>'id'=a.id::text
                        """,
                        (row, index) ->
                                VideoAccess.canWatch(
                                                documents.read(row.getString("metadata")), viewer)
                                        ? new PublishedVideo(
                                                row.getObject("id", UUID.class),
                                                row.getString("mime"))
                                        : null,
                        id)
                .stream()
                .filter(java.util.Objects::nonNull)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
