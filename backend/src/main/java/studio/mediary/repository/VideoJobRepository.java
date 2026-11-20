package studio.mediary.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class VideoJobRepository {
    public record Job(long assetId, UUID claim, boolean deleteFiles) {}

    // The lease exceeds FFmpeg's timeout. A new worker can resume after a process crash.
    private static final String CLAIM_JOB =
            """
            with candidate as (
                select a.id, a.retired or (
                    a.uploaded < now() - interval '1 day' and not exists (
                        select 1 from member m, lateral jsonb_array_elements(m.doc->'clips') clip
                        where m.id=a.owner and clip->>'id'=a.id::text
                    )
                ) as obsolete
                from asset a
                where a.claim_until is null or a.claim_until < now()
            ), selected as (
                select a.id, c.obsolete from candidate c join asset a on a.id=c.id
                where c.obsolete or a.status='pending'
                order by c.obsolete desc, a.id limit 1 for update of a skip locked
            )
            update asset a set claim_id=?,claim_until=now()+interval '70 minutes'
            from selected where a.id=selected.id
            returning a.id,selected.obsolete
            """;
    private final JdbcTemplate database;

    public VideoJobRepository(JdbcTemplate database) {
        this.database = database;
    }

    public Optional<Job> claimNext() {
        UUID claim = UUID.randomUUID();
        return database
                .query(
                        CLAIM_JOB,
                        (row, index) ->
                                new Job(row.getLong("id"), claim, row.getBoolean("obsolete")),
                        claim)
                .stream()
                .findFirst();
    }

    public boolean lockClaim(Job job) {
        return !database.queryForList(
                        "select id from asset where id=? and claim_id=? for update",
                        Long.class,
                        job.assetId(),
                        job.claim())
                .isEmpty();
    }

    public void complete(Job job, boolean success) {
        database.update(
                "update asset set status=?,claim_id=null,claim_until=null where id=? and"
                        + " claim_id=?",
                success ? "ready" : "failed",
                job.assetId(),
                job.claim());
    }

    public void delete(Job job) {
        database.update("delete from asset where id=? and claim_id=?", job.assetId(), job.claim());
    }
}
