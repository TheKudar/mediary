package studio.mediary.security;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

public class SessionAccess {

    private SessionAccess() {}

    public static void check(boolean ok, HttpStatus status) {
        if (!ok) throw new ResponseStatusException(status);
    }

    public static UUID user(HttpSession session) {
        return (UUID) session.getAttribute("user");
    }

    public static UUID required(HttpSession session) {
        var u = user(session);
        check(u != null, HttpStatus.UNAUTHORIZED);
        return u;
    }
}
