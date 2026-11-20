package studio.mediary.service;

import static studio.mediary.security.SessionAccess.check;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.springframework.http.HttpStatus;

import java.util.List;

final class LibraryValidation {
    private LibraryValidation() {}

    static void validate(ObjectNode document) {
        for (String field : List.of("groups", "clips", "comments", "posts", "visits")) {
            JsonNode items = document.path(field);
            check(items.isArray(), HttpStatus.BAD_REQUEST);
            items.forEach(item -> check(item.isObject(), HttpStatus.BAD_REQUEST));
        }
        for (String field :
                List.of("likes", "dislikes", "saved", "follows", "interests", "folderList"))
            strings(document.path(field));
        check(document.path("brand").isObject(), HttpStatus.BAD_REQUEST);
        for (var clip : document.path("clips")) {
            strings(clip.path("tags"));
            strings(clip.path("invites"));
            check(clip.path("category").isTextual(), HttpStatus.BAD_REQUEST);
        }
        for (var group : document.path("groups")) {
            check(
                    group.path("items").isArray() && group.path("name").isTextual(),
                    HttpStatus.BAD_REQUEST);
            check(
                    List.of("collections", "playlists").contains(group.path("kind").asText()),
                    HttpStatus.BAD_REQUEST);
        }
        for (var comment : document.path("comments"))
            check(
                    comment.path("text").isTextual() && !comment.path("key").asText().isBlank(),
                    HttpStatus.BAD_REQUEST);
    }

    private static void strings(JsonNode items) {
        check(items.isArray(), HttpStatus.BAD_REQUEST);
        items.forEach(item -> check(item.isTextual(), HttpStatus.BAD_REQUEST));
    }
}
