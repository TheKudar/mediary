package studio.mediary.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

import studio.mediary.dto.Credentials;
import studio.mediary.dto.Registration;
import studio.mediary.service.AccountService;
import studio.mediary.service.LibraryQueryService;

@RestController
public class AccountController {
    private final AccountService accounts;
    private final LibraryQueryService library;

    AccountController(AccountService accounts, LibraryQueryService library) {
        this.accounts = accounts;
        this.library = library;
    }

    @PostMapping("/api/auth/register")
    Map<String, Object> register(
            @RequestBody Registration registration, HttpServletRequest request) {
        return startSession(request, accounts.register(registration));
    }

    @PostMapping("/api/auth/login")
    Map<String, Object> login(@RequestBody Credentials credentials, HttpServletRequest request) {
        return startSession(request, accounts.authenticate(credentials));
    }

    private Map<String, Object> startSession(HttpServletRequest request, UUID memberId) {
        HttpSession session = request.getSession();
        request.changeSessionId();
        session.setAttribute("user", memberId);
        return library.state(session);
    }

    @PostMapping("/api/logout")
    void logout(HttpSession session) {
        session.invalidate();
    }
}
