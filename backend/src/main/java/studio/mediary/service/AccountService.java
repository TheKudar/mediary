package studio.mediary.service;

import static studio.mediary.security.SessionAccess.check;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

import studio.mediary.dto.Credentials;
import studio.mediary.dto.Registration;

@Service
public class AccountService {
    private final JdbcTemplate database;
    private final ObjectMapper json;
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();

    AccountService(JdbcTemplate database, ObjectMapper json) {
        this.database = database;
        this.json = json;
    }

    public UUID register(Registration registration) {
        String email = normalizeEmail(registration.email());
        String password = registration.password();
        String name = Objects.toString(registration.name(), "").strip();
        check(!name.isEmpty() && name.length() <= 100, HttpStatus.BAD_REQUEST);
        check(
                password != null
                        && password.length() >= 8
                        && password.getBytes(StandardCharsets.UTF_8).length <= 72,
                HttpStatus.BAD_REQUEST);
        UUID memberId = UUID.randomUUID();
        var profile = json.createObjectNode();
        profile.set(
                "interests",
                json.valueToTree(Objects.requireNonNullElse(registration.interests(), List.of())));
        int inserted =
                database.update(
                        """
                        insert into member(id,email,password_hash,name,doc,stream_key)
                        values(?,?,?,?,?::jsonb,?) on conflict(email) do nothing
                        """,
                        memberId,
                        email,
                        passwords.encode(password),
                        name,
                        profile.toString(),
                        UUID.randomUUID());
        check(inserted == 1, HttpStatus.CONFLICT);
        return memberId;
    }

    private record StoredCredentials(UUID memberId, String hash) {}

    public UUID authenticate(Credentials credentials) {
        var matches =
                database.query(
                        "select id,password_hash from member where email=?",
                        (row, index) ->
                                new StoredCredentials(
                                        row.getObject("id", UUID.class),
                                        row.getString("password_hash")),
                        normalizeEmail(credentials.email()));
        check(
                !matches.isEmpty()
                        && credentials.password() != null
                        && passwords.matches(credentials.password(), matches.get(0).hash()),
                HttpStatus.UNAUTHORIZED);
        return matches.get(0).memberId();
    }

    private String normalizeEmail(String value) {
        String email = Objects.toString(value, "").strip().toLowerCase(Locale.ROOT);
        check(email.contains("@") && email.length() < 255, HttpStatus.BAD_REQUEST);
        return email;
    }
}
